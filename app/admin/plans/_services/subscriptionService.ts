import { apiFetch } from "@/lib/api";

export interface CreateSubscriptionData {
  company_id: string;
  plan_id: string;
  billing_cycle: "monthly" | "yearly";
}

export async function createSubscription(data: CreateSubscriptionData) {
  // Create subscription via API
  // Backend expects: POST /api/v1/company-subscriptions with company_id in body
  const response = await apiFetch(`/api/company-subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company_id: data.company_id,
      plan_id: data.plan_id,
      billing_cycle: data.billing_cycle,
    }),
  });

  return response;
}
