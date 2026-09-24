import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-[var(--border-hairline)] px-2 py-0.5 text-xs text-[var(--text-secondary)]",
        className
      )}
      {...props}
    />
  );
}
