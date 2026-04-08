"use client";

import { ReactNode } from "react";
import { FileProvider } from "@/context/FileContext";
import { LanguageProvider } from "@/context/LanguageContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <FileProvider>{children}</FileProvider>
    </LanguageProvider>
  );
}
