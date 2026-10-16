"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "../../app/employee-app.css";

// ── Types ──
type TabKey = "home" | "att" | "leave" | "pay" | "me";
type SubKey = "roster" | "expenses" | "docs" | "assets" | "moments" | "perf" | null;
type SheetKey = "leave" | "ot" | "face" | "remote" | null;
type LangKey = "en" | "si" | "ta";
type PunchState = "out" | "in" | "done";

interface ToastItem {
  id: number;
  text: string;
}

interface LeaveReqItem {
  id: string;
  day: string;
  month: string;
  title: string;
  sub: string;
  status: "Pending" | "Approved" | "Declined";
  statusCls: "w" | "ok" | "n";
}

interface DayDetail {
  status: string;
  inTime: string;
  outTime: string;
  ot: string;
  by: string;
}

const DETAIL_MAP: Record<string, DayDetail> = {
  future: { status: "Not worked yet", inTime: "—", outTime: "—", ot: "0", by: "—" },
  p: { status: "Present", inTime: "08:12 AM", outTime: "05:24 PM", ot: "1.0", by: "Fingerprint-01" },
  l: { status: "Late · after grace", inTime: "09:07 AM", outTime: "05:31 PM", ot: "0", by: "Fingerprint-01" },
  lv: { status: "Annual leave", inTime: "—", outTime: "—", ot: "0", by: "HR" },
  h: { status: "Binara Poya — holiday", inTime: "—", outTime: "—", ot: "0", by: "HR" },
  off: { status: "Weekly holiday", inTime: "—", outTime: "—", ot: "0", by: "HR" },
};

const DAYS_CAL: Record<number, string> = {
  1: "lv", 2: "p", 3: "p", 4: "p", 5: "off", 6: "off", 7: "p", 8: "p", 9: "l", 10: "p", 11: "p",
  12: "lv", 13: "off", 14: "p", 15: "p", 16: "p", 17: "p", 18: "p", 19: "off", 20: "off",
  21: "p", 22: "p", 23: "p", 24: "p", 25: "h", 26: "off", 27: "off",
};

const TRANSLATIONS: Record<LangKey, Record<string, string>> = {
  en: {
    "greet.m": "Good morning,",
    "greet.a": "Good afternoon,",
    "greet.e": "Good evening,",
    "punch.in": "Mark in",
    "punch.out": "Mark out",
    "punch.done": "Day complete",
    "punch.s1": "Tap when you reach the branch",
    "tab.home": "Home",
    "tab.att": "Attendance",
    "tab.leave": "Leave",
    "tab.pay": "Pay",
    "tab.me": "Me",
    shift: "General shift · 8:30 AM – 5:30 PM",
  },
  si: {
    "greet.m": "සුබ උදෑසනක්,",
    "greet.a": "සුබ දහවලක්,",
    "greet.e": "සුබ සැන්දෑවක්,",
    "punch.in": "පැමිණීම සටහන්",
    "punch.out": "පිටවීම සටහන්",
    "punch.done": "දිනය අවසන්",
    "punch.s1": "ශාඛාවට පැමිණි විට ඔබන්න",
    "tab.home": "මුල",
    "tab.att": "පැමිණීම",
    "tab.leave": "නිවාඩු",
    "tab.pay": "වැටුප",
    "tab.me": "මම",
    shift: "සාමාන්‍ය මුරය · පෙ.ව. 8.30 – ප.ව. 5.30",
  },
  ta: {
    "greet.m": "காலை வணக்கம்,",
    "greet.a": "மதிய வணக்கம்,",
    "greet.e": "மாலை வணக்கம்,",
    "punch.in": "வருகை பதிவு",
    "punch.out": "வெளியேறு பதிவு",
    "punch.done": "நாள் முடிந்தது",
    "punch.s1": "கிளைக்கு வந்ததும் அழுத்தவும்",
    "tab.home": "முகப்பு",
    "tab.att": "வருகை",
    "tab.leave": "விடுமுறை",
    "tab.pay": "ஊதியம்",
    "tab.me": "நான்",
    shift: "பொது ஷிப்ட் · காலை 8.30 – மாலை 5.30",
  },
};

const WEEK_DAYS = [
  { day: "Mon", code: "ok" },
  { day: "Tue", code: "ok" },
  { day: "Wed", code: "late" },
  { day: "Thu", code: "ok" },
  { day: "Fri", code: "today" },
  { day: "Sat", code: "off" },
  { day: "Sun", code: "off" },
];

export function EmployeeApp() {
  // ── States ──
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [activeSub, setActiveSub] = useState<SubKey>(null);
  const [activeSheet, setActiveSheet] = useState<SheetKey>(null);
  const [lang, setLang] = useState<LangKey>("en");

  // Punch state
  const [punchState, setPunchState] = useState<PunchState>("out");
  const [inMin, setInMin] = useState<number>(0);
  const [outMin, setOutMin] = useState<number>(0);
  const [isGeofenceOut, setIsGeofenceOut] = useState<boolean>(false);
  const [punchMode, setPunchMode] = useState<"Office" | "Remote">("Office");
  const [faceCheckOn, setFaceCheckOn] = useState<boolean>(true);
  const [shareBirthdayOn, setShareBirthdayOn] = useState<boolean>(true);

  // Calendar
  const [selectedDay, setSelectedDay] = useState<number>(22);
  const [selectedDayKey, setSelectedDayKey] = useState<string>("p");

  // Overtime Form
  const [otReason, setOtReason] = useState<string>("");

  // Leave Form
  const [leaveType, setLeaveType] = useState<string>("Annual — 8.5 days left");
  const [leaveFrom, setLeaveFrom] = useState<string>("2026-09-28");
  const [leaveTo, setLeaveTo] = useState<string>("2026-09-28");
  const [leaveReason, setLeaveReason] = useState<string>("");

  // Leave Requests List
  const [leaveRequests, setLeaveRequests] = useState<LeaveReqItem[]>([
    { id: "1", day: "25", month: "Sep", title: "Casual leave · 1 day", sub: "Family matter · applied 18 Sep", status: "Pending", statusCls: "w" },
    { id: "2", day: "12", month: "Sep", title: "Annual leave · 2 days", sub: "Approved by D. Rajapaksha", status: "Approved", statusCls: "ok" },
    { id: "3", day: "03", month: "Aug", title: "Medical · 1 day", sub: "Certificate uploaded", status: "Approved", statusCls: "ok" },
    { id: "4", day: "21", month: "Jul", title: "Annual leave · 3 days", sub: "Line closed for stock count", status: "Declined", statusCls: "n" },
  ]);

  // Expenses subscreen
  const [receiptAttached, setReceiptAttached] = useState<boolean>(false);
  const [expenseClaims, setExpenseClaims] = useState([
    { id: "ex-1", day: "22", month: "Sep", title: "Travel · Rs 8,400", sub: "Colombo to Kandy · receipt attached", pill: "Pending", pillCls: "w" },
    { id: "ex-2", day: "08", month: "Sep", title: "Meals · Rs 2,100", sub: "Paid with September salary", pill: "Reimbursed", pillCls: "ok" },
    { id: "ex-3", day: "27", month: "Aug", title: "Fuel · Rs 6,800", sub: "No receipt uploaded", pill: "Rejected", pillCls: "n" },
  ]);

  // Modals state
  const [faceScanState, setFaceScanState] = useState<"idle" | "busy" | "go">("idle");
  const [locScanState, setLocScanState] = useState<"idle" | "busy" | "got" | "no">("idle");

  // Payslip month
  const [payMonth, setPayMonth] = useState<string>("Sep");

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastSeq = useRef(0);

  const addToast = (msg: string) => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { id, text: msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2900);
  };

  // Colombo time helper
  const getSlNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
  const two = (n: number) => (n < 10 ? "0" + n : "" + n);
  const formatTime = (h: number, m: number) => {
    const ap = h >= 12 ? "PM" : "AM";
    return (h % 12 || 12) + ":" + two(m) + " " + ap;
  };

  // Init theme & storage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("shr.theme");
      if (savedTheme) {
        setTheme(savedTheme as "light" | "dark");
        document.documentElement.setAttribute("data-theme", savedTheme);
      }
      const savedPunch = localStorage.getItem("shr.punch");
      if (savedPunch) setPunchState(savedPunch as PunchState);
      const savedIn = localStorage.getItem("shr.in");
      if (savedIn) setInMin(Number(savedIn));
      const savedOut = localStorage.getItem("shr.out");
      if (savedOut) setOutMin(Number(savedOut));
      const savedFace = localStorage.getItem("shr.face");
      if (savedFace !== null) setFaceCheckOn(savedFace !== "0");
      const savedBd = localStorage.getItem("shr.bd");
      if (savedBd !== null) setShareBirthdayOn(savedBd !== "0");
    } catch {
      // storage unavailable
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("shr.theme", nextTheme);
    } catch {}
  };

  // Punch actions
  const IN_H = 8.5; // 8:30 AM
  const OUT_H = 17.5; // 5:30 PM
  const CIRCLE_LEN = 2 * Math.PI * 100; // ~628.3

  const getProg = () => {
    if (punchState === "out") return 0;
    if (punchState === "done") return 1;
    const nowD = getSlNow();
    const nowMin = nowD.getHours() * 60 + nowD.getMinutes();
    return Math.min(1, Math.max(0, (nowMin - IN_H * 60) / ((OUT_H - IN_H) * 60)));
  };

  const executePunchIn = (currentMode: "Office" | "Remote") => {
    const d = getSlNow();
    const now = d.getHours() * 60 + d.getMinutes();
    setPunchState("in");
    setInMin(now);
    setPunchMode(currentMode);
    try {
      localStorage.setItem("shr.punch", "in");
      localStorage.setItem("shr.in", String(now));
    } catch {}

    const isLate = now > IN_H * 60 + 15;
    if (currentMode === "Remote") {
      addToast(`Remote session started at ${formatTime(d.getHours(), d.getMinutes())} from Nugegoda.`);
    } else if (isLate) {
      addToast(`Marked in at ${formatTime(d.getHours(), d.getMinutes())} — after the 15 min grace.`);
    } else {
      addToast(`Marked in at ${formatTime(d.getHours(), d.getMinutes())}. Have a good shift.`);
    }
  };

  const handlePunchClick = () => {
    const d = getSlNow();
    const now = d.getHours() * 60 + d.getMinutes();

    if (punchState === "out") {
      if (isGeofenceOut) {
        setLocScanState("idle");
        setActiveSheet("remote");
        return;
      }
      if (faceCheckOn) {
        setFaceScanState("idle");
        setActiveSheet("face");
        return;
      }
      executePunchIn("Office");
    } else if (punchState === "in") {
      setPunchState("done");
      setOutMin(now);
      try {
        localStorage.setItem("shr.punch", "done");
        localStorage.setItem("shr.out", String(now));
      } catch {}
      const ot = Math.max(0, (now - OUT_H * 60) / 60);
      if (ot > 0.25) {
        addToast(`Marked out. ${ot.toFixed(1)} OT hours sent for approval.`);
      } else {
        addToast(`Marked out at ${formatTime(d.getHours(), d.getMinutes())}.`);
      }
    } else {
      // Done -> view attendance
      setActiveTab("att");
    }
  };

  // Face Scan Flow
  const startFaceScan = () => {
    setFaceScanState("busy");
    setTimeout(() => {
      setFaceScanState("go");
      setTimeout(() => {
        setActiveSheet(null);
        executePunchIn(punchMode);
      }, 600);
    }, 1300);
  };

  // Remote Geofence Scan Flow
  const startLocationScan = () => {
    setLocScanState("busy");
    setTimeout(() => {
      setLocScanState("got");
    }, 1400);
  };

  // Dynamic Greeting
  const hNow = getSlNow().getHours();
  const greetPrefixKey = hNow < 12 ? "greet.m" : hNow < 17 ? "greet.a" : "greet.e";
  const greetPrefix = TRANSLATIONS[lang][greetPrefixKey] || "Good morning,";

  // Punch Title & Subtitle
  let punchTitle = TRANSLATIONS[lang]["punch.in"];
  let punchSub = TRANSLATIONS[lang]["punch.s1"];
  const nowSl = getSlNow();
  const currentTotalMin = nowSl.getHours() * 60 + nowSl.getMinutes();
  const workedMins = inMin ? (punchState === "in" ? currentTotalMin - inMin : outMin - inMin) : 0;
  const workedText = inMin && workedMins > 0 ? `${Math.floor(workedMins / 60)}h ${two(workedMins % 60)}m` : "—";

  if (punchState === "in") {
    punchTitle = TRANSLATIONS[lang]["punch.out"];
    punchSub = `${punchMode} · in since ${formatTime(Math.floor(inMin / 60), inMin % 60)} · ${workedText}`;
  } else if (punchState === "done") {
    punchTitle = TRANSLATIONS[lang]["punch.done"];
    punchSub = "Sent to payroll · tap to see today";
  }

  const ringDash = `${(getProg() * CIRCLE_LEN).toFixed(1)} ${CIRCLE_LEN}`;

  // Calendar Day Click
  const onDayClick = (d: number, k: string) => {
    setSelectedDay(d);
    setSelectedDayKey(k);
  };

  const dayDetail = DETAIL_MAP[selectedDayKey] || DETAIL_MAP.off;
  const dayDateObj = new Date(2026, 8, selectedDay);
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayTitleStr = `${weekdayNames[dayDateObj.getDay()]} ${selectedDay} September`;

  // Submit Leave Sheet
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSheet(null);
    const newReq: LeaveReqItem = {
      id: String(Date.now()),
      day: leaveFrom.split("-")[2] || "28",
      month: "Sep",
      title: `${leaveType.split("—")[0].trim()} · 1 day`,
      sub: `${leaveReason || "Personal matter"} · applied today`,
      status: "Pending",
      statusCls: "w",
    };
    setLeaveRequests([newReq, ...leaveRequests]);
    addToast("Leave request sent to D. Rajapaksha.");
  };

  // Submit OT Sheet
  const handleOtSubmit = () => {
    if (otReason.trim().length < 10) return;
    setActiveSheet(null);
    setOtReason("");
    addToast("Sent to M. Gunathilaka. 1 h 12 m claimed.");
  };

  // Submit Expense Claim
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSub(null);
    setReceiptAttached(false);
    addToast("Claim submitted to your supervisor.");
  };

  return (
    <>
      {/* ── Mode Switch Bar (Allows switching to Admin Console) ── */}
      <div className="mode-switch-bar">
        <span>
          📱 <b>SmartHR Employee App</b>
          <em className="active-pill">Mobile Active</em>
        </span>
        <Link href="/admin" className="mode-switch-btn" title="Open HR Admin Console">
          <span>🖥️ Switch to Admin Console</span>
          <span style={{ fontSize: "14px" }}>→</span>
        </Link>
      </div>

      <div className="stage">
        {/* ── Desktop-Only Pitch Column ── */}
        <div className="pitch">
          <img
            src="/icon.svg"
            alt="SmartHR Logo"
            width={120}
            height={120}
            style={{ marginBottom: "22px" }}
          />
          <h1>The app your staff actually open</h1>
          <p>One tap to mark in at the gate. Leave balance and payslip in the same place, in the language they read.</p>
          <ul>
            <li>
              <b>GPS mark-in</b> — the button only works inside the branch fence
            </li>
            <li>
              <b>EPF and ETF</b> shown on every payslip, not buried in HR
            </li>
            <li>
              <b>Sinhala, Tamil, English</b> — switched from the profile screen
            </li>
            <li>
              <b>Works offline</b> — punches queue and sync when signal returns
            </li>
          </ul>
          <div className="pitch-actions">
            <Link href="/admin" className="pitch-link">
              <span>🖥️ Open Full HR Admin Console</span>
              <span>→</span>
            </Link>
            <div style={{ fontSize: "12px", color: "var(--ink-3)", marginTop: "4px" }}>
              Compliant with Sri Lanka Shop &amp; Office Employees Act
            </div>
          </div>
        </div>

        {/* ── ═══ Phone Device View ═══ ── */}
        <div className="phone">
          <div className="notch" aria-hidden="true"></div>
          <div className="screen">
            {/* Header */}
            <header className="hdr">
              <div className="hdr-row">
                <img
                  className="hdr-logo"
                  src="/icon.svg"
                  alt="SmartHR Logo"
                  width={30}
                  height={30}
                />
                <div className="hdr-t">
                  <b>SmartHR</b>
                  <span id="hdrSub">ABC Holdings · Colombo HQ</span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  id="themeBtn"
                  onClick={toggleTheme}
                  aria-label="Switch theme"
                  title="Toggle Light/Dark Theme"
                >
                  {theme === "dark" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => addToast("3 notifications — 1 leave approved, 2 roster changes.")}
                  aria-label="Notifications, 3 unread"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
                  </svg>
                  <span className="dot-badge">3</span>
                </button>
              </div>
            </header>

            {/* Scrollable Body */}
            <div className="body" id="body">
              {/* ════ HOME PANE ════ */}
              <section className={`pane ${activeTab === "home" ? "on" : ""}`} id="p-home" role="tabpanel" aria-label="Home">
                <div className="greet">
                  <h1 id="greetLine">
                    {greetPrefix}
                    <br />
                    <span>Kamal</span>
                  </h1>
                  <p id="greetSub">{TRANSLATIONS[lang]["shift"]}</p>
                </div>

                {/* THE PUNCH DIAL */}
                <div className="punch-wrap">
                  <div className="dial">
                    <svg viewBox="0 0 216 216" aria-hidden="true">
                      <defs>
                        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#E40675" />
                          <stop offset="45%" stopColor="#C810B0" />
                          <stop offset="100%" stopColor="#0B6FD4" />
                        </linearGradient>
                      </defs>
                      <circle className="bg-ring" cx="108" cy="108" r="100" />
                      <circle
                        className="fg-ring"
                        id="ring"
                        cx="108"
                        cy="108"
                        r="100"
                        strokeDasharray={ringDash}
                        data-empty={getProg() <= 0 ? "" : undefined}
                      />
                    </svg>
                    <button
                      type="button"
                      className={`punch ${punchState === "in" ? "is-in" : punchState === "done" ? "is-done" : ""}`}
                      id="punch"
                      onClick={handlePunchClick}
                    >
                      <span className="punch-ico" id="punchIco">
                        {punchState === "out" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                          </svg>
                        )}
                        {punchState === "in" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9" />
                          </svg>
                        )}
                        {punchState === "done" && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                            <path d="m5 13 4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <b id="punchT">{punchTitle}</b>
                      <span id="punchS">{punchSub}</span>
                    </button>
                  </div>

                  {/* Geofence Indicator (Click flips between inside and outside) */}
                  <div
                    className={`geo live ${isGeofenceOut ? "out" : ""}`}
                    id="geo"
                    onClick={() => {
                      const nextOut = !isGeofenceOut;
                      setIsGeofenceOut(nextOut);
                      addToast(
                        nextOut
                          ? "Away from branch. Marking in will start a remote session, which needs your location."
                          : "Back inside the fence at Colombo HQ."
                      );
                    }}
                    title="Click to toggle geofence simulation"
                  >
                    <i></i>
                    <span id="geoT">
                      {isGeofenceOut
                        ? "Outside the fence · 1.2 km from Colombo HQ"
                        : "Inside Colombo HQ · 38 m from gate"}
                    </span>
                  </div>
                </div>

                {/* Stamp Row */}
                <div className="stamp">
                  <div>
                    <span>In</span>
                    <b id="sIn">{inMin ? formatTime(Math.floor(inMin / 60), inMin % 60) : "—"}</b>
                  </div>
                  <div>
                    <span>Out</span>
                    <b id="sOut">{outMin ? formatTime(Math.floor(outMin / 60), outMin % 60) : "—"}</b>
                  </div>
                  <div>
                    <span>Worked</span>
                    <b id="sWork">{workedText}</b>
                  </div>
                </div>

                {/* This Month Metrics */}
                <div className="sec-t">This month</div>
                <div className="trio">
                  <div className="tile a">
                    <span>OT hours</span>
                    <b>18.5</b>
                  </div>
                  <div className="tile b">
                    <span>Late</span>
                    <b>2</b>
                  </div>
                  <div className="tile c">
                    <span>Leave left</span>
                    <b>11</b>
                  </div>
                </div>

                {/* This Week Strip */}
                <div className="card" style={{ marginTop: "14px" }}>
                  <div className="card-h">
                    <h2>This week</h2>
                    <button type="button" onClick={() => setActiveTab("att")}>
                      See month
                    </button>
                  </div>
                  <div className="card-b">
                    <div className="week" id="week">
                      {WEEK_DAYS.map((wd, i) => (
                        <div key={wd.day} className={`wd ${i === 4 ? "today" : ""}`}>
                          <em>{wd.day[0]}</em>
                          <i className={wd.code === "today" ? "ok" : wd.code}></i>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notice Note */}
                <div className="note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  </svg>
                  <div>
                    <b>Binara Poya — Friday 25 September</b>
                    Branch closed. Roster shows you back on Monday 28th.
                  </div>
                </div>

                {/* Celebration Card */}
                <div className="cel">
                  <span className="cel-av" aria-hidden="true">
                    NS
                  </span>
                  <div className="cel-b">
                    <b>It’s Nimal Silva’s birthday</b>
                    <span>Kandy branch · Production</span>
                  </div>
                  <button type="button" onClick={() => setActiveSub("moments")}>
                    Wish
                  </button>
                </div>

                {/* Quick Actions Grid */}
                <div className="sec-t">Quick actions</div>
                <div className="quick">
                  <button type="button" className="qa" onClick={() => setActiveSheet("leave")}>
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18" />
                      </svg>
                    </i>
                    <b>Apply for leave</b>
                    <span>11 days left this year</span>
                  </button>

                  <button type="button" className="qa" onClick={() => setActiveTab("pay")}>
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </i>
                    <b>September payslip</b>
                    <span>Rs 91,340 to your bank</span>
                  </button>

                  <button type="button" className="qa" onClick={() => setActiveSheet("ot")}>
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    </i>
                    <b>Claim overtime</b>
                    <span>1 h 12 m needs a reason</span>
                  </button>

                  <button type="button" className="qa" onClick={() => setActiveSub("roster")}>
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 6h18M3 12h18M3 18h12" />
                      </svg>
                    </i>
                    <b>Roster &amp; swaps</b>
                    <span>1 swap waiting on you</span>
                  </button>

                  <button type="button" className="qa" onClick={() => setActiveSub("expenses")}>
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 4h16v16H4z" />
                        <path d="M8 9h8M8 13h5" />
                      </svg>
                    </i>
                    <b>Claim an expense</b>
                    <span>Rs 8,400 awaiting approval</span>
                  </button>

                  <button type="button" className="qa" onClick={() => setActiveSub("perf")}>
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 19V5M4 19h16" />
                        <path d="m7 15 3-4 3 2 4-6" />
                      </svg>
                    </i>
                    <b>My performance</b>
                    <span>Q3 review ready to read</span>
                  </button>
                </div>
              </section>

              {/* ════ ATTENDANCE PANE ════ */}
              <section className={`pane ${activeTab === "att" ? "on" : ""}`} id="p-att" role="tabpanel" aria-label="Attendance">
                <div className="cal-top">
                  <b>September 2026</b>
                  <button
                    type="button"
                    className="cal-nav"
                    onClick={() => addToast("August 2026 loaded.")}
                    aria-label="Previous month"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="cal-nav"
                    onClick={() => addToast("October has not started yet.")}
                    aria-label="Next month"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>

                <div className="trio" style={{ marginBottom: "14px" }}>
                  <div className="tile c">
                    <span>Present</span>
                    <b>16</b>
                  </div>
                  <div className="tile b">
                    <span>Late</span>
                    <b>2</b>
                  </div>
                  <div className="tile a">
                    <span>OT hrs</span>
                    <b>18.5</b>
                  </div>
                </div>

                <div className="card">
                  <div className="card-b">
                    <div className="cal" id="cal">
                      {["M", "T", "W", "T", "F", "S", "S"].map((head, i) => (
                        <div key={i} className="cal-hd">
                          {head}
                        </div>
                      ))}
                      {/* September 2026 starts on Tuesday, 1 empty slot */}
                      <div></div>
                      {Array.from({ length: 30 }, (_, idx) => {
                        const d = idx + 1;
                        let k = DAYS_CAL[d] || "";
                        const future = d > 22;
                        if (future && k !== "h") {
                          k = k === "off" ? "off" : "";
                        }
                        const isSelected = d === selectedDay;
                        const isDisabled = future && k !== "h" && k !== "off";

                        return (
                          <button
                            key={d}
                            type="button"
                            className={`cd ${k} ${isSelected ? "sel" : ""}`}
                            disabled={isDisabled}
                            onClick={() => onDayClick(d, k || "future")}
                          >
                            {d}
                            <i></i>
                          </button>
                        );
                      })}
                    </div>

                    <div className="legend">
                      <span>
                        <i style={{ background: "var(--ok)" }}></i>Present
                      </span>
                      <span>
                        <i style={{ background: "var(--warn)" }}></i>Late
                      </span>
                      <span>
                        <i style={{ background: "var(--bad)" }}></i>Absent
                      </span>
                      <span>
                        <i style={{ background: "var(--blue)" }}></i>Leave
                      </span>
                      <span>
                        <i style={{ background: "var(--magenta)" }}></i>Holiday
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-h">
                    <h2 id="ddTitle">{dayTitleStr}</h2>
                  </div>
                  <div className="card-b day-detail" id="ddBody">
                    <div className="dd-row">
                      <span>Status</span>
                      <b>{dayDetail.status}</b>
                    </div>
                    <div className="dd-row">
                      <span>Marked in</span>
                      <b>{dayDetail.inTime}</b>
                    </div>
                    <div className="dd-row">
                      <span>Marked out</span>
                      <b>{dayDetail.outTime}</b>
                    </div>
                    <div className="dd-row">
                      <span>Overtime</span>
                      <b>{dayDetail.ot} hrs</b>
                    </div>
                    <div className="dd-row">
                      <span>Recorded by</span>
                      <b>{dayDetail.by}</b>
                    </div>
                  </div>
                </div>
              </section>

              {/* ════ LEAVE PANE ════ */}
              <section className={`pane ${activeTab === "leave" ? "on" : ""}`} id="p-leave" role="tabpanel" aria-label="Leave">
                <div className="sec-t" style={{ marginTop: "4px" }}>
                  Balance · 2026
                </div>
                <div className="bal">
                  <div className="bal-c">
                    <span>Annual</span>
                    <b>
                      8.5 <small style={{ fontSize: "12px", fontWeight: 500, color: "var(--ink-2)" }}>of 14</small>
                    </b>
                    <div className="meter">
                      <i style={{ width: "61%" }}></i>
                    </div>
                    <small>5.5 taken</small>
                  </div>

                  <div className="bal-c">
                    <span>Casual</span>
                    <b>
                      3 <small style={{ fontSize: "12px", fontWeight: 500, color: "var(--ink-2)" }}>of 7</small>
                    </b>
                    <div className="meter">
                      <i style={{ width: "43%", background: "var(--magenta)" }}></i>
                    </div>
                    <small>4 taken</small>
                  </div>

                  <div className="bal-c">
                    <span>Medical</span>
                    <b>
                      6 <small style={{ fontSize: "12px", fontWeight: 500, color: "var(--ink-2)" }}>of 7</small>
                    </b>
                    <div className="meter">
                      <i style={{ width: "86%", background: "var(--ok)" }}></i>
                    </div>
                    <small>Certificate needed over 2 days</small>
                  </div>

                  <div className="bal-c">
                    <span>No-pay taken</span>
                    <b>1</b>
                    <div className="meter">
                      <i style={{ width: "8%", background: "var(--bad)" }}></i>
                    </div>
                    <small>Rs 3,100 deducted in July</small>
                  </div>
                </div>

                <div className="note" style={{ background: "var(--card-2)", color: "var(--blue)", marginBottom: "14px" }}>
                  <span aria-hidden="true">◈</span>
                  <div>
                    <b>You joined in March 2022</b>
                    So your full 14 annual days apply. Anyone who joins after March gets less in their first year — 10, 7 or 4 days depending on the quarter.
                  </div>
                </div>

                <div className="sec-t" style={{ marginTop: 0 }}>
                  Maternity
                </div>
                <div className="card" style={{ marginBottom: "16px" }}>
                  <div className="card-b" style={{ paddingTop: "12px" }}>
                    <div className="pay-row">
                      <span>Entitlement, live birth</span>
                      <b>84 working days</b>
                    </div>
                    <div className="pay-row">
                      <span>Split</span>
                      <b>14 before · 70 after</b>
                    </div>
                    <div className="pay-row">
                      <span>Nursing intervals</span>
                      <b>2 paid, per 9-hour shift</b>
                    </div>
                    <div className="pay-row" style={{ borderBottom: 0 }}>
                      <span>Applies to</span>
                      <b>Every birth</b>
                    </div>
                    <p style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: "9px", lineHeight: 1.5 }}>
                      Working days, so weekends and Poya do not count against the 84. Apply through the form and HR confirms the end date against the holiday calendar.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn"
                  onClick={() => setActiveSheet("leave")}
                  style={{ marginBottom: "18px" }}
                >
                  Apply for leave
                </button>

                <div className="sec-t" style={{ marginTop: 0 }}>
                  My requests
                </div>
                <div className="card" id="reqList">
                  {leaveRequests.map((req) => (
                    <div key={req.id} className="req">
                      <div className="req-d">
                        <b>{req.day}</b>
                        <span>{req.month}</span>
                      </div>
                      <div className="req-b">
                        <b>{req.title}</b>
                        <span>{req.sub}</span>
                      </div>
                      <span className={`pill ${req.statusCls}`}>{req.status}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ════ PAY PANE ════ */}
              <section className={`pane ${activeTab === "pay" ? "on" : ""}`} id="p-pay" role="tabpanel" aria-label="Payslip">
                <div className="seg" role="group" aria-label="Month" style={{ marginBottom: "14px" }}>
                  {["Sep", "Aug", "Jul", "Earlier"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={payMonth === m}
                      onClick={() => {
                        setPayMonth(m);
                        if (m !== "Sep") addToast(`${m} payslip loaded.`);
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="pay-hero">
                  <span>Net pay · September 2026</span>
                  <b>Rs 91,340</b>
                  <small>Credited to BOC ••••4182 on 30 September</small>
                  <div className="pay-meta">
                    <div>
                      <span>Worked</span>
                      <b>21 days</b>
                    </div>
                    <div>
                      <span>OT</span>
                      <b>18.5 hrs</b>
                    </div>
                    <div>
                      <span>No-pay</span>
                      <b>0 days</b>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-h">
                    <h2>Earnings</h2>
                  </div>
                  <div className="card-b">
                    <div className="ln">
                      <span>Basic salary</span>
                      <b>Rs 85,000</b>
                    </div>
                    <div className="ln">
                      <span>Budgetary relief allowance</span>
                      <b>Rs 3,500</b>
                    </div>
                    <div className="ln">
                      <span>Attendance allowance</span>
                      <b>Rs 2,500</b>
                    </div>
                    <div className="ln">
                      <span>Overtime · 18.5 hrs at 1.5×</span>
                      <b>Rs 14,820</b>
                    </div>
                    <div className="ln-tot">
                      <span>Gross</span>
                      <span>Rs 105,820</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-h">
                    <h2>Deductions</h2>
                  </div>
                  <div className="card-b">
                    <div className="ln neg">
                      <span>EPF employee · 8%</span>
                      <b>−Rs 7,080</b>
                    </div>
                    <div className="ln neg">
                      <span>APIT withheld</span>
                      <b>−Rs 2,400</b>
                    </div>
                    <div className="ln neg">
                      <span>Salary advance · 2 of 4</span>
                      <b>−Rs 5,000</b>
                    </div>
                    <div className="ln-tot">
                      <span>Total</span>
                      <span>−Rs 14,480</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-h">
                    <h2>Paid by your employer</h2>
                  </div>
                  <div className="card-b">
                    <div className="ln">
                      <span>EPF employer · 12%</span>
                      <b>Rs 10,620</b>
                    </div>
                    <div className="ln">
                      <span>ETF · 3%</span>
                      <b>Rs 2,655</b>
                    </div>
                    <div className="ln">
                      <span>EPF balance to date</span>
                      <b>Rs 1,284,600</b>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-h">
                    <h2>Gratuity</h2>
                    <span
                      style={{
                        background: "var(--warn-bg)",
                        color: "var(--warn)",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "12px",
                      }}
                    >
                      Accruing
                    </span>
                  </div>
                  <div className="card-b">
                    <div className="ln">
                      <span>Service completed</span>
                      <b>4 years 6 months</b>
                    </div>
                    <div className="ln">
                      <span>Accrued so far</span>
                      <b>Rs 170,000</b>
                    </div>
                    <div className="ln">
                      <span>Payable from</span>
                      <b>12 March 2027</b>
                    </div>
                    <div className="due" style={{ marginTop: "12px" }}>
                      <span aria-hidden="true">⚖</span>
                      <div>
                        <b>You need five completed years</b>
                        At that point it becomes half a month&apos;s wage for every year, worked out on your last salary — not today&apos;s.
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-2"
                  onClick={() => addToast("Payslip PDF saved to your downloads.")}
                >
                  Download payslip PDF
                </button>
              </section>

              {/* ════ PROFILE (ME) PANE ════ */}
              <section className={`pane ${activeTab === "me" ? "on" : ""}`} id="p-me" role="tabpanel" aria-label="Profile">
                <div className="me">
                  <div className="me-av" aria-hidden="true">
                    KP
                  </div>
                  <div className="me-t">
                    <b>Kamal Perera</b>
                    <span>Machine Operator · Production</span>
                    <em>Confirmed · 4 years</em>
                  </div>
                </div>

                <div className="card">
                  <div className="row">
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 9h4M7 13h8" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Employee number</b>
                    </div>
                    <span className="row-v">EMP-001</span>
                  </div>

                  <div className="row">
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v10M9.5 9.5h5M9.5 14.5h5" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>EPF member number</b>
                    </div>
                    <span className="row-v">A/14023</span>
                  </div>

                  <div className="row">
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Salary account</b>
                    </div>
                    <span className="row-v">BOC ••••4182</span>
                  </div>

                  <div className="row">
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10Z" />
                        <circle cx="12" cy="11" r="2.5" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Home branch</b>
                    </div>
                    <span className="row-v">Colombo HQ</span>
                  </div>
                </div>

                <div className="sec-t">My records</div>
                <div className="card">
                  <button type="button" className="row" onClick={() => setActiveSub("docs")}>
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                        <path d="M14 3v5h5" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>My documents</b>
                      <span>7 on file · 1 expiring</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="row"
                    onClick={() =>
                      addToast("Registered remote address: 118/4 Old Kesbewa Road, Nugegoda. Ask HR to change it.")
                    }
                  >
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10Z" />
                        <circle cx="12" cy="11" r="2.6" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>My remote work address</b>
                      <span>Nugegoda · 2 km allowance</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <button type="button" className="row" onClick={() => setActiveSub("assets")}>
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="13" rx="2" />
                        <path d="M8 21h8" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>What I hold</b>
                      <span>3 company items</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <button type="button" className="row" onClick={() => setActiveSub("perf")}>
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 19V5M4 19h16" />
                        <path d="m7 15 3-4 3 2 4-6" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>My performance</b>
                      <span>Q3 2026 · rated 4 of 5</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>

                {/* Language Switcher */}
                <div className="sec-t">Language</div>
                <div className="seg" role="group" aria-label="Language">
                  <button
                    type="button"
                    aria-pressed={lang === "en"}
                    onClick={() => {
                      setLang("en");
                      addToast("Language set to English.");
                    }}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    aria-pressed={lang === "si"}
                    lang="si"
                    onClick={() => {
                      setLang("si");
                      addToast("භාෂාව සිංහල ලෙස සකසන ලදී.");
                    }}
                  >
                    සිංහල
                  </button>
                  <button
                    type="button"
                    aria-pressed={lang === "ta"}
                    lang="ta"
                    onClick={() => {
                      setLang("ta");
                      addToast("மொழி தமிழாக மாற்றப்பட்டது.");
                    }}
                  >
                    தமிழ்
                  </button>
                </div>

                <div className="sec-t">Settings</div>
                <div className="card">
                  <button
                    type="button"
                    className="row"
                    onClick={() => addToast("Reminder set for 8:15 AM on working days.")}
                  >
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Mark-in reminder</b>
                      <span>8:15 AM, working days</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="row"
                    onClick={() => {
                      const next = !faceCheckOn;
                      setFaceCheckOn(next);
                      try {
                        localStorage.setItem("shr.face", next ? "1" : "0");
                      } catch {}
                      addToast(
                        next
                          ? "Face check on. GPS alone proves the phone was there, not you."
                          : "Face check off. Mark-in will use GPS only."
                      );
                    }}
                  >
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
                        <circle cx="12" cy="12" r="3.2" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Face check at mark-in</b>
                      <span>{faceCheckOn ? "On · required inside the fence" : "Off · GPS only"}</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="row"
                    onClick={() => addToast("Face ID is on for this device.")}
                  >
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
                        <path d="M9 11v.5M15 11v.5M9.5 15a3.5 3.5 0 0 0 5 0" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Unlock with Face ID</b>
                      <span>On</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="row"
                    onClick={() => {
                      const next = !shareBirthdayOn;
                      setShareBirthdayOn(next);
                      try {
                        localStorage.setItem("shr.bd", next ? "1" : "0");
                      } catch {}
                      addToast(
                        next
                          ? "Your birthday will be shared with colleagues."
                          : "Your birthday is now private. HR still has it on file."
                      );
                    }}
                  >
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 21h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z" />
                        <path d="M12 9V6M9 6a1.5 1.5 0 1 1 3 0M15 6a1.5 1.5 0 1 0-3 0" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Share my birthday</b>
                      <span>{shareBirthdayOn ? "On · colleagues are notified on the day" : "Off · nobody is notified"}</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="row"
                    onClick={() => addToast("2 punches waiting to sync. They will upload on Wi-Fi.")}
                  >
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-8-5" />
                        <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 8 5" />
                        <path d="M20 4v4h-4M4 20v-4h4" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Offline punches</b>
                      <span>2 waiting to sync</span>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="row"
                    onClick={() => addToast("Signed out on this device.")}
                  >
                    <div className="row-i">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                    </div>
                    <div className="row-t">
                      <b>Sign out</b>
                    </div>
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>

                <p style={{ fontSize: "11.5px", color: "var(--ink-3)", margin: "16px 0 8px", lineHeight: 1.5 }}>
                  SmartHR by Lumi AI · v2.4.1
                  <br />
                  Leave entitlements follow the Shop &amp; Office Employees Act. Your company may give more.
                </p>
              </section>
            </div>

            {/* Bottom Tabs */}
            <nav className="tabs" role="tablist" aria-label="Sections">
              <button
                type="button"
                className="tab"
                role="tab"
                aria-selected={activeTab === "home"}
                onClick={() => {
                  setActiveSub(null);
                  setActiveTab("home");
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
                </svg>
                {TRANSLATIONS[lang]["tab.home"]}
              </button>

              <button
                type="button"
                className="tab"
                role="tab"
                aria-selected={activeTab === "att"}
                onClick={() => {
                  setActiveSub(null);
                  setActiveTab("att");
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 11h18" />
                </svg>
                {TRANSLATIONS[lang]["tab.att"]}
              </button>

              <button
                type="button"
                className="tab"
                role="tab"
                aria-selected={activeTab === "leave"}
                onClick={() => {
                  setActiveSub(null);
                  setActiveTab("leave");
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <path d="M12 3v18M5 8l7-5 7 5" />
                  <path d="M5 8v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                </svg>
                {TRANSLATIONS[lang]["tab.leave"]}
              </button>

              <button
                type="button"
                className="tab"
                role="tab"
                aria-selected={activeTab === "pay"}
                onClick={() => {
                  setActiveSub(null);
                  setActiveTab("pay");
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M6 9v6M18 9v6" />
                </svg>
                {TRANSLATIONS[lang]["tab.pay"]}
              </button>

              <button
                type="button"
                className="tab"
                role="tab"
                aria-selected={activeTab === "me"}
                onClick={() => {
                  setActiveSub(null);
                  setActiveTab("me");
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
                </svg>
                {TRANSLATIONS[lang]["tab.me"]}
              </button>
            </nav>

            {/* ════ SUB-SCREENS ════ */}
            <section className={`sub ${activeSub ? "on" : ""}`} id="sub" aria-label="Detail">
              <header className="sub-h">
                <button type="button" className="bk" onClick={() => setActiveSub(null)} aria-label="Back">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <h2 id="subT">
                  {activeSub === "roster" && "Roster & swaps"}
                  {activeSub === "expenses" && "Expense claims"}
                  {activeSub === "docs" && "My documents"}
                  {activeSub === "assets" && "What I hold"}
                  {activeSub === "moments" && "Team moments"}
                  {activeSub === "perf" && "My performance"}
                </h2>
              </header>
              <div className="sub-b" id="subB">
                {/* SUB: ROSTER */}
                {activeSub === "roster" && (
                  <div>
                    <div className="card" style={{ marginBottom: "14px" }}>
                      <div className="card-h">
                        <h2>Week of 28 September</h2>
                      </div>
                      <div className="card-b" style={{ paddingTop: "8px" }}>
                        <div className="ln">
                          <span>Mon 28 · General</span>
                          <b>8:30 – 5:30</b>
                        </div>
                        <div className="ln">
                          <span>Tue 29 · General</span>
                          <b>8:30 – 5:30</b>
                        </div>
                        <div className="ln">
                          <span>Wed 30 · Off</span>
                          <b>Weekly holiday</b>
                        </div>
                        <div className="ln">
                          <span>Thu 01 · General</span>
                          <b>8:30 – 5:30</b>
                        </div>
                        <div className="ln">
                          <span>Fri 02 · Poya</span>
                          <b>Branch closed</b>
                        </div>
                        <div className="ln">
                          <span>Sat 03 · Half day</span>
                          <b>8:30 – 1:00</b>
                        </div>
                        <div className="ln" style={{ borderBottom: 0 }}>
                          <span>Sun 04 · Off</span>
                          <b>Weekly holiday</b>
                        </div>
                      </div>
                    </div>

                    <div className="sec-t" style={{ marginTop: 0 }}>
                      Swap requests
                    </div>
                    <div className="swap">
                      <div className="swap-t">
                        <b>N. Bandara wants your Wednesday</b>
                        <span className="pill w">Waiting on you</span>
                      </div>
                      <div className="swap-w">
                        Your <b style={{ color: "var(--ink)" }}>Wed 30 · Off</b> <i>⇄</i> their <b style={{ color: "var(--ink)" }}>Wed 30 · Night</b>
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "11px" }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ margin: 0, flex: 1 }}
                          onClick={() => addToast("Swap accepted. Waiting for your supervisor.")}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn-2"
                          style={{ margin: 0, flex: 1 }}
                          onClick={() => addToast("Swap declined.")}
                        >
                          Decline
                        </button>
                      </div>
                    </div>

                    <div className="swap">
                      <div className="swap-t">
                        <b>Your request to M. Ishara</b>
                        <span className="pill ok">Approved</span>
                      </div>
                      <div className="swap-w">
                        Your <b style={{ color: "var(--ink)" }}>Sat 03 · Half day</b> <i>⇄</i> their <b style={{ color: "var(--ink)" }}>Sat 03 · Off</b>
                      </div>
                      <p style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: "8px" }}>
                        Approved by P. Jayasuriya · 26 Sep
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => addToast("Swap request sent. The other person has to accept first.")}
                    >
                      Ask someone to swap
                    </button>
                  </div>
                )}

                {/* SUB: EXPENSES */}
                {activeSub === "expenses" && (
                  <form onSubmit={handleExpenseSubmit}>
                    <div
                      className={`up ${receiptAttached ? "has" : ""}`}
                      onClick={() => setReceiptAttached(!receiptAttached)}
                      title="Click to toggle photo attachment"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                        <path d="M12 16V4M7 9l5-5 5 5" />
                        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                      </svg>
                      {receiptAttached ? (
                        <>
                          <b>Receipt attached</b>IMG_4471.jpg · 1.2 MB · tap to replace
                        </>
                      ) : (
                        <>
                          <b>Photograph the receipt</b>A claim without one cannot be reimbursed
                        </>
                      )}
                    </div>

                    <label className="f" htmlFor="ex-c">
                      Category
                    </label>
                    <select className="f-in" id="ex-c" defaultValue="Travel">
                      <option>Travel</option>
                      <option>Fuel</option>
                      <option>Meals</option>
                      <option>Training</option>
                      <option>Other</option>
                    </select>

                    <label className="f" htmlFor="ex-a">
                      Amount
                    </label>
                    <input className="f-in" id="ex-a" type="number" placeholder="0.00" inputMode="decimal" required />

                    <label className="f" htmlFor="ex-d">
                      Date
                    </label>
                    <input className="f-in" id="ex-d" type="date" defaultValue="2026-09-29" />

                    <label className="f" htmlFor="ex-n">
                      What it was for
                    </label>
                    <textarea className="f-in" id="ex-n" placeholder="Colombo to Kandy, client visit" required></textarea>

                    <button type="submit" className="btn">
                      Submit claim
                    </button>

                    <div className="sec-t">My claims</div>
                    <div className="card">
                      {expenseClaims.map((ex) => (
                        <div key={ex.id} className="req">
                          <div className="req-d">
                            <b>{ex.day}</b>
                            <span>{ex.month}</span>
                          </div>
                          <div className="req-b">
                            <b>{ex.title}</b>
                            <span>{ex.sub}</span>
                          </div>
                          <span className={`pill ${ex.pillCls}`}>{ex.pill}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: "12px", lineHeight: 1.5 }}>
                      Reimbursements are paid through your payslip as a separate line. They are not earnings, so no EPF, ETF or tax comes off them.
                    </p>
                  </form>
                )}

                {/* SUB: DOCS */}
                {activeSub === "docs" && (
                  <div>
                    <div className="note" style={{ background: "var(--warn-bg)", color: "var(--warn)", marginBottom: "14px" }}>
                      <span aria-hidden="true">⚑</span>
                      <div>
                        <b>Your forklift licence expires 22 October</b>
                        The renewal session on 22 Oct is already booked for you.
                      </div>
                    </div>

                    <div className="card">
                      <div className="drow">
                        <span className="di">▤</span>
                        <div className="db">
                          <b>Appointment letter</b>
                          <span>Signed 12 Mar 2022 · no expiry</span>
                        </div>
                        <button type="button" className="btn btn-sm" onClick={() => addToast("Opening appointment letter PDF...")}>
                          View
                        </button>
                      </div>

                      <div className="drow">
                        <span className="di">▤</span>
                        <div className="db">
                          <b>NIC copy</b>
                          <span>Uploaded 12 Mar 2022</span>
                        </div>
                        <button type="button" className="btn btn-sm" onClick={() => addToast("Opening NIC copy...")}>
                          View
                        </button>
                      </div>

                      <div className="drow">
                        <span className="di">◉</span>
                        <div className="db">
                          <b>Forklift licence</b>
                          <span>Expires 22 Oct 2026 · 23 days</span>
                        </div>
                        <span className="pill w">Expiring</span>
                      </div>

                      <div className="drow">
                        <span className="di">◉</span>
                        <div className="db">
                          <b>Safety induction certificate</b>
                          <span>Completed 04 Apr 2026</span>
                        </div>
                        <button type="button" className="btn btn-sm" onClick={() => addToast("Opening safety certificate...")}>
                          View
                        </button>
                      </div>

                      <div className="drow">
                        <span className="di">▤</span>
                        <div className="db">
                          <b>EPF Form A</b>
                          <span>Filed 18 Mar 2022 · member A/14023</span>
                        </div>
                        <button type="button" className="btn btn-sm" onClick={() => addToast("Opening EPF Form A...")}>
                          View
                        </button>
                      </div>

                      <div className="drow">
                        <span className="di">▤</span>
                        <div className="db">
                          <b>Promotion letter</b>
                          <span>Effective 01 Oct 2026 · Senior Operator</span>
                        </div>
                        <span className="pill ok">New</span>
                      </div>

                      <div className="drow">
                        <span className="di">▤</span>
                        <div className="db">
                          <b>Bank mandate</b>
                          <span>BOC ••••4182 · updated 09 Jan 2025</span>
                        </div>
                        <button type="button" className="btn btn-sm" onClick={() => addToast("Opening bank mandate...")}>
                          View
                        </button>
                      </div>
                    </div>

                    <button type="button" className="btn btn-2" onClick={() => addToast("Upload dialog opened.")}>
                      Upload a document
                    </button>
                  </div>
                )}

                {/* SUB: ASSETS */}
                {activeSub === "assets" && (
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--ink-2)", marginBottom: "14px" }}>
                      Company property issued to you. Anything not returned when you leave comes off your final settlement.
                    </p>
                    <div className="card">
                      <div className="drow">
                        <span className="di">▣</span>
                        <div className="db">
                          <b>Safety boots · size 42</b>
                          <span>Issued 02 Mar 2026 · Rs 8,400</span>
                        </div>
                      </div>
                      <div className="drow">
                        <span className="di">▣</span>
                        <div className="db">
                          <b>Uniform set · 2 pairs</b>
                          <span>Issued 12 Mar 2022 · Rs 6,200</span>
                        </div>
                      </div>
                      <div className="drow">
                        <span className="di">▣</span>
                        <div className="db">
                          <b>Locker key · B-114</b>
                          <span>Issued 12 Mar 2022</span>
                        </div>
                      </div>
                    </div>

                    <div className="card" style={{ marginTop: "14px" }}>
                      <div className="card-b">
                        <div className="ln">
                          <span>Items held</span>
                          <b>3</b>
                        </div>
                        <div className="ln" style={{ borderBottom: 0 }}>
                          <span>Book value</span>
                          <b>Rs 14,600</b>
                        </div>
                      </div>
                    </div>

                    <button type="button" className="btn btn-2" onClick={() => addToast("Return request sent to Admin.")}>
                      Report something lost or return an item
                    </button>
                  </div>
                )}

                {/* SUB: MOMENTS */}
                {activeSub === "moments" && (
                  <div>
                    <div className="sec-t" style={{ marginTop: 0 }}>
                      Today
                    </div>
                    <div className="card" style={{ marginBottom: "6px" }}>
                      <div className="mrow">
                        <span className="av bd">NS</span>
                        <div className="bd2">
                          <b>Nimal Silva</b>
                          <span>Birthday · Kandy branch</span>
                        </div>
                      </div>
                    </div>

                    <div className="quickwish">
                      <button type="button" onClick={() => addToast("Wish sent to Nimal Silva.")}>
                        🎉 Happy birthday!
                      </button>
                      <button type="button" onClick={() => addToast("Wish sent to Nimal Silva.")}>
                        සුභ උපන්දිනයක්!
                      </button>
                      <button type="button" onClick={() => addToast("Wish sent to Nimal Silva.")}>
                        🎂 Have a good one
                      </button>
                    </div>

                    <button type="button" className="btn btn-2" onClick={() => addToast("Your message was sent to Nimal Silva.")}>
                      Write something else
                    </button>

                    <div className="sec-t">This week</div>
                    <div className="card">
                      <div className="mrow">
                        <span className="av bd">FR</span>
                        <div className="bd2">
                          <b>Fathima Rizwan</b>
                          <span>Birthday · Friday 2 October</span>
                        </div>
                        <button type="button" className="wishbtn" onClick={() => addToast("Reminder set for Friday.")}>
                          Remind me
                        </button>
                      </div>
                      <div className="mrow">
                        <span className="av bd">CG</span>
                        <div className="bd2">
                          <b>Chamara Gunasekara</b>
                          <span>Birthday · Sunday 4 October</span>
                        </div>
                        <button type="button" className="wishbtn" onClick={() => addToast("Reminder set for Sunday.")}>
                          Remind me
                        </button>
                      </div>
                    </div>

                    <div className="sec-t">Work anniversaries</div>
                    <div className="card">
                      <div className="mrow">
                        <span className="av yr">RD</span>
                        <div className="bd2">
                          <b>Ruwan Dissanayake</b>
                          <span>9 years on 15 November</span>
                        </div>
                      </div>
                      <div className="mrow">
                        <span className="av yr">PJ</span>
                        <div className="bd2">
                          <b>Priyantha Jayasuriya</b>
                          <span>8 years on 4 January</span>
                        </div>
                      </div>
                      <div className="mrow">
                        <span className="av yr">KP</span>
                        <div className="bd2">
                          <b>You (Kamal Perera)</b>
                          <span>5 years on 12 March · gratuity starts</span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: "12px", lineHeight: 1.5 }}>
                      Only the day and month are shared, never the year. Anyone can turn their own birthday off in Settings and it disappears from this list for everybody.
                    </p>
                  </div>
                )}

                {/* SUB: PERF */}
                {activeSub === "perf" && (
                  <div>
                    <div className="pay-hero" style={{ marginBottom: "14px" }}>
                      <span>Q3 2026 review</span>
                      <b>4 / 5</b>
                      <small>Exceeds expectations · reviewed by M. Gunathilaka</small>
                      <div className="pay-meta">
                        <div>
                          <span>Attendance</span>
                          <b>97.2%</b>
                        </div>
                        <div>
                          <span>Late marks</span>
                          <b>2</b>
                        </div>
                        <div>
                          <span>OT hours</span>
                          <b>18.5</b>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-h">
                        <h2>How the figures were taken</h2>
                      </div>
                      <div className="card-b">
                        <div className="pf">
                          <div className="pf-t">
                            <span>Attendance rate</span>
                            <b>97.2%</b>
                          </div>
                          <div className="meter">
                            <i style={{ width: "97%" }}></i>
                          </div>
                          <small>Team average 92.4%</small>
                        </div>
                        <div className="pf">
                          <div className="pf-t">
                            <span>On time</span>
                            <b>2 late marks</b>
                          </div>
                          <div className="meter">
                            <i style={{ width: "88%" }}></i>
                          </div>
                          <small>Team average 4.1</small>
                        </div>
                        <div className="pf">
                          <div className="pf-t">
                            <span>Training completed</span>
                            <b>3 of 3</b>
                          </div>
                          <div className="meter">
                            <i style={{ width: "100%" }}></i>
                          </div>
                          <small>All required courses done</small>
                        </div>
                        <div className="pf">
                          <div className="pf-t">
                            <span>Unplanned absence</span>
                            <b>1 day</b>
                          </div>
                          <div className="meter">
                            <i style={{ width: "94%" }}></i>
                          </div>
                          <small>Team average 2.8 days</small>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-h">
                        <h2>Your manager wrote</h2>
                      </div>
                      <div className="card-b">
                        <p style={{ fontSize: "13.5px", lineHeight: 1.6 }}>
                          Steady on the line all quarter and picked up the new stitching rig faster than anyone else on B shift. Attendance has been near perfect. Next quarter I would like you taking the morning handover when I am not in, which is why the promotion is going through from October.
                        </p>
                        <p style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: "11px" }}>
                          M. Gunathilaka · Production Head · 26 September 2026
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => addToast("Review acknowledged. HR has been notified.")}
                    >
                      Acknowledge this review
                    </button>
                    <button
                      type="button"
                      className="btn btn-2"
                      onClick={() => addToast("Your comment was sent to M. Gunathilaka.")}
                    >
                      Add a comment
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* ════ BOTTOM SHEETS ════ */}
            <div className={`scrim ${activeSheet ? "on" : ""}`} onClick={() => setActiveSheet(null)}></div>
            <div className={`sheet ${activeSheet ? "on" : ""}`} role="dialog" aria-modal="true">
              <div className="grip" aria-hidden="true"></div>

              {/* SHEET: APPLY FOR LEAVE */}
              {activeSheet === "leave" && (
                <form onSubmit={handleLeaveSubmit}>
                  <h2>Apply for leave</h2>
                  <p>Your manager sees this straight away.</p>

                  <label className="f" htmlFor="lt">
                    Type
                  </label>
                  <select
                    className="f-in"
                    id="lt"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option>Annual — 8.5 days left</option>
                    <option>Casual — 3 days left</option>
                    <option>Medical — 6 days left</option>
                    <option>Maternity — 84 working days</option>
                    <option>No-pay</option>
                  </select>

                  <label className="f" htmlFor="lf">
                    From
                  </label>
                  <input
                    className="f-in"
                    id="lf"
                    type="date"
                    value={leaveFrom}
                    onChange={(e) => setLeaveFrom(e.target.value)}
                    required
                  />

                  <label className="f" htmlFor="lto">
                    To
                  </label>
                  <input
                    className="f-in"
                    id="lto"
                    type="date"
                    value={leaveTo}
                    onChange={(e) => setLeaveTo(e.target.value)}
                    required
                  />

                  <label className="f" htmlFor="lr">
                    Reason
                  </label>
                  <textarea
                    className="f-in"
                    id="lr"
                    placeholder="A line is enough"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                  ></textarea>

                  <button type="submit" className="btn">
                    Send request
                  </button>
                  <button type="button" className="btn btn-2" onClick={() => setActiveSheet(null)}>
                    Cancel
                  </button>
                </form>
              )}

              {/* SHEET: CLAIM OVERTIME */}
              {activeSheet === "ot" && (
                <div>
                  <h2>Claim overtime</h2>
                  <p>You worked past your rostered hours on 29 September. Tell your manager why and it goes for approval.</p>

                  <div className="card" style={{ margin: "0 0 4px" }}>
                    <div className="card-b" style={{ padding: "12px 14px" }}>
                      <div className="pay-row">
                        <span>Rostered</span>
                        <b>9 h · General</b>
                      </div>
                      <div className="pay-row">
                        <span>You worked</span>
                        <b>10 h 12 m</b>
                      </div>
                      <div className="pay-row">
                        <span>Extra</span>
                        <b>1 h 12 m</b>
                      </div>
                      <div className="pay-row" style={{ borderBottom: 0 }}>
                        <span>Claiming at 1.5×</span>
                        <b>Rs 962</b>
                      </div>
                    </div>
                  </div>

                  <label className="f" htmlFor="otr">
                    Why did you work the extra time?
                  </label>
                  <textarea
                    className="f-in"
                    id="otr"
                    placeholder="Machine 4 jammed at 17:00 and I stayed until maintenance cleared it"
                    value={otReason}
                    onChange={(e) => setOtReason(e.target.value)}
                  ></textarea>

                  <p
                    id="otHint"
                    style={{
                      fontSize: "11.5px",
                      color: otReason.trim().length >= 10 ? "var(--ink-3)" : "var(--bad)",
                      marginTop: "6px",
                    }}
                  >
                    {otReason.trim().length >= 10
                      ? "This is what your manager will read."
                      : "A reason is required (min 10 chars). Overtime that was not rostered cannot be paid without one."}
                  </p>

                  <button
                    type="button"
                    className="btn"
                    disabled={otReason.trim().length < 10}
                    style={{ opacity: otReason.trim().length >= 10 ? 1 : 0.45 }}
                    onClick={handleOtSubmit}
                  >
                    Send for approval
                  </button>
                  <button type="button" className="btn btn-2" onClick={() => setActiveSheet(null)}>
                    Not now
                  </button>

                  <p style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: "14px", lineHeight: 1.5 }}>
                    Goes to M. Gunathilaka, your manager. You will get a notification either way. Your week is at 8.0 of the 12 overtime hours allowed.
                  </p>
                </div>
              )}

              {/* SHEET: FACE GATE */}
              {activeSheet === "face" && (
                <div>
                  <h2>Confirm it is you</h2>
                  <p>The match runs on this phone. Your face template is never uploaded.</p>
                  <div className="face">
                    <div className={`face-ring ${faceScanState === "busy" ? "busy" : faceScanState === "go" ? "go" : ""}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
                        <circle cx="12" cy="12" r="3.2" />
                        <path d="M9 16.5c1.8 1.2 4.2 1.2 6 0" />
                      </svg>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--ink-2)", marginTop: "14px", textAlign: "center" }}>
                      {faceScanState === "busy"
                        ? "Matching…"
                        : faceScanState === "go"
                        ? "Matched. Marking you in."
                        : "Hold the phone at eye level"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    disabled={faceScanState !== "idle"}
                    onClick={startFaceScan}
                  >
                    {faceScanState === "busy" ? "Matching…" : "Scan my face"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-2"
                    onClick={() => {
                      setActiveSheet(null);
                      addToast("Biometric verification cancelled.");
                    }}
                  >
                    Use fingerprint at the gate instead
                  </button>
                </div>
              )}

              {/* SHEET: REMOTE SESSION GATE */}
              {activeSheet === "remote" && (
                <div>
                  <h2>Start a remote session</h2>
                  <p>You are away from the branch. A remote session records where you are working from — this cannot be skipped.</p>

                  <div className={`loc ${locScanState}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10Z" />
                      <circle cx="12" cy="11" r="2.6" />
                    </svg>
                    <b>
                      {locScanState === "busy"
                        ? "Finding you…"
                        : locScanState === "got"
                        ? "Nugegoda"
                        : locScanState === "no"
                        ? "Session blocked"
                        : "Location needed"}
                    </b>
                    <span>
                      {locScanState === "busy" ? (
                        "Hold still for a moment"
                      ) : locScanState === "got" ? (
                        <>
                          Accuracy 24 m
                          <span className="loc-d">
                            <span>From your registered address</span>
                            <b>1.2 km</b>
                          </span>
                          <span className="loc-d">
                            <span>Allowance</span>
                            <b>2 km · within range</b>
                          </span>
                        </>
                      ) : locScanState === "no" ? (
                        "Without a location a remote session cannot be recorded. Mark in at a branch instead, or allow location and try again."
                      ) : (
                        "The session cannot start until your phone returns a fix"
                      )}
                    </span>
                  </div>

                  {locScanState !== "got" ? (
                    <>
                      <button
                        type="button"
                        className="btn"
                        disabled={locScanState === "busy"}
                        onClick={startLocationScan}
                      >
                        {locScanState === "no" ? "Allow and try again" : "Use my location"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-2"
                        onClick={() => setLocScanState("no")}
                      >
                        Do not allow
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setActiveSheet(null);
                        if (faceCheckOn) {
                          setFaceScanState("idle");
                          setActiveSheet("face");
                        } else {
                          executePunchIn("Remote");
                        }
                      }}
                    >
                      Start the session
                    </button>
                  )}

                  <p style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: "14px", lineHeight: 1.5 }}>
                    Recorded at mark-in and mark-out only. Nothing is tracked in between. Your manager sees the place name and the distance from your registered address, and HR can see the coordinates if a day is ever disputed.
                  </p>
                </div>
              )}
            </div>

            {/* Toasts */}
            <div className="toasts" id="toasts" aria-live="polite">
              {toasts.map((t) => (
                <div key={t.id} className="toast">
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
