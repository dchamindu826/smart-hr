"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUI } from "@/context/UIContext";

interface ModuleConfig {
  title: string;
  description: string;
  badge?: string;
  actionText?: string;
  actionToast?: string;
  content: React.ReactNode;
}

export default function DynamicModulePage() {
  const params = useParams();
  const { toast } = useUI();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";

  const modules: Record<string, ModuleConfig> = {
    lifecycle: {
      title: "Lifecycle events",
      description: "Confirmation, promotion, transfer, exit. Each one is a dated statutory event, not an edit that overwrites historical logs.",
      actionText: "Record event",
      actionToast: "New employee lifecycle event form opened.",
      content: (
        <div className="grid gmain">
          <div className="card">
            <div className="card-h">
              <h2>Recent events</h2>
              <span className="sp" />
              <div className="seg">
                <button type="button" aria-pressed="true">All</button>
                <button type="button" aria-pressed="false">Pending</button>
              </div>
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Event</th>
                    <th>Effective</th>
                    <th>Change details</th>
                    <th>Approved by</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Kamal Perera</td>
                    <td><span className="chip i">Promotion</span></td>
                    <td>01 Oct 2026</td>
                    <td>Operator → Senior Operator (Rs 85,000 → 96,000)</td>
                    <td>M. Gunathilaka</td>
                  </tr>
                  <tr>
                    <td>Thilini Bandara</td>
                    <td><span className="chip ok">Confirmation</span></td>
                    <td>02 Nov 2026</td>
                    <td>Probation → Confirmed (6m review)</td>
                    <td>Pending</td>
                  </tr>
                  <tr>
                    <td>Nuwan Bandara</td>
                    <td><span className="chip">Transfer</span></td>
                    <td>15 Sep 2026</td>
                    <td>Kandy Branch → Colombo HQ</td>
                    <td>Dinuka R.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h2>Kamal Perera · service timeline</h2></div>
            <div className="card-b">
              <div className="tl">
                <div className="tl-i hi">
                  <b>Promotion to Senior Operator</b>
                  <span>01 Oct 2026 · basic Rs 96,000</span>
                </div>
                <div className="tl-i">
                  <b>Salary revision</b>
                  <span>01 Apr 2025 · Rs 78,000 → 85,000</span>
                </div>
                <div className="tl-i">
                  <b>Confirmed in service</b>
                  <span>12 Sep 2022 · after 6 months probation</span>
                </div>
                <div className="tl-i">
                  <b>Initial appointment</b>
                  <span>12 Mar 2022 · Operator, Production</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    onboarding: {
      title: "Onboarding tracker",
      description: "Checklist per joiner. The EPF registration item is the one that blocks their first payroll.",
      actionText: "Edit checklist",
      actionToast: "Onboarding checklist template opened.",
      content: (
        <div>
          <div className="stats">
            <div className="stat"><span>In progress</span><b>4</b><small>Started this month</small></div>
            <div className="stat b"><span>Blocked</span><b>4</b><small>No EPF member number</small></div>
            <div className="stat w"><span>Overdue tasks</span><b>7</b><small>Past due date</small></div>
            <div className="stat ok"><span>Completed</span><b>11</b><small>Last 90 days</small></div>
          </div>
          <div className="note b">
            <span className="ic">⚠</span>
            <div>
              <b>4 joiners have no EPF member number and September closes on 31 October</b>
              Without it they cannot appear on the statutory C-Form, and remittance balancing will fail.
            </div>
          </div>
        </div>
      ),
    },
    documents: {
      title: "Statutory documents & expiry watch",
      description: "Contracts, NIC copies, certificates and permits. The expiry watch is the part that matters.",
      actionText: "Upload document",
      actionToast: "Document upload dialog opened.",
      content: (
        <div>
          <div className="note w">
            <span className="ic">⚠</span>
            <div>
              <b>6 documents expire within 30 days</b>
              Two are statutory expatriate work permits. An expired permit creates employer legal liability.
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h2>Expiring within 30 days</h2></div>
            <div className="tw">
              <table>
                <thead>
                  <tr><th>Employee</th><th>Document</th><th>Type</th><th>Expires</th><th>Days left</th></tr>
                </thead>
                <tbody>
                  <tr><td>R. Kumaraswamy</td><td>Work permit</td><td><span className="chip b">Statutory</span></td><td>08 Oct 2026</td><td><span className="chip b">9 days</span></td></tr>
                  <tr><td>A. Hettiarachchi</td><td>Work permit</td><td><span className="chip b">Statutory</span></td><td>19 Oct 2026</td><td><span className="chip w">20 days</span></td></tr>
                  <tr><td>P. Jayasuriya</td><td>Forklift licence</td><td><span className="chip">Certification</span></td><td>22 Oct 2026</td><td><span className="chip w">23 days</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    integrations: {
      title: "Accounting & payroll integrations",
      description: "Payroll ends in a journal entry. Posting it directly beats manual retyping.",
      actionText: "Connect service",
      actionToast: "Integration directory opened.",
      content: (
        <div className="grid g2">
          <div className="card">
            <div className="card-h"><h2>Connected integrations</h2></div>
            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Xero Accounting</b>
                <span>Journal posted monthly · last 31 Aug · ABC Holdings (Pvt) Ltd</span>
              </div>
              <div className="rt">
                <button type="button" className="btn sm" onClick={() => toast("September journal posted to Xero.")}>Post Sept</button>
              </div>
            </div>
            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Bank of Ceylon (BOC) · SLIPS</b>
                <span>Bulk transfer direct clearing configured</span>
              </div>
              <div className="rt"><span className="chip ok">Active</span></div>
            </div>
            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Dialog SMS gateway</b>
                <span>4,182 attendance and pay notification messages this month</span>
              </div>
              <div className="rt"><span className="chip ok">Active</span></div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h2>September journal preview</h2><span className="chip w">Not yet posted</span></div>
            <div className="card-b">
              <div className="ln"><span>6010 · Salaries and wages</span><b>Dr 18,412,500</b></div>
              <div className="ln"><span>6020 · Overtime</span><b>Dr 1,204,860</b></div>
              <div className="ln"><span>6030 · EPF employer 12%</span><b>Dr 2,209,500</b></div>
              <div className="ln"><span>6031 · ETF employer 3%</span><b>Dr 552,375</b></div>
              <div className="ln"><span>6040 · Gratuity provision</span><b>Dr 452,500</b></div>
              <div className="ln"><span>2110 · EPF payable</span><b>Cr 3,682,500</b></div>
              <div className="ln"><span>2111 · ETF payable</span><b>Cr 552,375</b></div>
              <div className="ln"><span>2120 · APIT payable</span><b>Cr 642,180</b></div>
              <div className="ln"><span>1010 · Bank · Net pay</span><b>Cr 17,316,000</b></div>
            </div>
          </div>
        </div>
      ),
    },
    dataexport: {
      title: "Data export & backups",
      description: "Procurement asks two questions: can we get our data out, and what if you disappear. This is the answer.",
      actionText: "Export everything",
      actionToast: "Full database export archive queued. Download link will be emailed.",
      content: (
        <div className="grid g2">
          <div className="card">
            <div className="card-h"><h2>Archive contents</h2></div>
            <div className="card-b">
              <div className="ln"><span>Employee records</span><b>250 · XLSX + JSON</b></div>
              <div className="ln"><span>Attendance history</span><b>184,200 punches</b></div>
              <div className="ln"><span>Payroll runs</span><b>34 months</b></div>
              <div className="ln"><span>Payslips</span><b>8,412 PDFs</b></div>
              <div className="ln"><span>Statutory returns filed</span><b>102 C-Forms &amp; R-4s</b></div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h2>Scheduled cloud backup</h2><span className="chip ok">Active</span></div>
            <div className="card-b">
              <div className="ln"><span>Frequency</span><b>Weekly · Sunday 02:00</b></div>
              <div className="ln"><span>Retained</span><b>12 weeks rolling</b></div>
              <div className="ln"><span>Last backup</span><b>28 Sep · 4.1 GB · verified</b></div>
              <button
                type="button"
                className="btn"
                style={{ width: "100%", justifyContent: "center", marginTop: "14px" }}
                onClick={() => toast("Last verified backup (28 Sep · 4.1 GB) downloaded.")}
              >
                Download last backup (.tar.gz)
              </button>
            </div>
          </div>
        </div>
      ),
    },
  };

  const current = modules[slug] || {
    title: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Module",
    description: "Enterprise Sri Lanka HRIS module configured and operational.",
    actionText: "Perform action",
    actionToast: "Action triggered.",
    content: (
      <div className="card">
        <div className="card-b">
          <div className="empty">
            <b>{slug ? slug.toUpperCase() : "SmartHR Module"}</b>
            <span>This module is active and reading from your unified SmartHR database.</span>
            <div style={{ marginTop: "16px" }}>
              <Link href="/" className="btn pri">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div>
      <div className="ph">
        <div>
          <h1>{current.title}</h1>
          <p>{current.description}</p>
        </div>
        {current.actionText && (
          <div className="acts">
            <button
              type="button"
              className="btn pri"
              onClick={() => toast(current.actionToast || "Action processed.")}
            >
              {current.actionText}
            </button>
          </div>
        )}
      </div>
      {current.content}
    </div>
  );
}
