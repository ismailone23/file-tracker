"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/context/LanguageContext";
import { CreateFilePayload, STAGE_ORDER, StageId } from "@/types/file";

interface AddFileDialogProps {
  defaultAssignee: string;
  onAddFile: (payload: CreateFilePayload) => void;
}

export function AddFileDialog({
  defaultAssignee,
  onAddFile,
}: AddFileDialogProps) {
  const { t, stageLabel } = useLanguage();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<StageId>("reception");
  const [assignedTo, setAssignedTo] = useState(defaultAssignee);

  const canSubmit = useMemo(
    () => title.trim().length > 2 && description.trim().length > 5,
    [title, description],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    onAddFile({
      title: title.trim(),
      description: description.trim(),
      stage,
      assignedTo: assignedTo.trim() || undefined,
    });

    setOpen(false);
    setTitle("");
    setDescription("");
    setStage("reception");
    setAssignedTo(defaultAssignee);
  };

  const handleStageChange = (value: string | null) => {
    if (!value) {
      return;
    }

    setStage(value as StageId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full" />}>
        {t("addFileToDesk")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNewFile")}</DialogTitle>
          <DialogDescription>{t("addFileDescription")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="file-title"
              className="text-xs font-medium text-slate-600"
            >
              {t("fileTitle")}
            </label>
            <Input
              id="file-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Procurement Clearance - Q2"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="file-description"
              className="text-xs font-medium text-slate-600"
            >
              {t("description")}
            </label>
            <Textarea
              id="file-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-600">
                {t("deskStage")}
              </p>
              <Select value={stage} onValueChange={handleStageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("chooseStage")} />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_ORDER.map((stageId) => (
                    <SelectItem key={stageId} value={stageId}>
                      {stageLabel(stageId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="assigned-to"
                className="text-xs font-medium text-slate-600"
              >
                {t("assignedToOptional")}
              </label>
              <Input
                id="assigned-to"
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {t("addFile")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
