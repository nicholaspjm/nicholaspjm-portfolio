"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getEditMode, subscribe } from "@/lib/edit-store";
import { Editable } from "./editable";

/**
 * A project entry line (number / title / year / summary). Normally the whole
 * block is a link to the work; while the content editor is in edit mode it
 * renders as a plain div instead so the title and summary can be clicked and
 * edited without following the link. Title/summary are editable and keyed by
 * slug so an edit applies wherever the work is listed.
 */
export function ProjectEntry({
  slug,
  title,
  year,
  summary,
  num,
  total,
  feature = false,
  prev,
}: {
  slug: string;
  title: string;
  year: string;
  summary: string;
  num: number;
  total: number;
  feature?: boolean;
  prev: string;
}) {
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);
  const cls = feature ? "entry feature" : "entry";

  const inner = (
    <>
      <span className="entry-num">
        {String(num).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </span>
      <Editable id={`work.${slug}.title`} as="span" className="ptitle">
        {title}
      </Editable>
      <br />
      <em>{year}.</em>{" "}
      <Editable id={`work.${slug}.summary`} as="span">
        {summary}
      </Editable>
    </>
  );

  if (editMode) return <div className={cls}>{inner}</div>;

  return (
    <Link href={`/work/${slug}`} className={cls} data-prev={prev} data-work={slug}>
      {inner}
    </Link>
  );
}
