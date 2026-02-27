import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBearerToken(request: NextRequest, cookieToken: string | undefined) {
  const header = request.headers.get("authorization");
  if (header && header.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  if (cookieToken) return cookieToken;
  return null;
}

async function proxyToUpstream(request: NextRequest, method: "GET" | "PUT" | "PATCH") {
  const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8080";
  const apiToken = process.env.API_TOKEN;

  if (!apiToken) {
    return NextResponse.json(
      { error: "Server misconfigured: API_TOKEN is missing" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("auth_token")?.value;
  const token = getBearerToken(request, cookieToken);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: No auth token found" }, { status: 401 });
  }

  const upstreamUrl = `${apiBaseUrl}/api/v1/profile`;

  let bodyText: string | undefined = undefined;
  if (method !== "GET") {
    try {
      bodyText = await request.text();
    } catch {
      bodyText = "";
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-API-Token": String(apiToken),
      },
      body: method === "GET" ? undefined : bodyText,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json(
      {
        error: "Failed to reach backend profile service",
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
          error: "Upstream profile request failed with empty response body",
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

export async function GET(request: NextRequest) {
  return proxyToUpstream(request, "GET");
}

export async function PUT(request: NextRequest) {
  return proxyToUpstream(request, "PUT");
}

export async function PATCH(request: NextRequest) {
  return proxyToUpstream(request, "PATCH");
}
