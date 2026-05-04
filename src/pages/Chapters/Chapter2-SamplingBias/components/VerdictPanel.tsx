import styles from "../Chapter2SamplingBias.module.css";
import { REGIONS } from "../chapterData";

type VerdictPanelProps = {
  overallAcc: number;
  otherCityOvr: number;
  regionAccs: number[];
  otherCityAccs: number[];
  sampledFlags: boolean[];
  committedCount: number;
  pct: (value: number) => string;
  onRestart: () => void;
};

export default function VerdictPanel({
  overallAcc,
  otherCityOvr,
  regionAccs,
  otherCityAccs,
  sampledFlags,
  committedCount,
  pct,
  onRestart,
}: VerdictPanelProps) {
  return (
    <>
      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Your city · overall {pct(overallAcc)}</p>
        <h2 className={styles.h2}>Accuracy by district</h2>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {REGIONS.map((r, i) => (
            <div key={r.id} style={{ color: "var(--rui-slate)", fontSize: 14 }}>
              <strong style={{ color: r.color }}>{r.label}</strong>: {pct(regionAccs[i])}
              {!sampledFlags[i] ? " (not sampled in 3-day plan)" : ""}
            </div>
          ))}
        </div>
        <p className={styles.deployNote}>Committed detective missions: {committedCount}</p>
      </div>

      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Deployed to a neighboring city · overall {pct(otherCityOvr)}</p>
        <h2 className={styles.h2}>Does the model travel?</h2>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {REGIONS.map((r, i) => (
            <div key={r.id} style={{ color: "var(--rui-slate)", fontSize: 14 }}>
              <strong style={{ color: r.color }}>{r.label}</strong>: {pct(otherCityAccs[i])}
            </div>
          ))}
        </div>
        <p className={styles.deployNote}>
          {otherCityOvr >= 0.70
            ? "Transfers reasonably — but ongoing monitoring is still essential."
            : "Breaks in the new city. A model tuned on one city needs retraining before deployment elsewhere."}
        </p>
      </div>

      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Personal Verdict</p>
        <h2 className={styles.h2}>What does this mean for you?</h2>
        <p className={styles.panelBody}>
          {overallAcc >= 0.80
            ? "Your careful data collection built a model that sees clearly. The machine that would have convicted you no longer exists — replaced by one that understands New Eden's diversity. You changed the future."
            : overallAcc >= 0.60
            ? "The model is better than before, but still makes mistakes. Some regions remain under-sampled, some questions added noise. The machine might still misjudge someone — perhaps even the version of you standing in that street ten years from now."
            : "The model barely improved. Blind spots remain, biased questions poisoned the training data, and whole districts were never visited. The machine that convicts you is still being built — and you just helped train it."}
        </p>
      </div>

      <div className={styles.continueRow}>
        <p className={styles.continueHint}>Done reviewing. What would you like to do?</p>
        <button type="button" className={styles.continueBtn} onClick={onRestart}>
          Return to Day 1 — try a different strategy
        </button>
      </div>
    </>
  );
}
