import { Company } from "../_components/CompaniesList";

export async function getCompanies(): Promise<Company[]> {
  try {
    // Fetch from Next.js API route
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    
    const response = await fetch("/api/companies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("API response error:", response.status);
      return [];
    }

    const data = await response.json();
    
    // Ensure we always return an array
    let companies: Company[] = [];
    
    if (Array.isArray(data)) {
      companies = data;
    } else if (data && Array.isArray(data.data)) {
      companies = data.data;
    } else if (data && typeof data === "object") {
      // If it's an object with companies/items property
      companies = (data.companies || data.items || data.results) as Company[];
    }
    
    return Array.isArray(companies) ? companies : [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

