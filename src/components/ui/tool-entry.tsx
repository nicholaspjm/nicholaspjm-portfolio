"use client";

import { useSyncExternalStore } from "react";
import { getEditMode, subscribe } from "@/lib/edit-store";
import { Editable } from "./editable";

/**
 * A tool row (number / name / summary / stack). Normally the whole row links
 * out to the tool's repo; while the content editor is in edit mode it renders
 * as a plain div so the name and summary can be edited without following the
 * link. Keyed by index in the tools list.
 */
export function ToolEntry({
  href,
  prev,
  name,
  summary,
  stack,
  idx,
}: {
  href: string;
  prev: string;
  name: string;
  summary: string;
  stack: string;
  idx: number;
}) {
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);

  const inner = (
    <>
      <Editable id={`tool.${idx}.name`} as="span" className="tool-name">
        {name}
      </Editable>{" "}
      <span className="foot">({stack})</span>
      <br />
      <Editable id={`tool.${idx}.summary`} as="span" className="tool-sum">
        {summary}
      </Editable>
    </>
  );

  if (editMode) return <div className="entry">{inner}</div>;

  return (
    <a
      className="entry"
      href={href}
      target="_blank"
      rel="noreferrer"
      data-prev={prev}
    >
      {inner}
    </a>
  );
}
