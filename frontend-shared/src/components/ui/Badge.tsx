import type { HTMLAttributes } from "react";
import "./ui.css";

type BadgeKind = "draft" | "confirmed" | "needs-review";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  kind: BadgeKind;
}

export function Badge({ kind, className, ...rest }: BadgeProps) {
  return <span className={["badge", `badge-${kind}`, className].filter(Boolean).join(" ")} {...rest} />;
}
