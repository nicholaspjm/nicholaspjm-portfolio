"use client";

import { useState } from "react";

export interface CVRow {
  year: string;
  type: string;
  title: string;
  detail: string;
}

const TABS = [
  { label: "CV", filter: null },
  { label: "projects", filter: ["Project", "Installation"] },
  { label: "performances", filter: ["Performance"] },
  { label: "awards", filter: ["Award"] },
  { label: "press", filter: ["Press"] },
  { label: "teaching", filter: ["Teaching"] },
  { label: "education", filter: ["Education"] },
] as const;

function toCSV(rows: CVRow[]) {
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`;
  const lines = [
    ["Year", "Type", "Title", "Detail"].map(esc).join(","),
    ...rows.map((r) =>
      [r.year, r.type, r.title, r.detail].map(esc).join(","),
    ),
  ];
  return lines.join("\r\n");
}

/**
 * The spreadsheet: formula bar, grid, working tab strip, and an export
 * button that downloads the full CV as a .csv.
 */
export function CVSheet({ rows }: { rows: CVRow[] }) {
  const [tab, setTab] = useState(0);

  const active = TABS[tab];
  const visible = active.filter
    ? rows.filter((r) => (active.filter as readonly string[]).includes(r.type))
    : rows;

  const download = () => {
    const blob = new Blob(["﻿" + toCSV(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Nicholas_Marriott_CV.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const query = active.filter
    ? `=QUERY(PRACTICE, "SELECT * WHERE type IN (${(active.filter as readonly string[]).map((f) => `'${f.toLowerCase()}'`).join(", ")}) ORDER BY year DESC")`
    : `=QUERY(PRACTICE, "SELECT * ORDER BY year DESC")`;

  return (
    <>
      <p>
        <button onClick={download}>export .csv ↓</button>
      </p>

      <div className="formula-bar">
        <span className="fx">fx</span>
        {query}
      </div>

      <table className="sheet">
        <thead>
          <tr>
            <th className="rownum"></th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
            <th>D</th>
          </tr>
        </thead>
        <tbody>
          <tr className="head-row">
            <td className="rownum">1</td>
            <td>Year</td>
            <td>Type</td>
            <td>Title</td>
            <td>Detail</td>
          </tr>
          {visible.map((r, i) => (
            <tr key={`${r.title}-${i}`}>
              <td className="rownum">{i + 2}</td>
              <td>{r.year === "—" ? "" : r.year}</td>
              <td>{r.type}</td>
              <td>{r.title}</td>
              <td>{r.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sheet-tabs">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            className={i === tab ? "tab active" : "tab"}
            onClick={() => setTab(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </>
  );
}
