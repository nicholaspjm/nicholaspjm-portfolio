"use client";

import { useMemo, useState } from "react";
import { Editable } from "@/components/ui/editable";

export interface CVRow {
  year: string;
  type: string;
  title: string;
  detail: string;
}

const COLS = ["year", "type", "title", "detail"] as const;
type Col = (typeof COLS)[number];
const COL_LETTER: Record<Col, string> = {
  year: "A",
  type: "B",
  title: "C",
  detail: "D",
};

const TABS = [
  { label: "CV", where: "" },
  { label: "projects", where: "type IN ('project', 'installation')" },
  { label: "performances", where: "type = 'performance'" },
  { label: "awards", where: "type = 'award'" },
  { label: "press", where: "type = 'press'" },
  { label: "teaching", where: "type = 'teaching'" },
  { label: "education", where: "type = 'education'" },
] as const;

/* ---------------------------------------------------------------------------
   Query engine — a working subset of the Sheets QUERY language:
   SELECT * [WHERE cond [AND cond]*] [ORDER BY col [ASC|DESC]] [LIMIT n]
   conds: col (= != > < >= <=) value · col IN ('a','b') · col CONTAINS 'x'
   ------------------------------------------------------------------------ */
interface Applied {
  whereText: string;
  where: ((r: CVRow) => boolean) | null;
  orderCol: Col | null;
  orderAsc: boolean;
  limit: number | null;
}

const num = (s: string) => parseInt(s, 10) || 0;
const strip = (s: string) => s.trim().replace(/^['"]|['"]$/g, "");

function parseCond(s: string): ((r: CVRow) => boolean) | null {
  s = s.trim();
  let m = s.match(/^(year|type|title|detail)\s+in\s*\(([^)]*)\)$/i);
  if (m) {
    const col = m[1].toLowerCase() as Col;
    const vals = m[2].split(",").map((v) => strip(v).toLowerCase());
    return (r) => vals.includes(r[col].toLowerCase());
  }
  m = s.match(/^(year|type|title|detail)\s+contains\s+(.+)$/i);
  if (m) {
    const col = m[1].toLowerCase() as Col;
    const v = strip(m[2]).toLowerCase();
    return (r) => r[col].toLowerCase().includes(v);
  }
  m = s.match(/^(year|type|title|detail)\s*(>=|<=|!=|=|>|<)\s*(.+)$/i);
  if (m) {
    const col = m[1].toLowerCase() as Col;
    const op = m[2];
    const raw = strip(m[3]);
    const numeric = col === "year" && /^\d+$/.test(raw);
    return (r) => {
      const a = numeric ? num(r[col]) : r[col].toLowerCase();
      const b = numeric ? num(raw) : raw.toLowerCase();
      switch (op) {
        case "=": return a === b;
        case "!=": return a !== b;
        case ">": return a > b;
        case "<": return a < b;
        case ">=": return a >= b;
        case "<=": return a <= b;
      }
      return false;
    };
  }
  return null;
}

function parseQuery(raw: string): Applied | { error: string } {
  let q = raw.trim();
  const wrapped = q.match(/^=?\s*query\s*\(\s*practice\s*,\s*["']([^"']*)["']\s*\)\s*$/i);
  if (wrapped) q = wrapped[1].trim();
  if (!/^select\s+\*/i.test(q)) return { error: "expected SELECT *" };
  let rest = q.replace(/^select\s+\*\s*/i, "").trim();

  let limit: number | null = null;
  const lm = rest.match(/\blimit\s+(\d+)\s*$/i);
  if (lm) {
    limit = parseInt(lm[1], 10);
    rest = rest.slice(0, lm.index).trim();
  }

  let orderCol: Col | null = null;
  let orderAsc = true;
  const om = rest.match(/\border\s+by\s+(year|type|title|detail)(\s+(asc|desc))?\s*$/i);
  if (om) {
    orderCol = om[1].toLowerCase() as Col;
    orderAsc = (om[3] ?? "asc").toLowerCase() === "asc";
    rest = rest.slice(0, om.index).trim();
  }

  let where: Applied["where"] = null;
  let whereText = "";
  if (rest) {
    const wm = rest.match(/^where\s+(.+)$/i);
    if (!wm) return { error: `can't parse: "${rest.slice(0, 24)}"` };
    whereText = wm[1].trim();
    const conds = whereText.split(/\s+and\s+/i).map(parseCond);
    if (conds.some((c) => !c)) return { error: "bad WHERE clause" };
    where = (r) => conds.every((f) => f!(r));
  }
  return { whereText, where, orderCol, orderAsc, limit };
}

function serialize(a: Applied): string {
  let s = "SELECT *";
  if (a.whereText) s += ` WHERE ${a.whereText}`;
  if (a.orderCol) s += ` ORDER BY ${a.orderCol} ${a.orderAsc ? "ASC" : "DESC"}`;
  if (a.limit != null) s += ` LIMIT ${a.limit}`;
  return `=QUERY(PRACTICE, "${s}")`;
}

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
 * The spreadsheet, functional end to end: an editable QUERY formula bar
 * (working WHERE / ORDER BY / LIMIT), sortable columns, selectable cells
 * with arrow-key navigation, filter tabs that write real queries, and CSV
 * export of the full dataset.
 */
export function CVSheet({ rows }: { rows: CVRow[] }) {
  const [tab, setTab] = useState(0);
  const [text, setText] = useState(serialize({ whereText: "", where: null, orderCol: "year", orderAsc: false, limit: null }));
  const [applied, setApplied] = useState<Applied>({
    whereText: "",
    where: null,
    orderCol: "year",
    orderAsc: false,
    limit: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);

  const run = (q: string, tabIdx: number | null) => {
    const res = parseQuery(q);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setError(null);
    setApplied(res);
    setText(serialize(res));
    setSel(null);
    if (tabIdx !== null) setTab(tabIdx);
  };

  const visible = useMemo(() => {
    let out = applied.where ? rows.filter(applied.where) : [...rows];
    const col = applied.orderCol;
    if (col) {
      const dir = applied.orderAsc ? 1 : -1;
      out.sort((a, b) =>
        col === "year"
          ? (num(a.year) - num(b.year)) * dir
          : a[col].localeCompare(b[col]) * dir,
      );
    }
    if (applied.limit != null) out = out.slice(0, applied.limit);
    return out;
  }, [rows, applied]);

  const sortBy = (c: Col) => {
    const next: Applied = {
      ...applied,
      orderCol: c,
      orderAsc: applied.orderCol === c ? !applied.orderAsc : c !== "year",
    };
    setApplied(next);
    setText(serialize(next));
    setError(null);
    setSel(null);
  };

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

  const move = (dr: number, dc: number) => {
    if (!sel) return;
    setSel({
      r: Math.min(Math.max(sel.r + dr, 0), visible.length - 1),
      c: Math.min(Math.max(sel.c + dc, 0), COLS.length - 1),
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!sel) return;
    const map: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const d = map[e.key];
    if (d) {
      e.preventDefault();
      move(d[0], d[1]);
    }
    if (e.key === "Escape") setSel(null);
  };

  const selValue = sel ? visible[sel.r]?.[COLS[sel.c]] ?? "" : null;
  const selRef = sel ? `${COL_LETTER[COLS[sel.c]]}${sel.r + 2}` : null;

  return (
    <>
      <p>
        <button onClick={download}>export .csv ↓</button>{" "}
        <span className="foot">
          <Editable id="cv.formulaHint" as="span">
            the formula bar runs for real — try WHERE year &gt;= 2026, WHERE
            title CONTAINS &apos;xx&apos;, or LIMIT 5 · click headers to sort ·
            click cells to inspect
          </Editable>
        </span>
      </p>

      <div className="formula-bar">
        <span className="fx">{sel ? selRef : "fx"}</span>
        {sel ? (
          <span className="fb-value" onClick={() => setSel(null)}>
            {selValue}
          </span>
        ) : (
          <input
            className="fb-input"
            value={text}
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run(text, null);
            }}
          />
        )}
        {error && <span className="qerror">#ERROR! {error}</span>}
      </div>

      <table className="sheet" tabIndex={0} onKeyDown={onKey}>
        <thead>
          <tr>
            <th className="rownum"></th>
            {COLS.map((c) => (
              <th
                key={c}
                className="sortable"
                onClick={() => sortBy(c)}
                title={`sort by ${c}`}
              >
                {COL_LETTER[c]}
                {applied.orderCol === c && (applied.orderAsc ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="head-row">
            <td className="rownum">1</td>
            {COLS.map((c) => (
              <td key={c} className="sortable" onClick={() => sortBy(c)}>
                {c[0].toUpperCase() + c.slice(1)}
                {applied.orderCol === c && (applied.orderAsc ? " ▲" : " ▼")}
              </td>
            ))}
          </tr>
          {visible.map((r, ri) => (
            <tr key={`${r.title}-${ri}`}>
              <td className="rownum">{ri + 2}</td>
              {COLS.map((c, ci) => (
                <td
                  key={c}
                  className={
                    sel && sel.r === ri && sel.c === ci ? "sel" : undefined
                  }
                  onClick={() => setSel({ r: ri, c: ci })}
                >
                  {c === "year" && r.year === "—" ? "" : r[c]}
                </td>
              ))}
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td className="rownum">2</td>
              <td colSpan={4}>
                <i>#N/A — query matched nothing</i>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="sheet-tabs">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            className={i === tab ? "tab active" : "tab"}
            onClick={() =>
              run(
                `=QUERY(PRACTICE, "SELECT *${t.where ? ` WHERE ${t.where}` : ""} ORDER BY year DESC")`,
                i,
              )
            }
          >
            {t.label}
          </button>
        ))}
      </div>
    </>
  );
}
