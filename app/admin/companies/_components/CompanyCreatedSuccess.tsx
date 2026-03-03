"use client";

import React from "react";
import Link from "next/link";
import { calculateTrialInfo, formatTrialDate } from "@/lib/trialHelpers";

interface CompanyCreatedSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  createdAt: string;
}

export function CompanyCreatedSuccess({
  isOpen,
  onClose,
  companyId,
  companyName,
  createdAt,
}: CompanyCreatedSuccessProps) {
  if (!isOpen) return null;

  const trialInfo = calculateTrialInfo(createdAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl mx-4">
        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
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
        </div>

        {/* Content */}
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-zinc-900">
            Company Created Successfully! 🎉
          </h2>
          <p className="mt-2 text-sm text-zinc-600">{companyName}</p>
        </div>

        {/* Trial Info Card */}
        <div className="mt-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">
                30-day free trial begins today
              </p>
              <p className="mt-2 text-sm text-green-800">
                <span className="font-medium">Trial ends on:</span>
                <br />
                {formatTrialDate(trialInfo.trialEndDate)}
              </p>
              <p className="mt-1 text-xs text-green-700">
                Enjoy full access to all features during your trial period!
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Next step:</strong> Explore our plans and choose the one that fits your needs. You can upgrade anytime during your trial.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Link
            href="/admin/plans"
            className="block w-full rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
            onClick={onClose}
          >
            View Plans
          </Link>
          <Link
            href={`/admin/companies/${companyId}`}
            className="block w-full rounded-md border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            onClick={onClose}
          >
            Go to Company Details
          </Link>
          <button
            onClick={onClose}
            className="block w-full rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
