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

  const upstreamUrl = `${apiBaseUrl}/api/auth/refresh`;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const payload: Record<string, unknown> =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Token": String(apiToken),
        ...(request.headers.get("cookie")
          ? { Cookie: request.headers.get("cookie") as string }
          : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json(
      {
        error: "Failed to reach backend refresh service",
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
          error: "Upstream refresh failed with empty response body",
          upstreamStatus: upstream.status,
          upstreamStatusText: upstream.statusText,
          upstream: upstreamUrl,
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

  // Forward refresh-token cookie(s) if upstream rotates them.
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
