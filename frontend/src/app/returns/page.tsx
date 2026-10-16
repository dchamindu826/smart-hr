"use client";

import React from "react";
import { useUI } from "@/context/UIContext";

export default function ReturnsPage() {
  const { toast } = useUI();

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Statutory returns & filings</h1>
          <p>
            Official file formats accepted directly by Sri Lanka statutory bodies (Department of
            Labour, ETF Board, and Inland Revenue Department).
          </p>
        </div>
        <div className="acts">
          <button
            type="button"
            className="btn pri"
            onClick={() => toast("EPF C-Form and ETF R-4 export batch generated for September.")}
          >
            Generate September returns
          </button>
        </div>
      </div>

      {/* Urgent Surcharge Warning Banner */}
      <div className="note b">
        <span className="ic">⚑</span>
        <div>
          <b>EPF C-Form and ETF R-4 for August are due tomorrow, 30 September</b>
          Statutory surcharge triggers the following day: 5% for the first 10 days, progressing up to
          50% for extended delays under EPF Act No. 15 of 1958.
        </div>
      </div>

      {/* Returns Schedule Table */}
      <div className="card">
        <div className="card-h">
          <h2>Statutory return calendar</h2>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Return</th>
                <th>Form</th>
                <th>Authority</th>
                <th>Period</th>
                <th>Due date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EPF Monthly Contribution</td>
                <td>
                  <span className="chip law">C-Form</span>
                </td>
                <td>Department of Labour</td>
                <td>August 2026</td>
                <td>30 Sep</td>
                <td>
                  <span className="chip b">Due tomorrow</span>
                </td>
                <td className="r">
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => toast("August EPF C-Form text file downloaded.")}
                  >
                    Get file
                  </button>
                </td>
              </tr>
              <tr>
                <td>ETF Monthly Contribution</td>
                <td>
                  <span className="chip law">R-4</span>
                </td>
                <td>ETF Board</td>
                <td>August 2026</td>
                <td>30 Sep</td>
                <td>
                  <span className="chip b">Due tomorrow</span>
                </td>
                <td className="r">
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => toast("August ETF R-4 file downloaded.")}
                  >
                    Get file
                  </button>
                </td>
              </tr>
              <tr>
                <td>APIT Monthly Schedule (PAYE)</td>
                <td>
                  <span className="chip law">T-10</span>
                </td>
                <td>Inland Revenue (IRD)</td>
                <td>September 2026</td>
                <td>15 Oct</td>
                <td>
                  <span className="chip w">16 days left</span>
                </td>
                <td className="r">
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => toast("APIT T-10 tax withholding schedule prepared.")}
                  >
                    Prepare
                  </button>
                </td>
              </tr>
              <tr>
                <td>Quarterly Stamp Duty</td>
                <td>
                  <span className="chip law">Quarterly</span>
                </td>
                <td>Inland Revenue (IRD)</td>
                <td>Q3 2026</td>
                <td>31 Oct</td>
                <td>
                  <span className="chip">32 days left</span>
                </td>
                <td className="r">
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => toast("Q3 Stamp duty computed: Rs 5,725.")}
                  >
                    Compute
                  </button>
                </td>
              </tr>
              <tr>
                <td>EPF Monthly Contribution</td>
                <td>
                  <span className="chip law">C-Form</span>
                </td>
                <td>Department of Labour</td>
                <td>July 2026</td>
                <td>31 Aug</td>
                <td>
                  <span className="chip ok">Filed 28 Aug</span>
                </td>
                <td className="r">
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => toast("July C-Form submission acknowledgement receipt opened.")}
                  >
                    Receipt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Surcharge Calculator & Statutory Guidelines */}
      <div className="grid g3">
        <div className="card">
          <div className="card-h">
            <h2>EPF Statutory Surcharges</h2>
            <span className="chip law">Act No. 15 of 1958</span>
          </div>
          <div className="card-b">
            <div className="ln">
              <span>1 – 10 days late</span>
              <b>5% surcharge</b>
            </div>
            <div className="ln">
              <span>11 – 30 days late</span>
              <b>15% surcharge</b>
            </div>
            <div className="ln">
              <span>1 – 3 months late</span>
              <b>20% surcharge</b>
            </div>
            <div className="ln">
              <span>3 – 6 months late</span>
              <b>30% surcharge</b>
            </div>
            <div className="ln">
              <span>6 – 12 months late</span>
              <b>40% surcharge</b>
            </div>
            <div className="ln">
              <span>Beyond 12 months</span>
              <b>50% surcharge</b>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h2>ETF Statutory Regulations</h2>
            <span className="chip law">Act No. 46 of 1980</span>
          </div>
          <div className="card-b">
            <div className="ln">
              <span>Rate</span>
              <b>3% of total earnings</b>
            </div>
            <div className="ln">
              <span>Deduction from employee?</span>
              <b>Strictly 100% employer liability</b>
            </div>
            <div className="ln">
              <span>Due date</span>
              <b>Last day of following month</b>
            </div>
            <div className="ln">
              <span>Return format</span>
              <b>Form R-4 (Electronic / Paper)</b>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h2>Inland Revenue (APIT)</h2>
            <span className="chip law">Inland Revenue Act</span>
          </div>
          <div className="card-b">
            <div className="ln">
              <span>Monthly withholding</span>
              <b>Progressive tax tables (up to 36%)</b>
            </div>
            <div className="ln">
              <span>Remittance due</span>
              <b>15th of each subsequent month</b>
            </div>
            <div className="ln">
              <span>Annual certificate</span>
              <b>T-10 issued to employees by 30 April</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
