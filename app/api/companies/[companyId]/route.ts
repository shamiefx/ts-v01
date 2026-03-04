import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type Params = {
  params: Promise<{ companyId: string }>;
};

async function buildAuth(request: NextRequest) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const apiToken = process.env.API_TOKEN;

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized: No auth token found" }, { status: 401 }) };
  }

  if (!apiToken) {
    return { error: NextResponse.json({ error: "Server misconfigured: API_TOKEN is missing" }, { status: 500 }) };
  }

  return {
    token,
    apiToken,
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8080",
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const auth = await buildAuth(request);
    if ("error" in auth) return auth.error;

    const { companyId } = await params;
    const encodedCompanyId = encodeURIComponent(companyId);
    const upstreamUrl = `${auth.apiBaseUrl}/api/v1/companies/${encodedCompanyId}`;

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${auth.token}`,
        "X-API-Token": auth.apiToken,
      },
    });

    // Some backends may not expose GET /companies/{id} consistently for all roles.
    // Fallback: fetch company list and resolve by ID to avoid false 404 in UI.
    if (upstream.status === 404) {
      const listUpstream = await fetch(`${auth.apiBaseUrl}/api/v1/companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${auth.token}`,
          "X-API-Token": auth.apiToken,
        },
      });

      if (listUpstream.ok) {
        const listText = await listUpstream.text();
        try {
          const parsed = JSON.parse(listText) as Record<string, unknown>;
          const companiesRaw =
            (Array.isArray(parsed.companies)
              ? parsed.companies
              : Array.isArray(parsed.data)
                ? parsed.data
                : []) as unknown[];

          const normalizeId = (value: unknown) => String(value ?? "").trim().toLowerCase();
          const targetId = normalizeId(companyId);

          const companies = companiesRaw
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const obj = item as Record<string, unknown>;
              if (obj.company && typeof obj.company === "object") {
                return obj.company as Record<string, unknown>;
              }
              return obj;
            })
            .filter((c): c is Record<string, unknown> => Boolean(c));

          const company = companies.find((c) => {
            const id = normalizeId(c.id ?? c.company_id);
            return id.length > 0 && id === targetId;
          });

          if (company) {
            return NextResponse.json({ company }, { status: 200 });
          }

          return NextResponse.json(
            {
              error: "Company not found in accessible company list",
              requestedCompanyId: companyId,
              upstream: upstreamUrl,
            },
            { status: 404 }
          );
        } catch {
          return NextResponse.json(
            {
              error: "Failed to parse companies list while resolving company detail",
              requestedCompanyId: companyId,
              upstream: upstreamUrl,
            },
            { status: 502 }
          );
        }
      }

      return NextResponse.json(
        {
          error: "Company detail endpoint returned 404 and list fallback failed",
          requestedCompanyId: companyId,
          upstream: upstreamUrl,
          listStatus: listUpstream.status,
        },
        { status: 404 }
      );
    }

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal error in /api/companies/[companyId]", details: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await buildAuth(request);
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const { companyId } = await params;
    const encodedCompanyId = encodeURIComponent(companyId);
    const upstreamUrl = `${auth.apiBaseUrl}/api/v1/companies/${encodedCompanyId}`;

    const upstream = await fetch(upstreamUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${auth.token}`,
        "X-API-Token": auth.apiToken,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal error in PUT /api/companies/[companyId]", details: message },
      { status: 500 }
    );
  }
}
