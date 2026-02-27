import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value || 
                  request.headers.get("authorization")?.replace("Bearer ", "");
    const apiToken = process.env.API_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No auth token found" },
        { status: 401 }
      );
    }
    if (!apiToken) {
      return NextResponse.json(
        { error: "Server misconfigured: API_TOKEN is missing" },
        { status: 500 }
      );
    }

    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const upstreamUrl = `${apiBaseUrl}/api/v1/companies`;
    const apiTokenValue: string = apiToken;

    let upstream: Response;
    try {
      upstream = await fetch(upstreamUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Token": apiTokenValue,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upstream request failed";
      return NextResponse.json(
        {
          error: "Failed to reach backend companies service",
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
            error: "Upstream companies request failed with empty response body",
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
  } catch (error) {
    console.error("Error in /api/companies:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal error in /api/companies", details: message },
      { status: 500 }
    );
  }
}
