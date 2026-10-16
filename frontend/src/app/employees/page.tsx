"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";

interface Employee {
  id: string;
  name: string;
  epf: string;
  department: string;
  branch: string;
  joined: string;
  service: string;
  status: "Confirmed" | "Probation" | "Maternity" | "Exited";
  gratuity: string;
}

const EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    name: "Kamal Perera",
    epf: "A/14023",
    department: "Production",
    branch: "Colombo HQ",
    joined: "12 Mar 2022",
    service: "4y 6m",
    status: "Confirmed",
    gratuity: "Rs 191,250",
  },
  {
    id: "EMP-112",
    name: "Priyantha Jayasuriya",
    epf: "A/14330",
    department: "Production",
    branch: "Katunayake",
    joined: "04 Jan 2019",
    service: "7y 8m",
    status: "Confirmed",
    gratuity: "Rs 402,500",
  },
  {
    id: "EMP-045",
    name: "Sanduni Weerasinghe",
    epf: "A/14118",
    department: "Finance",
    branch: "Colombo HQ",
    joined: "18 Jul 2021",
    service: "5y 2m",
    status: "Maternity",
    gratuity: "Rs 268,750",
  },
  {
    id: "EMP-208",
    name: "Thilini Bandara",
    epf: "A/14402",
    department: "Sales",
    branch: "Galle",
    joined: "02 Aug 2026",
    service: "1m",
    status: "Probation",
    gratuity: "—",
  },
  {
    id: "EMP-076",
    name: "Ruwan Dissanayake",
    epf: "A/14187",
    department: "Production",
    branch: "Katunayake",
    joined: "15 Nov 2017",
    service: "8y 10m",
    status: "Confirmed",
    gratuity: "Rs 528,000",
  },
  {
    id: "EMP-190",
    name: "Fathima Rizwan",
    epf: "A/14377",
    department: "Admin",
    branch: "Colombo HQ",
    joined: "09 Sep 2025",
    service: "1y",
    status: "Confirmed",
    gratuity: "—",
  },
  {
    id: "EMP-221",
    name: "Sivakumar Raj",
    epf: "A/14415",
    department: "Logistics",
    branch: "Galle",
    joined: "23 Feb 2020",
    service: "6y 7m",
    status: "Confirmed",
    gratuity: "Rs 337,500",
  },
];

export default function EmployeesPage() {
  const { toast, openSheet } = useUI();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Confirmed" | "Probation" | "Exited">("All");

  const filtered = EMPLOYEES.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.id.toLowerCase().includes(query.toLowerCase()) ||
      emp.epf.toLowerCase().includes(query.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "All") return true;
    return emp.status === filter;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusChip = (status: Employee["status"]) => {
    switch (status) {
      case "Confirmed":
        return <span className="chip ok">Confirmed</span>;
      case "Probation":
        return <span className="chip w">Probation</span>;
      case "Maternity":
        return <span className="chip i">Maternity</span>;
      case "Exited":
        return <span className="chip b">Exited</span>;
    }
  };

  const handleAddEmployee = () => {
    openSheet(
      "Add New Employee",
      "Record appointment details and statutory registrations",
      <div>
        <label className="f">Full Name</label>
        <input className="f-in" placeholder="e.g. Kasun Chamara Perera" />

        <div className="f-row f2">
          <div>
            <label className="f">NIC Number</label>
            <input className="f-in" placeholder="199512345678 or 951234567V" />
          </div>
          <div>
            <label className="f">EPF Member Number</label>
            <input className="f-in" placeholder="A/14450" />
          </div>
        </div>

        <div className="f-row f2">
          <div>
            <label className="f">Department</label>
            <select className="f-in">
              <option>Production</option>
              <option>Finance</option>
              <option>Sales & Marketing</option>
              <option>Logistics</option>
              <option>Administration</option>
            </select>
          </div>
          <div>
            <label className="f">Branch</label>
            <select className="f-in">
              <option>Colombo HQ</option>
              <option>Katunayake Plant</option>
              <option>Kandy Branch</option>
              <option>Galle Branch</option>
            </select>
          </div>
        </div>

        <div className="f-row f2">
          <div>
            <label className="f">Basic Salary (LKR)</label>
            <input className="f-in" type="number" defaultValue="85000" />
          </div>
          <div>
            <label className="f">Date Joined</label>
            <input className="f-in" type="date" defaultValue="2026-10-01" />
          </div>
        </div>

        <button
          type="button"
          className="btn pri"
          style={{ width: "100%", justifyContent: "center", marginTop: "18px" }}
          onClick={() => toast("New employee profile created successfully.")}
        >
          Save & Register Employee
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Employees</h1>
          <p>250 on the roll across 4 branches. Everything about a person hangs off this record.</p>
        </div>
        <div className="acts">
          <Link href="/import" className="btn">
            Bulk import
          </Link>
          <button type="button" className="btn pri" onClick={handleAddEmployee}>
            Add employee
          </button>
        </div>
      </div>

      {/* Main Card with filters & table */}
      <div className="card">
        <div className="card-h">
          <input
            className="f-in"
            style={{ maxWidth: "250px" }}
            placeholder="Name, EMP no. or EPF no."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search employees"
          />

          <div className="seg">
            <button
              type="button"
              aria-pressed={filter === "All"}
              onClick={() => setFilter("All")}
            >
              All 250
            </button>
            <button
              type="button"
              aria-pressed={filter === "Confirmed"}
              onClick={() => setFilter("Confirmed")}
            >
              Confirmed 214
            </button>
            <button
              type="button"
              aria-pressed={filter === "Probation"}
              onClick={() => setFilter("Probation")}
            >
              Probation 29
            </button>
            <button
              type="button"
              aria-pressed={filter === "Exited"}
              onClick={() => setFilter("Exited")}
            >
              Exited 7
            </button>
          </div>

          <span className="sp" />

          <button
            type="button"
            className="btn sm"
            onClick={() => toast("250 employee rows exported to XLSX.")}
          >
            Export
          </button>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Branch</th>
                <th>Joined</th>
                <th>Service</th>
                <th>Status</th>
                <th className="r">Gratuity accrued</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="emp">
                      <i>{getInitials(emp.name)}</i>
                      <span>
                        <b>{emp.name}</b>
                        <span>
                          {emp.id} · {emp.epf}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.branch}</td>
                  <td>{emp.joined}</td>
                  <td>{emp.service}</td>
                  <td>{getStatusChip(emp.status)}</td>
                  <td className="r">{emp.gratuity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Guidance Note */}
      <div className="note i">
        <span className="ic">◈</span>
        <div>
          <b>Gratuity accrues from the fifth year</b>
          Anyone under five years of service shows a dash. The running figure comes from the Sri Lanka
          Gratuity Act accrual calculation (1/2 month's terminal salary per year), not from a typed field.
        </div>
      </div>
    </div>
  );
}
