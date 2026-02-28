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
    const companyId = request.nextUrl.searchParams.get("companyId")?.trim();
    const upstreamUrl = companyId
      ? `${apiBaseUrl}/api/v1/companies/${encodeURIComponent(companyId)}`
      : `${apiBaseUrl}/api/v1/companies`;
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
            error: companyId
              ? "Upstream company detail request failed with empty response body"
              : "Upstream companies request failed with empty response body",
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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const upstreamUrl = `${apiBaseUrl}/api/v1/companies`;
    const apiTokenValue: string = apiToken;

    let upstream: Response;
    try {
      upstream = await fetch(upstreamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Token": apiTokenValue,
        },
        body: JSON.stringify(body),
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
            error: "Upstream companies create request failed with empty response body",
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
    console.error("Error in POST /api/companies:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal error in /api/companies", details: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("auth_token")?.value ||
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

    const companyId = request.nextUrl.searchParams.get("companyId")?.trim();
    if (!companyId) {
      return NextResponse.json(
        { error: "companyId query parameter is required for update" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const upstreamUrl = `${apiBaseUrl}/api/v1/companies/${encodeURIComponent(companyId)}`;
    const apiTokenValue: string = apiToken;

    let upstream: Response;
    try {
      upstream = await fetch(upstreamUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Token": apiTokenValue,
        },
        body: JSON.stringify(body),
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
            error: "Upstream companies update request failed with empty response body",
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
    console.error("Error in PUT /api/companies:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal error in PUT /api/companies", details: message },
      { status: 500 }
    );
  }
}
