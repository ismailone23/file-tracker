"use client";

import { notFound, useParams } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { FileStageTable } from "@/components/shared/file-stage-table";
import { STAGE_ORDER, StageId } from "@/types/file";

const isStageId = (value: string): value is StageId =>
  STAGE_ORDER.includes(value as StageId);

export default function StagePage() {
  const params = useParams<{ stage: string }>();
  const stage = params.stage;

  if (!isStageId(stage)) {
    notFound();
  }

  return (
    <DashboardShell>
      <FileStageTable stage={stage} />
    </DashboardShell>
  );
}
