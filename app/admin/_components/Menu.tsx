"use client";

import React from "react";
import Link from "next/link";

export interface MenuItem {
  name: string;
  href: string;
  role?: string[]; // for future role-based access
}

const menuItems: MenuItem[] = [
  { name: "Overview", href: "/admin" },
  { name: "Company", href: "/admin/companies" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Products", href: "/admin/products" },
  { name: "Settings", href: "/admin/settings" },
];

export function Menu() {
  return (
    <ul className="space-y-1">
      {menuItems.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { menuItems };