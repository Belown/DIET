import { createContext, useContext, useState, type ReactNode } from "react";

export type BoundaryParams = { slope: number; intercept: number };

type SimCtx = {
  b1: BoundaryParams;
  setB1: (b: BoundaryParams) => void;
  b2: BoundaryParams;
  setB2: (b: BoundaryParams) => void;
  b3: BoundaryParams;
  setB3: (b: BoundaryParams) => void;
  phase2Unlocked: boolean;
  setPhase2Unlocked: (v: boolean) => void;
  phase3Unlocked: boolean;
  setPhase3Unlocked: (v: boolean) => void;
};

const SimulatorContext = createContext<SimCtx | null>(null);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [b1, setB1] = useState<BoundaryParams>({ slope: 0, intercept: 60 });
  const [b2, setB2] = useState<BoundaryParams>({ slope: 0, intercept: 60 });
  const [b3, setB3] = useState<BoundaryParams>({ slope: 0, intercept: 60 });
  const [phase2Unlocked, setPhase2Unlocked] = useState(false);
  const [phase3Unlocked, setPhase3Unlocked] = useState(false);

  return (
    <SimulatorContext.Provider
      value={{ b1, setB1, b2, setB2, b3, setB3, phase2Unlocked, setPhase2Unlocked, phase3Unlocked, setPhase3Unlocked }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator(): SimCtx {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error("useSimulator must be inside SimulatorProvider");
  return ctx;
}
