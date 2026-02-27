import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8080";
  const apiToken = process.env.API_TOKEN;

  const upstreamUrl = `${apiBaseUrl}/api/auth/signup`;

  if (!apiToken) {
    return NextResponse.json(
      { error: "Server misconfigured: API_TOKEN is missing" },
      { status: 500 }
    );
  }

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

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Token": apiTokenValue,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json(
      {
        error: "Failed to reach backend auth service",
        details: message,
        upstream: upstreamUrl,
      },
      { status: 502 }
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    const t = text.trim();
    const empty = t.length === 0 || t === '""';
    if (empty) {
      return NextResponse.json(
        {
          error: "Upstream signup failed with empty response body",
          upstreamStatus: upstream.status,
          upstreamStatusText: upstream.statusText,
          upstream: upstreamUrl,
        },
        { status: upstream.status }
      );
    }
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}
