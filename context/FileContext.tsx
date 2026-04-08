"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  defaultStageForOfficer,
  MOCK_FILES,
  MOCK_OFFICERS,
} from "@/lib/mock-data";
import {
  CreateFilePayload,
  Officer,
  STAGE_ORDER,
  StageId,
  TrackedFile,
  WorkflowAction,
} from "@/types/file";

interface FileContextValue {
  files: TrackedFile[];
  officers: Officer[];
  activeOfficer: Officer;
  setActiveOfficer: (officerId: string) => void;
  getFilesByStage: (stage: StageId) => TrackedFile[];
  getAssignableStagesForActiveOfficer: () => StageId[];
  addFile: (payload: CreateFilePayload) => void;
  approveAndForward: (fileId: string, signature: string, note?: string) => void;
  forwardOnly: (fileId: string, note?: string) => void;
}

const FileContext = createContext<FileContextValue | null>(null);

const getNextStage = (stage: StageId): StageId | null => {
  const idx = STAGE_ORDER.indexOf(stage);
  if (idx < 0 || idx === STAGE_ORDER.length - 1) {
    return null;
  }

  return STAGE_ORDER[idx + 1];
};

const buildAction = (
  type: WorkflowAction["type"],
  by: string,
  fromStage: StageId,
  toStage: StageId,
  note?: string,
  signature?: string,
): WorkflowAction => ({
  id: `action-${crypto.randomUUID()}`,
  type,
  by,
  timestamp: new Date().toISOString(),
  fromStage,
  toStage,
  note,
  signature,
});

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<TrackedFile[]>(MOCK_FILES);
  const [activeOfficerId, setActiveOfficerId] = useState<string>(
    MOCK_OFFICERS[0].id,
  );

  const activeOfficer = useMemo(
    () =>
      MOCK_OFFICERS.find((officer) => officer.id === activeOfficerId) ??
      MOCK_OFFICERS[0],
    [activeOfficerId],
  );

  const setActiveOfficer = useCallback((officerId: string) => {
    setActiveOfficerId(officerId);
  }, []);

  const getFilesByStage = useCallback(
    (stage: StageId) => files.filter((file) => file.currentStage === stage),
    [files],
  );

  const getAssignableStagesForActiveOfficer = useCallback(
    () => activeOfficer.allowedStages,
    [activeOfficer.allowedStages],
  );

  const addFile = useCallback((payload: CreateFilePayload) => {
    setFiles((previous) => {
      const sequence = String(previous.length + 1).padStart(3, "0");
      const year = new Date().getFullYear();

      const newFile: TrackedFile = {
        id: `FT-${year}-${sequence}`,
        title: payload.title,
        description: payload.description,
        currentStage: payload.stage,
        assignedTo: payload.assignedTo?.trim() || "Unassigned",
        status: "Pending",
        history: [],
      };

      return [newFile, ...previous];
    });
  }, []);

  const applyTransition = useCallback(
    (
      fileId: string,
      actionType: WorkflowAction["type"],
      signature?: string,
      note?: string,
    ) => {
      setFiles((previous) =>
        previous.map((file) => {
          if (file.id !== fileId) {
            return file;
          }

          const nextStage = getNextStage(file.currentStage);
          if (!nextStage) {
            return file;
          }

          const action = buildAction(
            actionType,
            activeOfficer.name,
            file.currentStage,
            nextStage,
            note,
            signature,
          );

          return {
            ...file,
            currentStage: nextStage,
            assignedTo: "Unassigned",
            status:
              actionType === "approved-forwarded" ? "Approved" : "Forwarded",
            history: [...file.history, action],
          };
        }),
      );
    },
    [activeOfficer.name],
  );

  const approveAndForward = useCallback(
    (fileId: string, signature: string, note?: string) => {
      applyTransition(fileId, "approved-forwarded", signature, note);
    },
    [applyTransition],
  );

  const forwardOnly = useCallback(
    (fileId: string, note?: string) => {
      applyTransition(fileId, "forwarded", undefined, note);
    },
    [applyTransition],
  );

  const value = useMemo(
    () => ({
      files,
      officers: MOCK_OFFICERS,
      activeOfficer,
      setActiveOfficer,
      getFilesByStage,
      getAssignableStagesForActiveOfficer,
      addFile,
      approveAndForward,
      forwardOnly,
    }),
    [
      files,
      activeOfficer,
      setActiveOfficer,
      getFilesByStage,
      getAssignableStagesForActiveOfficer,
      addFile,
      approveAndForward,
      forwardOnly,
    ],
  );

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within FileProvider");
  }

  return context;
}

export function useInitialStageForOfficer() {
  const { activeOfficer } = useFileContext();
  return defaultStageForOfficer(activeOfficer.allowedStages);
}
