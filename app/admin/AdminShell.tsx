"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Navbar from "./_components/Navbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.push("/auth?view=sign-in");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Sidebar open={sidebarOpen} onCloseAction={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Navbar onMenuClickAction={() => setSidebarOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
