"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";

interface Session {
  time: string;
  type: "office" | "remote";
  typeLabel: string;
  duration: string;
  location: string;
}

interface AttendanceRow {
  id: string;
  name: string;
  rostered: string;
  sessionCount: number;
  worked: string;
  variance: string;
  varianceChip?: "w" | "b" | "i";
  ot: string;
  status: "Complete" | "Present" | "Short" | "Unplanned OT" | "Late 38 m" | "No punch";
  statusChip: "ok" | "w" | "b" | "i";
  sessions?: Session[];
}

const ATTENDANCE_DATA: AttendanceRow[] = [
  {
    id: "att-1",
    name: "Kamal Perera",
    rostered: "Split · 9 h",
    sessionCount: 3,
    worked: "9 h 00 m",
    variance: "—",
    ot: "0.0",
    status: "Complete",
    statusChip: "ok",
    sessions: [
      {
        time: "08:30 – 12:30",
        type: "office",
        typeLabel: "🏢 Office",
        duration: "4 h 00 m",
        location: "Fingerprint-01 · Colombo HQ",
      },
      {
        time: "14:05 – 16:05",
        type: "remote",
        typeLabel: "🏡 Remote",
        duration: "2 h 00 m",
        location: "Nugegoda · 1.2 km from registered address · accuracy 24 m",
      },
      {
        time: "17:10 – 20:10",
        type: "remote",
        typeLabel: "🏡 Remote",
        duration: "3 h 00 m",
        location: "Nugegoda · same location · day total reached, marked complete",
      },
    ],
  },
  {
    id: "att-2",
    name: "Priyantha Jayasuriya",
    rostered: "Early · 11.5 h",
    sessionCount: 2,
    worked: "11 h 48 m",
    variance: "−12 m",
    varianceChip: "w",
    ot: "2.3",
    status: "Present",
    statusChip: "ok",
    sessions: [
      {
        time: "06:30 – 12:30",
        type: "office",
        typeLabel: "🏢 Office",
        duration: "6 h 00 m",
        location: "Fingerprint-02 · Katunayake Plant",
      },
      {
        time: "13:30 – 19:18",
        type: "office",
        typeLabel: "🏢 Office",
        duration: "5 h 48 m",
        location: "Fingerprint-02 · Katunayake Plant",
      },
    ],
  },
  {
    id: "att-3",
    name: "Fathima Rizwan",
    rostered: "General · 9 h",
    sessionCount: 2,
    worked: "6 h 40 m",
    variance: "−2 h 20 m",
    varianceChip: "b",
    ot: "—",
    status: "Short",
    statusChip: "w",
    sessions: [
      {
        time: "08:55 – 12:30",
        type: "office",
        typeLabel: "🏢 Office",
        duration: "3 h 35 m",
        location: "Fingerprint-01 · late by 25 min",
      },
      {
        time: "13:25 – 16:30",
        type: "remote",
        typeLabel: "🏡 Remote",
        duration: "3 h 05 m",
        location: "Rajagiriya · at her registered address · no third session, day left open",
      },
    ],
  },
  {
    id: "att-4",
    name: "Ruwan Dissanayake",
    rostered: "General · 9 h",
    sessionCount: 1,
    worked: "10 h 12 m",
    variance: "+1 h 12 m",
    varianceChip: "i",
    ot: "1.2",
    status: "Unplanned OT",
    statusChip: "i",
  },
  {
    id: "att-5",
    name: "Nimal Silva",
    rostered: "General · 9 h",
    sessionCount: 1,
    worked: "7 h 07 m",
    variance: "−1 h 53 m",
    varianceChip: "b",
    ot: "—",
    status: "Late 38 m",
    statusChip: "w",
  },
  {
    id: "att-6",
    name: "Amal Fernando",
    rostered: "General · 9 h",
    sessionCount: 0,
    worked: "—",
    variance: "−9 h",
    varianceChip: "b",
    ot: "—",
    status: "No punch",
    statusChip: "b",
  },
  {
    id: "att-7",
    name: "Nuwan Bandara",
    rostered: "Night · ends today",
    sessionCount: 1,
    worked: "5 h 00 m",
    variance: "—",
    ot: "—",
    status: "Complete",
    statusChip: "ok",
    sessions: [
      {
        time: "00:00 – 05:00",
        type: "office",
        typeLabel: "🏢 Office",
        duration: "5 h 00 m",
        location: "Second half of Monday’s night shift · split at midnight",
      },
    ],
  },
];

export default function AttendancePage() {
  const { toast } = useUI();
  const [filter, setFilter] = useState<"All" | "Short" | "Remote">("All");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "att-1": true,
    "att-3": true,
    "att-7": true,
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = ATTENDANCE_DATA.filter((row) => {
    if (filter === "Short") return row.status === "Short" || row.status === "Late 38 m";
    if (filter === "Remote") return row.sessions?.some((s) => s.type === "remote");
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Attendance & muster roll</h1>
          <p>
            A day is a set of work sessions, not one in and one out. Payroll reads the day total
            against what was rostered.
          </p>
        </div>
        <div className="acts">
          <button
            type="button"
            className="btn"
            onClick={() => toast("Attendance sheet exported as XLSX.")}
          >
            Export
          </button>
          <Link href="/registers" className="btn">
            Statutory register
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats">
        <div className="stat ok">
          <span>Average present</span>
          <b>91.2%</b>
          <small>Target 93% across 4 branches</small>
        </div>
        <div className="stat i">
          <span>Remote sessions</span>
          <b>142</b>
          <small>34 mobile-clocked staff</small>
        </div>
        <div className="stat w">
          <span>Short of rostered</span>
          <b>9</b>
          <small>Day total under the roster</small>
        </div>
        <div className="stat b">
          <span>Unexplained absence</span>
          <b>37</b>
          <small>Across 21 people</small>
        </div>
      </div>

      {/* Main Attendance Card */}
      <div className="card">
        <div className="card-h">
          <input
            className="f-in"
            style={{ maxWidth: "210px" }}
            placeholder="Employee or EPF no."
            aria-label="Search employee"
          />

          <div className="seg">
            <button
              type="button"
              aria-pressed={filter === "All"}
              onClick={() => setFilter("All")}
            >
              All
            </button>
            <button
              type="button"
              aria-pressed={filter === "Short"}
              onClick={() => setFilter("Short")}
            >
              Short
            </button>
            <button
              type="button"
              aria-pressed={filter === "Remote"}
              onClick={() => setFilter("Remote")}
            >
              Remote
            </button>
          </div>

          <span className="sp" />
          <span className="chip">Tue 29 Sep 2026</span>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Rostered</th>
                <th className="r">Sessions</th>
                <th className="r">Worked</th>
                <th className="r">Variance</th>
                <th className="r">OT</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isExpanded = !!expanded[row.id];
                return (
                  <React.Fragment key={row.id}>
                    <tr>
                      <td>
                        {row.sessions && row.sessions.length > 0 ? (
                          <button
                            type="button"
                            className="exp"
                            onClick={() => toggleExpand(row.id)}
                            title={isExpanded ? "Collapse sessions" : "Expand sessions"}
                          >
                            {isExpanded ? "−" : "+"}
                          </button>
                        ) : (
                          <span style={{ display: "inline-block", width: "27px" }} />
                        )}
                        <b>{row.name}</b>
                      </td>
                      <td>{row.rostered}</td>
                      <td className="r">{row.sessionCount}</td>
                      <td className="r">
                        <b>{row.worked}</b>
                      </td>
                      <td className="r">
                        {row.varianceChip ? (
                          <span className={`chip ${row.varianceChip}`}>{row.variance}</span>
                        ) : (
                          row.variance
                        )}
                      </td>
                      <td className="r">{row.ot}</td>
                      <td>
                        <span className={`chip ${row.statusChip}`}>{row.status}</span>
                      </td>
                    </tr>

                    {/* Expandable Individual Sessions */}
                    {isExpanded &&
                      row.sessions?.map((sess, idx) => {
                        const isLast = idx === (row.sessions?.length || 0) - 1;
                        return (
                          <tr
                            key={idx}
                            className={`sess ${isLast ? "last" : ""}`}
                          >
                            <td>{sess.time}</td>
                            <td>
                              <span
                                className={`mchip ${sess.type === "office" ? "o" : "w"}`}
                              >
                                {sess.typeLabel}
                              </span>
                            </td>
                            <td className="r">—</td>
                            <td className="r">{sess.duration}</td>
                            <td colSpan={3}>{sess.location}</td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules & Explanations */}
      <div className="grid g2">
        <div className="card">
          <div className="card-h">
            <h2>How a day is counted</h2>
          </div>
          <div className="card-b">
            <div className="ln">
              <span>A session</span>
              <b>One mark-in to the next mark-out</b>
            </div>
            <div className="ln">
              <span>A day</span>
              <b>00:00 to 23:59, by the clock</b>
            </div>
            <div className="ln">
              <span>A session crossing midnight</span>
              <b>Split at 00:00 and counted on both days</b>
            </div>
            <div className="ln">
              <span>Day is complete when</span>
              <b>Session time reaches the rostered hours</b>
            </div>
            <div className="ln">
              <span>Gaps between sessions</span>
              <b>Not counted · they are the break</b>
            </div>
            <div className="ln">
              <span>One unbroken session over meal window</span>
              <b>1 h deducted automatically (Shop &amp; Office Act)</b>
            </div>
            <div className="ln">
              <span>Late is judged on</span>
              <b>The first mark-in only</b>
            </div>
            <div className="note w" style={{ marginTop: "13px" }}>
              <span className="ic">⚠</span>
              <div>
                <b>A calendar day splits every night shift</b>
                N. Bandara’s 20:00 to 05:00 is four hours on Monday and five on Tuesday. The roster
                places hours on both dates accurately for statutory compliance.
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h2>Clocking policies settled</h2>
            <span className="chip ok">Sri Lankan practice</span>
          </div>
          <div className="card-b">
            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Does lunch interval need a punch?</b>
                <span>
                  Settled: no. Staff who stay on site through lunch are not required to punch out.
                  One hour is deducted automatically from single sessions covering the meal window.
                </span>
              </div>
              <div className="rt">
                <span className="chip ok">Decided</span>
              </div>
            </div>

            <div className="list-row">
              <span className="dot ok" />
              <div className="bd">
                <b>Remote punch geofencing</b>
                <span>
                  Settled: yes. Phone GPS must return a fix within 100m before mobile check-in starts,
                  preventing proxy check-ins outside home or client premises.
                </span>
              </div>
              <div className="rt">
                <span className="chip ok">Decided</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
