"use client";

import React, { useState } from "react";
import { CompaniesList } from "./_components/CompaniesList";
import { NewCompanyModal } from "./_components/NewCompanyModal";
import { createCompany } from "./_services/companiesService";
import type { CompanyFormData } from "./_components/NewCompanyModal";

export default function CompaniesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateCompany = async (data: CompanyFormData) => {
    await createCompany(data);
    // Trigger refresh of companies list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Companies</h1>
          <p className="mt-2 text-sm text-zinc-600">Manage your company information</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create
        </button>
      </div>
      <CompaniesList key={refreshKey} />
      <NewCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCompany}
      />
    </div>
  );
}