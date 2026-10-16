"use client";

import React, { useState } from "react";
import { useUI } from "@/context/UIContext";

interface GratuityRow {
  id: string;
  name: string;
  joined: string;
  years: number;
  salary: number;
  liability: number;
  accrued: number;
  gapText: string;
  gapChip: "ok" | "w" | "b" | "i";
}

const GRATUITY_ROWS: GratuityRow[] = [
  {
    id: "g-1",
    name: "Ruwan Dissanayake",
    joined: "15 Nov 2017",
    years: 8,
    salary: 88000,
    liability: 352000,
    accrued: 352000,
    gapText: "Funded",
    gapChip: "ok",
  },
  {
    id: "g-2",
    name: "Priyantha Jayasuriya",
    joined: "04 Jan 2019",
    years: 7,
    salary: 92000,
    liability: 322000,
    accrued: 287500,
    gapText: "Rs 34,500 short",
    gapChip: "w",
  },
  {
    id: "g-3",
    name: "Sivakumar Raj",
    joined: "23 Feb 2020",
    years: 6,
    salary: 76000,
    liability: 228000,
    accrued: 228000,
    gapText: "Funded",
    gapChip: "ok",
  },
  {
    id: "g-4",
    name: "Sanduni Weerasinghe",
    joined: "18 Jul 2021",
    years: 5,
    salary: 118000,
    liability: 295000,
    accrued: 0,
    gapText: "Just crossed 5y",
    gapChip: "b",
  },
  {
    id: "g-5",
    name: "Kamal Perera",
    joined: "12 Mar 2022",
    years: 4,
    salary: 85000,
    liability: 0,
    accrued: 170000,
    gapText: "Accruing (4y)",
    gapChip: "i",
  },
];

export default function GratuityPage() {
  const { toast } = useUI();
  const [filter, setFilter] = useState<"Eligible" | "Crossing" | "All">("Eligible");
  const [provisionPosted, setProvisionPosted] = useState(false);

  const filtered = GRATUITY_ROWS.filter((row) => {
    if (filter === "Eligible") return row.years >= 5;
    if (filter === "Crossing") return row.years === 4 || row.gapChip === "b";
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Gratuity liability schedule</h1>
          <p>
            Half a month’s wage for every completed year of service (Payment of Gratuity Act No. 12
            of 1983). Accrued monthly under LKAS 19.
          </p>
        </div>
        <div className="acts">
          <button
            type="button"
            className="btn"
            onClick={() => toast("Gratuity actuarial schedule exported as XLSX for external audit.")}
          >
            Export for audit
          </button>
          <button
            type="button"
            className="btn pri"
            disabled={provisionPosted}
            onClick={() => {
              setProvisionPosted(true);
              toast("Rs 452,500 posted as September 2026 gratuity provision entry.");
            }}
          >
            {provisionPosted ? "✓ Provision posted" : "Post September provision"}
          </button>
        </div>
      </div>

      {/* Statutory Act Legal Reference Banner */}
      <div className="note b">
        <span className="ic">⚖</span>
        <div>
          <b>Payment of Gratuity Act No. 12 of 1983 (Sri Lanka)</b>
          Mandatory for all employers with 15 or more workmen. Payment must be disbursed within 30
          days of service termination. Delayed payment incurs statutory surcharges up to 30%.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat b">
          <span>Total liability</span>
          <b>Rs 31.4M</b>
          <small>At last drawn terminal wage</small>
        </div>
        <div className="stat i">
          <span>Eligible staff</span>
          <b>147</b>
          <small>5+ completed years of service</small>
        </div>
        <div className="stat w">
          <span>Crossing 5 years</span>
          <b>14</b>
          <small>This quarter (Provision trigger)</small>
        </div>
        <div className="stat">
          <span>Monthly provision</span>
          <b>Rs 452,500</b>
          <small>September 2026</small>
        </div>
      </div>

      {/* Calculation Formula Card */}
      <div className="card">
        <div className="card-h">
          <h2>Statutory Calculation Engine</h2>
        </div>
        <div className="card-b">
          <div className="ln">
            <span>Legal formula</span>
            <b>(Last drawn monthly wage ÷ 2) × completed years of service</b>
          </div>
          <div className="ln">
            <span>Qualification milestone</span>
            <b>5 completed years of continuous service</b>
          </div>
          <div className="ln">
            <span>Wage definition</span>
            <b>Last drawn terminal wage (including statutory budgetary allowances)</b>
          </div>
          <div className="ln">
            <span>Accounting treatment (LKAS 19)</span>
            <b>
              Backwards revaluation: When salary increases, all prior years revalue at the new rate
            </b>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="note w">
        <span className="ic">⚠</span>
        <div>
          <b>14 staff crossed 5 years this quarter and Rs 1,840,000 has not been provisioned</b>
          They became an active legal liability on the exact anniversary date. Posting the monthly
          catch-up journal entry ensures audit compliance.
        </div>
      </div>

      {/* Employee Schedule Table */}
      <div className="card">
        <div className="card-h">
          <h2>Liability by employee</h2>
          <span className="sp" />
          <div className="seg">
            <button
              type="button"
              aria-pressed={filter === "Eligible"}
              onClick={() => setFilter("Eligible")}
            >
              Eligible 147
            </button>
            <button
              type="button"
              aria-pressed={filter === "Crossing"}
              onClick={() => setFilter("Crossing")}
            >
              Crossing soon 14
            </button>
            <button
              type="button"
              aria-pressed={filter === "All"}
              onClick={() => setFilter("All")}
            >
              All 250
            </button>
          </div>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date joined</th>
                <th className="r">Completed years</th>
                <th className="r">Monthly wage (LKR)</th>
                <th className="r">Legal liability</th>
                <th className="r">Accrued to date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <b>{row.name}</b>
                  </td>
                  <td>{row.joined}</td>
                  <td className="r">{row.years}</td>
                  <td className="r">Rs {row.salary.toLocaleString()}</td>
                  <td className="r">
                    {row.liability > 0 ? `Rs ${row.liability.toLocaleString()}` : "—"}
                  </td>
                  <td className="r">Rs {row.accrued.toLocaleString()}</td>
                  <td>
                    <span className={`chip ${row.gapChip}`}>{row.gapText}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
