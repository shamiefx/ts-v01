"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PlanOption } from "../../companies/_services/companiesService";
import { getCompanies, type Company } from "../../companies/_services/companiesService";
import { createSubscription } from "../_services/subscriptionService";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanOption;
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

export function SubscribeModal({ isOpen, onClose, plan }: SubscribeModalProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCompanies() {
      try {
        setLoadingCompanies(true);
        const data = await getCompanies();
        setCompanies(data);
        if (data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load companies");
      } finally {
        setLoadingCompanies(false);
      }
    }

    fetchCompanies();
  }, [isOpen, selectedCompanyId]);

  if (!isOpen) return null;

  const monthlyPrice = plan.monthlyPrice;
  const yearlyTotal = monthlyPrice * 12 * 0.9; // 10% discount
  const selectedPrice = billingCycle === "yearly" ? yearlyTotal : monthlyPrice;

  const handleSubscribe = async () => {
    if (!selectedCompanyId) {
      setError("Please select a company");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await createSubscription({
        company_id: selectedCompanyId,
        plan_id: plan.id,
        billing_cycle: billingCycle,
      });

      // Success - redirect to company detail
      router.push(`/admin/companies/${selectedCompanyId}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl mx-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900">Subscribe to {plan.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Trial Info */}
        <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-900">
                30-day free trial included
              </p>
              <p className="mt-1 text-xs text-green-800">
                No payment required now. Billing starts after trial ends.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Select Company <span className="text-red-500">*</span>
            </label>
            {loadingCompanies ? (
              <div className="mt-1 text-sm text-zinc-500">Loading companies...</div>
            ) : companies.length === 0 ? (
              <div className="mt-1 text-sm text-red-600">
                No companies found. Please create a company first.
              </div>
            ) : (
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-3">
              Billing Cycle
            </label>
            <div className="space-y-3">
              <label
                className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition ${
                  billingCycle === "monthly"
                    ? "border-blue-600 bg-blue-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="monthly"
                    checked={billingCycle === "monthly"}
                    onChange={(e) => setBillingCycle(e.target.value as "monthly")}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Monthly</div>
                    <div className="text-sm text-zinc-600">Billed monthly after trial</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatPrice(monthlyPrice, plan.currency)}</div>
                  <div className="text-xs text-zinc-500">per month</div>
                </div>
              </label>

              <label
                className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition ${
                  billingCycle === "yearly"
                    ? "border-blue-600 bg-blue-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="yearly"
                    checked={billingCycle === "yearly"}
                    onChange={(e) => setBillingCycle(e.target.value as "yearly")}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Yearly</div>
                    <div className="text-sm text-zinc-600">Save 10% - Billed yearly after trial</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatPrice(yearlyTotal, plan.currency)}</div>
                  <div className="text-xs text-zinc-500">per year</div>
                  <div className="text-xs text-green-600 font-medium">
                    Save {formatPrice(monthlyPrice * 12 * 0.1, plan.currency)}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-zinc-50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-700">
                Amount after trial:
              </span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(selectedPrice, plan.currency)}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              Billing starts after your 30-day free trial ends
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubscribe}
            disabled={loading || loadingCompanies || companies.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Starting Trial..." : "Start Free Trial"}
          </button>
        </div>
      </div>
    </div>
  );
}
