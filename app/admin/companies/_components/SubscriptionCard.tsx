"use client";

import React from "react";
import Link from "next/link";
import {
  calculateTrialInfo,
  formatTrialDate,
  getSubscriptionState,
  type SubscriptionState,
} from "@/lib/trialHelpers";

interface SubscriptionCardProps {
  subscription: {
    id?: string;
    plan_id?: string;
    plan_name?: string;
    billing_cycle?: string;
    amount?: string | number;
    currency?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  } | null | undefined;
  createdAt: string;
}

function formatAmount(amount?: string | number, currency?: string) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "-";
  const curr = currency || "MYR";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${curr}`;
  }
}

function formatDate(date?: string) {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function SubscriptionCard({ subscription, createdAt }: SubscriptionCardProps) {
  const state: SubscriptionState = getSubscriptionState(subscription, createdAt);
  const trialInfo = calculateTrialInfo(createdAt);

  // State 1: Trial
  if (state === "trial") {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Subscription</h2>
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Trial
          </span>
        </div>
        
        <div className="mt-4 rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 shrink-0 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">
                You&apos;re on a 30-day free trial
              </p>
              <p className="mt-1 text-sm text-green-800">
                Trial ends on {formatTrialDate(trialInfo.trialEndDate)}
              </p>
              <p className="mt-1 text-xs font-medium text-green-700">
                ({trialInfo.daysRemaining} days left)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/admin/plans"
            className="block w-full rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            Upgrade now
          </Link>
          <Link
            href="/admin/plans"
            className="block w-full rounded-md border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            View plans
          </Link>
        </div>

        <div className="mt-4 rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Subscribe before trial ends to keep all your data and continue without interruption.
          </p>
        </div>
      </div>
    );
  }

  // State 2: Active
  if (state === "active") {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Subscription</h2>
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Active
          </span>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-3 border-b pb-2">
            <span className="text-zinc-500">Plan</span>
            <span className="text-right font-medium text-zinc-900">
              {subscription?.plan_name || "-"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 border-b pb-2">
            <span className="text-zinc-500">Billing Cycle</span>
            <span className="font-medium text-zinc-900 capitalize">
              {subscription?.billing_cycle || "-"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 border-b pb-2">
            <span className="text-zinc-500">Amount</span>
            <span className="font-medium text-zinc-900">
              {formatAmount(subscription?.amount, subscription?.currency)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 border-b pb-2">
            <span className="text-zinc-500">Start Date</span>
            <span className="font-medium text-zinc-900">
              {formatDate(subscription?.start_date)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-zinc-500">Renews on</span>
            <span className="font-medium text-zinc-900">
              {formatDate(subscription?.end_date)}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/admin/billing"
            className="block w-full rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            Manage billing
          </Link>
          <Link
            href="/admin/plans"
            className="block w-full rounded-md border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Change plan
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Expired
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Subscription</h2>
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
          Expired
        </span>
      </div>

      <div className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 shrink-0 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Trial ended</p>
            <p className="mt-1 text-sm text-red-800">
              Trial ended on {formatTrialDate(trialInfo.trialEndDate)}
            </p>
            <p className="mt-2 text-sm text-red-800">
              Your company is now in <strong>read-only mode</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/plans"
          className="block w-full rounded-md bg-red-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-red-700"
        >
          Subscribe to continue
        </Link>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 p-3">
        <p className="text-xs text-amber-800">
          ⚠️ <strong>Important:</strong> Subscribe now to regain full access to all features and your data.
        </p>
      </div>
    </div>
  );
}
