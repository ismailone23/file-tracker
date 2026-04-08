"use client";

import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Language, useLanguage } from "@/context/LanguageContext";

export function AppHeader() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (value: string | null) => {
    if (!value) {
      return;
    }

    setLanguage(value as Language);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-orange-200/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-4 md:px-6">
        <div>
          <h1 className="font-heading text-lg font-semibold text-slate-900">
            {t("appTitle")}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 bg-white">
              <span className="text-sm">
                {language === "bn" ? "বাংলা" : "English"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="bn">বাংলা</SelectItem>
            </SelectContent>
          </Select>
          <Link
            href="/dashboard"
            className="rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-sm font-medium text-orange-800 transition hover:bg-orange-100"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </header>
  );
}
