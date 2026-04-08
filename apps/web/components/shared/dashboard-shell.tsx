"use client";

import { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useFiles } from "@/hooks/useFiles";
import { AddFileDialog } from "./add-file-dialog";
import { StageSidebar } from "./stage-sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const {
    officers,
    activeOfficer,
    feedback,
    clearFeedback,
    setActiveOfficer,
    addFile,
    stats,
  } = useFiles();

  const handleOfficerChange = (value: string | null) => {
    if (!value) {
      return;
    }

    setActiveOfficer(value);
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 md:grid-cols-[250px_1fr] md:px-6">
      <div className="space-y-4">
        <div className="rounded-2xl border border-orange-200/70 bg-white/80 p-4 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("activeOfficer")}
          </p>
          <p className="mt-1 font-heading text-base text-slate-900">
            {activeOfficer.role}
          </p>
          <Select value={activeOfficer.id} onValueChange={handleOfficerChange}>
            <SelectTrigger className="mt-3 w-full">
              <span className="truncate">{activeOfficer.name}</span>
            </SelectTrigger>
            <SelectContent>
              {officers.map((officer) => (
                <SelectItem key={officer.id} value={officer.id}>
                  {officer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-3">
            <AddFileDialog
              defaultAssignee={activeOfficer.name}
              onAddFile={addFile}
            />
          </div>

          {feedback ? (
            <button
              type="button"
              onClick={clearFeedback}
              className={`mt-3 w-full rounded-lg border px-3 py-2 text-left text-xs ${
                feedback.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-red-300 bg-red-50 text-red-800"
              }`}
            >
              {feedback.message}
            </button>
          ) : null}
        </div>

        <StageSidebar counts={stats} />
      </div>

      <section>{children}</section>
    </div>
  );
}
