"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";

export default function PayrollPage() {
  const { toast } = useUI();
  const [locked, setLocked] = useState(false);
  const [convertedNoPay, setConvertedNoPay] = useState(false);

  const handleLockAndPay = () => {
    setLocked(true);
    toast("September payroll locked. 250 payslips queued and Bank of Ceylon SLIPS file generated.");
  };

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Payroll run · September 2026</h1>
          <p>250 employees. Locked runs cannot be edited — corrections post forward as arrears.</p>
        </div>
        <div className="acts">
          <Link href="/arrears" className="btn">
            Corrections & arrears
          </Link>
          <button
            type="button"
            className="btn pri"
            disabled={locked}
            onClick={handleLockAndPay}
          >
            {locked ? "✓ Payroll locked" : "Lock and pay"}
          </button>
        </div>
      </div>

      {/* Steps Pipeline */}
      <div className="steps">
        <div className="step dn">
          <span className="n">01</span>
          <b>Attendance closed</b>
          29 Sep · 12 overrides
        </div>
        <div className="step dn">
          <span className="n">02</span>
          <b>OT approved</b>
          1,482 hours
        </div>
        <div className={`step ${locked ? "dn" : "on"}`}>
          <span className="n">03</span>
          <b>Review</b>
          {convertedNoPay ? "2 exceptions" : "3 exceptions open"}
        </div>
        <div className={`step ${locked ? "on" : ""}`}>
          <span className="n">04</span>
          <b>Lock and pay</b>
          SLIPS + payslips
        </div>
      </div>

      <div className="grid gmain">
        {/* Left Column: Exceptions & Register */}
        <div>
          {/* Exceptions Card */}
          <div className="card">
            <div className="card-h">
              <h2>Exceptions before lock</h2>
              <span className="chip w">{convertedNoPay ? "2" : "3"}</span>
            </div>

            <div className="list-row">
              <span className="dot b" />
              <div className="bd">
                <b>4 employees have no EPF member number</b>
                <span>They will be left off the C-Form and the return will not balance.</span>
              </div>
              <div className="rt">
                <Link href="/onboarding" className="btn sm">
                  Fix
                </Link>
              </div>
            </div>

            <div className="list-row">
              <span className={`dot ${convertedNoPay ? "ok" : "w"}`} />
              <div className="bd">
                <b>Thilini Bandara has a negative annual leave balance</b>
                <span>
                  {convertedNoPay
                    ? "2 days converted to no-pay deduction: −Rs 3,600."
                    : "2 days need converting to no-pay before final run."}
                </span>
              </div>
              <div className="rt">
                <button
                  type="button"
                  className="btn sm"
                  disabled={convertedNoPay}
                  onClick={() => {
                    setConvertedNoPay(true);
                    toast("2 days converted to no-pay deduction: −Rs 3,600.");
                  }}
                >
                  {convertedNoPay ? "Converted" : "Convert"}
                </button>
              </div>
            </div>

            <div className="list-row">
              <span className="dot w" />
              <div className="bd">
                <b>Gratuity provision not posted for 14 staff</b>
                <span>They crossed five years of service this quarter.</span>
              </div>
              <div className="rt">
                <Link href="/gratuity" className="btn sm">
                  Post
                </Link>
              </div>
            </div>
          </div>

          {/* Payroll Register Card */}
          <div className="card">
            <div className="card-h">
              <h2>Register preview</h2>
              <span className="sp" />
              <button
                type="button"
                className="btn sm"
                onClick={() => toast("Payroll register exported as XLSX.")}
              >
                Export
              </button>
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th className="r">Basic (LKR)</th>
                    <th className="r">OT (LKR)</th>
                    <th className="r">Gross (LKR)</th>
                    <th className="r">EPF 8%</th>
                    <th className="r">APIT</th>
                    <th className="r">Net to bank</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Kamal Perera</td>
                    <td className="r">85,000</td>
                    <td className="r">14,820</td>
                    <td className="r">105,820</td>
                    <td className="r">−7,080</td>
                    <td className="r">−2,400</td>
                    <td className="r"><b>91,340</b></td>
                  </tr>
                  <tr>
                    <td>Priyantha Jayasuriya</td>
                    <td className="r">92,000</td>
                    <td className="r">21,640</td>
                    <td className="r">117,140</td>
                    <td className="r">−7,640</td>
                    <td className="r">−3,120</td>
                    <td className="r"><b>106,380</b></td>
                  </tr>
                  <tr>
                    <td>Sanduni Weerasinghe</td>
                    <td className="r">118,000</td>
                    <td className="r">—</td>
                    <td className="r">121,500</td>
                    <td className="r">−9,720</td>
                    <td className="r">−4,860</td>
                    <td className="r"><b>106,920</b></td>
                  </tr>
                  <tr>
                    <td>Thilini Bandara</td>
                    <td className="r">54,000</td>
                    <td className="r">—</td>
                    <td className="r">54,400</td>
                    <td className="r">−4,600</td>
                    <td className="r">—</td>
                    <td className="r"><b>46,700</b></td>
                  </tr>
                  <tr>
                    <td>Ruwan Dissanayake</td>
                    <td className="r">88,000</td>
                    <td className="r">12,015</td>
                    <td className="r">103,515</td>
                    <td className="r">−7,320</td>
                    <td className="r">−2,180</td>
                    <td className="r"><b>94,015</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown & Bank Outputs */}
        <div>
          {/* Employee Totals */}
          <div className="card">
            <div className="card-h">
              <h2>Totals</h2>
            </div>
            <div className="card-b">
              <div className="ln">
                <span>Basic and allowances</span>
                <b>Rs 18,412,500</b>
              </div>
              <div className="ln">
                <span>Overtime at 1.5×</span>
                <b>Rs 1,204,860</b>
              </div>
              <div className="ln neg">
                <span>No-pay deductions</span>
                <b>−Rs 186,300</b>
              </div>
              <div className="ln neg">
                <span>EPF employee 8%</span>
                <b>−Rs 1,473,000</b>
              </div>
              <div className="ln neg">
                <span>APIT withheld</span>
                <b>−Rs 642,180</b>
              </div>
              <div className="tot">
                <span>Net to bank</span>
                <span>Rs 17,316,000</span>
              </div>
            </div>
          </div>

          {/* Employer Statutory Cost (EPF 12% + ETF 3% + Gratuity) */}
          <div className="card">
            <div className="card-h">
              <h2>Employer statutory cost</h2>
            </div>
            <div className="card-b">
              <div className="ln">
                <span>EPF employer 12%</span>
                <b>Rs 2,209,500</b>
              </div>
              <div className="ln">
                <span>ETF employer 3%</span>
                <b>Rs 552,375</b>
              </div>
              <div className="ln">
                <span>Gratuity provision (monthly accrual)</span>
                <b>Rs 452,500</b>
              </div>
              <div className="tot">
                <span>Total statutory burden</span>
                <span>Rs 3,214,375</span>
              </div>
              <p className="hint" style={{ marginTop: "9px" }}>
                Gratuity is the third employer liability beside EPF and ETF. It accrues monthly
                under Sri Lankan accounting standards (LKAS 19). Overtime is calculated on gross
                working hours, omitting unpaid meal breaks.
              </p>
            </div>
          </div>

          {/* Bank Transfers & Document Outputs */}
          <div className="card">
            <div className="card-h">
              <h2>Outputs & exports</h2>
            </div>
            <div className="card-b">
              <div className="ln">
                <span>Bank of Ceylon (BOC) SLIPS file</span>
                <b>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => toast("SLIPS bulk payment file generated (slips-sep2026.txt).")}
                  >
                    Download
                  </button>
                </b>
              </div>
              <div className="ln">
                <span>Payslips · English PDF</span>
                <b>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => toast("250 English payslip PDFs queued for download.")}
                  >
                    Get
                  </button>
                </b>
              </div>
              <div className="ln">
                <span>Payslips · සිංහල PDF (Noto Sans)</span>
                <b>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => toast("184 Sinhala payslips generated with Unicode fonts.")}
                  >
                    Get
                  </button>
                </b>
              </div>
              <div className="ln">
                <span>Journal to Xero</span>
                <b>
                  <Link href="/integrations" className="btn sm">
                    Post
                  </Link>
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
