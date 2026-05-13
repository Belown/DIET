import styles from "./MissionPlanner.module.css";
import shared from "../../../../../styles/shared.module.css";
import { BUDGET_VISUALS, POPULATION_IMAGES, QUESTION_IMAGES, ZONE_VISUALS } from "../../../../../assets/image/image";
import { DAILY_BUDGET, QUESTION_OPTIONS, REGIONS } from "../../chapterData";
import type { MissionPlan, PopulationOption, QuestionKey, QuestionOption } from "../../types";
import { useTutorial, type TutorialStep } from "../../hooks/useTutorial";
import TutorialPopover from "../Tutorial/TutorialPopover";

type SelectedQuestionInfo = QuestionOption & { line: string };

type MissionPlannerProps = {
  currentDay: number;
  currentPlans: MissionPlan[];
  dayLocked: boolean[];
  spentToday: number;
  remainToday: number;
  planPopulation: PopulationOption;
  planZones: boolean[];
  planQuestions: QuestionKey[];
  selectedQuestionInfos: SelectedQuestionInfo[];
  zoneCount: number;
  draftCost: number;
  canAddPlan: boolean;
  togglePlanZone: (index: number, checked: boolean) => void;
  setPlanPopulation: (population: PopulationOption) => void;
  toggleQuestion: (key: QuestionKey, checked: boolean) => void;
  addPlan: () => void;
  removePlan: (id: string) => void;
  sendDetectiveAndAdvance: () => void;
  onTutorialOpenChange?: (open: boolean) => void;
};

const getPopulationLabel = (population: PopulationOption) => {
  if (population === 100) return "Small sweep";
  if (population === 500) return "Focused campaign";
  return "Mass operation";
};

const DAY_RANKS = ["Rookie Sweep", "Field Operator", "Final Command"] as const;

const POPULATION_TIERS: Array<{ value: PopulationOption; title: string; desc: string }> = [
  { value: 100, title: "Scout Sweep", desc: "Cheap, fast, narrow signal" },
  { value: 500, title: "Field Campaign", desc: "Balanced coverage push" },
  { value: 1000, title: "Citywide Dragnet", desc: "High power, high cost" },
];

const MANDATORY_SIGNALS = [
  {
    label: "Night Activity",
    code: "NA",
    desc: "Fixed record used for every sampled resident.",
  },
  {
    label: "Group Size",
    code: "GS",
    desc: "Fixed record used for every sampled resident.",
  },
] as const;

type TutorialTarget = "intro" | "budget" | "coverage" | "sample" | "signals" | "queue";

const TUTORIAL_STEPS: TutorialStep<TutorialTarget>[] = [
  {
    target: "intro",
    title: "Mission overview",
    body: "This card tells you the day and objective. Use it as your quick status read before building a sortie.",
    placement: "bottom",
  },
  {
    target: "budget",
    title: "Budget",
    body: "This card tracks your daily investigation points, spent budget, and draft cost. A mission must fit the budget before it can be queued.",
    placement: "left",
  },
  {
    target: "coverage",
    title: "Coverage",
    body: "Choose which zones the detective should visit. Wider coverage helps the model learn from the whole city instead of one narrow area.",
    placement: "bottom",
  },
  {
    target: "sample",
    title: "Sample size",
    body: "Pick how many residents to sample. Larger samples cost more, but they give the model stronger evidence.",
    placement: "right",
  },
  {
    target: "signals",
    title: "Signals",
    body: "Night Activity and Group Size are mandatory records. Optional questions cost extra, and some add useful context while others add noise or bias.",
    placement: "top",
  },
  {
    target: "queue",
    title: "Operation stack",
    body: "Add the current sortie to today's queue, review what will be collected, then deploy the detective when the plan is ready.",
    placement: "left",
  },
];

const DAY_COPY = [
  {
    kicker: "Day 1 / 3 — Mission Control",
    title: "The investigation begins.",
    desc: "Send your detectives into the city to gather clues. Choose which districts to visit, how many people to talk to, and what questions to ask.",
  },
  {
    kicker: "Day 2 / 3 — Mission Control",
    title: "The first report reveals missing clues.",
    desc: "Use yesterday's results to decide where your detectives should search next.",
  },
  {
    kicker: "Day 3 / 3 — Final Collection Day",
    title: "This is your last chance to complete the evidence.",
    desc: "Fill the remaining gaps before the AI system is used in court.",
  },
] as const;

const QUESTION_VISUALS: Record<QuestionKey, { icon: string; tag: string }> = {
  "daily-routine": { icon: QUESTION_IMAGES["daily-routine"], tag: "Useful context" },
  "phone-model": { icon: QUESTION_IMAGES["phone-model"], tag: "Useless noise" },
  "past-police-stops": { icon: QUESTION_IMAGES["past-police-stops"], tag: "Bias trap" },
};

export default function MissionPlanner({
  currentDay,
  currentPlans,
  dayLocked,
  spentToday,
  remainToday,
  planPopulation,
  planZones,
  planQuestions,
  selectedQuestionInfos,
  zoneCount,
  draftCost,
  canAddPlan,
  togglePlanZone,
  setPlanPopulation,
  toggleQuestion,
  addPlan,
  removePlan,
  sendDetectiveAndAdvance,
  onTutorialOpenChange,
}: MissionPlannerProps) {
  const locked = dayLocked[currentDay];
  const tutorial = useTutorial(TUTORIAL_STEPS, {
    enabled: currentDay === 0 && !locked,
    onOpenChange: onTutorialOpenChange,
  });
  const remainingAfterAdd = remainToday - draftCost;
  const budgetUsed = Math.min(100, Math.round((spentToday / DAILY_BUDGET) * 100));
  const coverageProgress = Math.round((zoneCount / REGIONS.length) * 100);
  const selectedDistricts = REGIONS.filter((_, i) => planZones[i]).map((region) => region.label);
  const dayCopy = DAY_COPY[currentDay];

  return (
    <div className={`${styles.missionDashboard} ${tutorial.open ? styles.missionDashboardTutorial : ""}`}>
      <section
        className={styles.missionHeader}
      >
        <div
          ref={tutorial.registerTarget("intro")}
          className={tutorial.getTargetClass("intro", styles.commandIntro)}
        >
          <div className={styles.commandMeta}>
            <span className={styles.dayBadge}>{dayCopy.kicker}</span>
            <span className={styles.rankBadge}>{DAY_RANKS[currentDay]}</span>
          </div>
          <h2 className={styles.h2}>{dayCopy.title}</h2>
          <p className={styles.panelBody}>{dayCopy.desc}</p>
        </div>

        <div
          ref={tutorial.registerTarget("budget")}
          className={tutorial.getTargetClass("budget", styles.budgetPanel)}
          aria-label="Budget status"
        >
          <div className={styles.budgetRing} style={{ ["--budget-used" as string]: `${budgetUsed}%` }}>
            <span>{remainToday}</span>
            <small>IP left</small>
          </div>
          <div className={styles.budgetStats}>
            <span><img src={BUDGET_VISUALS.budget} alt="" aria-hidden="true" /> Budget {DAILY_BUDGET}</span>
            <span><img src={BUDGET_VISUALS.spent} alt="" aria-hidden="true" /> Spent {spentToday}</span>
            <span><img src={BUDGET_VISUALS.draft} alt="" aria-hidden="true" /> Draft {draftCost}</span>
          </div>
        </div>
      </section>

      <div className={styles.missionGrid}>
        <section
          ref={tutorial.registerTarget("coverage")}
          className={tutorial.getTargetClass("coverage", `${styles.missionCard} ${styles.missionCardWide}`)}
        >
          <div className={styles.missionCardHeader}>
            <div>
              <p className={styles.panelEyebrow}>Coverage</p>
              <h3 className={styles.missionCardTitle}>Zones to search</h3>
            </div>
            <span className={styles.missionPill}>{coverageProgress}% map</span>
          </div>

          <div className={styles.missionRegionGrid}>
            {REGIONS.map((r, i) => (
              <label
                key={r.id}
                className={`${styles.regionCard} ${styles.missionRegionCard} ${planZones[i] ? styles.regionCardOn : ""}`}
              >
                <input
                  type="checkbox"
                  checked={planZones[i]}
                  onChange={(e) => togglePlanZone(i, e.target.checked)}
                  disabled={locked}
                />
                <img className={styles.regionImage} src={ZONE_VISUALS[i].image} alt={r.label} />
                <span className={styles.regionTopline}>
                  <img src={ZONE_VISUALS[i].icon} alt="" aria-hidden="true" className={styles.regionMiniIcon} />
                  <span className={styles.regionCode}>Zone {i + 1}</span>
                </span>
                <span className={styles.regionName}>{r.label}</span>
                <span className={styles.regionDesc}>{r.desc}</span>
                <span className={styles.regionStatus}>{planZones[i] ? "Deployed" : "Standby"}</span>
              </label>
            ))}
          </div>
        </section>

        <section
          ref={tutorial.registerTarget("sample")}
          className={tutorial.getTargetClass("sample", styles.missionCard)}
        >
          <div className={styles.missionCardHeader}>
            <div>
              <p className={styles.panelEyebrow}>Sample</p>
              <h3 className={styles.missionCardTitle}>Population volume</h3>
            </div>
            <span className={styles.missionPill}>{getPopulationLabel(planPopulation)}</span>
          </div>

          <div className={styles.sampleTierGrid}>
            {POPULATION_TIERS.map((tier, index) => (
              <button
                key={tier.value}
                type="button"
                className={`${styles.sampleTier} ${planPopulation === tier.value ? styles.sampleTierOn : ""}`}
                onClick={() => setPlanPopulation(tier.value)}
                disabled={locked}
              >
                <img src={POPULATION_IMAGES[tier.value]} alt="" aria-hidden="true" className={styles.sampleTierIcon} />
                <span className={styles.sampleTierKicker}>Level {index + 1}</span>
                <strong>{tier.value}</strong>
                <span>{tier.title}</span>
                <small>{tier.desc}</small>
              </button>
            ))}
          </div>
        </section>

        <section
          ref={tutorial.registerTarget("signals")}
          className={tutorial.getTargetClass("signals", `${styles.missionCard} ${styles.missionCardWide}`)}
        >
          <div className={styles.missionCardHeader}>
            <div>
              <p className={styles.panelEyebrow}>Signals</p>
              <h3 className={styles.missionCardTitle}>Mandatory signals and optional questions</h3>
            </div>
            <span className={styles.missionPill}>2 required / {planQuestions.length} extra</span>
          </div>

          <div className={styles.mandatorySignalGrid} aria-label="Mandatory signals">
            {MANDATORY_SIGNALS.map((signal) => (
              <div key={signal.label} className={styles.mandatorySignalCard}>
                <span className={styles.mandatorySignalIcon}>{signal.code}</span>
                <span className={styles.mandatorySignalText}>
                  <strong>{signal.label}</strong>
                  <small>{signal.desc}</small>
                </span>
                <span className={styles.mandatorySignalBadge}>Required</span>
              </div>
            ))}
          </div>

          <p className={styles.signalSectionLabel}>Optional questions</p>
          <div className={styles.featureGrid}>
            {QUESTION_OPTIONS.map((f) => {
              const compactLabel = f.label.replace(/\s*\([^)]*\)\s*/g, " ").trim();
              return (
                <label
                  key={f.key}
                  className={`${styles.featureChip} ${styles.missionFeatureChip} ${planQuestions.includes(f.key) ? styles.featureChipOn : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={planQuestions.includes(f.key)}
                    onChange={(e) => toggleQuestion(f.key, e.target.checked)}
                    disabled={locked}
                  />
                  <img src={QUESTION_VISUALS[f.key].icon} alt="" aria-hidden="true" className={styles.featureIcon} />
                  <span className={styles.featureChipLabel}>{compactLabel}</span>
                  <strong>+{f.cost}</strong>
                </label>
              );
            })}
          </div>

          <div className={styles.featureIntelPanel}>
            {selectedQuestionInfos.length === 0 ? (
              <p className={styles.featureIntelEmpty}>No extra question selected. Mission still collects mandatory Night Activity and Group Size records.</p>
            ) : (
              selectedQuestionInfos.map((q) => (
                <div className={styles.featureIntelCard} key={q.key}>
                  <p className={styles.featureIntelTitle}>{q.label}</p>
                  <p className={styles.featureIntelLine}><strong>The tactic:</strong> {q.tactic}</p>
                  <p className={styles.featureIntelLine}><strong>Signal impact:</strong> {q.why}</p>
                  <p className={styles.featureIntelFlavor}>"{q.line}"</p>
                </div>
              ))
            )}
          </div>
        </section>

        <aside
          ref={tutorial.registerTarget("queue")}
          className={tutorial.getTargetClass("queue", styles.missionQueue)}
        >
          <div className={styles.missionCardHeader}>
            <div>
              <p className={styles.panelEyebrow}>Operation Stack</p>
              <h3 className={styles.missionCardTitle}>Today&apos;s queue</h3>
            </div>
            <span className={remainingAfterAdd < 0 ? styles.missionPillBad : styles.missionPill}>
              {remainingAfterAdd} left
            </span>
          </div>

          <div className={styles.draftSummary}>
            <span>Next sortie</span>
            <strong>{draftCost}</strong>
            <p>{selectedDistricts.length ? selectedDistricts.join(", ") : "No district selected"}</p>
          </div>
          <button type="button" className={shared.continueBtn} onClick={addPlan} disabled={!canAddPlan}>
            Add Sortie
          </button>

          <div className={styles.queueList}>
            {currentPlans.length === 0 ? (
              <p className={styles.featureIntelEmpty}>No missions queued for Day {currentDay + 1}.</p>
            ) : (
              currentPlans.map((p, index) => (
                <div key={p.id} className={styles.queueItem}>
                  <div className={styles.queueItemHeader}>
                    <strong>
                      <span className={styles.queueBadge}>{index + 1}</span>
                      Mission {index + 1}
                    </strong>
                    <span>{p.cost} credits</span>
                  </div>
                  <p>{p.population} residents | {p.zones.filter(Boolean).length} zone(s)</p>
                  <p>{REGIONS.filter((_, i) => p.zones[i]).map((z) => z.label).join(", ")}</p>
                  <p>
                    Mandatory: Night Activity; Group Size | Extra:{" "}
                    {p.questions.length
                      ? p.questions.map((k) => QUESTION_OPTIONS.find((q) => q.key === k)?.label).join("; ")
                      : "No extra questions"}
                  </p>
                  {!locked && (
                    <button type="button" className={styles.queueRemoveBtn} onClick={() => removePlan(p.id)}>
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {currentPlans.length > 0 && !locked && (
            <button type="button" className={`${shared.continueBtn} ${styles.queueDeployBtn}`} onClick={sendDetectiveAndAdvance}>
              {currentDay < 2
                ? `Deploy Detective | Unlock Day ${currentDay + 2}`
                : "Deploy Detective | Train Model"}
            </button>
          )}
        </aside>
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
          titleId="mission-tutorial-title"
          popoverRef={tutorial.registerPopover}
        />
      )}
    </div>
  );
}
