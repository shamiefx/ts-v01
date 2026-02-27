import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8080";
  const apiToken = process.env.API_TOKEN;

  if (!apiToken) {
    return NextResponse.json(
      { error: "Server misconfigured: API_TOKEN is missing" },
      { status: 500 }
    );
  }

  // Narrow env var type for headers (HeadersInit requires string values)
  const apiTokenValue: string = apiToken;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body (expected JSON)" },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  const upstreamUrl = `${apiBaseUrl}/api/auth/login`;

  async function callUpstream(p: Record<string, unknown>) {
    let response: Response;
    try {
      response = await fetch(upstreamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-Token": apiTokenValue,
        },
        body: JSON.stringify(p),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upstream request failed";
      return {
        response: null as Response | null,
        text: null as string | null,
        networkError: message,
      };
    }

    const text = await response.text();
    return { response, text, networkError: null as string | null };
  }

  // Attempt #1: as-is
  const first = await callUpstream(payload);
  if (!first.response) {
    return NextResponse.json(
      {
        error: "Failed to reach backend auth service",
        details: first.networkError,
        upstream: upstreamUrl,
      },
      { status: 502 }
    );
  }

  let upstream = first.response;
  let text = first.text ?? "";

  // If backend crashes only for web flow, retry once without is_web.
  const trimmed = text.trim();
  const isEffectivelyEmpty = trimmed.length === 0 || trimmed === '""';
  const isWeb = payload.is_web === true;
  if (isWeb && upstream.status >= 500 && isEffectivelyEmpty) {
    const withoutIsWeb = { ...payload };
    delete withoutIsWeb.is_web;
    const second = await callUpstream(withoutIsWeb);
    if (second.response) {
      upstream = second.response;
      text = second.text ?? "";
    }
  }

  // Some upstream failures return an empty JSON string (""), which is hard to debug from the client.
  // Provide a structured error payload in that case.
  if (!upstream.ok) {
    const t = text.trim();
    const empty = t.length === 0 || t === '""';
    if (empty) {
      return NextResponse.json(
        {
          error: "Upstream login failed with empty response body",
          upstreamStatus: upstream.status,
          upstreamStatusText: upstream.statusText,
          upstream: upstreamUrl,
          hint: "Backend returned an empty error response; check backend logs for the real exception.",
        },
        { status: upstream.status }
      );
    }
  }

  const res = new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });

  // Forward refresh-token cookie(s) if upstream sets them (web login flow)
  // undici/Next may expose multiple Set-Cookie values via getSetCookie().
  // We handle both single and multi-cookie cases safely.
  const anyUpstream = upstream as unknown as {
    headers: Headers & { getSetCookie?: () => string[] };
  };

  const setCookies = anyUpstream.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    for (const c of setCookies) res.headers.append("set-cookie", c);
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) res.headers.set("set-cookie", single);
  }

  return res;
}
