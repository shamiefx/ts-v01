"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCompanies } from "@/app/admin/companies/_services/companiesService";

export interface Company {
  id: string;
  name: string;
  company_code: string;
  phone: string;
  email: string;
  address?: string;
  created_at: string;
  status?: "active" | "inactive" | "suspended" | "unknown" | null;
  user_type?: "owner" | "manager" | "employee" | string;
  subscription?: {
    id?: string;
    plan_id?: string;
    plan_name?: string;
    billing_cycle?: "monthly" | "yearly" | string;
    amount?: string | number;
    currency?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  };
}

function normalizeStatus(status: Company["status"]): "active" | "inactive" | "suspended" | "unknown" {
  if (status === "active" || status === "inactive" || status === "suspended") return status;
  return "unknown";
}

function statusLabel(status: "active" | "inactive" | "suspended" | "unknown") {
  if (status === "unknown") return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function roleLabel(role?: Company["user_type"]) {
  if (!role) return "-";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function billingLabel(cycle?: string) {
  if (!cycle) return "-";
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
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
  return d.toLocaleDateString();
}

export function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const data = await getCompanies();
        setCompanies(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load companies");
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-600">Loading companies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      {/* Desktop Table */}
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Company Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Billing
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Renewal
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-6 py-4 text-sm text-zinc-700">{company.company_code}</td>
              <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                {company.name}
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700">
                <div>{company.phone || "-"}</div>
                <div className="text-xs text-zinc-500">{company.email || "-"}</div>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {roleLabel(company.user_type)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700">
                {company.subscription?.plan_name || "-"}
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700">
                <div>{billingLabel(company.subscription?.billing_cycle)}</div>
                <div className="text-xs text-zinc-500">
                  {formatAmount(company.subscription?.amount, company.subscription?.currency)}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700">
                {formatDate(company.subscription?.end_date)}
              </td>
              <td className="px-6 py-4 text-sm">
                {(() => {
                  const s = normalizeStatus(company.status);
                  return (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    s === "active"
                      ? "bg-green-100 text-green-800"
                      : s === "inactive"
                        ? "bg-zinc-100 text-zinc-800"
                        : s === "suspended"
                          ? "bg-red-100 text-red-800"
                          : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {statusLabel(s)}
                </span>
                  );
                })()}
              </td>
              <td className="px-6 py-4 text-sm">
                <Link
                  href={`/admin/companies/${company.id}`}
                  className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="divide-y divide-zinc-200 md:hidden">
        {companies.map((company) => (
          <div
            key={company.id}
            className="space-y-3 border-b border-zinc-200 p-4 hover:bg-zinc-50 transition-colors last:border-b-0"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-zinc-900">{company.name}</p>
                <p className="text-xs text-zinc-600">{company.company_code}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  normalizeStatus(company.status) === "active"
                    ? "bg-green-100 text-green-800"
                    : normalizeStatus(company.status) === "inactive"
                      ? "bg-zinc-100 text-zinc-800"
                      : normalizeStatus(company.status) === "suspended"
                        ? "bg-red-100 text-red-800"
                        : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {statusLabel(normalizeStatus(company.status))}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium text-zinc-700">Role:</span>{" "}
                <span className="text-zinc-600">{roleLabel(company.user_type)}</span>
              </p>
              <p>
                <span className="font-medium text-zinc-700">Email:</span>{" "}
                <span className="text-zinc-600">{company.email}</span>
              </p>
              <p>
                <span className="font-medium text-zinc-700">Plan:</span>{" "}
                <span className="text-zinc-600">
                  {company.subscription?.plan_name || "-"}
                </span>
              </p>
              <p>
                <span className="font-medium text-zinc-700">Billing:</span>{" "}
                <span className="text-zinc-600">
                  {billingLabel(company.subscription?.billing_cycle)} • {formatAmount(company.subscription?.amount, company.subscription?.currency)}
                </span>
              </p>
              <p>
                <span className="font-medium text-zinc-700">Renewal:</span>{" "}
                <span className="text-zinc-600">{formatDate(company.subscription?.end_date)}</span>
              </p>
              <div className="pt-2">
                <Link
                  href={`/admin/companies/${company.id}`}
                  className="inline-block rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && !loading && (
        <div className="px-6 py-12 text-center">
          <p className="text-zinc-600">No companies found</p>
        </div>
      )}
    </div>
  );
}
