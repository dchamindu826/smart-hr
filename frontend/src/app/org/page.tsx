"use client";

import React from "react";
import { useUI } from "@/context/UIContext";

export default function OrgChartPage() {
  const { toast } = useUI();

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <h1>Organisation chart</h1>
          <p>
            Drawn from the reporting lines on each employee record. Leave requests and approvals route
            through this tree.
          </p>
        </div>
        <div className="acts">
          <button
            type="button"
            className="btn"
            onClick={() => toast("Org hierarchy chart exported as PNG.")}
          >
            Export chart
          </button>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="note w">
        <span className="ic">⚠</span>
        <div>
          <b>9 employees have no reporting manager assigned</b>
          They do not appear in the hierarchy below, and their leave requests cannot be routed for
          approval.
          <button
            type="button"
            className="btn sm"
            style={{ marginLeft: "10px" }}
            onClick={() => toast("Displaying 9 employees without assigned reporting managers.")}
          >
            Show list
          </button>
        </div>
      </div>

      {/* Visual Org Tree */}
      <div className="card">
        <div className="card-b">
          <div className="org">
            {/* Level 1: Executive */}
            <div className="org-l">
              <div className="org-n hd">
                <b>D. Rajapaksha</b>
                <span>Managing Director</span>
              </div>
            </div>

            {/* Level 2: Department Heads */}
            <div className="org-l">
              <div className="org-n">
                <b>Dinuka R.</b>
                <span>HR Manager · 6 direct</span>
              </div>
              <div className="org-n">
                <b>S. Weerasinghe</b>
                <span>Finance Manager · 4 direct</span>
              </div>
              <div className="org-n">
                <b>M. Gunathilaka</b>
                <span>Production Head · 148 team</span>
              </div>
              <div className="org-n">
                <b>A. Careem</b>
                <span>Sales Head · 31 team</span>
              </div>
            </div>

            {/* Level 3: Line Supervisors */}
            <div className="org-l">
              <div className="org-n">
                <b>P. Jayasuriya</b>
                <span>Line Supervisor · 42</span>
              </div>
              <div className="org-n">
                <b>R. Dissanayake</b>
                <span>Line Supervisor · 38</span>
              </div>
              <div className="org-n">
                <b>K. Perera</b>
                <span>Line Supervisor · 36</span>
              </div>
              <div className="org-n">
                <b>N. Bandara</b>
                <span>Line Supervisor · 32</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
