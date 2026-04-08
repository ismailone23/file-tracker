"use client";

import { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useFiles } from "@/hooks/useFiles";
import { AddFileDialog } from "./add-file-dialog";
import { StageSidebar } from "./stage-sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { officers, activeOfficer, setActiveOfficer, addFile, stats } =
    useFiles();

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
              <SelectValue placeholder={t("selectOfficer")} />
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
        </div>

        <StageSidebar counts={stats} />
      </div>

      <section>{children}</section>
    </div>
  );
}
