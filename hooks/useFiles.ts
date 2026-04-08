"use client";

import { useMemo } from "react";
import { useFileContext } from "@/context/FileContext";
import { STAGE_ORDER, StageId } from "@/types/file";

export function useFiles(stage?: StageId, searchTerm?: string) {
  const context = useFileContext();

  const sourceFiles = stage ? context.getFilesByStage(stage) : context.files;

  const query = (searchTerm ?? "").trim().toLowerCase();
  const files = useMemo(() => {
    if (!query) {
      return sourceFiles;
    }

    return sourceFiles.filter((file) => {
      return (
        file.id.toLowerCase().includes(query) ||
        file.title.toLowerCase().includes(query) ||
        file.description.toLowerCase().includes(query) ||
        file.assignedTo.toLowerCase().includes(query)
      );
    });
  }, [sourceFiles, query]);

  const stats = useMemo(() => {
    return STAGE_ORDER.reduce(
      (acc, stageId) => {
        acc[stageId] = context.getFilesByStage(stageId).length;
        return acc;
      },
      {} as Record<StageId, number>,
    );
  }, [context]);

  return {
    ...context,
    files,
    stats,
  };
}
