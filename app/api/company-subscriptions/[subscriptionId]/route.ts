import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET /api/company-subscriptions/{subscriptionId}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // Get authentication tokens
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

    // Call the backend API
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const response = await fetch(
      `${backendUrl}/api/v1/company-subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Token": apiToken,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT/PATCH /api/company-subscriptions/{subscriptionId}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;
    const body = await request.json();

    // Get authentication tokens
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

    // Call the backend API to update subscription
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const response = await fetch(
      `${backendUrl}/api/v1/company-subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Token": apiToken,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH is same as PUT for this API
export const PATCH = PUT;

// DELETE /api/company-subscriptions/{subscriptionId}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // Get authentication tokens
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

    // Call the backend API to cancel subscription
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const response = await fetch(
      `${backendUrl}/api/v1/company-subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Token": apiToken,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
