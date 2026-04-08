"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { FileStatus, StageId } from "@/types/file";

export type Language = "en" | "bn";

type TranslationKey =
  | "appTitle"
  | "tagline"
  | "home"
  | "language"
  | "activeOfficer"
  | "selectOfficer"
  | "workflow"
  | "addFileToDesk"
  | "createNewFile"
  | "addFileDescription"
  | "fileTitle"
  | "description"
  | "deskStage"
  | "chooseStage"
  | "assignedToOptional"
  | "addFile"
  | "stage"
  | "filesInStage"
  | "searchPlaceholder"
  | "tableFileId"
  | "tableTitle"
  | "tableAssignedTo"
  | "tableStatus"
  | "tableHistory"
  | "tableActions"
  | "actionsCount"
  | "approveForward"
  | "forwardOnly"
  | "finalStage"
  | "noAccess"
  | "noFilesMatch"
  | "approveDialogTitle"
  | "approveDialogDescription"
  | "signatureName"
  | "approvalNoteOptional"
  | "approvalNotePlaceholder"
  | "confirmApproval";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  stageLabel: (stage: StageId) => string;
  statusLabel: (status: FileStatus) => string;
}

const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  en: {
    appTitle: "File Tracking System",
    tagline: "Approve, sign, and forward in one flow.",
    home: "Home",
    language: "Language",
    activeOfficer: "Active Officer",
    selectOfficer: "Select officer",
    workflow: "Workflow",
    addFileToDesk: "Add File To Desk",
    createNewFile: "Create New File",
    addFileDescription:
      "Add a new file and place it directly into the selected desk.",
    fileTitle: "File Title",
    description: "Description",
    deskStage: "Desk / Stage",
    chooseStage: "Choose stage",
    assignedToOptional: "Assigned To (Optional)",
    addFile: "Add File",
    stage: "Stage",
    filesInStage: "file(s) currently in this stage.",
    searchPlaceholder: "Search file ID, title, assignee",
    tableFileId: "File ID",
    tableTitle: "Title",
    tableAssignedTo: "Assigned To",
    tableStatus: "Status",
    tableHistory: "History",
    tableActions: "Actions",
    actionsCount: "action(s)",
    approveForward: "Approve & Forward",
    forwardOnly: "Forward Only",
    finalStage: "Final Stage",
    noAccess: "No Access",
    noFilesMatch: "No files matched this stage and search term.",
    approveDialogTitle: "Approve",
    approveDialogDescription:
      "Sign this file and forward it to the next stage.",
    signatureName: "Signature Name",
    approvalNoteOptional: "Approval Note (Optional)",
    approvalNotePlaceholder: "Any instructions or comments for the next desk",
    confirmApproval: "Confirm Approval",
  },
  bn: {
    appTitle: "ফাইল ট্র্যাকিং সিস্টেম",
    tagline: "একটি ফ্লোতেই অনুমোদন, স্বাক্ষর এবং ফরওয়ার্ড করুন।",
    home: "হোম",
    language: "ভাষা",
    activeOfficer: "সক্রিয় কর্মকর্তা",
    selectOfficer: "কর্মকর্তা নির্বাচন করুন",
    workflow: "ওয়ার্কফ্লো",
    addFileToDesk: "ডেস্কে ফাইল যোগ করুন",
    createNewFile: "নতুন ফাইল তৈরি করুন",
    addFileDescription: "নতুন ফাইল যোগ করে সরাসরি নির্বাচিত ডেস্কে পাঠান।",
    fileTitle: "ফাইলের শিরোনাম",
    description: "বিবরণ",
    deskStage: "ডেস্ক / ধাপ",
    chooseStage: "ধাপ নির্বাচন করুন",
    assignedToOptional: "বরাদ্দপ্রাপ্ত (ঐচ্ছিক)",
    addFile: "ফাইল যোগ করুন",
    stage: "ধাপ",
    filesInStage: "টি ফাইল বর্তমানে এই ধাপে রয়েছে।",
    searchPlaceholder: "ফাইল আইডি, শিরোনাম, বরাদ্দপ্রাপ্ত দিয়ে খুঁজুন",
    tableFileId: "ফাইল আইডি",
    tableTitle: "শিরোনাম",
    tableAssignedTo: "বরাদ্দপ্রাপ্ত",
    tableStatus: "স্ট্যাটাস",
    tableHistory: "ইতিহাস",
    tableActions: "অ্যাকশন",
    actionsCount: "টি অ্যাকশন",
    approveForward: "অনুমোদন ও ফরওয়ার্ড",
    forwardOnly: "শুধু ফরওয়ার্ড",
    finalStage: "চূড়ান্ত ধাপ",
    noAccess: "অ্যাক্সেস নেই",
    noFilesMatch: "এই ধাপ ও সার্চ অনুযায়ী কোনো ফাইল পাওয়া যায়নি।",
    approveDialogTitle: "অনুমোদন",
    approveDialogDescription: "ফাইলে স্বাক্ষর করে পরবর্তী ধাপে ফরওয়ার্ড করুন।",
    signatureName: "স্বাক্ষরের নাম",
    approvalNoteOptional: "অনুমোদন নোট (ঐচ্ছিক)",
    approvalNotePlaceholder: "পরবর্তী ডেস্কের জন্য নির্দেশনা বা মন্তব্য",
    confirmApproval: "অনুমোদন নিশ্চিত করুন",
  },
};

const STAGE_LABELS: Record<Language, Record<StageId, string>> = {
  en: {
    reception: "Reception",
    officer: "Officer Desk",
    manager: "Manager Review",
    final: "Final Records",
  },
  bn: {
    reception: "রিসেপশন",
    officer: "অফিসার ডেস্ক",
    manager: "ম্যানেজার রিভিউ",
    final: "ফাইনাল রেকর্ডস",
  },
};

const STATUS_LABELS: Record<Language, Record<FileStatus, string>> = {
  en: {
    Pending: "Pending",
    Approved: "Approved",
    Forwarded: "Forwarded",
  },
  bn: {
    Pending: "অপেক্ষমাণ",
    Approved: "অনুমোদিত",
    Forwarded: "ফরওয়ার্ডেড",
  },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => TRANSLATIONS[language][key],
      stageLabel: (stage: StageId) => STAGE_LABELS[language][stage],
      statusLabel: (status: FileStatus) => STATUS_LABELS[language][status],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
