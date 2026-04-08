import { Officer, StageId, TrackedFile } from "@/types/file";

export const MOCK_OFFICERS: Officer[] = [
  {
    id: "officer-1",
    name: "Amina Yusuf",
    role: "Reception Officer",
    allowedStages: ["reception"],
  },
  {
    id: "officer-2",
    name: "Rahul Sen",
    role: "Review Officer",
    allowedStages: ["officer"],
  },
  {
    id: "officer-3",
    name: "Marta Klein",
    role: "Manager",
    allowedStages: ["manager"],
  },
  {
    id: "officer-4",
    name: "Noah Ibrahim",
    role: "Records Controller",
    allowedStages: ["final"],
  },
];

const isoNowMinusHours = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

export const MOCK_FILES: TrackedFile[] = [
  {
    id: "FT-2026-001",
    title: "Land Permit - Plot 24A",
    description: "Verification and routing for municipal land permit release.",
    currentStage: "reception",
    assignedTo: "Amina Yusuf",
    status: "Pending",
    history: [],
  },
  {
    id: "FT-2026-002",
    title: "Vendor Contract Renewal",
    description: "Contract review file for annual maintenance vendor.",
    currentStage: "officer",
    assignedTo: "Rahul Sen",
    status: "Forwarded",
    history: [
      {
        id: "action-1",
        type: "forwarded",
        by: "Amina Yusuf",
        timestamp: isoNowMinusHours(18),
        fromStage: "reception",
        toStage: "officer",
      },
    ],
  },
  {
    id: "FT-2026-003",
    title: "Scholarship Approval Batch",
    description:
      "Batch file for scholarship committee recommendation approval.",
    currentStage: "manager",
    assignedTo: "Marta Klein",
    status: "Approved",
    history: [
      {
        id: "action-2",
        type: "approved-forwarded",
        by: "Rahul Sen",
        timestamp: isoNowMinusHours(6),
        fromStage: "officer",
        toStage: "manager",
        signature: "Rahul Sen",
      },
    ],
  },
  {
    id: "FT-2026-004",
    title: "Quarterly Audit File",
    description: "Final archival package for Q1 compliance audit.",
    currentStage: "final",
    assignedTo: "Noah Ibrahim",
    status: "Forwarded",
    history: [
      {
        id: "action-3",
        type: "approved-forwarded",
        by: "Marta Klein",
        timestamp: isoNowMinusHours(2),
        fromStage: "manager",
        toStage: "final",
        signature: "Marta Klein",
      },
    ],
  },
];

export const defaultStageForOfficer = (stages: StageId[]): StageId => stages[0];
