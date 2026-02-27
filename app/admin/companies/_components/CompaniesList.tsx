"use client";

import React, { useEffect, useState } from "react";
import { getCompanies } from "@/app/admin/companies/_services/companiesService";

export interface Company {
  id: string;
  name: string;
  company_code: string;
  phone: string;
  email: string;
  created_at: string;
  status?: "active" | "inactive" | "suspended" | "unknown" | null;
}

function normalizeStatus(status: Company["status"]): "active" | "inactive" | "suspended" | "unknown" {
  if (status === "active" || status === "inactive" || status === "suspended") return status;
  return "unknown";
}

function statusLabel(status: "active" | "inactive" | "suspended" | "unknown") {
  if (status === "unknown") return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
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
              Company Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-700">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                {company.name}
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700">{company.company_code}</td>
              <td className="px-6 py-4 text-sm text-zinc-700">{company.phone}</td>
              <td className="px-6 py-4 text-sm text-zinc-700">{company.email}</td>
              <td className="px-6 py-4 text-sm text-zinc-700">
                {new Date(company.created_at).toLocaleDateString()}
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
                <span className="font-medium text-zinc-700">Phone:</span>{" "}
                <span className="text-zinc-600">{company.phone}</span>
              </p>
              <p>
                <span className="font-medium text-zinc-700">Email:</span>{" "}
                <span className="text-zinc-600">{company.email}</span>
              </p>
              <p>
                <span className="font-medium text-zinc-700">Created:</span>{" "}
                <span className="text-zinc-600">
                  {new Date(company.created_at).toLocaleDateString()}
                </span>
              </p>
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
