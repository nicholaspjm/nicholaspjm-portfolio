import Link from "next/link";
import { cn } from "@/lib/cn";

export function Tag({
  label,
  href,
  active,
}: {
  label: string;
  href?: string;
  active?: boolean;
}) {
  const cls = cn(
    "caption inline-flex items-center border border-rule px-2 py-[2px]",
    "transition-colors",
    active
      ? "bg-ink text-paper"
      : "bg-transparent text-ink-soft hover:border-link hover:text-link",
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }
  return <span className={cls}>{label}</span>;
}
