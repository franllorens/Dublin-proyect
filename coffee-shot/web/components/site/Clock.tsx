"use client";

import { createContext, useContext } from "react";
import type { DublinNow } from "@/lib/hours";
import { useDublinClock } from "@/lib/useClock";

const Ctx = createContext<DublinNow | null>(null);

export function ClockProvider({ children }: { children: React.ReactNode }) {
  const now = useDublinClock();
  return <Ctx.Provider value={now}>{children}</Ctx.Provider>;
}

export const useNow = () => useContext(Ctx);
