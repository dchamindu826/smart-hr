"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { UIProvider } from "@/context/UIContext";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEmployeeApp = pathname === "/" || pathname === "/employee" || pathname.startsWith("/employee/");

  return (
    <UIProvider>
      {isEmployeeApp ? (
        <div className="employee-app-wrapper">{children}</div>
      ) : (
        <div className="shell">
          <Sidebar />
          <div className="main">
            <TopBar />
            <main className="page">{children}</main>
          </div>
        </div>
      )}
    </UIProvider>
  );
}
