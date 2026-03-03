import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const body = await request.json();

    const { plan_id, billing_cycle } = body;

    // Validate required fields
    if (!plan_id || !billing_cycle) {
      return NextResponse.json(
        { error: "Missing required fields: plan_id, billing_cycle" },
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

    // Calculate start and end dates based on billing cycle
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (billing_cycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Prepare subscription data - backend calculates amount and dates
    const subscriptionData = {
      company_id: companyId,
      plan_id: plan_id,
      billing_cycle: billing_cycle,
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

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to create subscription" }));
      return NextResponse.json(
        { error: error.error || "Failed to create subscription" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      subscription: data,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET subscription for a company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

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

    // Call the backend API to get subscription
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const response = await fetch(
      `${backendUrl}/api/v1/company-subscriptions?company_id=${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Token": apiToken,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch subscription" }));
      return NextResponse.json(
        { error: error.error || "Failed to fetch subscription" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT/PATCH subscription for a company (update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
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

    // First, get the existing subscription
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const getResponse = await fetch(
      `${backendUrl}/api/v1/company-subscriptions?company_id=${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Token": apiToken,
        },
      }
    );

    if (!getResponse.ok) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const subscriptions = await getResponse.json();
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const subscription = subscriptions[0];

    // Update the subscription
    const updateResponse = await fetch(
      `${backendUrl}/api/v1/company-subscriptions/${subscription.id}`,
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

    if (!updateResponse.ok) {
      const error = await updateResponse.json().catch(() => ({ error: "Failed to update subscription" }));
      return NextResponse.json(
        { error: error.error || "Failed to update subscription" },
        { status: updateResponse.status }
      );
    }

    const data = await updateResponse.json();

    return NextResponse.json({
      success: true,
      subscription: data,
      message: "Subscription updated successfully",
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
