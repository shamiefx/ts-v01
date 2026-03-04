"use client";

import React, { useState, useEffect } from "react";
import type { PlanOption } from "../_services/companiesService";
import { getPlans } from "../_services/companiesService";

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
}

export function NewCompanyModal({ isOpen, onClose, onSubmit }: NewCompanyModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    plan_id: "",
    billing_cycle: "monthly", // Always default to monthly
  });
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});
  const [plans, setPlans] = useState<PlanOption[]>([]);

  // Fetch plans when modal opens
  useEffect(() => {
    if (isOpen && plans.length === 0 && !plansLoading) {
      fetchPlans();
    }
  }, [isOpen, plans.length, plansLoading]);

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const fetchedPlans = await getPlans();
      // Filter to show only active plans
      const activePlans = fetchedPlans.filter((plan) => plan.status === "active");
      setPlans(activePlans);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError("Failed to load plans");
    } finally {
      setPlansLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: { name?: string; email?: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Company name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!formData.plan_id) {
      setError("Please select a plan to continue");
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        plan_id: "",
        billing_cycle: "monthly",
      });
      setFieldErrors({});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl rounded-xl bg-white shadow-2xl mx-4 my-8">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-linear-to-r from-blue-50 to-white px-6 py-5 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Register Company</h2>
            <p className="text-sm text-zinc-600 mt-1">Quick and easy setup - get started in minutes</p>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white hover:text-zinc-700 transition-colors"
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

        <div className="flex">
          {/* Left Column - Company Form */}
          <div className="w-1/2 border-r border-zinc-200 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-2">
                  <svg className="h-5 w-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    placeholder="Enter your company name"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    placeholder="company@example.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Total Amount Display */}
              {formData.plan_id && (
                (() => {
                  const selectedPlan = plans.find((p) => p.id === formData.plan_id);
                  if (!selectedPlan) return null;

                  const currency = selectedPlan.currency || "MYR";
                  const amount = selectedPlan.monthlyPrice;

                  return (
                    <div className="pt-6 border-t border-zinc-200">
                      <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Selected Plan</p>
                            <p className="text-base font-bold text-zinc-900 mt-1">{selectedPlan.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-600">Total Amount</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {currency} {amount.toFixed(2)}
                              <span className="text-sm font-normal text-zinc-600"> /month</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-200/50">
                          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs text-green-700 font-medium">30-day free trial included • Cancel anytime</p>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-zinc-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-10 pr-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div> */}

              {/* <div>
                <label htmlFor="address" className="block text-sm font-semibold text-zinc-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full pl-10 pr-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="Enter company address"
                  />
                </div>
              </div> */}
            </form>
          </div>

          {/* Right Column - Plan Selection */}
          <div className="w-1/2 overflow-y-auto p-6 bg-linear-to-br from-zinc-50 to-zinc-100">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-zinc-900">Choose Your Plan</h3>
              <p className="text-xs text-zinc-600 mt-1">
                Select the perfect plan for your business <span className="text-red-500">*</span>
              </p>
            </div>
            
            {plansLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-300 border-t-blue-600 mb-4"></div>
                <div className="text-sm text-zinc-500">Loading plans...</div>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <svg className="h-16 w-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <div className="text-sm text-zinc-500">No plans available</div>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setFormData((prev) => ({ ...prev, plan_id: plan.id }))}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.plan_id === plan.id
                        ? "border-blue-500 bg-white shadow-lg ring-2 ring-blue-200 scale-[1.02]"
                        : "border-zinc-200 bg-white hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    {formData.plan_id === plan.id && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1.5 shadow-lg">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <h4 className="text-lg font-bold text-zinc-900 mb-1">{plan.name}</h4>
                      {plan.description && (
                        <p className="text-xs text-zinc-600 leading-relaxed">{plan.description}</p>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 mb-3 pb-3 border-b border-zinc-200">
                      <span className="text-xl font-bold text-zinc-900">
                        {plan.currency || "MYR"}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {plan.monthlyPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-600 ml-1">/month</span>
                    </div>

                    {plan.modules && plan.modules.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-700 mb-2">Included Modules:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.modules.map((module, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                formData.plan_id === plan.id
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-zinc-200 text-zinc-700"
                              }`}
                            >
                              {module.charAt(0).toUpperCase() + module.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-linear-to-r from-zinc-50 to-white px-6 py-5 rounded-b-xl">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure and encrypted</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.plan_id || !formData.name || !formData.email}
              className="rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-8 py-3 text-sm font-bold text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating Company...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Company
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
