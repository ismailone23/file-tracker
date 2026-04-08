"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/context/LanguageContext";
import { useFiles } from "@/hooks/useFiles";
import { StageId } from "@/types/file";
import { FileApprovalDialog } from "./file-approval-dialog";
import { StatusBadge } from "./status-badge";

interface FileStageTableProps {
  stage: StageId;
}

export function FileStageTable({ stage }: FileStageTableProps) {
  const { t, stageLabel } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const {
    files,
    activeOfficer,
    approveAndForward,
    forwardOnly,
    getAssignableStagesForActiveOfficer,
  } = useFiles(stage, searchTerm);

  const canActInStage = useMemo(
    () => getAssignableStagesForActiveOfficer().includes(stage),
    [getAssignableStagesForActiveOfficer, stage],
  );

  return (
    <Card className="border-orange-200/70 bg-white/80 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="font-heading text-xl text-slate-900">
            {stageLabel(stage)} {t("stage")}
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            {files.length} {t("filesInStage")}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("tableFileId")}</TableHead>
              <TableHead>{t("tableTitle")}</TableHead>
              <TableHead>{t("tableAssignedTo")}</TableHead>
              <TableHead>{t("tableStatus")}</TableHead>
              <TableHead>{t("tableHistory")}</TableHead>
              <TableHead className="text-right">{t("tableActions")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium text-slate-700">
                  {file.id}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-900">{file.title}</p>
                  <p className="max-w-md truncate text-xs text-slate-500">
                    {file.description}
                  </p>
                </TableCell>
                <TableCell>{file.assignedTo}</TableCell>
                <TableCell>
                  <StatusBadge status={file.status} />
                </TableCell>
                <TableCell className="text-slate-600">
                  {file.history.length} {t("actionsCount")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {canActInStage && stage !== "final" ? (
                      <>
                        <FileApprovalDialog
                          file={file}
                          officerName={activeOfficer.name}
                          onApprove={approveAndForward}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => forwardOnly(file.id)}
                        >
                          {t("forwardOnly")}
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" disabled>
                        {stage === "final" ? t("finalStage") : t("noAccess")}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {files.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-slate-500"
                >
                  {t("noFilesMatch")}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
