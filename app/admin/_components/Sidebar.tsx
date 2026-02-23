"use client";

import React from "react";
import { Menu } from "./Menu";

type SidebarProps = {
  open: boolean;
  onCloseAction: () => void;
};

export default function Sidebar({ open, onCloseAction }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseAction}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-zinc-900" />
            <span className="text-lg font-semibold">Admin</span>
          </div>
          <button
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden"
            onClick={onCloseAction}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 px-3">
          <Menu />
        </nav>
        
      </aside>
    </>
  );
}
