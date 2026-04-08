"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  defaultStageForOfficer,
  MOCK_FILES,
  MOCK_OFFICERS,
} from "@/lib/mock-data";
import { apiRequest, API_URL } from "@/lib/api";
import {
  CreateFilePayload,
  Officer,
  StageId,
  TrackedFile,
  WorkflowAction,
} from "@/types/file";

interface FileContextValue {
  files: TrackedFile[];
  officers: Officer[];
  activeOfficer: Officer;
  feedback: {
    type: "success" | "error";
    message: string;
  } | null;
  clearFeedback: () => void;
  setActiveOfficer: (officerId: string) => void;
  getFilesByStage: (stage: StageId) => TrackedFile[];
  getAssignableStagesForActiveOfficer: () => StageId[];
  addFile: (payload: CreateFilePayload) => void;
  approveAndForward: (fileId: string, signature: string, note?: string) => void;
  forwardOnly: (fileId: string, note?: string) => void;
}

const FileContext = createContext<FileContextValue | null>(null);

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<TrackedFile[]>(MOCK_FILES);
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [token, setToken] = useState<string>("");
  const [activeOfficerId, setActiveOfficerId] = useState<string>(
    MOCK_OFFICERS[0].id,
  );
  const wsRef = useRef<WebSocket | null>(null);

  const activeOfficer = useMemo(
    () =>
      officers.find((officer) => officer.id === activeOfficerId) ?? officers[0],
    [activeOfficerId, officers],
  );

  const fetchFiles = useCallback(async (authToken: string) => {
    const response = await apiRequest<{ files: TrackedFile[] }>("/files", {
      token: authToken,
    });
    setFiles(response.files);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const getErrorMessage = useCallback((error: unknown) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Request failed. Please try again.";
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  const authenticateOfficer = useCallback(async (officer: Officer) => {
    if (!officer.email) {
      throw new Error("Selected officer is missing an email for login.");
    }

    const response = await apiRequest<{
      token: string;
      user: {
        id: string;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: officer.email,
        password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD ?? "ChangeMe123!",
      }),
    });

    setToken(response.token);
    return response.token;
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await apiRequest<{
          users: {
            id: string;
            name: string;
            email: string;
            role: string;
            allowedStages: StageId[];
          }[];
        }>("/officers");

        if (!mounted || response.users.length === 0) {
          return;
        }

        const mapped: Officer[] = response.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          allowedStages: user.allowedStages,
        }));

        setOfficers(mapped);
        setActiveOfficerId((prev) => {
          return mapped.some((item) => item.id === prev) ? prev : mapped[0].id;
        });
      } catch {
        // Keep local mock mode when API is unavailable.
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeOfficer) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const authToken = await authenticateOfficer(activeOfficer);
        if (cancelled) {
          return;
        }
        await fetchFiles(authToken);
      } catch {
        // Keep existing in-memory state if backend auth is unavailable.
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeOfficer, authenticateOfficer, fetchFiles]);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsBase = API_URL.replace(/^http/, "ws");
    const socket = new WebSocket(`${wsBase}/ws`);
    wsRef.current = socket;

    socket.addEventListener("message", async () => {
      try {
        await fetchFiles(token);
      } catch {
        // Ignore transient websocket refresh errors.
      }
    });

    return () => {
      socket.close();
    };
  }, [fetchFiles, token]);

  const setActiveOfficer = useCallback((officerId: string) => {
    setActiveOfficerId(officerId);
  }, []);

  const getFilesByStage = useCallback(
    (stage: StageId) => files.filter((file) => file.currentStage === stage),
    [files],
  );

  const getAssignableStagesForActiveOfficer = useCallback(() => {
    return activeOfficer?.allowedStages ?? [];
  }, [activeOfficer]);

  const addFile = useCallback(
    async (payload: CreateFilePayload) => {
      if (!token) {
        return;
      }

      try {
        const response = await apiRequest<{ file: TrackedFile }>("/files", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });

        setFiles((previous) => [response.file, ...previous]);
        setFeedback({
          type: "success",
          message: `File ${response.file.id} added successfully.`,
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: getErrorMessage(error),
        });
      }
    },
    [getErrorMessage, token],
  );

  const applyTransition = useCallback(
    (
      fileId: string,
      actionType: WorkflowAction["type"],
      signature?: string,
      note?: string,
    ) => {
      if (!token) {
        return;
      }

      void apiRequest<{ file: TrackedFile }>(`/files/${fileId}/forward`, {
        method: "POST",
        token,
        body: JSON.stringify({
          actionType,
          signature,
          note,
        }),
      })
        .then((response) => {
          setFiles((previous) =>
            previous.map((file) => {
              if (file.id === fileId) {
                return response.file;
              }

              return file;
            }),
          );
          setFeedback({
            type: "success",
            message: `File ${response.file.id} moved to ${response.file.currentStage}.`,
          });
        })
        .catch((error) => {
          setFeedback({
            type: "error",
            message: getErrorMessage(error),
          });
        });
    },
    [getErrorMessage, token],
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
      officers,
      activeOfficer,
      feedback,
      clearFeedback,
      setActiveOfficer,
      getFilesByStage,
      getAssignableStagesForActiveOfficer,
      addFile,
      approveAndForward,
      forwardOnly,
    }),
    [
      files,
      officers,
      activeOfficer,
      feedback,
      clearFeedback,
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
