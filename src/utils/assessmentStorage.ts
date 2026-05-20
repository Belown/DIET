export type AssessmentEntry = {
  mode: "pre" | "post";
  timestamp: string;
  answers: Record<string, string>;
  confidence: Record<string, number>;
  understanding: Record<string, number>;
  feedback?: Record<number, number>;
  openEnded?: Record<number, string>;
};

const STORAGE_KEY = "diet_assessment_log";

export function saveAssessment(entry: AssessmentEntry): void {
  const all = loadAllAssessments();
  all.push(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    console.error("[DIET] Could not persist assessment result to localStorage");
  }
  console.log("[DIET] Assessment result logged:", entry);
}

export function loadAllAssessments(): AssessmentEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AssessmentEntry[]) : [];
  } catch {
    return [];
  }
}

export function hasCompleted(mode: "pre" | "post"): boolean {
  return loadAllAssessments().some((e) => e.mode === mode);
}
