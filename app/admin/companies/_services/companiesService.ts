import type { Company } from "../_components/CompaniesList";
import { apiFetch } from "@/lib/api";

function normalizeCompany(input: unknown): Company | null {
  if (!input || typeof input !== "object") return null;
  const maybeWrapper = input as Record<string, unknown>;
  const subscriptionObj =
    maybeWrapper.subscription && typeof maybeWrapper.subscription === "object"
      ? (maybeWrapper.subscription as Record<string, unknown>)
      : null;
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
  const user_type =
    (maybeWrapper.user_type ?? maybeWrapper.userType ?? maybeWrapper.role) as
      | Company["user_type"]
      | undefined;

  const subscription = subscriptionObj
    ? {
        id: (subscriptionObj.id ?? subscriptionObj.subscription_id) as string | undefined,
        plan_id: (subscriptionObj.plan_id ?? subscriptionObj.planId) as string | undefined,
        plan_name: (subscriptionObj.plan_name ?? subscriptionObj.planName) as string | undefined,
        billing_cycle: (subscriptionObj.billing_cycle ??
          subscriptionObj.billingCycle) as string | undefined,
        amount: (subscriptionObj.amount ?? subscriptionObj.price) as string | number | undefined,
        currency: (subscriptionObj.currency ?? subscriptionObj.currency_code) as string | undefined,
        start_date: (subscriptionObj.start_date ?? subscriptionObj.startDate) as string | undefined,
        end_date: (subscriptionObj.end_date ?? subscriptionObj.endDate) as string | undefined,
        status: (subscriptionObj.status ?? "unknown") as string | undefined,
      }
    : undefined;

  return {
    id,
    name,
    company_code: company_code || "",
    phone: phone || "",
    email: email || "",
    address: address || "",
    created_at: created_at || new Date().toISOString(),
    status,
    user_type,
    subscription,
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
  plan_id: string;
  billing_cycle?: "monthly" | "yearly";
  amount?: string;
}

export interface PlanOption {
  id: string;
  name: string;
  monthlyPrice: number;
  currency?: string;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company_code?: string;
}

export async function createCompany(data: CreateCompanyData): Promise<{ company_id: string; message: string }> {
  const requestBody = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    plan_id: data.plan_id,
    billing_cycle: data.billing_cycle ?? "monthly",
    amount: data.amount,
  };

  const response = await apiFetch<{ message: string; company_id: string }>("/api/companies", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  return response;
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function normalizePlan(input: unknown): PlanOption | null {
  if (!input || typeof input !== "object") return null;
  const p = input as Record<string, unknown>;

  const id = (p.id ?? p.plan_id ?? p.uuid) as string | undefined;
  if (!id) return null;

  const name =
    ((p.name ?? p.plan_name ?? p.title) as string | undefined)?.trim() || "Unnamed Plan";

  const monthlyPrice = toNumber(
    p.monthly_price ?? p.monthlyPrice ?? p.price_monthly ?? p.price ?? 0,
  );

  const currency =
    ((p.currency ?? p.currency_code ?? p.curr) as string | undefined)?.trim() || undefined;

  return { id, name, monthlyPrice, currency };
}

export async function getPlans(): Promise<PlanOption[]> {
  const data = await apiFetch<unknown>("/api/plans", {
    method: "GET",
    cache: "no-store",
  });

  let plansRaw: unknown[] = [];

  if (Array.isArray(data)) {
    plansRaw = data;
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.plans)) plansRaw = obj.plans;
    else if (Array.isArray(obj.data)) plansRaw = obj.data;
    else if (Array.isArray(obj.items)) plansRaw = obj.items;
    else if (obj.plan && typeof obj.plan === "object") plansRaw = [obj.plan];
  }

  return plansRaw
    .map(normalizePlan)
    .filter((p): p is PlanOption => Boolean(p));
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

