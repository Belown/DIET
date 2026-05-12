import { useEffect, useMemo, useState } from "react";
import { ZONE_VISUALS } from "../../../../../assets/image/image";
import { REGIONS } from "../../chapterData";
import styles from "./DayReportPanel.module.css";
import { useTutorial, type TutorialStep } from "../../hooks/useTutorial";
import TutorialPopover from "../Tutorial/TutorialPopover";

type DayReportPanelProps = {
  dayNumber: 1 | 2 | 3;
  overallAcc: number;
  regionAccs: number[];
  sampledFlags: boolean[];
  onTutorialOpenChange?: (open: boolean) => void;
};

const districtCode = (index: number) => ["UP", "DT", "FZ", "SL"][index] ?? "RG";

type TutorialTarget = "overall" | "districts" | "narrative";

const TUTORIAL_STEPS: TutorialStep<TutorialTarget>[] = [
  {
    target: "overall",
    title: "Overall accuracy",
    body: "This pill summarizes how the model performed across the whole city for this day. Color tells you the confidence band at a glance.",
    offset: { x: -360, y: 120 },
  },
  {
    target: "districts",
    title: "District breakdown",
    body: "Each card shows confidence per district. Watch for unsampled zones — those bars are guesses, not evidence.",
    offset: { x: 120, y: 80 },
  },
  {
    target: "narrative",
    title: "Narrative log",
    body: "Plain-language summary of what the model learned today and what to fix tomorrow. Use the recommendation to guide your next plan.",
    offset: { x: -360, y: 80 },
  },
];

export default function DayReportPanel({ dayNumber, overallAcc, regionAccs, sampledFlags, onTutorialOpenChange }: DayReportPanelProps) {
  const [barValues, setBarValues] = useState([0, 0, 0, 0]);
  const [typedSummary, setTypedSummary] = useState("");

  const tutorial = useTutorial(TUTORIAL_STEPS, {
    enabled: dayNumber === 1,
    onOpenChange: onTutorialOpenChange,
  });

  useEffect(() => {
    setBarValues([0, 0, 0, 0]);
    const timers = REGIONS.map((_, i) =>
      setTimeout(() => {
        setBarValues((prev) => {
          const next = [...prev];
          next[i] = Math.round((regionAccs[i] ?? 0) * 100);
          return next;
        });
      }, i * 120),
    );
    return () => timers.forEach(clearTimeout);
  }, [dayNumber, regionAccs]);

  const overallPct = Math.round(overallAcc * 100);
  const sampledCount = sampledFlags.filter(Boolean).length;
  const overallTone = overallPct >= 75 ? "good" : overallPct >= 60 ? "mid" : "low";

  const suggestedActions = useMemo(() => {
    if (dayNumber === 3) {
      if (overallPct >= 80) return ["Proceed to final verdict and deployment stress test.", "Document why this strategy worked for future retraining cycles."];
      return ["Proceed to final verdict and inspect transfer risk carefully.", "In future runs, expand coverage before increasing sample volume."];
    }

    const actions: string[] = [];
    if (sampledCount < 4) actions.push("Add at least one unsampled district tomorrow.");
    if (overallPct < 65) actions.push("Favor useful context question over noisy signals.");
    if (actions.length === 0) actions.push("Keep broad coverage and avoid overfitting one district.");
    actions.push(`Prepare Day ${dayNumber + 1} mission with balanced distribution.`);
    return actions;
  }, [dayNumber, overallPct, sampledCount]);

  const summaryText = useMemo(() => {
    const strongZones = REGIONS.filter((_, i) => (regionAccs[i] ?? 0) >= 0.75).map((r) => r.label);
    const lowZones = REGIONS.filter((_, i) => (regionAccs[i] ?? 0) < 0.6).map((r) => r.label);
    const unseenZones = REGIONS.filter((_, i) => !sampledFlags[i]).map((r) => r.label);

    const lines: string[] = [];
    lines.push(`Day ${dayNumber} closed.`);
    lines.push(`Dataset coverage: ${sampledCount}/4 districts sampled.`);
    lines.push("");
    if (strongZones.length) lines.push(`Strong confidence in ${strongZones.join(", ")}.`);
    if (lowZones.length) lines.push(`Weak confidence in ${lowZones.join(", ")}.`);
    if (unseenZones.length) lines.push(`Blind spots remain in ${unseenZones.join(", ")}.`);
    lines.push("");
    lines.push(`Recommendation: ${suggestedActions[0]}`);
    if (suggestedActions[1]) lines.push(suggestedActions[1]);
    return lines.join("\n");
  }, [dayNumber, regionAccs, sampledCount, sampledFlags, suggestedActions]);

  useEffect(() => {
    setTypedSummary("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedSummary(summaryText.slice(0, index));
      if (index >= summaryText.length) window.clearInterval(timer);
    }, 14);
    return () => window.clearInterval(timer);
  }, [summaryText]);

  const confidenceLabel = (score: number) => {
    if (score >= 75) return "Strong confidence";
    if (score >= 60) return "Moderate confidence";
    return "Weak confidence";
  };

  return (
    <section className={`${styles.reportRoot} ${tutorial.open ? styles.reportRootTutorialActive : ""}`}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Case File · Temporal Bias Unit</p>
          <h2 className={styles.title}>Day {dayNumber} Investigation Report</h2>
          <p className={styles.subtitle}>
            {dayNumber < 3
              ? "End-of-day model checkpoint before next patrol deployment."
              : "Final field-day report before full city verdict review."}
          </p>
        </div>
        <div
          ref={tutorial.registerTarget("overall")}
          className={tutorial.getTargetClass("overall", `${styles.overallPill} ${styles[`overallPill_${overallTone}`]}`)}
        >
          <span className={styles.overallLabel}>Overall Accuracy</span>
          <strong className={styles.overallValue}>{overallPct}%</strong>
        </div>
      </header>

      <div className={styles.grid}>
        <article
          ref={tutorial.registerTarget("districts")}
          className={tutorial.getTargetClass("districts", styles.sectionCard)}
        >
          <p className={styles.sectionEyebrow}>District Breakdown</p>
          <div className={styles.zoneGrid}>
            {REGIONS.map((region, i) => (
              <div key={region.id} className={styles.zoneCard}>
                <img className={styles.zonePhoto} src={ZONE_VISUALS[i].image} alt={region.label} />
                <div className={styles.zoneInfo}>
                  <div className={styles.zoneTop}>
                    <img className={styles.zoneIcon} src={ZONE_VISUALS[i].icon} alt="" aria-hidden="true" />
                    <span className={styles.zoneLabel} style={{ color: region.color }}>
                      {i === 3 ? (
                        <>
                          <span className={styles.zoneCode}>{districtCode(i)} ·</span>
                          <span className={styles.zoneLabelBreak}>{region.label}</span>
                        </>
                      ) : (
                        `${districtCode(i)} · ${region.label}`
                      )}
                    </span>
                  </div>
                  <p className={styles.zoneScore} style={{ color: region.color }}>{barValues[i]}%</p>
                  <div className={styles.zoneTrack}>
                    <div
                      className={styles.zoneFill}
                      style={{ "--bar-width": `${barValues[i]}%`, background: region.color } as React.CSSProperties}
                    />
                  </div>
                  <p className={styles.zoneState} style={{ color: region.color }}>
                    {confidenceLabel(barValues[i])}
                  </p>
                  {!sampledFlags[i] && <p className={styles.zoneMeta}>Unsampled in committed plan</p>}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article
          ref={tutorial.registerTarget("narrative")}
          className={tutorial.getTargetClass("narrative", styles.sectionCard)}
        >
          <p className={styles.sectionEyebrow}>Narrative Log</p>
          <div className={styles.typewriterPaper}>
            <p className={styles.typewriterText}>{typedSummary}<span className={styles.cursor}>|</span></p>
          </div>

        </article>
      </div>

      {tutorial.step && (
        <TutorialPopover
          open={tutorial.open}
          title={tutorial.step.title}
          body={tutorial.step.body}
          stepIndex={tutorial.stepIndex}
          totalSteps={tutorial.totalSteps}
          style={tutorial.popoverStyle}
          onSkip={tutorial.close}
          onBack={tutorial.goPrev}
          onNext={tutorial.goNext}
          titleId="day-report-tutorial-title"
        />
      )}
    </section>
  );
}
