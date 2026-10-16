"use client";

import React from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";

export default function AdminDashboardPage() {
  const { toast, openSheet, selectedBranch } = useUI();

  const handleReviewAll = () => {
    openSheet(
      "Pending Decisions Queue",
      "7 compliance and operational items waiting for sign-off",
      <div>
        <div className="note b">
          <span className="ic">⚠</span>
          <div>
            <b>Urgent statutory deadline</b>
            EPF C-Form and ETF R-4 monthly remittance deadline is in 1 day (Tue 30 Sep).
          </div>
        </div>
        <div className="list-row">
          <span className="dot b"></span>
          <div className="bd">
            <b>4 joiners with no EPF numbers</b>
            <span>Needed before C-Form submission closes.</span>
          </div>
          <button
            className="btn sm"
            onClick={() => toast("Redirecting to onboarding queue...")}
          >
            Resolve
          </button>
        </div>
        <div className="list-row" style={{ marginTop: "10px" }}>
          <span className="dot w"></span>
          <div className="bd">
            <b>Gratuity accrued shortfall</b>
            <span>Rs 1,840,000 needs accounting provision entry.</span>
          </div>
          <button
            className="btn sm"
            onClick={() => toast("Opening gratuity schedule...")}
          >
            View
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="ph">
        <div>
          <h1>Today at a glance</h1>
          <p>Tuesday 29 September 2026 · {selectedBranch}</p>
        </div>
        <div className="acts">
          <Link
            href="/"
            className="btn"
            style={{
              borderColor: "var(--blue)",
              color: "var(--blue)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
            }}
          >
            📱 Open Employee App
          </Link>
          <button
            type="button"
            className="btn"
            onClick={() => toast("Muster roll exported as XLSX (smarthr-muster-sept29.xlsx).")}
          >
            Export muster roll
          </button>
          <Link href="/payroll" className="btn pri">
            Run September payroll
          </Link>
        </div>
      </div>

      {/* Top Stats Counters */}
      <div className="stats">
        <div className="stat">
          <span>On the roll</span>
          <b>250</b>
          <small>4 branches · 11 departments</small>
        </div>
        <div className="stat ok">
          <span>Marked in</span>
          <b>218</b>
          <small>193 fingerprint · 25 mobile</small>
        </div>
        <div className="stat w">
          <span>Late</span>
          <b>17</b>
          <small>Grace 15 min · 6 repeat this month</small>
        </div>
        <div className="stat b">
          <span>Not in</span>
          <b>15</b>
          <small>9 approved leave · 6 unexplained</small>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid gmain">
        {/* Left Column: Action Items & Muster Roll */}
        <div>
          {/* Needs a Decision Card */}
          <div className="card">
            <div className="card-h">
              <h2>Needs a decision</h2>
              <span className="chip b">7</span>
              <span className="sp" />
              <button type="button" className="btn sm" onClick={handleReviewAll}>
                Review all
              </button>
            </div>

            <div className="list-row">
              <span className="dot b" />
              <div className="bd">
                <b>6 people not marked in and no leave on file</b>
                <span>Katunayake Plant · sewing line B · past 10:30</span>
              </div>
              <div className="rt">
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => toast("SMS alert dispatched to 6 plant supervisors.")}
                >
                  Ping
                </button>
              </div>
            </div>

            <div className="list-row">
              <span className="dot b" />
              <div className="bd">
                <b>Gratuity provision short by Rs 1,840,000</b>
                <span>14 staff crossed 5 years this quarter · not yet accrued</span>
              </div>
              <div className="rt">
                <Link href="/gratuity" className="btn sm">
                  Open
                </Link>
              </div>
            </div>

            <div className="list-row">
              <span className="dot w" />
              <div className="bd">
                <b>Priyantha J. is at 13.5 OT hours this week</b>
                <span>Over the 12-hour weekly cap in the Shop &amp; Office Employees Act</span>
              </div>
              <div className="rt">
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => toast("OT approval blocked for Priyantha this week (Shop & Office Cap).")}
                >
                  Block OT
                </button>
              </div>
            </div>

            <div className="list-row">
              <span className="dot w" />
              <div className="bd">
                <b>8 leave requests waiting, 3 clash with the Poya long weekend</b>
                <span>Binara Poya falls on Friday 25 September</span>
              </div>
              <div className="rt">
                <Link href="/leave" className="btn sm">
                  Queue
                </Link>
              </div>
            </div>

            <div className="list-row">
              <span className="dot w" />
              <div className="bd">
                <b>Fingerprint-03 has held 41 punches offline since 06:12</b>
                <span>Galle Branch · router reconnecting</span>
              </div>
              <div className="rt">
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => toast("Retrying sync with Galle Fingerprint-03...")}
                >
                  Retry
                </button>
              </div>
            </div>

            <div className="list-row">
              <span className="dot b" />
              <div className="bd">
                <b>2 mobile mark-ins landed outside the branch geofence</b>
                <span>Nuwan B. 1.4 km from Kandy · Tharindu S. 780 m from HQ</span>
              </div>
              <div className="rt">
                <Link href="/devices" className="btn sm">
                  Map
                </Link>
              </div>
            </div>

            <div className="list-row">
              <span className="dot i" />
              <div className="bd">
                <b>4 new hires have no EPF member number</b>
                <span>Needed before the September return closes on 31 October</span>
              </div>
              <div className="rt">
                <Link href="/onboarding" className="btn sm">
                  Fix
                </Link>
              </div>
            </div>

            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Nimal Silva’s birthday today</b>
                <span>Notified to Kandy branch at 08:30 · 7 staff have opted out company-wide</span>
              </div>
              <div className="rt">
                <Link href="/notifications" className="btn sm">
                  Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Muster Roll Preview Table */}
          <div className="card">
            <div className="card-h">
              <h2>Muster roll</h2>
              <span className="chip">6 of 250 shown</span>
              <span className="sp" />
              <Link href="/attendance" className="btn sm">
                Full attendance
              </Link>
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Branch</th>
                    <th>In</th>
                    <th>Out</th>
                    <th className="r">OT</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="emp">
                        <i>KP</i>
                        <span>
                          <b>Kamal Perera</b>
                          <span>EMP-001 · EPF A/14023</span>
                        </span>
                      </div>
                    </td>
                    <td>Colombo HQ</td>
                    <td>08:12</td>
                    <td>17:24</td>
                    <td className="r">1.0</td>
                    <td>
                      <span className="chip ok">Present</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="emp">
                        <i>NS</i>
                        <span>
                          <b>Nimal Silva</b>
                          <span>EMP-024 · EPF A/14090</span>
                        </span>
                      </div>
                    </td>
                    <td>Kandy</td>
                    <td>09:23</td>
                    <td>—</td>
                    <td className="r">—</td>
                    <td>
                      <span className="chip w">Late</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="emp">
                        <i>AF</i>
                        <span>
                          <b>Amal Fernando</b>
                          <span>EMP-087 · EPF A/14211</span>
                        </span>
                      </div>
                    </td>
                    <td>Colombo HQ</td>
                    <td>—</td>
                    <td>—</td>
                    <td className="r">—</td>
                    <td>
                      <span className="chip b">Not in</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="emp">
                        <i>PJ</i>
                        <span>
                          <b>Priyantha Jayasuriya</b>
                          <span>EMP-112 · EPF A/14330</span>
                        </span>
                      </div>
                    </td>
                    <td>Katunayake</td>
                    <td>07:48</td>
                    <td>19:36</td>
                    <td className="r">2.1</td>
                    <td>
                      <span className="chip ok">Present</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="emp">
                        <i>SW</i>
                        <span>
                          <b>Sanduni Weerasinghe</b>
                          <span>EMP-045 · EPF A/14118</span>
                        </span>
                      </div>
                    </td>
                    <td>Colombo HQ</td>
                    <td>—</td>
                    <td>—</td>
                    <td className="r">—</td>
                    <td>
                      <span className="chip i">Maternity</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="emp">
                        <i>NB</i>
                        <span>
                          <b>Nuwan Bandara</b>
                          <span>EMP-133 · EPF A/14350</span>
                        </span>
                      </div>
                    </td>
                    <td>Kandy</td>
                    <td>08:41</td>
                    <td>—</td>
                    <td className="r">—</td>
                    <td>
                      <span className="chip w">Check location</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Payroll Snapshot & Statutory Calendar */}
        <div>
          {/* Payroll Run Preview Card */}
          <div className="card">
            <div className="card-h">
              <h2>September payroll</h2>
              <span className="chip w">Draft</span>
            </div>
            <div className="card-b">
              <div className="ln">
                <span>Gross earnings</span>
                <b>Rs 18,412,500</b>
              </div>
              <div className="ln">
                <span>Overtime at 1.5×</span>
                <b>Rs 1,204,860</b>
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
              <div className="ln" style={{ marginTop: "10px", borderTop: "1px solid var(--rule)" }}>
                <span>Employer cost — EPF 12% + ETF 3% + gratuity</span>
                <b>Rs 3,214,375</b>
              </div>
              <Link
                href="/payroll"
                className="btn pri"
                style={{ width: "100%", justifyContent: "center", marginTop: "12px" }}
              >
                Open payroll run
              </Link>
            </div>
          </div>

          {/* Statutory Compliance Calendar Card */}
          <div className="card">
            <div className="card-h">
              <h2>Compliance calendar</h2>
            </div>
            <div className="card-b">
              <div className="ln">
                <span>Tue 30 Sep · EPF C-Form + ETF R-4</span>
                <b className="chip b">1 day</b>
              </div>
              <div className="ln">
                <span>Wed 15 Oct · APIT T-10 to IRD</span>
                <b className="chip w">16 days</b>
              </div>
              <div className="ln">
                <span>Fri 31 Oct · Stamp duty Q3</span>
                <b className="chip">32 days</b>
              </div>
              <div className="ln">
                <span>Mon 20 Oct · Deepavali</span>
                <b className="chip i">Double pay</b>
              </div>
              <Link
                href="/returns"
                className="btn"
                style={{ width: "100%", justifyContent: "center", marginTop: "12px" }}
              >
                Open statutory returns
              </Link>
            </div>
          </div>

          {/* Hardware & Clock-in Terminals */}
          <div className="card">
            <div className="card-h">
              <h2>Clock-in points</h2>
              <span className="chip ok">4 of 5 online</span>
            </div>
            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Fingerprint-01 · Colombo HQ</b>
                <span>Synced 10s ago · 184 punches</span>
              </div>
            </div>
            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Fingerprint-02 · Kandy</b>
                <span>Synced 24s ago · 61 punches</span>
              </div>
            </div>
            <div className="list-row">
              <span className="dot b" />
              <div className="bd">
                <b>Fingerprint-03 · Galle</b>
                <span>Offline since 06:12 · 41 held</span>
              </div>
            </div>
            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Face-01 · Katunayake gate</b>
                <span>Synced 2m ago · 486 punches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
