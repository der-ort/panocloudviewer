"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import type { ViewerLocale } from "./types";
import { en } from "./en";

const LocaleContext = createContext<ViewerLocale>(en);

export function useLocale(): ViewerLocale {
  return useContext(LocaleContext);
}

interface LocaleProviderProps {
  locale?: ViewerLocale;
  children: ReactNode;
}

export function LocaleProvider({ locale = en, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}
