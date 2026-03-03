import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET /api/company-subscriptions?company_id={company_id}
export async function GET(request: NextRequest) {
  try {
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

    // Get company_id from query params
    const companyId = request.nextUrl.searchParams.get("company_id");
    
    if (!companyId) {
      return NextResponse.json(
        { error: "Missing required parameter: company_id" },
        { status: 400 }
      );
    }

    // Call the backend API
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const response = await fetch(
      `${backendUrl}/api/v1/company-subscriptions?company_id=${encodeURIComponent(companyId)}`,
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
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/company-subscriptions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, plan_id, billing_cycle } = body;

    // Validate required fields
    if (!company_id || !plan_id || !billing_cycle) {
      return NextResponse.json(
        { error: "Missing required fields: company_id, plan_id, billing_cycle" },
        { status: 400 }
      );
    }

    // Validate billing cycle
    if (billing_cycle !== "monthly" && billing_cycle !== "yearly") {
      return NextResponse.json(
        { error: "Invalid billing_cycle. Must be 'monthly' or 'yearly'" },
        { status: 400 }
      );
    }

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

    // Prepare subscription data - backend calculates amount and dates
    const subscriptionData = {
      company_id,
      plan_id,
      billing_cycle,
    };

    // Call the backend API to create subscription
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const response = await fetch(`${backendUrl}/api/v1/company-subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-API-Token": apiToken,
      },
      body: JSON.stringify(subscriptionData),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
