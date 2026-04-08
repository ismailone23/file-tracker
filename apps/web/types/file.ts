export const STAGE_ORDER = [
  "reception",
  "officer",
  "manager",
  "final",
] as const;

export type StageId = (typeof STAGE_ORDER)[number];

export const STAGE_LABELS: Record<StageId, string> = {
  reception: "Reception",
  officer: "Officer Desk",
  manager: "Manager Review",
  final: "Final Records",
};

export type FileStatus = "Pending" | "Approved" | "Forwarded";

export type WorkflowActionType = "approved-forwarded" | "forwarded";

export interface WorkflowAction {
  id: string;
  type: WorkflowActionType;
  by: string;
  timestamp: string;
  fromStage: StageId;
  toStage: StageId;
  note?: string;
  signature?: string;
}

export interface TrackedFile {
  id: string;
  title: string;
  description: string;
  currentStage: StageId;
  assignedTo: string;
  status: FileStatus;
  history: WorkflowAction[];
}

export interface CreateFilePayload {
  title: string;
  description: string;
  stage: StageId;
  assignedTo?: string;
}

export interface Officer {
  id: string;
  name: string;
  email?: string;
  role: string;
  allowedStages: StageId[];
}
