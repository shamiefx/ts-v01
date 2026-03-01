"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getCompanyById,
  updateCompany,
  type UpdateCompanyData,
} from "../_services/companiesService";

type CompanyForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  company_code: string;
};

export default function CompanyDetailPage() {
  const params = useParams<{ companyId: string }>();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<CompanyForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    company_code: "",
  });

  const [initialForm, setInitialForm] = useState<CompanyForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    company_code: "",
  });

  useEffect(() => {
    let active = true;

    async function loadCompany() {
      if (!companyId) return;

      try {
        setLoading(true);
        setError(null);

        const company = await getCompanyById(companyId);
        if (!active) return;

        const nextForm: CompanyForm = {
          name: company.name || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          company_code: company.company_code || "",
        };

        setForm(nextForm);
        setInitialForm(nextForm);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load company details",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCompany();

    return () => {
      active = false;
    };
  }, [companyId]);

  const handleSave = async () => {
    if (!companyId) return;

    setError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    const normalizedName = form.name.trim().toUpperCase();
    const normalizedAddress = form.address.trim().toUpperCase();
    const normalizedEmail = form.email.trim().toLowerCase();

    const payload: UpdateCompanyData = {
      name: normalizedName,
      email: normalizedEmail,
      phone: form.phone.trim() || undefined,
      address: normalizedAddress || undefined,
      company_code: form.company_code.trim() || undefined,
    };

    try {
      setSaving(true);
      await updateCompany(companyId, payload);
      const normalizedForm: CompanyForm = {
        ...form,
        name: normalizedName,
        address: normalizedAddress,
        email: normalizedEmail,
      };
      setForm(normalizedForm);
      setInitialForm(normalizedForm);
      setEditMode(false);
      setSuccess("Company updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setError(null);
    setSuccess(null);
    setForm(initialForm);
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-zinc-600">Loading company details...</p>
      </div>
    );
  }

  if (error && !editMode) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Company Detail</h1>
        <p className="mt-2 text-sm text-zinc-600">
          View and edit company information
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {success ? (
          <p className="mb-4 text-sm text-green-700">{success}</p>
        ) : null}
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
            <div className="text-sm font-medium text-zinc-700">
              Company Code
            </div>
            <div className="text-sm text-zinc-900">
              {form.company_code || "-"}
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
            <div className="text-sm font-medium text-zinc-700">Name</div>
            <div className="text-sm text-zinc-900">
              {editMode ? (
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Company name"
                />
              ) : (
                form.name || "-"
              )}
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
            <div className="text-sm font-medium text-zinc-700">Email</div>
            <div className="text-sm text-zinc-900">
              {editMode ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      email: e.target.value.toLowerCase(),
                    }))
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="company@example.com"
                />
              ) : (
                form.email || "-"
              )}
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
            <div className="text-sm font-medium text-zinc-700">Phone</div>
            <div className="text-sm text-zinc-900">
              {editMode ? (
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Phone"
                />
              ) : (
                form.phone || "-"
              )}
            </div>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
            <div className="text-sm font-medium text-zinc-700">Address</div>
            <div className="text-sm text-zinc-900">
              {editMode ? (
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Address"
                  rows={3}
                />
              ) : (
                form.address || "-"
              )}
            </div>
          </div>

          <div className="pt-2">
            {editMode ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="rounded-md border px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/admin/companies"
                  className="rounded-md border px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Back
                </Link>
                <button
                  type="button"
                  className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setEditMode(true);
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
