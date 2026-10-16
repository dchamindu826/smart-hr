"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";

interface LeaveRequest {
  id: string;
  name: string;
  type: string;
  typeChip: string;
  dates: string;
  days: number;
  balanceAfter: string;
  isNegative?: boolean;
  note: string;
  isPoyaClash?: boolean;
  status: "Pending" | "Approved" | "Declined";
}

const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: "l-1",
    name: "Sanduni Weerasinghe",
    type: "Maternity",
    typeChip: "i",
    dates: "22 Sep – 14 Jan",
    days: 84,
    balanceAfter: "—",
    note: "Working days, full pay (Maternity Benefits Ordinance)",
    status: "Pending",
  },
  {
    id: "l-2",
    name: "Nimal Silva",
    type: "Casual",
    typeChip: "",
    dates: "25 Sep",
    days: 1,
    balanceAfter: "2.0",
    note: "Clashes with Binara Poya long weekend",
    isPoyaClash: true,
    status: "Pending",
  },
  {
    id: "l-3",
    name: "Thilini Bandara",
    type: "Annual",
    typeChip: "",
    dates: "06 – 08 Oct",
    days: 3,
    balanceAfter: "−2.0",
    isNegative: true,
    note: "First year · joined Aug, entitled 4 days only",
    status: "Pending",
  },
  {
    id: "l-4",
    name: "Kamal Perera",
    type: "Annual",
    typeChip: "",
    dates: "13 – 15 Oct",
    days: 3,
    balanceAfter: "5.5",
    note: "Regular annual leave request",
    status: "Pending",
  },
  {
    id: "l-5",
    name: "Sivakumar Raj",
    type: "Medical",
    typeChip: "ok",
    dates: "30 Sep – 02 Oct",
    days: 3,
    balanceAfter: "3.0",
    note: "Government medical certificate attached",
    status: "Pending",
  },
];

export default function LeavePage() {
  const { toast } = useUI();
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [tab, setTab] = useState<"Pending" | "Approved" | "Declined">("Pending");

  const handleApprove = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );
    toast(`Approved leave for ${name}. Roster and calendar synced.`);
  };

  const handleApproveValid = () => {
    setRequests((prev) =>
      prev.map((r) => (r.isNegative ? r : { ...r, status: "Approved" }))
    );
    toast("Bulk approval applied to all valid requests (over-entitlement skipped).");
  };

  const filtered = requests.filter((r) => r.status === tab);

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Leave management</h1>
          <p>
            Balances calculated dynamically under Sri Lankan statutory rules (Shop &amp; Office Act
            &amp; Maternity Benefits Ordinance).
          </p>
        </div>
        <div className="acts">
          <Link href="/leavepolicy" className="btn">
            Leave policy rules
          </Link>
          <button type="button" className="btn pri" onClick={handleApproveValid}>
            Approve valid requests
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats">
        <div className="stat w">
          <span>Awaiting approval</span>
          <b>{requests.filter((r) => r.status === "Pending").length}</b>
          <small>1 clashes with Poya weekend</small>
        </div>
        <div className="stat i">
          <span>On leave today</span>
          <b>9</b>
          <small>1 maternity · 8 annual &amp; casual</small>
        </div>
        <div className="stat b">
          <span>Negative balances</span>
          <b>1</b>
          <small>Approved beyond statutory entitlement</small>
        </div>
        <div className="stat">
          <span>Liability provision</span>
          <b>Rs 4.1M</b>
          <small>Unused annual leave at terminal cost</small>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="note w">
        <span className="ic">⚠</span>
        <div>
          <b>Thilini Bandara joined in August: First-year annual entitlement is 4 days, not 14</b>
          She has applied for 3 days but previously taken 3. The 2 extra days must be converted to
          no-pay deduction or deducted from casual leave.
        </div>
      </div>

      {/* Requests Table Card */}
      <div className="card">
        <div className="card-h">
          <h2>Leave requests</h2>
          <span className="sp" />
          <div className="seg">
            <button
              type="button"
              aria-pressed={tab === "Pending"}
              onClick={() => setTab("Pending")}
            >
              Pending ({requests.filter((r) => r.status === "Pending").length})
            </button>
            <button
              type="button"
              aria-pressed={tab === "Approved"}
              onClick={() => setTab("Approved")}
            >
              Approved ({requests.filter((r) => r.status === "Approved").length})
            </button>
            <button
              type="button"
              aria-pressed={tab === "Declined"}
              onClick={() => setTab("Declined")}
            >
              Declined ({requests.filter((r) => r.status === "Declined").length})
            </button>
          </div>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th className="r">Days</th>
                <th className="r">Balance after</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td>
                    <b>{req.name}</b>
                  </td>
                  <td>
                    <span className={`chip ${req.typeChip}`}>{req.type}</span>
                  </td>
                  <td>{req.dates}</td>
                  <td className="r">{req.days}</td>
                  <td className="r">
                    {req.isNegative ? (
                      <span className="chip b">{req.balanceAfter}</span>
                    ) : (
                      req.balanceAfter
                    )}
                  </td>
                  <td>
                    {req.isPoyaClash ? (
                      <span className="chip w">{req.note}</span>
                    ) : (
                      <span>{req.note}</span>
                    )}
                  </td>
                  <td className="r">
                    {req.status === "Pending" ? (
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => handleApprove(req.id, req.name)}
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="chip ok">✓ Done</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--ink-2)" }}>
                    No requests in this tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Rules Reference Cards */}
      <div className="grid g2">
        <div className="card">
          <div className="card-h">
            <h2>Maternity Benefits Ordinance</h2>
            <span className="chip ok">Statutory</span>
          </div>
          <div className="card-b">
            <div className="ln">
              <span>Entitlement</span>
              <b>84 working days (full pay)</b>
            </div>
            <div className="ln">
              <span>Split pattern</span>
              <b>14 days before · 70 days after confinement</b>
            </div>
            <div className="ln">
              <span>Count criteria</span>
              <b>Excludes weekly rest days and Poya holidays</b>
            </div>
            <div className="note i" style={{ marginTop: "10px" }}>
              <span className="ic">◈</span>
              <div>
                Statutory maternity leave cannot be converted to cash or refused by the employer.
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h2>Shop &amp; Office Joining Quarter Entitlements</h2>
            <span className="chip ok">Statutory</span>
          </div>
          <div className="card-b">
            <div className="ln">
              <span>Joined Jan – Mar</span>
              <b>14 days</b>
            </div>
            <div className="ln">
              <span>Joined Apr – Jun</span>
              <b>10 days</b>
            </div>
            <div className="ln">
              <span>Joined Jul – Sep</span>
              <b>7 days</b>
            </div>
            <div className="ln">
              <span>Joined Oct – Dec</span>
              <b>4 days</b>
            </div>
            <div className="note i" style={{ marginTop: "10px" }}>
              <span className="ic">◈</span>
              <div>
                First-year annual leave is legally taken during the subsequent calendar year.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
