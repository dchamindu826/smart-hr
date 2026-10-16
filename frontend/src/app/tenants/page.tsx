"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUI, ClientCompany } from "@/context/UIContext";

export default function TenantsPage() {
  const router = useRouter();
  const { companies, currentCompany, setCurrentCompany, toast, openSheet, closeSheet } = useUI();
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyEpf, setNewCompanyEpf] = useState("");
  const [newCompanyPlan, setNewCompanyPlan] = useState<"STARTER" | "GROWTH" | "COMPLETE">("GROWTH");
  const [newCompanyStaff, setNewCompanyStaff] = useState("50");

  const handleLaunchConsole = (comp: ClientCompany) => {
    setCurrentCompany(comp);
    toast(`Switched into ${comp.name} Customer Console.`);
    router.push("/");
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      toast("Please enter a valid company name.");
      return;
    }
    const newComp: ClientCompany = {
      id: "c_" + Date.now(),
      name: newCompanyName.trim(),
      slug: newCompanyName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      plan: newCompanyPlan,
      staffCount: parseInt(newCompanyStaff) || 25,
      devices: 2,
      epfNo: newCompanyEpf.trim() || "A/00000",
      tin: "100000000-0000",
      address: "Colombo, Sri Lanka",
    };
    setCurrentCompany(newComp);
    closeSheet();
    toast(`Client ${newComp.name} provisioned successfully! Now viewing their console.`);
    router.push("/");
  };

  const openOnboardModal = () => {
    openSheet(
      "Onboard New Client Organization",
      "Provision a new multi-tenant instance with Sri Lanka EPF/ETF compliance and biometrics.",
      <form onSubmit={handleCreateCompany} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label className="f">Registered Company Name</label>
          <input
            className="f-in"
            type="text"
            placeholder="e.g. Silverline Garments (Pvt) Ltd"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="f-row f2">
          <div>
            <label className="f">EPF Employer Number</label>
            <input
              className="f-in"
              type="text"
              placeholder="e.g. S/09842"
              value={newCompanyEpf}
              onChange={(e) => setNewCompanyEpf(e.target.value)}
            />
          </div>
          <div>
            <label className="f">Initial Staff Count</label>
            <input
              className="f-in"
              type="number"
              value={newCompanyStaff}
              onChange={(e) => setNewCompanyStaff(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="f">Subscription Tier</label>
          <select
            className="f-in"
            value={newCompanyPlan}
            onChange={(e) => setNewCompanyPlan(e.target.value as "STARTER" | "GROWTH" | "COMPLETE")}
          >
            <option value="STARTER">Starter Tier (Up to 25 staff · 11 screens)</option>
            <option value="GROWTH">Growth Tier (Up to 100 staff · 22 screens)</option>
            <option value="COMPLETE">Complete Tier (Enterprise · 38 screens)</option>
          </select>
        </div>
        <div style={{ marginTop: "16px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={closeSheet}>
            Cancel
          </button>
          <button type="submit" className="btn pri">
            Provision &amp; Launch Console ↗
          </button>
        </div>
      </form>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="ph">
        <div>
          <h1>Client Organizations &amp; Multi-Tenant Consoles</h1>
          <p>
            Manage multi-tenant subscriptions, provision customer organizations, and launch any client’s HR &amp; payroll console directly.
          </p>
        </div>
        <div className="acts">
          <button type="button" className="btn pri" onClick={openOnboardModal}>
            + Onboard New Company
          </button>
        </div>
      </div>

      {/* Stats KPI Grid */}
      <div className="stats">
        <div className="stat i">
          <span>Client Organizations</span>
          <b>{companies.length}</b>
          <small>Active corporate tenants</small>
        </div>
        <div className="stat ok">
          <span>Active Staff Managed</span>
          <b>{companies.reduce((acc, c) => acc + c.staffCount, 0)}</b>
          <small>Employees across all tenants</small>
        </div>
        <div className="stat w">
          <span>Biometric Terminals</span>
          <b>{companies.reduce((acc, c) => acc + c.devices, 0)}</b>
          <small>Connected ZKTeco / Face Kiosks</small>
        </div>
        <div className="stat">
          <span>Currently Active Console</span>
          <b style={{ fontSize: "16px", color: "var(--blue)", marginTop: "6px" }}>{currentCompany.name.split(" ")[0]}</b>
          <small>{currentCompany.plan} Plan Active</small>
        </div>
      </div>

      {/* Client Companies List Card */}
      <div className="card">
        <div className="card-h">
          <h2>Registered Client Companies ({companies.length})</h2>
          <span className="sp" />
          <span className="chip ok">Multi-Tenant Isolated</span>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Company Name &amp; Address</th>
                <th>Company Slug</th>
                <th>EPF Employer No</th>
                <th>Subscription Plan</th>
                <th className="r">Staff Count</th>
                <th>Hardware Devices</th>
                <th className="r">Actions &amp; Console Access</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => {
                const isCurrent = c.id === currentCompany.id;
                const planClass = c.plan === "COMPLETE" ? "law" : c.plan === "GROWTH" ? "ok" : "w";
                return (
                  <tr key={c.id} style={{ background: isCurrent ? "var(--info-bg)" : undefined }}>
                    <td>
                      <b style={{ color: "var(--ink)", display: "flex", alignItems: "center", gap: "6px" }}>
                        🏢 {c.name}
                        {isCurrent && <span className="chip ok" style={{ fontSize: "10px" }}>Current View</span>}
                      </b>
                      <span style={{ fontSize: "11px", color: "var(--ink-2)" }}>{c.address}</span>
                    </td>
                    <td>
                      <code style={{ background: "var(--card-2)", padding: "2px 6px", borderRadius: "4px", color: "var(--blue)", fontSize: "12px" }}>
                        {c.slug}
                      </code>
                    </td>
                    <td>
                      <b>{c.epfNo}</b>
                      <div style={{ fontSize: "10.5px", color: "var(--ink-3)" }}>TIN: {c.tin}</div>
                    </td>
                    <td>
                      <span className={`chip ${planClass}`}>{c.plan}</span>
                    </td>
                    <td className="r">
                      <b>{c.staffCount}</b>
                    </td>
                    <td>
                      <span className="chip i">📟 {c.devices} Terminals</span>
                    </td>
                    <td className="r">
                      <button
                        type="button"
                        className={`btn sm ${isCurrent ? "" : "pri"}`}
                        onClick={() => handleLaunchConsole(c)}
                        title={`Open ${c.name} HR console`}
                      >
                        {isCurrent ? "Active Console ✓" : "Launch Console ↗"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
