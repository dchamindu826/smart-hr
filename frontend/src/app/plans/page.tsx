"use client";

import React, { useState } from "react";
import { useUI } from "@/context/UIContext";

export default function PlansPage() {
  const { toast, currentPlan, setCurrentPlan } = useUI();
  const selectedPlan = currentPlan.toLowerCase() as "starter" | "growth" | "complete";

  const handleSelectPlan = (tier: "STARTER" | "GROWTH" | "COMPLETE") => {
    setCurrentPlan(tier);
    toast(`Active workspace plan switched to ${tier}. Sidebar updated instantly.`);
  };

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Plan &amp; modules</h1>
          <p>
            Tailored subscription tiers for Sri Lankan businesses. Everything is in one unified system
            without separate logins or fragmented software.
          </p>
        </div>
        <div className="acts">
          <button
            type="button"
            className="btn pri"
            onClick={() => toast(`Plan subscription updated to ${selectedPlan.toUpperCase()}.`)}
          >
            Save plan selection
          </button>
        </div>
      </div>

      {/* Philosophy note */}
      <div className="note i">
        <span className="ic">◈</span>
        <div>
          <b>Smart modular enablement</b>
          Each tier unlocks the exact depth of labor compliance and operational controls needed for your
          workforce size, growing alongside your enterprise without data migrations.
        </div>
      </div>

      {/* Tier Pricing Cards Grid */}
      <div className="grid g3" style={{ marginBottom: "18px" }}>
        {/* Starter Plan */}
        <div className={`tier ${selectedPlan === "starter" ? "on" : ""}`}>
          <h3>Starter</h3>
          <div className="sz">Up to 25 people</div>
          <div className="pr">
            Rs 2,500<small> /month</small>
          </div>
          <ul>
            <li>Attendance and leave management</li>
            <li>Payroll with EPF 8%, ETF 3% &amp; APIT</li>
            <li>Payslips in three languages (EN, SI, TA)</li>
            <li>C-Form, R-4 and T-10 tax returns</li>
            <li>One biometric fingerprint terminal</li>
            <li>Employee self-service mobile app</li>
            <li className="no">Roster and shift planning</li>
            <li className="no">Gratuity liability tracking</li>
          </ul>
          <div className="cnt">
            <b>11</b> screens · setup in an afternoon
          </div>
          <button
            type="button"
            className="btn sm"
            style={{ marginTop: "11px", justifyContent: "center" }}
            onClick={() => handleSelectPlan("STARTER")}
          >
            {selectedPlan === "starter" ? "✓ Active Tier" : "Select Starter"}
          </button>
        </div>

        {/* Growth Plan (Default active) */}
        <div className={`tier ${selectedPlan === "growth" ? "on" : ""}`}>
          <h3>Growth</h3>
          <div className="sz">Up to 100 people</div>
          <div className="pr">
            Rs 6,500<small> /month</small>
          </div>
          <ul>
            <li>Everything in Starter</li>
            <li>Roster, shifts and statutory OT ceilings</li>
            <li>Gratuity liability engine (LKAS 19)</li>
            <li>Holiday and double-pay calendar with Poya</li>
            <li>Bulk Excel import and arrears adjustments</li>
            <li>Unlimited biometric devices and branches</li>
            <li className="no">Recruitment and appraisals</li>
            <li className="no">Assets, training, disciplinary</li>
          </ul>
          <div className="cnt">
            <b>22</b> screens · recommended for SME
          </div>
          <button
            type="button"
            className="btn sm"
            style={{ marginTop: "11px", justifyContent: "center" }}
            onClick={() => handleSelectPlan("GROWTH")}
          >
            {selectedPlan === "growth" ? "✓ Active Tier" : "Select Growth"}
          </button>
        </div>

        {/* Complete Enterprise Plan */}
        <div className={`tier ${selectedPlan === "complete" ? "on" : ""}`}>
          <h3>Complete</h3>
          <div className="sz">Up to 500 people</div>
          <div className="pr">
            Rs 14,000<small> /month</small>
          </div>
          <ul>
            <li>Everything in Growth</li>
            <li>Recruitment pipeline and performance reviews</li>
            <li>Document expiry watch, asset registry, training</li>
            <li>Interactive Org chart and lifecycle history</li>
            <li>Accounting posting to Xero &amp; QuickBooks</li>
            <li>Approval delegation and full database export</li>
            <li>Multi-currency payroll (USD, EUR, GBP)</li>
          </ul>
          <div className="cnt">
            <b>38</b> screens · full enterprise suite
          </div>
          <button
            type="button"
            className="btn sm"
            style={{ marginTop: "11px", justifyContent: "center" }}
            onClick={() => handleSelectPlan("COMPLETE")}
          >
            {selectedPlan === "complete" ? "✓ Active Tier" : "Select Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
