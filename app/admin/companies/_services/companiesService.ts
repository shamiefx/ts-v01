import type { Company } from "../_components/CompaniesList";
import { apiFetch } from "@/lib/api";

function normalizeCompany(input: unknown): Company | null {
  if (!input || typeof input !== "object") return null;
  const maybeWrapper = input as Record<string, unknown>;
  const c =
    maybeWrapper.company && typeof maybeWrapper.company === "object"
      ? (maybeWrapper.company as Record<string, unknown>)
      : maybeWrapper;

  const id = (c.id ?? c.company_id) as string | undefined;
  const name = (c.name ?? c.company_name) as string | undefined;
  if (!id || !name) return null;

  const company_code =
    (c.company_code ?? c.code ?? c.companyCode ?? c.companyCode) as string | undefined;
  const phone = (c.phone ?? c.company_phone ?? "") as string;
  const email = (c.email ?? c.company_email ?? "") as string;
  const address = (c.address ?? c.company_address ?? "") as string;
  const created_at =
    (c.created_at ?? c.created ?? c.createdAt ?? new Date().toISOString()) as string;
  const status = (c.status ?? c.state ?? c.company_status ?? "unknown") as Company["status"];

  return {
    id,
    name,
    company_code: company_code || "",
    phone: phone || "",
    email: email || "",
    address: address || "",
    created_at: created_at || new Date().toISOString(),
    status,
  };
}

export async function getCompanies(): Promise<Company[]> {
  const data = await apiFetch<unknown>("/api/companies", {
    method: "GET",
    cache: "no-store",
  });

  // Ensure we always return an array
  let companies: unknown[] = [];
  if (Array.isArray(data)) {
    companies = data;
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) companies = obj.data;
    else if (Array.isArray(obj.companies)) companies = obj.companies;
    else if (Array.isArray(obj.items)) companies = obj.items;
    else if (Array.isArray(obj.results)) companies = obj.results;
  }

  return companies.map(normalizeCompany).filter((c): c is Company => Boolean(c));
}

export async function getCompanyById(companyId: string): Promise<Company> {
  const data = await apiFetch<unknown>(`/api/companies?companyId=${encodeURIComponent(companyId)}`, {
    method: "GET",
    cache: "no-store",
  });

  const normalized = normalizeCompany(data);
  if (!normalized) {
    throw new Error("Failed to load company details");
  }

  return normalized;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company_code?: string;
}

export async function createCompany(data: CreateCompanyData): Promise<{ company_id: string; message: string }> {
  // Workaround: Backend expects company_code field (even if empty) due to auto-generation bug
  const requestBody = {
    ...data,
    company_code: "", // Backend will auto-generate this
  };

  const response = await apiFetch<{ message: string; company_id: string }>("/api/companies", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  return response;
}

export async function updateCompany(
  companyId: string,
  data: UpdateCompanyData
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/companies?companyId=${encodeURIComponent(companyId)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

