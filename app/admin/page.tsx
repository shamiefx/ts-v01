import React from "react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Clean, light admin portal layout with responsive sidebar and navbar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total Users", value: "1,284" },
          { label: "Revenue", value: "$12,430" },
          { label: "Active Plans", value: "324" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-200 bg-white p-5"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Activity</h2>
        <div className="mt-4 space-y-3">
          {[
            "New signup: anna@example.com",
            "Order #1024 completed",
            "Plan upgraded: Pro Annual",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-600"
            >
              <span>{item}</span>
              <span className="text-xs text-zinc-400">just now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
