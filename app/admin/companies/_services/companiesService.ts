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
  const created_at =
    (c.created_at ?? c.created ?? c.createdAt ?? new Date().toISOString()) as string;
  const status = (c.status ?? c.state ?? c.company_status ?? "unknown") as Company["status"];

  return {
    id,
    name,
    company_code: company_code || "",
    phone: phone || "",
    email: email || "",
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

