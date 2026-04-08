"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { STAGE_ORDER, StageId } from "@/types/file";

interface StageSidebarProps {
  counts: Record<StageId, number>;
}

export function StageSidebar({ counts }: StageSidebarProps) {
  const { t, stageLabel } = useLanguage();
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-orange-200/70 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {t("workflow")}
      </p>
      <nav className="mt-3 space-y-1">
        {STAGE_ORDER.map((stage) => {
          const href = `/stages/${stage}`;
          const active = pathname === href;

          return (
            <Link
              key={stage}
              href={href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-orange-500 text-white shadow"
                  : "text-slate-700 hover:bg-orange-100/70",
              )}
            >
              <span>{stageLabel(stage)}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "border",
                  active
                    ? "border-white/40 bg-white/20 text-white"
                    : "border-orange-200 bg-white text-slate-700",
                )}
              >
                {counts[stage]}
              </Badge>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
