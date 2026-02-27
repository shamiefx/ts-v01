import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBearerToken(request: NextRequest, cookieToken: string | undefined) {
  const header = request.headers.get("authorization");
  if (header && header.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  if (cookieToken) return cookieToken;
  return null;
}

export async function POST(request: NextRequest) {
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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("profile_image");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing profile_image file" },
      { status: 400 }
    );
  }

  const upstreamUrl = `${apiBaseUrl}/api/v1/profile/image`;

  // Rebuild form data so it is definitely mutable and only contains what we need.
  const upstreamForm = new FormData();
  upstreamForm.set("profile_image", file, file.name);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-API-Token": String(apiToken),
      },
      body: upstreamForm,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json(
      {
        error: "Failed to reach backend profile image service",
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
          error: "Upstream profile image upload failed with empty response body",
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
