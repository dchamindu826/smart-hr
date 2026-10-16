"use client";

import React, { useState } from "react";
import { useUI } from "@/context/UIContext";

interface DayConfig {
  type: string;
  name: string;
  rate: string;
  chipClass: string;
}

const SPECIAL_DAYS: Record<number, DayConfig> = {
  2: { type: "poya", name: "Vap Poya", rate: "2×", chipClass: "x2" },
  3: { type: "half", name: "Half-holiday", rate: "1×", chipClass: "x1" },
  4: { type: "wk", name: "Weekly holiday", rate: "1.5×", chipClass: "x15" },
  10: { type: "half", name: "Half-holiday", rate: "1×", chipClass: "x1" },
  11: { type: "wk", name: "Weekly holiday", rate: "1.5×", chipClass: "x15" },
  17: { type: "half", name: "Half-holiday", rate: "1×", chipClass: "x1" },
  18: { type: "wk", name: "Weekly holiday", rate: "1.5×", chipClass: "x15" },
  20: { type: "pub", name: "Deepavali", rate: "2×", chipClass: "x2" },
  24: { type: "half", name: "Half-holiday", rate: "1×", chipClass: "x1" },
  25: { type: "wk", name: "Weekly holiday", rate: "1.5×", chipClass: "x15" },
  26: { type: "co", name: "Plant maintenance", rate: "1.5×", chipClass: "x15" },
  31: { type: "half", name: "Half-holiday", rate: "1×", chipClass: "x1" },
};

export default function PayCalendarPage() {
  const { toast } = useUI();
  const [selectedDay, setSelectedDay] = useState<number>(20);
  const [dayName, setDayName] = useState("Deepavali");
  const [dayRate, setDayRate] = useState("2× — double");

  const handleSelectDay = (d: number) => {
    setSelectedDay(d);
    const cfg = SPECIAL_DAYS[d];
    if (cfg) {
      setDayName(cfg.name);
      setDayRate(`${cfg.rate} ${cfg.rate === "2×" ? "— double" : ""}`);
      toast(`${d} October · ${cfg.name} (${cfg.rate})`);
    } else {
      setDayName("Ordinary working day");
      setDayRate("1× — ordinary");
      toast(`${d} October · Ordinary working day (1×)`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Holiday &amp; pay calendar</h1>
          <p>
            October 2026. Marking a date here governs payment rates (1×, 1.5×, 2× Poya/Mercantile)
            across the roster and payroll engine.
          </p>
        </div>
        <div className="acts">
          <button
            type="button"
            className="btn"
            onClick={() => toast("2027 Sri Lanka Government Gazette imported. 12 Poya days and 9 mercantile holidays added.")}
          >
            Import gazette
          </button>
          <button
            type="button"
            className="btn pri"
            onClick={() => toast("Calendar published. Roster and payroll now read the updated rates.")}
          >
            Publish calendar
          </button>
        </div>
      </div>

      {/* Authority Notice */}
      <div className="note i">
        <span className="ic">⚑</span>
        <div>
          <b>Authorized HR Manager Control</b>
          Line managers roster staff onto shifts; they cannot change statutory wage multipliers. The
          rate set here feeds the attendance calculator, overtime multiplier, and payroll run
          automatically.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat w">
          <span>Poya days</span>
          <b>12</b>
          <small>Paid holiday · 2× if worked</small>
        </div>
        <div className="stat b">
          <span>Gazetted public</span>
          <b>9</b>
          <small>Paid holiday · 2× if worked</small>
        </div>
        <div className="stat i">
          <span>Company holidays</span>
          <b>3</b>
          <small>1.5× if worked</small>
        </div>
        <div className="stat">
          <span>Double-pay budget</span>
          <b>Rs 1.84M</b>
          <small>184 people worked on 2× days</small>
        </div>
      </div>

      <div className="grid gmain">
        {/* Left Column: Calendar Grid */}
        <div className="card">
          <div className="card-h">
            <h2>October 2026 Calendar</h2>
            <span className="sp" />
            <span className="chip w">Poya 2×</span>
            <span className="chip b">Gazetted 2×</span>
            <span className="chip i">Company 1.5×</span>
            <span className="chip">Weekly 1.5×</span>
          </div>
          <div className="card-b">
            <div className="pc">
              {["M", "T", "W", "T", "F", "S", "S"].map((dayName, idx) => (
                <div key={idx} className="pc-h">
                  {dayName}
                </div>
              ))}

              {/* Leading month padding cells */}
              <div className="pc-d pad" />
              <div className="pc-d pad" />
              <div className="pc-d pad" />

              {/* 31 days */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const k = SPECIAL_DAYS[d];
                const isSelected = selectedDay === d;
                return (
                  <button
                    key={d}
                    type="button"
                    className={`pc-d ${k ? k.type : ""} ${isSelected ? "sel" : ""}`}
                    onClick={() => handleSelectDay(d)}
                  >
                    <span className="n">{d}</span>
                    <span className="t">{k ? k.name : ""}</span>
                    <span className={`x ${k ? k.chipClass : "x1"}`}>
                      {k ? k.rate : "1×"}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="hint" style={{ marginTop: "12px" }}>
              Click any date to inspect or adjust its rate multiplier. Poya and public holidays arrive
              via Government Gazette; weekly rest days sync from shift patterns.
            </p>
          </div>
        </div>

        {/* Right Column: Selected Day Configuration */}
        <div>
          <div className="card">
            <div className="card-h">
              <h2>Date settings · {selectedDay} October</h2>
              {SPECIAL_DAYS[selectedDay] && (
                <span className={`chip ${SPECIAL_DAYS[selectedDay].type === "poya" ? "w" : "b"}`}>
                  {SPECIAL_DAYS[selectedDay].type === "poya" ? "Full Moon Poya" : "Gazetted"}
                </span>
              )}
            </div>
            <div className="card-b">
              <label className="f">Classification</label>
              <select className="f-in">
                <option>Gazetted public holiday</option>
                <option>Full Moon Poya day</option>
                <option>Company holiday</option>
                <option>Weekly holiday</option>
                <option>Ordinary working day</option>
              </select>

              <label className="f">Public label</label>
              <input
                className="f-in"
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
              />

              <label className="f">Pay multiplier if worked</label>
              <select
                className="f-in"
                value={dayRate}
                onChange={(e) => setDayRate(e.target.value)}
              >
                <option value="2× — double">2× — double</option>
                <option value="1.5×">1.5×</option>
                <option value="1× — ordinary">1× — ordinary</option>
                <option value="Double and day off">Double and a day off in lieu</option>
              </select>

              <div className="ln" style={{ marginTop: "14px" }}>
                <span>Rostered on this date</span>
                <b>38 staff</b>
              </div>
              <div className="ln">
                <span>Premium cost</span>
                <b>Rs 284,600 extra</b>
              </div>
              <div className="ln">
                <span>Counts toward OT ceiling?</span>
                <b>No (Holiday premium, not OT)</b>
              </div>

              <button
                type="button"
                className="btn pri"
                style={{ width: "100%", justifyContent: "center", marginTop: "14px" }}
                onClick={() => toast(`Date configuration saved for ${selectedDay} October.`)}
              >
                Save date rate
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h2>Sri Lanka Statutory Rates Summary</h2>
            </div>
            <div className="card-b">
              <div className="ln">
                <span>Ordinary day</span>
                <b>1× normal rate</b>
              </div>
              <div className="ln">
                <span>Overtime on ordinary day</span>
                <b>1.5× hourly rate</b>
              </div>
              <div className="ln">
                <span>Weekly rest day worked</span>
                <b>1.5× hourly rate</b>
              </div>
              <div className="ln">
                <span>Poya day worked</span>
                <b>2× normal daily rate</b>
              </div>
              <div className="ln">
                <span>Gazetted statutory holiday</span>
                <b>2× normal daily rate</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
