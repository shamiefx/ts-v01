"use client";

import React from "react";
import type { PlanOption } from "../../companies/_services/companiesService";

interface PlanCardProps {
  plan: PlanOption;
  onSelect: () => void;
}

function formatPrice(price: number, currency?: string) {
  const curr = currency || "MYR";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${curr} ${price.toFixed(2)}`;
  }
}

export function PlanCard({ plan, onSelect }: PlanCardProps) {
  const monthlyPrice = plan.monthlyPrice;
  const yearlyPrice = monthlyPrice * 12;
  const yearlyDiscount = yearlyPrice * 0.1; // 10% discount
  const yearlyPriceWithDiscount = yearlyPrice - yearlyDiscount;

  return (
    <div className="group relative rounded-lg border-2 border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
      {/* Plan Name */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-zinc-900">{plan.name}</h3>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-zinc-900">
            {formatPrice(monthlyPrice, plan.currency)}
          </span>
          <span className="text-sm text-zinc-600">/month</span>
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          or {formatPrice(yearlyPriceWithDiscount, plan.currency)}/year
          <span className="ml-1 text-green-600 font-medium">Save {formatPrice(yearlyDiscount, plan.currency)}</span>
        </p>
      </div>

      {/* Plan Description */}
      {plan.description && (
        <div className="mb-6">
          <p className="text-sm text-zinc-600">{plan.description}</p>
        </div>
      )}

{/* Features */}
      <div className="mb-6 space-y-3">
        <div className="flex items-start gap-2">
          <svg
            className="h-5 w-5 shrink-0 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm text-zinc-700">30-day free trial included</span>
        </div>
        <div className="flex items-start gap-2">
          <svg
            className="h-5 w-5 shrink-0 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm text-zinc-700">Cancel anytime</span>
        </div>
        <div className="flex items-start gap-2">
          <svg
            className="h-5 w-5 shrink-0 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm text-zinc-700">Unlimited Employees</span>
        </div>
        <div className="flex items-start gap-2">
          <svg
            className="h-5 w-5 shrink-0 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm text-zinc-700">No credit card required for trial</span>
        </div>
      </div>

      {/* Modules */}
      {plan.modules && plan.modules.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-zinc-900">Included Modules:</h4>
          <div className="space-y-2">
            {plan.modules.map((module) => (
              <div key={module} className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 shrink-0 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-zinc-700 capitalize">{module}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trial Badge */}
      {/* <div className="mt-4 rounded-lg bg-green-50 p-3 text-center">
        <p className="text-xs font-medium text-green-800">
          Start your free trial today
        </p>
      </div> */}

      {/* Select Button */}
      <button
        onClick={onSelect}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 group-hover:bg-blue-700"
      >
        Select Plan
      </button>
    </div>
  );
}
