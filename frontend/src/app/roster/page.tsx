"use client";

import React, { useState, useMemo } from "react";
import { useUI } from "@/context/UIContext";

interface ShiftPattern {
  id: string;
  name: string;
  startTime: string;
  durationHours: number;
  mealMinutes: number;
  defaultMode: "OFFICE" | "REMOTE" | "SPLIT";
}

interface DayAssignment {
  date: string;
  dayName: string;
  isOffDay: boolean;
  shiftPatternId: string | null;
  shiftName: string;
  hours: number;
  mode: "OFFICE" | "REMOTE" | "SPLIT";
  isPoya?: boolean;
}

interface EmployeeRoster {
  id: string;
  empNo: string;
  fullName: string;
  designation: string;
  department: string;
  days: DayAssignment[];
}

const INITIAL_SHIFTS: ShiftPattern[] = [
  { id: "sp-1", name: "General Day Shift (08:30 – 17:30)", startTime: "08:30", durationHours: 9, mealMinutes: 60, defaultMode: "OFFICE" },
  { id: "sp-2", name: "Morning Shift (06:30 – 15:30)", startTime: "06:30", durationHours: 9, mealMinutes: 60, defaultMode: "OFFICE" },
  { id: "sp-3", name: "Evening Shift (14:30 – 23:00)", startTime: "14:30", durationHours: 8.5, mealMinutes: 45, defaultMode: "OFFICE" },
  { id: "sp-4", name: "Night Shift (21:00 – 06:00)", startTime: "21:00", durationHours: 9, mealMinutes: 60, defaultMode: "OFFICE" },
  { id: "sp-5", name: "Half Day (08:30 – 13:00)", startTime: "08:30", durationHours: 4.5, mealMinutes: 0, defaultMode: "OFFICE" },
];

const DAYS_HEADER = [
  { key: "mon", label: "Mon 29 Sep" },
  { key: "tue", label: "Tue 30 Sep" },
  { key: "wed", label: "Wed 01 Oct" },
  { key: "thu", label: "Thu 02 Oct", isPoya: true },
  { key: "fri", label: "Fri 03 Oct" },
  { key: "sat", label: "Sat 04 Oct" },
  { key: "sun", label: "Sun 05 Oct" },
];

function buildInitialDays(generalId: string, morningId: string): DayAssignment[] {
  return [
    { date: "2026-09-29", dayName: "Mon", isOffDay: false, shiftPatternId: generalId, shiftName: "General Shift", hours: 8, mode: "OFFICE" },
    { date: "2026-09-30", dayName: "Tue", isOffDay: false, shiftPatternId: generalId, shiftName: "General Shift", hours: 8, mode: "OFFICE" },
    { date: "2026-10-01", dayName: "Wed", isOffDay: false, shiftPatternId: generalId, shiftName: "General Shift", hours: 8, mode: "OFFICE" },
    { date: "2026-10-02", dayName: "Thu", isOffDay: false, shiftPatternId: generalId, shiftName: "General Shift", hours: 8, mode: "OFFICE", isPoya: true },
    { date: "2026-10-03", dayName: "Fri", isOffDay: false, shiftPatternId: generalId, shiftName: "General Shift", hours: 8, mode: "OFFICE" },
    { date: "2026-10-04", dayName: "Sat", isOffDay: false, shiftPatternId: morningId, shiftName: "Morning (OT)", hours: 10, mode: "OFFICE" },
    { date: "2026-10-05", dayName: "Sun", isOffDay: true, shiftPatternId: null, shiftName: "Weekly Off", hours: 0, mode: "OFFICE" },
  ];
}

const INITIAL_ROSTER: EmployeeRoster[] = [
  {
    id: "emp-1",
    empNo: "EMP-001",
    fullName: "Kasun Perera",
    designation: "Senior Weaver",
    department: "Production Line A",
    days: buildInitialDays("sp-1", "sp-2"),
  },
  {
    id: "emp-2",
    empNo: "EMP-002",
    fullName: "Dinuka Fernando",
    designation: "Quality Inspector",
    department: "Quality Assurance",
    days: [
      { date: "2026-09-29", dayName: "Mon", isOffDay: false, shiftPatternId: "sp-1", shiftName: "General Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-09-30", dayName: "Tue", isOffDay: false, shiftPatternId: "sp-1", shiftName: "General Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-10-01", dayName: "Wed", isOffDay: false, shiftPatternId: "sp-1", shiftName: "General Shift", hours: 8, mode: "REMOTE" },
      { date: "2026-10-02", dayName: "Thu", isOffDay: false, shiftPatternId: "sp-1", shiftName: "General Shift", hours: 8, mode: "OFFICE", isPoya: true },
      { date: "2026-10-03", dayName: "Fri", isOffDay: false, shiftPatternId: "sp-1", shiftName: "General Shift", hours: 8, mode: "REMOTE" },
      { date: "2026-10-04", dayName: "Sat", isOffDay: true, shiftPatternId: null, shiftName: "Weekly Off", hours: 0, mode: "OFFICE" },
      { date: "2026-10-05", dayName: "Sun", isOffDay: true, shiftPatternId: null, shiftName: "Weekly Off", hours: 0, mode: "OFFICE" },
    ],
  },
  {
    id: "emp-3",
    empNo: "EMP-003",
    fullName: "Ruwan Silva",
    designation: "Shift Supervisor",
    department: "Production Line B",
    days: [
      { date: "2026-09-29", dayName: "Mon", isOffDay: false, shiftPatternId: "sp-4", shiftName: "Night Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-09-30", dayName: "Tue", isOffDay: false, shiftPatternId: "sp-4", shiftName: "Night Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-10-01", dayName: "Wed", isOffDay: false, shiftPatternId: "sp-4", shiftName: "Night Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-10-02", dayName: "Thu", isOffDay: false, shiftPatternId: "sp-4", shiftName: "Night Shift", hours: 8, mode: "OFFICE", isPoya: true },
      { date: "2026-10-03", dayName: "Fri", isOffDay: false, shiftPatternId: "sp-4", shiftName: "Night Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-10-04", dayName: "Sat", isOffDay: false, shiftPatternId: "sp-4", shiftName: "Night (Overtime)", hours: 14, mode: "OFFICE" }, // intentional OT cap breach
      { date: "2026-10-05", dayName: "Sun", isOffDay: false, shiftPatternId: "sp-1", shiftName: "General Shift", hours: 8, mode: "OFFICE" }, // intentional no rest day
    ],
  },
  {
    id: "emp-4",
    empNo: "EMP-004",
    fullName: "Chamari Atapattu",
    designation: "Cutting Master",
    department: "Production Line A",
    days: buildInitialDays("sp-1", "sp-5"),
  },
  {
    id: "emp-5",
    empNo: "EMP-005",
    fullName: "Sandun Jayawardena",
    designation: "Maintenance Lead",
    department: "Engineering",
    days: [
      { date: "2026-09-29", dayName: "Mon", isOffDay: false, shiftPatternId: "sp-2", shiftName: "Morning Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-09-30", dayName: "Tue", isOffDay: false, shiftPatternId: "sp-2", shiftName: "Morning Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-10-01", dayName: "Wed", isOffDay: false, shiftPatternId: "sp-2", shiftName: "Morning Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-10-02", dayName: "Thu", isOffDay: false, shiftPatternId: "sp-2", shiftName: "Morning Shift", hours: 8, mode: "OFFICE", isPoya: true },
      { date: "2026-10-03", dayName: "Fri", isOffDay: false, shiftPatternId: "sp-2", shiftName: "Morning Shift", hours: 8, mode: "OFFICE" },
      { date: "2026-10-04", dayName: "Sat", isOffDay: false, shiftPatternId: "sp-5", shiftName: "Half Day", hours: 4.5, mode: "OFFICE" },
      { date: "2026-10-05", dayName: "Sun", isOffDay: true, shiftPatternId: null, shiftName: "Weekly Off", hours: 0, mode: "OFFICE" },
    ],
  },
];

export default function RosterPage() {
  const { toast } = useUI();

  // State
  const [shifts, setShifts] = useState<ShiftPattern[]>(INITIAL_SHIFTS);
  const [roster, setRoster] = useState<EmployeeRoster[]>(INITIAL_ROSTER);
  const [status, setStatus] = useState<"DRAFT" | "SUBMITTED" | "APPROVED" | "PUBLISHED">("DRAFT");
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit Cell Modal
  const [editingCell, setEditingCell] = useState<{
    empId: string;
    empName: string;
    dayIndex: number;
    dayLabel: string;
    assignment: DayAssignment;
  } | null>(null);
  const [cellShiftId, setCellShiftId] = useState<string>("sp-1");
  const [cellIsOff, setCellIsOff] = useState<boolean>(false);
  const [cellMode, setCellMode] = useState<"OFFICE" | "REMOTE" | "SPLIT">("OFFICE");

  // Generate Week Roster Modal
  const [isGenModalOpen, setIsGenModalOpen] = useState<boolean>(false);
  const [genDept, setGenDept] = useState<string>("ALL");
  const [genShiftId, setGenShiftId] = useState<string>("sp-1");
  const [genOffDay, setGenOffDay] = useState<number>(6); // Sunday

  // Create Shift Modal
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [newShiftName, setNewShiftName] = useState<string>("");
  const [newShiftStart, setNewShiftStart] = useState<string>("08:00");
  const [newShiftDuration, setNewShiftDuration] = useState<number>(9);
  const [newShiftMeal, setNewShiftMeal] = useState<number>(60);
  const [newShiftMode, setNewShiftMode] = useState<"OFFICE" | "REMOTE" | "SPLIT">("OFFICE");

  // Add Employee Modal
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState<boolean>(false);
  const [newEmpName, setNewEmpName] = useState<string>("");
  const [newEmpNo, setNewEmpNo] = useState<string>("");
  const [newEmpRole, setNewEmpRole] = useState<string>("");
  const [newEmpDept, setNewEmpDept] = useState<string>("Production Line A");
  const [newEmpShiftId, setNewEmpShiftId] = useState<string>("sp-1");

  // Departments list
  const departments = useMemo(() => {
    return Array.from(new Set(roster.map((r) => r.department)));
  }, [roster]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return roster.filter((r) => {
      const matchDept = deptFilter === "ALL" || r.department === deptFilter;
      const matchQuery =
        !searchQuery ||
        r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.empNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.designation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchQuery;
    });
  }, [roster, deptFilter, searchQuery]);

  // Statutory Calculations
  const stats = useMemo(() => {
    let totalRostered = 0;
    let totalPlannedOt = 0;
    let blockingViolations = 0;
    let warnings = 0;

    roster.forEach((emp) => {
      const totalHours = emp.days.reduce((acc, d) => acc + (d.isOffDay ? 0 : d.hours), 0);
      const regularHours = 45; // standard statutory normal week
      const otHours = Math.max(0, totalHours - regularHours);
      totalRostered += totalHours;
      totalPlannedOt += otHours;

      // 12-hour OT weekly cap rule
      if (otHours > 12) {
        blockingViolations++;
      }

      // 1 rest day rule (at least one off-day in 7 days)
      const offDaysCount = emp.days.filter((d) => d.isOffDay).length;
      if (offDaysCount === 0) {
        warnings++;
      }
    });

    const estOtCost = totalPlannedOt * 850 * 1.5;

    return {
      totalEmployees: roster.length,
      totalRostered,
      totalPlannedOt,
      estOtCost,
      blockingViolations,
      warnings,
    };
  }, [roster]);

  // Cell Click Handler
  const handleOpenCell = (emp: EmployeeRoster, dayIdx: number) => {
    const d = emp.days[dayIdx];
    setEditingCell({
      empId: emp.id,
      empName: emp.fullName,
      dayIndex: dayIdx,
      dayLabel: DAYS_HEADER[dayIdx].label,
      assignment: d,
    });
    setCellShiftId(d.shiftPatternId || "sp-1");
    setCellIsOff(d.isOffDay);
    setCellMode(d.mode);
  };

  // Save Cell
  const handleSaveCell = () => {
    if (!editingCell) return;
    const pat = shifts.find((s) => s.id === cellShiftId) || shifts[0];

    setRoster((prev) =>
      prev.map((emp) => {
        if (emp.id !== editingCell.empId) return emp;
        const newDays = [...emp.days];
        newDays[editingCell.dayIndex] = {
          ...newDays[editingCell.dayIndex],
          isOffDay: cellIsOff,
          shiftPatternId: cellIsOff ? null : pat.id,
          shiftName: cellIsOff ? "Weekly Off" : pat.name.split(" (")[0],
          hours: cellIsOff ? 0 : pat.durationHours - pat.mealMinutes / 60,
          mode: cellMode,
        };
        return { ...emp, days: newDays };
      }),
    );

    toast(`Shift saved for ${editingCell.empName}`);
    setEditingCell(null);
  };

  // One-click statutory auto-trim OT fix
  const handleTrimOt = (empId: string, empName: string) => {
    setRoster((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const newDays = [...emp.days];
        // Trim Saturday (index 5) to 4 hours half day
        newDays[5] = {
          ...newDays[5],
          hours: 4.5,
          shiftName: "Half Day (Trimmed)",
          shiftPatternId: "sp-5",
        };
        return { ...emp, days: newDays };
      }),
    );
    toast(`Overtime hours trimmed for ${empName}. Now within Sri Lanka 12h statutory cap.`);
  };

  // One-click statutory weekly rest day fix
  const handleSetSundayOff = (empId: string, empName: string) => {
    setRoster((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const newDays = [...emp.days];
        // Set Sunday (index 6) to rest day
        newDays[6] = {
          ...newDays[6],
          isOffDay: true,
          hours: 0,
          shiftName: "Weekly Rest Day",
          shiftPatternId: null,
        };
        return { ...emp, days: newDays };
      }),
    );
    toast(`Mandatory weekly rest day assigned to ${empName}.`);
  };

  // Generate Week Roster
  const handleGenerateRoster = () => {
    const pat = shifts.find((s) => s.id === genShiftId) || shifts[0];
    const netHours = pat.durationHours - pat.mealMinutes / 60;

    setRoster((prev) =>
      prev.map((emp) => {
        if (genDept !== "ALL" && emp.department !== genDept) return emp;

        const newDays = emp.days.map((d, idx) => {
          const isOff = idx === genOffDay;
          return {
            ...d,
            isOffDay: isOff,
            shiftPatternId: isOff ? null : pat.id,
            shiftName: isOff ? "Weekly Off" : pat.name.split(" (")[0],
            hours: isOff ? 0 : netHours,
            mode: pat.defaultMode,
          };
        });
        return { ...emp, days: newDays };
      }),
    );

    toast(`Roster schedule regenerated for ${genDept === "ALL" ? "all departments" : genDept}!`);
    setIsGenModalOpen(false);
  };

  // Create Shift Pattern
  const handleCreateShift = () => {
    if (!newShiftName.trim()) {
      toast("Please enter a shift name.");
      return;
    }
    const newId = `sp-${Date.now()}`;
    const newPat: ShiftPattern = {
      id: newId,
      name: `${newShiftName.trim()} (${newShiftStart} – ${newShiftDuration}h)`,
      startTime: newShiftStart,
      durationHours: Number(newShiftDuration),
      mealMinutes: Number(newShiftMeal),
      defaultMode: newShiftMode,
    };
    setShifts((prev) => [...prev, newPat]);
    toast(`New shift "${newShiftName}" created!`);
    setIsShiftModalOpen(false);
    setNewShiftName("");
  };

  // Add Employee to Roster
  const handleAddEmployee = () => {
    if (!newEmpName.trim()) {
      toast("Please enter employee name.");
      return;
    }
    const empId = `emp-${Date.now()}`;
    const pat = shifts.find((s) => s.id === newEmpShiftId) || shifts[0];
    const netHours = pat.durationHours - pat.mealMinutes / 60;

    const newDays: DayAssignment[] = DAYS_HEADER.map((h, idx) => {
      const isOff = idx === 6; // Sunday off
      return {
        date: `2026-10-0${idx + 1}`,
        dayName: h.label.split(" ")[0],
        isOffDay: isOff,
        shiftPatternId: isOff ? null : pat.id,
        shiftName: isOff ? "Weekly Off" : pat.name.split(" (")[0],
        hours: isOff ? 0 : netHours,
        mode: pat.defaultMode,
        isPoya: h.isPoya,
      };
    });

    const newEmp: EmployeeRoster = {
      id: empId,
      empNo: newEmpNo.trim() || `EMP-00${roster.length + 1}`,
      fullName: newEmpName.trim(),
      designation: newEmpRole.trim() || "Operations Associate",
      department: newEmpDept,
      days: newDays,
    };

    setRoster((prev) => [...prev, newEmp]);
    toast(`${newEmp.fullName} added to the current week's roster!`);
    setIsAddEmpModalOpen(false);
    setNewEmpName("");
    setNewEmpNo("");
    setNewEmpRole("");
  };

  return (
    <div>
      {/* Top Header & Action Bar */}
      <div className="ph" style={{ flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ margin: 0 }}>Roster &amp; Shift Planner</h1>
            <span className={`chip ${status === "PUBLISHED" ? "ok" : status === "SUBMITTED" ? "i" : "w"}`}>
              {status}
            </span>
          </div>
          <p>
            Week of 29 September – 05 October 2026 · Real-time Sri Lanka Shop &amp; Office statutory compliance checks.
          </p>
        </div>

        <div className="acts" style={{ flexWrap: "wrap", gap: "8px" }}>
          {/* Week Navigation */}
          <div style={{ display: "inline-flex", gap: "4px", marginRight: "4px" }}>
            <button
              type="button"
              className="btn sm"
              onClick={() => {
                setWeekOffset((w) => w - 1);
                toast("Showing previous week roster");
              }}
              title="Previous week"
            >
              ◀ Prev Week
            </button>
            <button
              type="button"
              className={`btn sm ${weekOffset === 0 ? "sec" : ""}`}
              onClick={() => {
                setWeekOffset(0);
                toast("Reset to current week");
              }}
              title="Current week"
            >
              This Week
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => {
                setWeekOffset((w) => w + 1);
                toast("Showing next week roster");
              }}
              title="Next week"
            >
              Next Week ▶
            </button>
          </div>

          <button
            type="button"
            className="btn pri"
            onClick={() => setIsGenModalOpen(true)}
            title="Auto-generate or batch create weekly roster"
          >
            ✨ Generate Week Roster
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => setIsShiftModalOpen(true)}
            title="Define a new shift pattern"
          >
            + New Shift
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => toast("Roster schedule copied from previous week's pattern.")}
          >
            Copy Last Week
          </button>

          {status === "DRAFT" && (
            <button
              type="button"
              className="btn pri"
              onClick={() => {
                if (stats.blockingViolations > 0) {
                  toast(`Cannot submit: ${stats.blockingViolations} statutory overtime violation(s) must be resolved first.`);
                } else {
                  setStatus("SUBMITTED");
                  toast("Roster submitted to HR for formal sign-off.");
                }
              }}
            >
              Send to HR
            </button>
          )}

          {(status === "SUBMITTED" || status === "APPROVED" || status === "DRAFT") && (
            <button
              type="button"
              className="btn pri"
              style={{ background: "var(--ok)", borderColor: "var(--ok)" }}
              onClick={() => {
                if (stats.blockingViolations > 0) {
                  toast(`Cannot publish: Please clear the ${stats.blockingViolations} statutory violation(s) first.`);
                } else {
                  setStatus("PUBLISHED");
                  toast("Roster published! Shift notifications pushed to employee mobile apps.");
                }
              }}
            >
              Approve &amp; Publish
            </button>
          )}
        </div>
      </div>

      {/* Approval Status Pipeline */}
      <div className="appr">
        <div className={`appr-s ${status !== "DRAFT" ? "dn" : "now"}`}>
          <span>1. Drafted</span>
          <b>{roster.length} team members</b>
          <span className="who">Production / Line Managers</span>
        </div>
        <div className={`appr-s ${stats.blockingViolations === 0 ? "dn" : "now"}`}>
          <span>2. Validating</span>
          <b>
            {stats.blockingViolations === 0 && stats.warnings === 0
              ? "All rules cleared ✓"
              : `${stats.blockingViolations} blocking · ${stats.warnings} warning`}
          </b>
          <span className="who">Shop &amp; Office Act statutory checks</span>
        </div>
        <div className={`appr-s ${status === "APPROVED" || status === "PUBLISHED" ? "dn" : status === "SUBMITTED" ? "now" : ""}`}>
          <span>3. HR approval</span>
          <b>{status === "PUBLISHED" || status === "APPROVED" ? "Approved ✓" : status === "SUBMITTED" ? "Under Review" : "Draft"}</b>
          <span className="who">Dinuka R. · HR Manager</span>
        </div>
        <div className={`appr-s ${status === "PUBLISHED" ? "dn" : ""}`}>
          <span>4. Published</span>
          <b>{status === "PUBLISHED" ? "Live on Mobile Apps" : "Pending"}</b>
          <span className="who">SMS &amp; Push Alerts to Staff</span>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="stats">
        <div className="stat">
          <span>Normal working day</span>
          <b>9 h</b>
          <small>8 h paid + 1 h meal interval</small>
        </div>
        <div className="stat i">
          <span>Rostered hours</span>
          <b>{stats.totalRostered} h</b>
          <small>Across {stats.totalEmployees} employees</small>
        </div>
        <div className="stat w">
          <span>Planned overtime</span>
          <b>{stats.totalPlannedOt} h</b>
          <small>Rs {stats.estOtCost.toLocaleString()} at 1.5× statutory rate</small>
        </div>
        <div className={`stat ${stats.blockingViolations > 0 ? "b" : ""}`}>
          <span>Over 12h weekly cap</span>
          <b>{stats.blockingViolations}</b>
          <small>{stats.blockingViolations === 0 ? "100% Compliant (under 12h)" : "Statutory breach detected"}</small>
        </div>
      </div>

      {/* Statutory Validator Card (Flags legal violations) */}
      {(stats.blockingViolations > 0 || stats.warnings > 0) && (
        <div className="card" style={{ marginBottom: "18px" }}>
          <div className="card-h">
            <h2>Statutory Validator</h2>
            {stats.blockingViolations > 0 && <span className="chip b">{stats.blockingViolations} blocking</span>}
            {stats.warnings > 0 && <span className="chip w">{stats.warnings} warning</span>}
            <span className="sp" />
            <span className="chip">Shop &amp; Office Employees Act (Sri Lanka)</span>
          </div>

          {roster
            .filter((emp) => {
              const tot = emp.days.reduce((acc, d) => acc + (d.isOffDay ? 0 : d.hours), 0);
              const ot = Math.max(0, tot - 45);
              const offDays = emp.days.filter((d) => d.isOffDay).length;
              return ot > 12 || offDays === 0;
            })
            .map((emp) => {
              const tot = emp.days.reduce((acc, d) => acc + (d.isOffDay ? 0 : d.hours), 0);
              const ot = Math.max(0, tot - 45);
              const offDays = emp.days.filter((d) => d.isOffDay).length;

              return (
                <React.Fragment key={emp.id}>
                  {ot > 12 && (
                    <div className="list-row">
                      <span className="dot b" />
                      <div className="bd">
                        <b>{emp.fullName} ({emp.empNo}) · {ot}h weekly overtime planned</b>
                        <span>
                          The legal ceiling under Sri Lanka labor law is 12 hours overtime per week. Excess hours must be trimmed before roster submission.
                        </span>
                      </div>
                      <div className="rt">
                        <span className="chip law">12h weekly cap</span>
                        <button
                          type="button"
                          className="btn sm pri"
                          onClick={() => handleTrimOt(emp.id, emp.fullName)}
                          title="Reduce Saturday shift to half day"
                        >
                          Trim Saturday OT
                        </button>
                      </div>
                    </div>
                  )}

                  {offDays === 0 && (
                    <div className="list-row">
                      <span className="dot w" />
                      <div className="bd">
                        <b>{emp.fullName} ({emp.empNo}) · No weekly rest day scheduled</b>
                        <span>
                          Under the Shop &amp; Office Act, every employee is legally entitled to at least 1 full day of rest in every 7 days.
                        </span>
                      </div>
                      <div className="rt">
                        <span className="chip">Weekly rest rule</span>
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => handleSetSundayOff(emp.id, emp.fullName)}
                          title="Assign Sunday as mandatory rest day"
                        >
                          Set Sunday Off
                        </button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
        </div>
      )}

      {/* Filter and Legend Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink-2)" }}>Department:</label>
            <select
              className="in"
              style={{ width: "auto", padding: "4px 10px", fontSize: "12px" }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments ({roster.length} staff)</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="text"
              className="in"
              placeholder="Search staff name / ID..."
              style={{ padding: "4px 10px", fontSize: "12px", width: "180px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span className="chip i">🏢 Office Shift</span>
          <span className="chip ok">🏡 Remote</span>
          <span className="chip">🌴 Weekly Off</span>
          <span className="chip w">🌕 Poya Holiday</span>
          <span style={{ fontSize: "11px", color: "var(--ink-3)", marginLeft: "4px" }}>💡 Click any slot to edit</span>
        </div>
      </div>

      {/* Roster Grid Table Card */}
      <div className="card">
        <div className="card-h">
          <h2>Team Roster Schedule ({filteredRoster.length} staff)</h2>
          <span className="sp" />
          <button
            type="button"
            className="btn sm sec"
            onClick={() => setIsAddEmpModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            + Add Employee to Roster
          </button>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: "170px" }}>Employee</th>
                {DAYS_HEADER.map((d) => (
                  <th key={d.key} style={{ minWidth: "110px", textAlign: "center" }}>
                    {d.label}
                    {d.isPoya && (
                      <div style={{ fontSize: "10px", color: "var(--warn)", fontWeight: 700 }}>Poya Gazetted</div>
                    )}
                  </th>
                ))}
                <th className="r" style={{ minWidth: "90px" }}>Weekly Total</th>
                <th className="r" style={{ minWidth: "80px" }}>OT Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.map((emp) => {
                const totalHours = emp.days.reduce((acc, d) => acc + (d.isOffDay ? 0 : d.hours), 0);
                const otHours = Math.max(0, totalHours - 45);
                const isOverCap = otHours > 12;

                return (
                  <tr key={emp.id}>
                    <td>
                      <b style={{ color: "var(--ink)", display: "block" }}>{emp.fullName}</b>
                      <div style={{ fontSize: "11px", color: "var(--ink-2)" }}>
                        <code>{emp.empNo}</code> · {emp.designation}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--ink-3)" }}>{emp.department}</div>
                    </td>

                    {emp.days.map((d, idx) => {
                      const isOff = d.isOffDay;
                      const isOtSlot = !isOff && d.hours > 8;

                      return (
                        <td
                          key={d.date}
                          style={{
                            textAlign: "center",
                            cursor: "pointer",
                            background: isOff
                              ? "rgba(100, 116, 139, 0.05)"
                              : d.isPoya
                              ? "rgba(234, 179, 8, 0.07)"
                              : undefined,
                            transition: "background 0.15s ease",
                          }}
                          onClick={() => handleOpenCell(emp, idx)}
                          title={`Click to edit shift for ${emp.fullName} on ${DAYS_HEADER[idx].label}`}
                        >
                          {isOff ? (
                            <span className="chip" style={{ fontSize: "11px", padding: "2px 6px" }}>
                              🌴 Off Day
                            </span>
                          ) : (
                            <div style={{ display: "inline-flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
                              <span
                                className={`chip ${isOtSlot ? "w" : d.mode === "REMOTE" ? "ok" : "i"}`}
                                style={{ fontSize: "11px", padding: "2px 7px", fontWeight: 600 }}
                              >
                                {d.shiftName}
                              </span>
                              <span style={{ fontSize: "10px", color: "var(--ink-2)" }}>
                                {d.hours} h {d.mode === "REMOTE" ? "· 🏡" : d.mode === "SPLIT" ? "· 🏢🏡" : ""}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="r">
                      <b style={{ color: "var(--ink)" }}>{totalHours} h</b>
                    </td>

                    <td className="r">
                      <span className={`chip ${isOverCap ? "b" : otHours > 0 ? "w" : ""}`} style={{ fontSize: "11px" }}>
                        {otHours > 0 ? `+${otHours} h` : "0 h"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Edit Shift Cell */}
      {editingCell && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Edit Shift Assignment</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--ink-2)" }}>
                  {editingCell.empName} · {editingCell.dayLabel}
                </p>
              </div>
              <button
                type="button"
                className="tbtn"
                onClick={() => setEditingCell(null)}
                style={{ fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                  Day Type
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className={`btn ${!cellIsOff ? "pri" : ""}`}
                    style={{ flex: 1 }}
                    onClick={() => setCellIsOff(false)}
                  >
                    🏢 Working Shift
                  </button>
                  <button
                    type="button"
                    className={`btn ${cellIsOff ? "pri" : ""}`}
                    style={{ flex: 1 }}
                    onClick={() => setCellIsOff(true)}
                  >
                    🌴 Weekly Rest Day (Off)
                  </button>
                </div>
              </div>

              {!cellIsOff && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                      Shift Pattern
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {shifts.map((sp) => (
                        <div
                          key={sp.id}
                          onClick={() => setCellShiftId(sp.id)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: `1.5px solid ${cellShiftId === sp.id ? "var(--blue)" : "var(--rule)"}`,
                            background: cellShiftId === sp.id ? "var(--info-bg)" : "var(--card)",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <b style={{ fontSize: "12.5px" }}>{sp.name}</b>
                            <div style={{ fontSize: "11px", color: "var(--ink-2)" }}>
                              Starts {sp.startTime} · {sp.durationHours}h ({sp.mealMinutes}m meal)
                            </div>
                          </div>
                          {cellShiftId === sp.id && <span style={{ color: "var(--blue)", fontWeight: 700 }}>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                      Work Mode
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      <button
                        type="button"
                        className={`btn ${cellMode === "OFFICE" ? "pri" : ""}`}
                        onClick={() => setCellMode("OFFICE")}
                      >
                        🏢 Office
                      </button>
                      <button
                        type="button"
                        className={`btn ${cellMode === "REMOTE" ? "pri" : ""}`}
                        onClick={() => setCellMode("REMOTE")}
                      >
                        🏡 Remote
                      </button>
                      <button
                        type="button"
                        className={`btn ${cellMode === "SPLIT" ? "pri" : ""}`}
                        onClick={() => setCellMode("SPLIT")}
                      >
                        🏢+🏡 Hybrid
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" className="btn" onClick={() => setEditingCell(null)}>
                  Cancel
                </button>
                <button type="button" className="btn pri" onClick={handleSaveCell}>
                  Save Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Generate Week Roster */}
      {isGenModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>✨ Generate Week Roster</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--ink-2)" }}>
                  Batch populate shifts across team members for this week
                </p>
              </div>
              <button
                type="button"
                className="tbtn"
                onClick={() => setIsGenModalOpen(false)}
                style={{ fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                  Department Scope
                </label>
                <select
                  className="in"
                  value={genDept}
                  onChange={(e) => setGenDept(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="ALL">All Departments ({roster.length} staff members)</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                  Default Shift Pattern
                </label>
                <select
                  className="in"
                  value={genShiftId}
                  onChange={(e) => setGenShiftId(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                  Mandatory Weekly Rest Day (Sri Lanka Labor Law)
                </label>
                <select
                  className="in"
                  value={genOffDay}
                  onChange={(e) => setGenOffDay(Number(e.target.value))}
                  style={{ width: "100%" }}
                >
                  <option value={6}>Sunday (Recommended - Statutory Rest Day)</option>
                  <option value={5}>Saturday</option>
                  <option value={4}>Friday</option>
                </select>
                <small style={{ color: "var(--ink-2)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                  Under the Shop &amp; Office Employees Act, at least 1 full rest day must be scheduled per week.
                </small>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" className="btn" onClick={() => setIsGenModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn pri" onClick={handleGenerateRoster}>
                  Generate Roster Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: New Shift Pattern */}
      {isShiftModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>+ Create New Shift Pattern</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--ink-2)" }}>
                  Define shift hours, meal interval, and default location
                </p>
              </div>
              <button
                type="button"
                className="tbtn"
                onClick={() => setIsShiftModalOpen(false)}
                style={{ fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                  Shift Name *
                </label>
                <input
                  type="text"
                  className="in"
                  placeholder="e.g. Early Morning Logistics (05:00 – 14:00)"
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="in"
                    value={newShiftStart}
                    onChange={(e) => setNewShiftStart(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Total Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    className="in"
                    value={newShiftDuration}
                    onChange={(e) => setNewShiftDuration(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Meal Interval (mins)
                  </label>
                  <input
                    type="number"
                    className="in"
                    value={newShiftMeal}
                    onChange={(e) => setNewShiftMeal(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Default Work Mode
                  </label>
                  <select
                    className="in"
                    value={newShiftMode}
                    onChange={(e) => setNewShiftMode(e.target.value as any)}
                    style={{ width: "100%" }}
                  >
                    <option value="OFFICE">🏢 Office</option>
                    <option value="REMOTE">🏡 Remote</option>
                    <option value="SPLIT">🏢+🏡 Hybrid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" className="btn" onClick={() => setIsShiftModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn pri" onClick={handleCreateShift}>
                  Save Shift Pattern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Employee to Roster */}
      {isAddEmpModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>+ Add Employee to Roster</h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--ink-2)" }}>
                  Assign staff member to the active week schedule
                </p>
              </div>
              <button
                type="button"
                className="tbtn"
                onClick={() => setIsAddEmpModalOpen(false)}
                style={{ fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="in"
                    placeholder="e.g. K. A. Nimal Jayasuriya"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Emp No
                  </label>
                  <input
                    type="text"
                    className="in"
                    placeholder="EMP-006"
                    value={newEmpNo}
                    onChange={(e) => setNewEmpNo(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    className="in"
                    placeholder="e.g. Quality Auditor"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                    Department
                  </label>
                  <select
                    className="in"
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                  Initial Assigned Shift
                </label>
                <select
                  className="in"
                  value={newEmpShiftId}
                  onChange={(e) => setNewEmpShiftId(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" className="btn" onClick={() => setIsAddEmpModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn pri" onClick={handleAddEmployee}>
                  Add to Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
