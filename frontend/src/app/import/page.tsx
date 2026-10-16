"use client";

import React, { useState } from "react";
import { useUI } from "@/context/UIContext";

interface ErrorRow {
  row: number;
  name: string;
  column: string;
  problem: string;
  found: string;
  fixed?: boolean;
}

const INITIAL_ERRORS: ErrorRow[] = [
  {
    row: 14,
    name: "W. A. Chathura",
    column: "epf_number",
    problem: "Already assigned to EMP-032",
    found: "A/14090",
  },
  {
    row: 38,
    name: "M. Ishara",
    column: "nic",
    problem: "Invalid Sri Lanka NIC format (needs 10 or 12 digits)",
    found: "9512345V7",
  },
  {
    row: 57,
    name: "K. Dilshan",
    column: "join_date",
    problem: "Date is in the future",
    found: "2027-01-05",
  },
  {
    row: 91,
    name: "S. Perera",
    column: "basic_salary",
    problem: "Below National Minimum Wage of Workers Act No. 3 of 2016",
    found: "12,000",
  },
  {
    row: 112,
    name: "A. Nirmala",
    column: "department",
    problem: 'No department called "Sewing C"',
    found: "Sewing C",
  },
  {
    row: 166,
    name: "T. Bandara",
    column: "branch",
    problem: "Branch field is mandatory for EPF remit",
    found: "—",
  },
  {
    row: 203,
    name: "R. Fernando",
    column: "bank_account",
    problem: "Account number length invalid for Bank of Ceylon SLIPS",
    found: "41827",
  },
];

export default function BulkImportPage() {
  const { toast, openSheet } = useUI();
  const [errors, setErrors] = useState<ErrorRow[]>(INITIAL_ERRORS);
  const [committed, setCommitted] = useState(false);

  const handleFixRow = (rowNum: number) => {
    openSheet(
      `Fix Import Error: Row ${rowNum}`,
      "Edit cell value to satisfy Sri Lanka statutory validation rules",
      <div>
        <label className="f">Field to correct</label>
        <input className="f-in" defaultValue="A/14499" />
        <button
          type="button"
          className="btn pri"
          style={{ width: "100%", justifyContent: "center", marginTop: "14px" }}
          onClick={() => {
            setErrors((prev) =>
              prev.map((e) => (e.row === rowNum ? { ...e, fixed: true } : e))
            );
            toast(`Row ${rowNum} corrected and validated.`);
          }}
        >
          Validate & Save Row
        </button>
      </div>
    );
  };

  const handleCommit = () => {
    setCommitted(true);
    toast("243 employees committed into database. Audit trail record logged.");
  };

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Bulk employee import</h1>
          <p>
            Bring a complete company payroll &amp; personnel record in from an Excel sheet. Nothing is
            committed until every row passes validation.
          </p>
        </div>
        <div className="acts">
          <button
            type="button"
            className="btn"
            onClick={() => toast("Template downloaded: smarthr-employees-template.xlsx")}
          >
            Download template (.xlsx)
          </button>
        </div>
      </div>

      {/* Steps Wizard */}
      <div className="steps">
        <div className="step dn">
          <span className="n">01</span>
          <b>File uploaded</b>
          employees-sept.xlsx · 250 rows
        </div>
        <div className="step dn">
          <span className="n">02</span>
          <b>Columns mapped</b>
          18 of 18 matched
        </div>
        <div className={`step ${committed ? "dn" : "on"}`}>
          <span className="n">03</span>
          <b>Validation</b>
          {committed ? "All rows passed" : "243 pass · 7 to fix"}
        </div>
        <div className={`step ${committed ? "dn" : ""}`}>
          <span className="n">04</span>
          <b>Commit</b>
          {committed ? "Committed to database" : "Not yet written"}
        </div>
      </div>

      {/* Notice */}
      {!committed && (
        <div className="note w">
          <span className="ic">⚠</span>
          <div>
            <b>7 rows require attention before commit</b>
            Fix them directly here or adjust the spreadsheet and re-upload. No database records have
            been modified yet.
          </div>
        </div>
      )}

      {/* Problem Rows Table Card */}
      <div className="card">
        <div className="card-h">
          <h2>Rows needing attention</h2>
          <span className="chip b">{errors.filter((e) => !e.fixed).length}</span>
          <span className="sp" />
          <button
            type="button"
            className="btn sm"
            onClick={() => toast("7 issue rows downloaded as an error report spreadsheet.")}
          >
            Download error report
          </button>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Employee Name</th>
                <th>Column</th>
                <th>Validation problem</th>
                <th>Value found</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e) => (
                <tr key={e.row}>
                  <td>{e.row}</td>
                  <td>
                    <b>{e.name}</b>
                  </td>
                  <td>
                    <code>{e.column}</code>
                  </td>
                  <td>{e.problem}</td>
                  <td>
                    <span className="chip law">{e.found}</span>
                  </td>
                  <td className="r">
                    {e.fixed ? (
                      <span className="chip ok">✓ Resolved</span>
                    ) : (
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => handleFixRow(e.row)}
                      >
                        Fix
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column Mapping & Commit Summary */}
      <div className="grid g2">
        <div className="card">
          <div className="card-h">
            <h2>Column mapping status</h2>
            <span className="chip ok">18 of 18 auto-matched</span>
          </div>
          <div className="card-b">
            <div className="ln">
              <span>Employee Name</span>
              <b>name</b>
            </div>
            <div className="ln">
              <span>National Identity (NIC)</span>
              <b>nic</b>
            </div>
            <div className="ln">
              <span>EPF Number</span>
              <b>epf_number</b>
            </div>
            <div className="ln">
              <span>Date of Joining</span>
              <b>join_date</b>
            </div>
            <div className="ln">
              <span>Basic Salary</span>
              <b>basic_salary</b>
            </div>
            <div className="ln">
              <span>Department</span>
              <b>department</b>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h2>Commit database action</h2>
          </div>
          <div className="card-b">
            <div className="ln">
              <span>New employee records</span>
              <b>243</b>
            </div>
            <div className="ln">
              <span>Leave balances initialized</span>
              <b>243 (Accrued by join quarter)</b>
            </div>
            <div className="ln">
              <span>Written to audit log</span>
              <b>1 batch commit record</b>
            </div>
            <button
              type="button"
              className="btn pri"
              disabled={committed}
              style={{ width: "100%", justifyContent: "center", marginTop: "14px" }}
              onClick={handleCommit}
            >
              {committed ? "✓ 243 employees imported" : "Commit 243 rows to database"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
