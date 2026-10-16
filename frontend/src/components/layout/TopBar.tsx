"use client";

import React from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";

export function TopBar() {
  const {
    toggleRail,
    theme,
    toggleTheme,
    toast,
    selectedBranch,
    setSelectedBranch,
    currentCompany,
    setCurrentCompany,
    companies,
    currentPlan,
  } = useUI();

  return (
    <header className="top">
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        className="burger"
        id="burger"
        onClick={() => toggleRail()}
        aria-label="Toggle navigation menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
          <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
          <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Customer Client Company Switcher */}
      <div className="pick" title="Switch Client Organization">
        <select
          value={currentCompany.id}
          onChange={(e) => {
            const found = companies.find((c) => c.id === e.target.value);
            if (found) setCurrentCompany(found);
          }}
          aria-label="Select Client Company"
          style={{ fontWeight: 600, color: "var(--ink)", borderColor: "var(--blue)" }}
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              🏢 {c.name} ({c.plan})
            </option>
          ))}
        </select>
      </div>

      {/* Branch & Unit Picker */}
      <div className="pick" style={{ marginLeft: "6px" }} title="Select Branch">
        <select
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value);
            toast(`Switched view to ${e.target.value}`);
          }}
          aria-label="Select Company Branch"
        >
          <option value={`${currentCompany.name} · All branches`}>All branches</option>
          <option value="Colombo HQ">Colombo HQ</option>
          <option value="Katunayake Plant">Katunayake Plant</option>
          <option value="Kandy Branch">Kandy Branch</option>
          <option value="Galle Branch">Galle Branch</option>
        </select>
      </div>

      {/* Quick Access to All Customer Consoles */}
      <Link
        href="/tenants"
        className="btn sm"
        style={{
          marginLeft: "8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          textDecoration: "none",
          fontWeight: 600,
          background: "var(--info-bg)",
          color: "var(--blue)",
          border: "1px solid var(--blue)",
        }}
        title="Open Multi-Tenant Customer Management Console"
      >
        <span>🏢 Client Consoles</span>
      </Link>

      {/* Quick Access to Employee Mobile App */}
      <Link
        href="/"
        className="btn sm"
        style={{
          marginLeft: "8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          textDecoration: "none",
          fontWeight: 700,
          background: "linear-gradient(135deg, var(--navy), var(--blue))",
          color: "#fff",
          border: "none",
          boxShadow: "0 2px 8px rgba(11, 111, 212, 0.25)"
        }}
        title="Open Employee Mobile App (SmartHR)"
      >
        <span>📱 Employee App</span>
      </Link>

      <div className="sp" />

      {/* Quick Search Button */}
      <button
        type="button"
        className="tbtn"
        onClick={() => toast("Search opened: type an employee name, NIC, or EPF number.")}
        aria-label="Search"
        title="Quick search"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16" y2="16" strokeLinecap="round" />
        </svg>
      </button>

      {/* Notifications Button */}
      <button
        type="button"
        className="tbtn"
        onClick={() => toast("Compliance alerts: Poya day schedule verified, EPF C-Form ready for submission.")}
        aria-label="Notifications"
        title="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dark / Light Theme Toggle */}
      <button
        type="button"
        className="tbtn"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* User Identity / Role Pill */}
      <div className="who">
        <i>SA</i>
        <div>
          <b>Lumi Platform Admin</b>
          <span>{currentCompany.name.split(" ")[0]} · {currentPlan}</span>
        </div>
      </div>
    </header>
  );
}
