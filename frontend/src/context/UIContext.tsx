"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PlanTier } from "@/types/navigation";

interface ToastItem {
  id: string;
  message: string;
}

interface SheetState {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  content: React.ReactNode | null;
}

export interface ClientCompany {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  staffCount: number;
  devices: number;
  epfNo: string;
  tin: string;
  address: string;
}

export const INITIAL_COMPANIES: ClientCompany[] = [
  {
    id: "c1",
    name: "ABC Holdings (Pvt) Ltd",
    slug: "abc-holdings",
    plan: "GROWTH",
    staffCount: 250,
    devices: 4,
    epfNo: "A/14000",
    tin: "114028719-7000",
    address: "67/1 Hudson Road, Colombo 03",
  },
  {
    id: "c2",
    name: "Lanka Garments (Pvt) Ltd",
    slug: "lanka-garments",
    plan: "COMPLETE",
    staffCount: 480,
    devices: 8,
    epfNo: "G/20845",
    tin: "128495022-8000",
    address: "EPZ Phase II, Katunayake",
  },
  {
    id: "c3",
    name: "Ceylon Tea & Spices Exports",
    slug: "ceylon-tea",
    plan: "GROWTH",
    staffCount: 110,
    devices: 3,
    epfNo: "T/09211",
    tin: "139582910-4000",
    address: "122 Peradeniya Road, Kandy",
  },
  {
    id: "c4",
    name: "Apex Logistics & Freight Hub",
    slug: "apex-logistics",
    plan: "STARTER",
    staffCount: 24,
    devices: 1,
    epfNo: "L/05412",
    tin: "109482711-2000",
    address: "8 Wakwella Road, Galle",
  },
];

interface UIContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  isRailOpen: boolean;
  toggleRail: (open?: boolean) => void;
  toast: (message: string) => void;
  openSheet: (title: string, subtitle?: string, content?: React.ReactNode) => void;
  closeSheet: () => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  currentPlan: PlanTier;
  setCurrentPlan: (plan: PlanTier) => void;
  currentCompany: ClientCompany;
  setCurrentCompany: (company: ClientCompany) => void;
  companies: ClientCompany[];
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [sheet, setSheet] = useState<SheetState>({
    isOpen: false,
    title: "",
    subtitle: "",
    content: null,
  });
  const [selectedBranch, setSelectedBranch] = useState("ABC Holdings · All branches");
  const [currentPlan, setCurrentPlanState] = useState<PlanTier>("GROWTH");
  const [companies] = useState<ClientCompany[]>(INITIAL_COMPANIES);
  const [currentCompany, setCurrentCompanyState] = useState<ClientCompany>(INITIAL_COMPANIES[0]);

  useEffect(() => {
    const saved = localStorage.getItem("shr.a.theme") as "light" | "dark" | null;
    const initialTheme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    const savedPlan = localStorage.getItem("shr.a.plan") as PlanTier | null;
    if (savedPlan) setCurrentPlanState(savedPlan);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("shr.a.theme", next);
    } catch {
      // ignore
    }
  };

  const setCurrentPlan = (plan: PlanTier) => {
    setCurrentPlanState(plan);
    try {
      localStorage.setItem("shr.a.plan", plan);
    } catch {
      // ignore
    }
    const screenCount = plan === "STARTER" ? 11 : plan === "GROWTH" ? 22 : 38;
    toast(`Switched view to ${plan} tier (${screenCount} screens active in sidebar).`);
  };

  const setCurrentCompany = (comp: ClientCompany) => {
    setCurrentCompanyState(comp);
    setCurrentPlanState(comp.plan);
    setSelectedBranch(`${comp.name} · All branches`);
    toast(`Console switched to client: ${comp.name} (${comp.plan} Plan)`);
  };

  const toggleRail = (open?: boolean) => {
    setIsRailOpen((prev) => (open !== undefined ? open : !prev));
  };

  const toast = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const openSheet = (title: string, subtitle?: string, content?: React.ReactNode) => {
    setSheet({
      isOpen: true,
      title,
      subtitle,
      content,
    });
  };

  const closeSheet = () => {
    setSheet((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSheet();
        setIsRailOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <UIContext.Provider
      value={{
        theme,
        toggleTheme,
        isRailOpen,
        toggleRail,
        toast,
        openSheet,
        closeSheet,
        selectedBranch,
        setSelectedBranch,
        currentPlan,
        setCurrentPlan,
        currentCompany,
        setCurrentCompany,
        companies,
      }}
    >
      {children}

      {/* Background Scrim */}
      <div
        className={`scrim ${isRailOpen || sheet.isOpen ? "on" : ""}`}
        onClick={() => {
          setIsRailOpen(false);
          closeSheet();
        }}
      />

      {/* Slide-over Side Sheet */}
      <aside className={`sheet ${sheet.isOpen ? "on" : ""}`} role="dialog" aria-modal="true">
        <button className="x" onClick={closeSheet} aria-label="Close sheet">
          ×
        </button>
        {sheet.title && <h2>{sheet.title}</h2>}
        {sheet.subtitle && <div className="sub">{sheet.subtitle}</div>}
        <div id="sheetBody">{sheet.content}</div>
      </aside>

      {/* Toasts Floating Stack */}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
