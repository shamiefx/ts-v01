/**
 * Trial Helper Functions
 * Calculate trial status based on created_at date
 */

export interface TrialInfo {
  isInTrial: boolean;
  trialStartDate: Date;
  trialEndDate: Date;
  daysRemaining: number;
  daysTotal: number;
  hasExpired: boolean;
}

/**
 * Calculate trial information based on company created_at date
 * Trial period is 30 days from creation
 */
export function calculateTrialInfo(createdAt: string): TrialInfo {
  const trialStartDate = new Date(createdAt);
  const trialEndDate = new Date(trialStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial
  
  const now = new Date();
  const diffMs = trialEndDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  const isInTrial = daysRemaining > 0;
  const hasExpired = daysRemaining <= 0;
  
  return {
    isInTrial,
    trialStartDate,
    trialEndDate,
    daysRemaining: Math.max(0, daysRemaining),
    daysTotal: 30,
    hasExpired,
  };
}

/**
 * Format date for display
 */
export function formatTrialDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Determine subscription state
 */
export type SubscriptionState = "trial" | "active" | "expired";

export interface SubscriptionData {
  id?: string;
  plan_id?: string;
  plan_name?: string;
  billing_cycle?: string;
  amount?: string | number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export function getSubscriptionState(
  subscription: SubscriptionData | null | undefined,
  createdAt: string
): SubscriptionState {
  // If has active subscription with valid status
  if (subscription && subscription.status === "active") {
    return "active";
  }
  
  // Check trial period
  const trialInfo = calculateTrialInfo(createdAt);
  
  if (trialInfo.isInTrial) {
    return "trial";
  }
  
  // Trial expired and no active subscription
  return "expired";
}
