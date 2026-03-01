"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/authClient";

type NavbarProps = {
  onMenuClickAction: () => void;
};

export default function Navbar({ onMenuClickAction }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    clearTokens();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth?view=sign-in");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
            onClick={onMenuClickAction}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <div>
            <p className="text-sm font-medium text-zinc-900">Admin Portal</p>
            <p className="text-xs text-zinc-500">Welcome back</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500">
            <span>⌘</span>
            <span>K</span>
            <span className="text-zinc-300">|</span>
            <span>Search</span>
          </div>
          <button
            className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
