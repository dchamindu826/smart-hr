"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_MAP, PlanTier } from "@/types/navigation";
import { useUI } from "@/context/UIContext";

const RANK: Record<PlanTier, number> = {
  STARTER: 0,
  GROWTH: 1,
  COMPLETE: 2,
};

export function Sidebar() {
  const pathname = usePathname();
  const { isRailOpen, toggleRail, currentPlan, currentCompany } = useUI();

  return (
    <aside className={`rail ${isRailOpen ? "open" : ""}`} id="rail">
      {/* Brand & Platform Header */}
      <div className="brand">
        <Link href="/admin" onClick={() => toggleRail(false)} className="brand-logo-link" title="SmartHR by LUMI AI">
          <img src="/logo.png" alt="SmartHR by LUMI AI" className="brand-logo-img" />
        </Link>
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-2)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentCompany.name}
          </span>
          <span className={`chip ${currentPlan === "COMPLETE" ? "law" : currentPlan === "GROWTH" ? "ok" : "w"}`} style={{ fontSize: "10px", padding: "1px 6px" }}>
            {currentPlan}
          </span>
        </div>
        <div style={{ marginTop: "10px" }}>
          <Link
            href="/"
            onClick={() => toggleRail(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "linear-gradient(135deg, var(--navy), var(--blue))",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 700,
              padding: "7px 10px",
              borderRadius: "8px",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(11, 111, 212, 0.25)",
            }}
          >
            <span>📱</span> Employee Mobile App
          </Link>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="nav" id="nav" aria-label="Main Navigation">
        {NAVIGATION_MAP.map((group) => {
          // Filter items based on current customer's plan
          const visibleItems = group.items.filter((item) => {
            const itemTier = item.tier || "STARTER";
            return RANK[itemTier] <= RANK[currentPlan];
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.category}>
              <h2>{group.category}</h2>
              <div>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={`nav-link ${isActive ? "on" : ""}`}
                      onClick={() => toggleRail(false)}
                    >
                      <span className="ic">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
