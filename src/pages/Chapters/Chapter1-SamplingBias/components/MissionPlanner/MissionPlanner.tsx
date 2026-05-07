import styles from "./MissionPlanner.module.css";
import shared from "../../../../../styles/shared.module.css";
import { BUDGET_VISUALS, POPULATION_IMAGES, QUESTION_IMAGES, ZONE_VISUALS } from "../../../../../assets/image/image";
import { DAILY_BUDGET, QUESTION_OPTIONS, REGIONS } from "../../chapterData";
import type { MissionPlan, PopulationOption, QuestionKey, QuestionOption } from "../../types";

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
}: MissionPlannerProps) {
  const locked = dayLocked[currentDay];
  const remainingAfterAdd = remainToday - draftCost;
  const budgetUsed = Math.min(100, Math.round((spentToday / DAILY_BUDGET) * 100));
  const coverageProgress = Math.round((zoneCount / REGIONS.length) * 100);
  const budgetFitsDraft = remainingAfterAdd >= 0;
  const readinessSteps = [
    { label: "Coverage", complete: zoneCount > 0 },
    { label: "Sample", complete: Boolean(planPopulation) },
    { label: "Budget", complete: budgetFitsDraft },
    { label: "Queue", complete: currentPlans.length > 0 },
  ];
  const readinessScore = Math.round((readinessSteps.filter((step) => step.complete).length / readinessSteps.length) * 100);
  const selectedDistricts = REGIONS.filter((_, i) => planZones[i]).map((region) => region.label);
  const dayCopy = DAY_COPY[currentDay];

  return (
    <div className={styles.missionDashboard}>
      <section className={styles.missionHeader}>
        <div className={styles.commandIntro}>
          <div className={styles.commandMeta}>
            <span className={styles.dayBadge}>{dayCopy.kicker}</span>
            <span className={styles.rankBadge}>{DAY_RANKS[currentDay]}</span>
          </div>
          <h2 className={styles.h2}>{dayCopy.title}</h2>
          <p className={styles.panelBody}>{dayCopy.desc}</p>
          <div className={styles.objectiveTrack} aria-label="Mission readiness checklist">
            {readinessSteps.map((step, index) => (
              <span
                key={step.label}
                className={`${styles.objectiveStep} ${step.complete ? styles.objectiveStepDone : ""}`}
              >
                <span>{index + 1}</span>
                {step.label}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.budgetPanel} aria-label="Budget status">
          <div className={styles.budgetRing} style={{ ["--budget-used" as string]: `${budgetUsed}%` }}>
            <span>{remainToday}</span>
            <small>IP left</small>
          </div>
          <div className={styles.budgetStats}>
            <strong>Readiness {readinessScore}%</strong>
            <span><img src={BUDGET_VISUALS.budget} alt="" aria-hidden="true" /> Budget {DAILY_BUDGET}</span>
            <span><img src={BUDGET_VISUALS.spent} alt="" aria-hidden="true" /> Spent {spentToday}</span>
            <span><img src={BUDGET_VISUALS.draft} alt="" aria-hidden="true" /> Draft {draftCost}</span>
          </div>
        </div>
      </section>

      <div className={styles.missionGrid}>
        <section className={`${styles.missionCard} ${styles.missionCardWide}`}>
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

        <section className={styles.missionCard}>
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

        <section className={`${styles.missionCard} ${styles.missionCardWide}`}>
          <div className={styles.missionCardHeader}>
            <div>
              <p className={styles.panelEyebrow}>Signals</p>
              <h3 className={styles.missionCardTitle}>Optional questions</h3>
            </div>
            <span className={styles.missionPill}>{planQuestions.length} active</span>
          </div>

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
              <p className={styles.featureIntelEmpty}>No extra question selected. Mission uses only fixed government records.</p>
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

        <aside className={styles.missionQueue}>
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
    </div>
  );
}
