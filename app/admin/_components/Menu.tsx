"use client";

import React from "react";
import Link from "next/link";

export interface MenuItem {
  name: string;
  href: string;
  role?: string[]; // for future role-based access
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { name: "Overview", href: "/admin" },
  {
    name: "Company",
    href: "/admin/companies",
    children: [
      { name: "List Companies", href: "/admin/companies" },
      { name: "Create New", href: "/admin/companies?mode=create" }
    ],
  },
  { name: "Orders", href: "/admin/orders" },
  { name: "Products", href: "/admin/products" },
  { name: "Settings", href: "/admin/settings" },
];

export function Menu() {
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <ul className="space-y-1">
      {menuItems.map((item) => (
        <li key={item.name}>
          {item.children?.length ? (
            <button
              type="button"
              onClick={() => toggleMenu(item.name)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              aria-expanded={Boolean(openMenus[item.name])}
              aria-controls={`submenu-${item.name}`}
            >
              <span>{item.name}</span>
              <span className="text-xs text-zinc-500">
                {openMenus[item.name] ? "▾" : "▸"}
              </span>
            </button>
          ) : (
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {item.name}
            </Link>
          )}

          {item.children?.length && openMenus[item.name] ? (
            <ul id={`submenu-${item.name}`} className="mt-1 space-y-1 pl-4">
              {item.children.map((child) => (
                <li key={`${item.name}-${child.name}`}>
                  <Link
                    href={child.href}
                    className="block rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export { menuItems };