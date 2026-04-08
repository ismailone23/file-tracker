"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { FileStageTable } from "@/components/shared/file-stage-table";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { useFiles } from "@/hooks/useFiles";
import { STAGE_ORDER } from "@/types/file";

export default function DashboardPage() {
  const { stageLabel } = useLanguage();
  const { stats, activeOfficer } = useFiles();
  const activeStage = activeOfficer.allowedStages[0];

  return (
    <DashboardShell>
      <section className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STAGE_ORDER.map((stage) => (
            <Link key={stage} href={`/stages/${stage}`}>
              <Card className="h-full border-orange-200/60 bg-gradient-to-br from-orange-50 to-white transition hover:border-orange-400 hover:shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">{stageLabel(stage)}</p>
                  <p className="mt-2 font-heading text-3xl text-slate-900">
                    {stats[stage]}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <FileStageTable stage={activeStage} />
      </section>
    </DashboardShell>
  );
}
