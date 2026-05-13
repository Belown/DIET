import { useEffect, useMemo, useState } from "react";
import { ZONE_VISUALS } from "../../../../../assets/image/image";
import shared from "../../../../../styles/shared.module.css";
import { REGIONS } from "../../chapterData";
import styles from "./DayReportPanel.module.css";
import { useTutorial, type TutorialStep } from "../../hooks/useTutorial";
import TutorialPopover from "../Tutorial/TutorialPopover";
import TutorialDebugOverlay from "../Tutorial/TutorialDebugOverlay";

type DayReportPanelProps = {
  dayNumber: 1 | 2 | 3;
  overallAcc: number;
  regionAccs: number[];
  sampledFlags: boolean[];
  continueLabel?: string;
  onContinue?: () => void;
  tutorialEnabled?: boolean;
  tutorialDebugEnabled?: boolean;
  onTutorialOpenChange?: (open: boolean) => void;
  onTutorialDismiss?: () => void;
};

const districtCode = (index: number) => ["UP", "DT", "FZ", "SL"][index] ?? "RG";
const districtName = (label: string) => label.replace(/\s+/g, " ").trim();

type TutorialTarget = "overall" | "districts" | "narrative" | "continue" | "help";

const TUTORIAL_STEPS: TutorialStep<TutorialTarget>[] = [
  {
    target: "overall",
    title: "Overall checkpoint",
    body: "This is the model's current accuracy after today's committed patrols. Low scores mean the dataset still has blind spots.",
    placement: "right",
  },
  {
    target: "districts",
    title: "District breakdown",
    body: "Each district shows its own confidence score. Compare sampled and unsampled districts before planning the next day.",
    placement: "right",
  },
  {
    target: "narrative",
    title: "Audit receipt",
    body: "This receipt shows the totals, the districts needing attention, and the next action to take.",
    placement: "left",
  },
  {
    target: "continue",
    title: "Proceed to the next day",
    body: "Use this button to move from the report into the next briefing.",
    placement: "top",
  },
  {
    target: "help",
    title: "Replay the guide",
    body: "Use this help button any time you want to reopen the day report walkthrough from the beginning.",
    placement: "bottom",
  },
];

export default function DayReportPanel({
  dayNumber,
  overallAcc,
  regionAccs,
  sampledFlags,
  continueLabel,
  onContinue,
  tutorialEnabled = true,
  tutorialDebugEnabled = false,
  onTutorialOpenChange,
  onTutorialDismiss,
}: DayReportPanelProps) {
  const [barValues, setBarValues] = useState([0, 0, 0, 0]);

  const tutorial = useTutorial(TUTORIAL_STEPS, {
    enabled: tutorialEnabled && dayNumber === 1,
    debugEnabled: tutorialDebugEnabled,
    onOpenChange: onTutorialOpenChange,
    onDismiss: onTutorialDismiss,
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
  const strongZones = useMemo(
    () => REGIONS.filter((_, i) => (regionAccs[i] ?? 0) >= 0.75).map((r) => districtName(r.label)),
    [regionAccs],
  );
  const lowZones = useMemo(
    () => REGIONS.filter((_, i) => (regionAccs[i] ?? 0) < 0.6).map((r) => districtName(r.label)),
    [regionAccs],
  );
  const unseenZones = useMemo(
    () => REGIONS.filter((_, i) => !sampledFlags[i]).map((r) => districtName(r.label)),
    [sampledFlags],
  );
  const attentionTone = unseenZones.length > 0 || overallPct < 60 ? "critical" : lowZones.length > 0 ? "warning" : "stable";
  const attentionTitle =
    unseenZones.length > 0
      ? "Coverage blind spot"
      : lowZones.length > 0
        ? "Weak district confidence"
        : "No urgent gaps";
  const attentionDetail =
    unseenZones.length > 0
      ? unseenZones.join(", ")
      : lowZones.length > 0
        ? lowZones.join(", ")
        : strongZones.length > 0
          ? strongZones.join(", ")
          : "All sampled districts";

  const suggestedActions = useMemo(() => {
    if (dayNumber === 3) {
      if (overallPct >= 80) return ["Proceed to final verdict and deployment stress test.", "Document why this strategy worked for future retraining cycles."];
      return ["Proceed to final verdict and inspect transfer risk carefully.", "In future runs, expand coverage before increasing sample volume."];
    }

    const actions: string[] = [];
    if (sampledCount < 4) actions.push("Add at least one unsampled district tomorrow.");
    if (overallPct < 65) actions.push("Revisit which candidate signals deserve space in tomorrow's dataset.");
    if (actions.length === 0) actions.push("Keep broad coverage and avoid overfitting one district.");
    actions.push(`Prepare Day ${dayNumber + 1} mission with balanced distribution.`);
    return actions;
  }, [dayNumber, overallPct, sampledCount]);

  const confidenceLabel = (score: number) => {
    if (score >= 75) return "Strong confidence";
    if (score >= 60) return "Moderate confidence";
    return "Weak confidence";
  };

  return (
    <section className={`${styles.reportRoot} ${tutorial.open ? styles.reportRootTutorialActive : ""}`}>
      <div className={styles.helpButtonSlot}>
        <div className={tutorial.getTargetClass("help", styles.helpButtonTarget)}>
          <button
            type="button"
            className={styles.helpButton}
            onClick={tutorial.restart}
            aria-label="Replay day report intro"
            data-tooltip="Replay intro tutorial"
          >
            ?
          </button>
        </div>
      </div>
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
          className={tutorial.getTargetClass("overall", `${styles.overallPill} ${styles[`overallPill_${overallTone}`]}`)}
        >
          <span className={styles.overallLabel}>Overall Accuracy</span>
          <strong className={styles.overallValue}>{overallPct}%</strong>
        </div>
      </header>

      <div className={styles.grid}>
        <article
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
          className={tutorial.getTargetClass("narrative", styles.sectionCard)}
        >
          <p className={styles.sectionEyebrow}>Audit Receipt</p>
          <div className={styles.receiptPaper}>
            <div className={styles.receiptHeader}>
              <span>Day {dayNumber} closed</span>
              <strong className={styles.receiptStamp}>Filed</strong>
            </div>

            <div className={styles.receiptRows} aria-label="Report totals">
              <div className={styles.receiptRow}>
                <span>Overall accuracy</span>
                <strong>{overallPct}%</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>District coverage</span>
                <strong>{sampledCount}/4</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>Strong districts</span>
                <strong>{strongZones.length || 0}</strong>
              </div>
            </div>

            <div className={`${styles.attentionBox} ${styles[`attentionBox_${attentionTone}`]}`}>
              <strong>{attentionTitle}</strong>
              <p>{attentionDetail}</p>
            </div>

            <div className={styles.receiptSection}>
              <span className={styles.receiptSectionLabel}>Next action</span>
              <p>{suggestedActions[0]}</p>
              {suggestedActions[1] && <small>{suggestedActions[1]}</small>}
            </div>
          </div>
        </article>
      </div>

      {onContinue && continueLabel && (
        <div className={styles.continueRow}>
          <p className={shared.continueHint}>
            {dayNumber < 3 ? "Report filed. Move to the next patrol day when ready." : "Final field report filed. Review the closing verdict."}
          </p>
          <button
            type="button"
            className={tutorial.getTargetClass("continue", shared.continueBtn)}
            onClick={onContinue}
          >
            {continueLabel}
          </button>
        </div>
      )}

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
          popoverRef={tutorial.registerPopover}
        />
      )}
      {tutorialDebugEnabled && tutorial.open && <TutorialDebugOverlay info={tutorial.debugInfo} />}
    </section>
  );
}
