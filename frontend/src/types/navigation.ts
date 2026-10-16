export type PlanTier = "STARTER" | "GROWTH" | "COMPLETE";

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  path: string;
  tier?: PlanTier;
  count?: string;
}

export interface NavGroup {
  category: string;
  items: NavItem[];
}

export const NAVIGATION_MAP: NavGroup[] = [
  {
    category: "Today",
    items: [
      { id: "dash", icon: "◧", label: "Dashboard", path: "/admin", tier: "STARTER" },
    ],
  },
  {
    category: "People",
    items: [
      { id: "employees", icon: "☰", label: "Employees", path: "/employees", tier: "STARTER" },
      { id: "import", icon: "⇪", label: "Bulk import", path: "/import", tier: "GROWTH" },
      { id: "org", icon: "⑂", label: "Org chart", path: "/org", tier: "COMPLETE" },
      { id: "lifecycle", icon: "⟳", label: "Lifecycle events", path: "/lifecycle", tier: "COMPLETE" },
      { id: "onboarding", icon: "✓", label: "Onboarding", path: "/onboarding", tier: "GROWTH" },
      { id: "documents", icon: "▤", label: "Documents", path: "/documents", tier: "GROWTH" },
      { id: "assets", icon: "▣", label: "Asset register", path: "/assets", tier: "COMPLETE" },
      { id: "training", icon: "◉", label: "Training", path: "/training", tier: "COMPLETE" },
      { id: "discipline", icon: "⚠", label: "Disciplinary", path: "/discipline", tier: "COMPLETE" },
    ],
  },
  {
    category: "Time",
    items: [
      { id: "attendance", icon: "◷", label: "Attendance", path: "/attendance", tier: "STARTER" },
      { id: "roster", icon: "☷", label: "Roster & shifts", path: "/roster", tier: "GROWTH" },
      { id: "swaps", icon: "⇄", label: "Shift swaps", path: "/swaps", tier: "GROWTH" },
      { id: "overtime", icon: "⊞", label: "Overtime", path: "/overtime", tier: "GROWTH" },
      { id: "leave", icon: "⌂", label: "Leave", path: "/leave", tier: "STARTER" },
      { id: "leavepolicy", icon: "§", label: "Leave policy", path: "/leavepolicy", tier: "GROWTH" },
      { id: "paycal", icon: "⚑", label: "Holiday & pay calendar", path: "/paycal", tier: "GROWTH" },
    ],
  },
  {
    category: "Pay",
    items: [
      { id: "payroll", icon: "₨", label: "Payroll run", path: "/payroll", tier: "STARTER" },
      { id: "payslip", icon: "▤", label: "Payslip template", path: "/payslip", tier: "STARTER" },
      { id: "arrears", icon: "↺", label: "Corrections & arrears", path: "/arrears", tier: "GROWTH" },
      { id: "gratuity", icon: "⚖", label: "Gratuity liability", path: "/gratuity", tier: "GROWTH" },
      { id: "settlement", icon: "⊡", label: "Final settlement", path: "/settlement", tier: "GROWTH" },
      { id: "loans", icon: "◈", label: "Loans & advances", path: "/loans", tier: "GROWTH" },
      { id: "expenses", icon: "▦", label: "Expense claims", path: "/expenses", tier: "GROWTH" },
      { id: "currency", icon: "$", label: "Multi-currency", path: "/currency", tier: "COMPLETE" },
    ],
  },
  {
    category: "Compliance",
    items: [
      { id: "returns", icon: "⊕", label: "Statutory returns", path: "/returns", tier: "STARTER" },
      { id: "registers", icon: "▥", label: "Statutory registers", path: "/registers", tier: "GROWTH" },
      { id: "audit", icon: "◎", label: "Audit log", path: "/audit", tier: "STARTER" },
    ],
  },
  {
    category: "Grow",
    items: [
      { id: "recruit", icon: "◔", label: "Recruitment", path: "/recruit", tier: "COMPLETE" },
      { id: "performance", icon: "↗", label: "Performance", path: "/performance", tier: "COMPLETE" },
      { id: "reports", icon: "▩", label: "Reports", path: "/reports", tier: "COMPLETE" },
    ],
  },
  {
    category: "Setup",
    items: [
      { id: "tenants", icon: "🏢", label: "Client Consoles (Tenants)", path: "/tenants", tier: "STARTER" },
      { id: "plans", icon: "◴", label: "Plan & modules", path: "/plans", tier: "STARTER" },
      { id: "business", icon: "⌗", label: "Business & branches", path: "/business", tier: "STARTER" },
      { id: "roles", icon: "◐", label: "Roles & users", path: "/roles", tier: "STARTER" },
      { id: "delegation", icon: "⇉", label: "Approval delegation", path: "/delegation", tier: "GROWTH" },
      { id: "devices", icon: "⊟", label: "Devices & geofence", path: "/devices", tier: "STARTER" },
      { id: "notifications", icon: "♫", label: "Notifications", path: "/notifications", tier: "GROWTH" },
      { id: "integrations", icon: "⧉", label: "Integrations", path: "/integrations", tier: "COMPLETE" },
      { id: "dataexport", icon: "⇩", label: "Data export", path: "/dataexport", tier: "GROWTH" },
    ],
  },
];
