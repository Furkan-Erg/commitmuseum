"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { RepoNode } from "@/lib/github/types";

interface RepoFilterProps {
  repos: RepoNode[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export function RepoFilter({ repos, selected, onChange }: RepoFilterProps) {
  function toggle(repo: string) {
    const next = new Set(selected);
    if (next.has(repo)) next.delete(repo);
    else next.add(repo);
    onChange(next);
  }

  function selectAll() {
    onChange(new Set(repos.map((r) => r.nameWithOwner)));
  }

  const allSelected = selected.size === repos.length;

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md border border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-[var(--text-primary)] cursor-pointer">
          Repos
          <span className="text-[var(--text-muted)]">
            {allSelected ? "All" : `${selected.size}/${repos.length}`}
          </span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 max-h-80 w-72 overflow-y-auto rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-2 shadow-lg"
        >
          <button
            onClick={selectAll}
            className="mb-1 w-full rounded px-2 py-1 text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--grid-line)] cursor-pointer"
          >
            Select all
          </button>
          {repos.map((repo) => {
            const checked = selected.has(repo.nameWithOwner);
            return (
              <label
                key={repo.nameWithOwner}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--grid-line)] cursor-pointer"
              >
                <CheckboxPrimitive.Root
                  checked={checked}
                  onCheckedChange={() => toggle(repo.nameWithOwner)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--axis-line)] data-[state=checked]:border-[var(--series-1)] data-[state=checked]:bg-[var(--series-1)]"
                >
                  <CheckboxPrimitive.Indicator className="text-[10px] leading-none text-[var(--surface-1)]">
                    ✓
                  </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>
                <span className="truncate">{repo.name}</span>
              </label>
            );
          })}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
