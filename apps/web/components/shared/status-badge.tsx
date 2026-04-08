import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { FileStatus } from "@/types/file";

const statusStyles: Record<FileStatus, string> = {
  Pending: "bg-amber-100 text-amber-900 border-amber-300",
  Approved: "bg-emerald-100 text-emerald-900 border-emerald-300",
  Forwarded: "bg-sky-100 text-sky-900 border-sky-300",
};

export function StatusBadge({ status }: { status: FileStatus }) {
  const { statusLabel } = useLanguage();

  return (
    <Badge variant="secondary" className={statusStyles[status]}>
      {statusLabel(status)}
    </Badge>
  );
}
