"use client";

import React, { useState } from "react";
import { useUI } from "@/context/UIContext";

export default function PayslipPage() {
  const { toast } = useUI();
  const [lang, setLang] = useState<"en" | "si" | "ta">("en");
  const [centerHeader, setCenterHeader] = useState(false);
  const [showEmployerContrib, setShowEmployerContrib] = useState(true);
  const [showLeaveBalance, setShowLeaveBalance] = useState(true);
  const [companyName, setCompanyName] = useState("ABC Holdings (Pvt) Ltd");
  const [address, setAddress] = useState("67/1 Hudson Road, Colombo 03");

  const i18n = {
    en: {
      title: "PAY SLIP",
      month: "September 2026",
      employee: "Employee",
      empNo: "Employee no.",
      designation: "Designation",
      epfMember: "EPF member",
      branch: "Branch",
      daysWorked: "Days worked",
      earnings: "EARNINGS",
      deductions: "DEDUCTIONS",
      basic: "Basic salary",
      budgetary: "Budgetary relief allowance",
      attendance: "Attendance allowance",
      ot: "Overtime 18.5 h at 1.5×",
      gross: "Gross earnings",
      epfEmp: "EPF employee 8%",
      apit: "APIT withheld",
      loan: "Staff loan recovery",
      totDeduct: "Total deductions",
      netPay: "NET PAYABLE TO BANK",
      employerStatutory: "EMPLOYER STATUTORY LIABILITIES",
      epfEmployer: "EPF employer 12%",
      etfEmployer: "ETF employer 3%",
      gratuityLiability: "Gratuity monthly accrual",
      leaveBalances: "LEAVE SUMMARY",
      annual: "Annual leave",
      casual: "Casual leave",
      medical: "Medical leave",
      footer: "This is a computer-generated payslip. No physical signature is required.",
    },
    si: {
      title: "වැටුප් පත්‍රිකාව",
      month: "2026 සැප්තැම්බර්",
      employee: "සේවකයාගේ නම",
      empNo: "සේවක අංකය",
      designation: "තනතුර",
      epfMember: "සේ.අ.අංකය (EPF)",
      branch: "ශාඛාව",
      daysWorked: "වැඩ කළ දින",
      earnings: "ඉපැයීම්",
      deductions: "අඩු කිරීම්",
      basic: "මූලික වැටුප",
      budgetary: "අයවැය සහන දීමනාව",
      attendance: "පැමිණීමේ දීමනාව",
      ot: "අතිකාල දීමනාව (පැය 18.5)",
      gross: "මුළු ඉපැයීම",
      epfEmp: "සේවක ඊ.පී.එෆ් 8%",
      apit: "ඒ.පී.අයි.ටී බදු (APIT)",
      loan: "ණය වාරික අයවීම්",
      totDeduct: "මුළු අඩු කිරීම්",
      netPay: "බැංකුවට ගෙවිය යුතු ශුද්ධ වැටුප",
      employerStatutory: "සේවායෝජක ව්‍යවස්ථාපිත දායකත්වයන්",
      epfEmployer: "සේවායෝජක ඊ.පී.එෆ් 12%",
      etfEmployer: "සේවායෝජක ඊ.ටී.එෆ් 3%",
      gratuityLiability: "පාරිතෝෂික මාසික ප්‍රතිපාදනය",
      leaveBalances: "නිවාඩු ශේෂය",
      annual: "වාර්ෂික නිවාඩු",
      casual: "අනියම් නිවාඩු",
      medical: "වෛද්‍ය නිවාඩු",
      footer: "මෙය පරිගණකයෙන් මුද්‍රණය කරන ලද ලියවිල්ලකි. අත්සනක් අවශ්‍ය නොවේ.",
    },
    ta: {
      title: "சம்பள சீட்டு",
      month: "செப்டம்பர் 2026",
      employee: "ஊழியர் பெயர்",
      empNo: "ஊழியர் எண்",
      designation: "பதவி",
      epfMember: "EPF எண்",
      branch: "கிளை",
      daysWorked: "வேலை செய்த நாட்கள்",
      earnings: "வருமானம்",
      deductions: "கழிவுகள்",
      basic: "அடிப்படை சம்பளம்",
      budgetary: "வரவுசெலவு நிவாரண கொடுப்பனவு",
      attendance: "வருகை கொடுப்பனவு",
      ot: "மேலதிக நேர கொடுப்பனவு",
      gross: "மொத்த வருமானம்",
      epfEmp: "ஊழியர் EPF 8%",
      apit: "APIT வரி",
      loan: "கடன் தவணை",
      totDeduct: "மொத்த கழிவுகள்",
      netPay: "வங்கிக்கு செலுத்தப்படும் நிகர சம்பளம்",
      employerStatutory: "நிறுவனத்தின் சட்டரீதியான பொறுப்புகள்",
      epfEmployer: "நிறுவன EPF 12%",
      etfEmployer: "நிறுவன ETF 3%",
      gratuityLiability: "பணிக்கொடை நிதி",
      leaveBalances: "விடுமுறை இருப்பு",
      annual: "வருடாந்த விடுமுறை",
      casual: "சாதாரண விடுமுறை",
      medical: "மருத்துவ விடுமுறை",
      footer: "இது கணினி மூலம் உருவாக்கப்பட்ட சம்பள சீட்டு. கையொப்பம் தேவையில்லை.",
    },
  }[lang];

  return (
    <div>
      {/* Page Header */}
      <div className="ph">
        <div>
          <h1>Payslip designer & template</h1>
          <p>
            Customizable document with full multi-language support (English, සිංහල, தமிழ்) and
            Sri Lanka statutory standards.
          </p>
        </div>
        <div className="acts">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCenterHeader(false);
              setShowEmployerContrib(true);
              setShowLeaveBalance(true);
              toast("Reset to default layout template.");
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn pri"
            onClick={() => toast("Template configuration saved for September batch.")}
          >
            Save template
          </button>
        </div>
      </div>

      <div className="grid gmain">
        {/* Left Column: Live Payslip Document Preview */}
        <div>
          <div className="card">
            <div className="card-h">
              <h2>Document preview</h2>
              <span className="sp" />
              {/* Language Switcher */}
              <div className="seg">
                <button
                  type="button"
                  aria-pressed={lang === "en"}
                  onClick={() => setLang("en")}
                >
                  English
                </button>
                <button
                  type="button"
                  aria-pressed={lang === "si"}
                  onClick={() => setLang("si")}
                >
                  සිංහල
                </button>
                <button
                  type="button"
                  aria-pressed={lang === "ta"}
                  onClick={() => setLang("ta")}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            <div className="card-b">
              <div className="slipwrap">
                <div
                  className={`slip ${centerHeader ? "center" : ""}`}
                  data-lang={lang}
                >
                  {/* Company Top Bar */}
                  <div className="slip-top">
                    <div className="slip-co">
                      <b>{companyName}</b>
                      <span>{address}</span>
                      <span>EPF Employer: A/14000 · ETF: E/08217 · TIN: 114028719-7000</span>
                      <span>011 234 5678 · payroll@abcholdings.lk</span>
                    </div>
                    <div className="slip-ttl">
                      <b>{i18n.title}</b>
                      <span>{i18n.month}</span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="slip-meta">
                    <div>
                      <span>{i18n.employee}</span>
                      <b>Kamal Perera</b>
                    </div>
                    <div>
                      <span>{i18n.empNo}</span>
                      <b>EMP-001</b>
                    </div>
                    <div>
                      <span>{i18n.designation}</span>
                      <b>Senior Operator</b>
                    </div>
                    <div>
                      <span>{i18n.epfMember}</span>
                      <b>A/14023</b>
                    </div>
                    <div>
                      <span>{i18n.branch}</span>
                      <b>Colombo HQ</b>
                    </div>
                    <div>
                      <span>{i18n.daysWorked}</span>
                      <b>21 of 21</b>
                    </div>
                  </div>

                  {/* Earnings & Deductions Columns */}
                  <div className="slip-cols">
                    <div>
                      <h4>{i18n.earnings} (LKR)</h4>
                      <div className="slip-r">
                        <span>{i18n.basic}</span>
                        <span>85,000.00</span>
                      </div>
                      <div className="slip-r">
                        <span>{i18n.budgetary}</span>
                        <span>3,500.00</span>
                      </div>
                      <div className="slip-r">
                        <span>{i18n.attendance}</span>
                        <span>2,500.00</span>
                      </div>
                      <div className="slip-r">
                        <span>{i18n.ot}</span>
                        <span>14,820.00</span>
                      </div>
                      <div className="slip-r sum">
                        <span>{i18n.gross}</span>
                        <span>105,820.00</span>
                      </div>
                    </div>

                    <div>
                      <h4>{i18n.deductions} (LKR)</h4>
                      <div className="slip-r">
                        <span>{i18n.epfEmp}</span>
                        <span>7,080.00</span>
                      </div>
                      <div className="slip-r">
                        <span>{i18n.apit}</span>
                        <span>2,400.00</span>
                      </div>
                      <div className="slip-r">
                        <span>{i18n.loan}</span>
                        <span>5,000.00</span>
                      </div>
                      <div className="slip-r sum">
                        <span>{i18n.totDeduct}</span>
                        <span>14,480.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Callout */}
                  <div className="slip-net">
                    <div>
                      <span>{i18n.netPay}</span>
                      <b>Bank of Ceylon (BOC) · A/C 008129481</b>
                    </div>
                    <div className="amt">Rs 91,340.00</div>
                  </div>

                  {/* Employer Statutory Contributions (Optional) */}
                  {showEmployerContrib && (
                    <div className="slip-x">
                      <h4>{i18n.employerStatutory} (NOT DEDUCTED FROM WAGES)</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "4px" }}>
                        <div>
                          <small style={{ color: "#5d6d85" }}>{i18n.epfEmployer}</small>
                          <div style={{ fontWeight: 600 }}>Rs 10,620.00</div>
                        </div>
                        <div>
                          <small style={{ color: "#5d6d85" }}>{i18n.etfEmployer}</small>
                          <div style={{ fontWeight: 600 }}>Rs 2,655.00</div>
                        </div>
                        <div>
                          <small style={{ color: "#5d6d85" }}>{i18n.gratuityLiability}</small>
                          <div style={{ fontWeight: 600 }}>Rs 3,541.67</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Leave Balances (Optional) */}
                  {showLeaveBalance && (
                    <div className="slip-x" style={{ borderTop: "1px solid #d8dfe9", paddingTop: "8px" }}>
                      <h4>{i18n.leaveBalances} (SHOP &amp; OFFICE ACT)</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "4px" }}>
                        <div>
                          <small style={{ color: "#5d6d85" }}>{i18n.annual}</small>
                          <div>5.5 days left</div>
                        </div>
                        <div>
                          <small style={{ color: "#5d6d85" }}>{i18n.casual}</small>
                          <div>2.0 days left</div>
                        </div>
                        <div>
                          <small style={{ color: "#5d6d85" }}>{i18n.medical}</small>
                          <div>3.0 days left</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="slip-foot">{i18n.footer}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Template Controls & Settings */}
        <div>
          <div className="card">
            <div className="card-h">
              <h2>Template controls</h2>
            </div>
            <div className="card-b">
              <label className="f">Company Name Header</label>
              <input
                className="f-in"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />

              <label className="f">Company Address</label>
              <input
                className="f-in"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div style={{ marginTop: "16px" }}>
                <label className="tgl">
                  <input
                    type="checkbox"
                    checked={centerHeader}
                    onChange={(e) => setCenterHeader(e.target.checked)}
                  />
                  <span>Center-align top company header</span>
                </label>

                <label className="tgl">
                  <input
                    type="checkbox"
                    checked={showEmployerContrib}
                    onChange={(e) => setShowEmployerContrib(e.target.checked)}
                  />
                  <span>
                    Show employer statutory cost (EPF 12% + ETF 3% + Gratuity)
                    <br />
                    <small>Transparent compensation transparency for staff</small>
                  </span>
                </label>

                <label className="tgl">
                  <input
                    type="checkbox"
                    checked={showLeaveBalance}
                    onChange={(e) => setShowLeaveBalance(e.target.checked)}
                  />
                  <span>
                    Display leave balance table
                    <br />
                    <small>Complies with Shop &amp; Office records rules</small>
                  </span>
                </label>
              </div>

              <button
                type="button"
                className="btn pri"
                style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}
                onClick={() => toast("Test payslip PDF downloaded for Kamal Perera.")}
              >
                Download sample PDF
              </button>
            </div>
          </div>

          <div className="note k">
            <span className="ic">✓</span>
            <div>
              <b>Sinhala Unicode (Noto Sans) verified</b>
              When printing or exporting in Sinhala, unicode text rendering ensures proper ligatures
              and Sri Lankan statutory accuracy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
