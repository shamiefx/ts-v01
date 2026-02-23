import React from "react";
import { CompaniesList } from "./_components/CompaniesList";

export default function CompaniesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Companies</h1>
        <p className="mt-2 text-sm text-zinc-600">Manage your company information</p>
      </div>
      <CompaniesList />
    </div>
  );
}