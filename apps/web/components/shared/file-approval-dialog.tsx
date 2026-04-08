"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrackedFile } from "@/types/file";

interface FileApprovalDialogProps {
  file: TrackedFile;
  officerName: string;
  onApprove: (fileId: string, signature: string, note?: string) => void;
}

export function FileApprovalDialog({
  file,
  officerName,
  onApprove,
}: FileApprovalDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [signature, setSignature] = useState(officerName);
  const [note, setNote] = useState("");

  const canSubmit = useMemo(() => signature.trim().length > 1, [signature]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onApprove(file.id, signature.trim(), note.trim() || undefined);
    setOpen(false);
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        {t("approveForward")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("approveDialogTitle")} {file.id}
          </DialogTitle>
          <DialogDescription>{t("approveDialogDescription")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor={`signature-${file.id}`}
              className="text-xs font-medium text-slate-600"
            >
              {t("signatureName")}
            </label>
            <Input
              id={`signature-${file.id}`}
              value={signature}
              onChange={(event) => setSignature(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`note-${file.id}`}
              className="text-xs font-medium text-slate-600"
            >
              {t("approvalNoteOptional")}
            </label>
            <Textarea
              id={`note-${file.id}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("approvalNotePlaceholder")}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {t("confirmApproval")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
