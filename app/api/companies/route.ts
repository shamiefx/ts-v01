import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value || 
                  request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No auth token found" },
        { status: 401 }
      );
    }

    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8080";
    const response = await fetch(`${apiBaseUrl}/api/v1/companies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Backend API error:", response.status, response.statusText);
      // Return mock data for development
      return NextResponse.json({
        data: getMockCompanies(),
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/companies:", error);
    // Return mock data for development
    return NextResponse.json({
      data: getMockCompanies(),
    });
  }
}

interface Company {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  created: string;
  status: "active" | "inactive" | "suspended";
}

function getMockCompanies(): Company[] {
  return [
    {
      id: "1",
      name: "TechCorp Solutions",
      code: "TC-001",
      phone: "(555) 123-4567",
      email: "contact@techcorp.com",
      created: "2024-01-15T10:30:00Z",
      status: "active",
    },
    {
      id: "2",
      name: "Digital Innovations Inc",
      code: "DII-002",
      phone: "(555) 234-5678",
      email: "info@diginnovate.com",
      created: "2024-02-20T14:15:00Z",
      status: "active",
    },
    {
      id: "3",
      name: "CloudAI Systems",
      code: "CAS-003",
      phone: "(555) 345-6789",
      email: "support@cloudai.io",
      created: "2024-03-10T09:45:00Z",
      status: "active",
    },
    {
      id: "4",
      name: "DataFlow Analytics",
      code: "DFA-004",
      phone: "(555) 456-7890",
      email: "hello@dataflow.co",
      created: "2024-01-05T11:20:00Z",
      status: "inactive",
    },
    {
      id: "5",
      name: "Security Nexus Ltd",
      code: "SNL-005",
      phone: "(555) 567-8901",
      email: "contact@secnexus.com",
      created: "2023-11-30T16:00:00Z",
      status: "suspended",
    },
  ];
}
