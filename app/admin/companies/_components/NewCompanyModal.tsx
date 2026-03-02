"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getPlans, type PlanOption } from "../_services/companiesService";

export interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<void>;
}

export interface CompanyFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  plan_id: string;
  billing_cycle: "monthly" | "yearly";
  amount: string;
}

export function NewCompanyModal({ isOpen, onClose, onSubmit }: NewCompanyModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    plan_id: "",
    billing_cycle: "monthly",
    amount: "0.00",
  });
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    async function loadPlans() {
      try {
        setPlansLoading(true);
        const list = await getPlans();
        if (!active) return;
        setPlans(list);
        setFormData((prev) => ({
          ...prev,
          plan_id: prev.plan_id || list[0]?.id || "",
        }));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load plans");
      } finally {
        if (active) setPlansLoading(false);
      }
    }

    loadPlans();

    return () => {
      active = false;
    };
  }, [isOpen]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === formData.plan_id) ?? null,
    [plans, formData.plan_id],
  );

  const monthlyPrice = selectedPlan?.monthlyPrice ?? 0;
  const yearlyPriceBeforeDiscount = monthlyPrice * 12;
  const yearlyDiscountAmount = yearlyPriceBeforeDiscount * 0.1;
  const yearlyPrice = yearlyPriceBeforeDiscount - yearlyDiscountAmount;

  function formatMoney(value: number, currency?: string) {
    const curr = currency || "USD";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: curr,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${curr}`;
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.plan_id) {
      setError("Plan is required.");
      return;
    }

    if (!selectedPlan) {
      setError("Selected plan is invalid.");
      return;
    }

    const computedAmountNumber =
      formData.billing_cycle === "yearly"
        ? selectedPlan.monthlyPrice * 12 * 0.9
        : selectedPlan.monthlyPrice;

    const computedAmount = computedAmountNumber.toFixed(2);

    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        amount: computedAmount,
      });
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        plan_id: plans[0]?.id || "",
        billing_cycle: "monthly",
        amount: "0.00",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          <h2 className="text-2xl font-bold text-zinc-900">New Company</h2>
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

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="company@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-zinc-700">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter company address"
            />
          </div>

          <div>
            <label htmlFor="plan_id" className="block text-sm font-medium text-zinc-700">
              Plan <span className="text-red-500">*</span>
            </label>
            <select
              id="plan_id"
              name="plan_id"
              required
              value={formData.plan_id}
              onChange={handleChange}
              disabled={plansLoading}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-zinc-100"
            >
              {plans.length === 0 ? (
                <option value="">{plansLoading ? "Loading plans..." : "No plans available"}</option>
              ) : null}
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="billing_cycle" className="block text-sm font-medium text-zinc-700">
              Billing Cycle
            </label>
            <select
              id="billing_cycle"
              name="billing_cycle"
              value={formData.billing_cycle}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly (10% discount)</option>
            </select>
            {selectedPlan ? (
              <p className="mt-2 text-xs text-zinc-600">
                {formData.billing_cycle === "yearly"
                  ? `Yearly: ${formatMoney(yearlyPrice, selectedPlan.currency)} (saved ${formatMoney(yearlyDiscountAmount, selectedPlan.currency)} from ${formatMoney(yearlyPriceBeforeDiscount, selectedPlan.currency)})`
                  : `Monthly: ${formatMoney(monthlyPrice, selectedPlan.currency)} / month`}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
