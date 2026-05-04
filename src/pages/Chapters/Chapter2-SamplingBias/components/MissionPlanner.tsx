import styles from "../Chapter2SamplingBias.module.css";
import { DAILY_BUDGET, POP_OPTIONS, QUESTION_OPTIONS, REGIONS } from "../chapterData";
import type { MissionPlan, PopulationOption, QuestionKey, QuestionOption } from "../types";

type SelectedQuestionInfo = QuestionOption & { line: string };

type MissionPlannerProps = {
  currentDay: number;
  currentPlans: MissionPlan[];
  dayLocked: boolean[];
  spentToday: number;
  remainToday: number;
  planPopulation: PopulationOption;
  planZones: boolean[];
  planDistribution: number[];
  planQuestions: QuestionKey[];
  selectedQuestionInfos: SelectedQuestionInfo[];
  zoneCount: number;
  draftCost: number;
  canAddPlan: boolean;
  togglePlanZone: (index: number, checked: boolean) => void;
  setPlanPopulation: (population: PopulationOption) => void;
  setDistributionForZone: (zoneIndex: number, value: number) => void;
  toggleQuestion: (key: QuestionKey, checked: boolean) => void;
  addPlan: () => void;
  removePlan: (id: string) => void;
  sendDetectiveAndAdvance: () => void;
};

export default function MissionPlanner({
  currentDay,
  currentPlans,
  dayLocked,
  spentToday,
  remainToday,
  planPopulation,
  planZones,
  planDistribution,
  planQuestions,
  selectedQuestionInfos,
  zoneCount,
  draftCost,
  canAddPlan,
  togglePlanZone,
  setPlanPopulation,
  setDistributionForZone,
  toggleQuestion,
  addPlan,
  removePlan,
  sendDetectiveAndAdvance,
}: MissionPlannerProps) {
  return (
    <>
      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Day {currentDay + 1} / 3 · Budget Control</p>
        <h2 className={styles.h2}>Design today&rsquo;s data collection strategy</h2>
        <p className={styles.panelBody}>
          Fixed records always available: Night Activity (X-axis) and Group Size (Y-axis).
          You control where to search, how many people to sample, and optional extra questions.
        </p>
        <p className={styles.panelBody}>
          Spent: <strong>{spentToday}</strong> / {DAILY_BUDGET} · Remaining: <strong>{remainToday}</strong>
        </p>
      </div>

      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Choice 1 · Which zones to search?</p>
        <div className={styles.regionGrid}>
          {REGIONS.map((r, i) => (
            <label
              key={r.id}
              className={`${styles.regionCard} ${planZones[i] ? styles.regionCardOn : ""}`}
            >
              <input
                type="checkbox"
                checked={planZones[i]}
                onChange={(e) => togglePlanZone(i, e.target.checked)}
                disabled={dayLocked[currentDay]}
              />
              <span className={styles.regionDot} style={{ background: r.color }} />
              <span className={styles.regionName}>{r.label}</span>
              <span className={styles.regionDesc}>{r.desc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Choice 2 · Amount — how many per district?</p>
        <div className={styles.sampleRow}>
          <span className={styles.sampleLbl}>{planPopulation} residents</span>
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={POP_OPTIONS.indexOf(planPopulation)}
            onChange={(e) => {
              const idx = Math.max(0, Math.min(2, parseInt(e.target.value, 10) || 0));
              setPlanPopulation(POP_OPTIONS[idx]);
            }}
            className={styles.sliderInput}
            disabled={dayLocked[currentDay]}
          />
          <span className={styles.sampleHint}>
            {planPopulation === 100 ? "Small sweep" : planPopulation === 500 ? "Focused campaign" : "Mass operation"}
          </span>
        </div>

        {zoneCount > 1 && (
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <p className={styles.panelBody}>Distribution across selected zones:</p>
            {REGIONS.map((r, i) => planZones[i] ? (
              <div key={r.id} className={styles.sliderRow}>
                <span className={styles.sliderLabel}>{r.label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={Math.round(planDistribution[i] * 100)}
                  onChange={(e) => setDistributionForZone(i, parseInt(e.target.value, 10) || 0)}
                  className={styles.sliderInput}
                  disabled={dayLocked[currentDay]}
                />
                <span className={styles.sliderValue}>{Math.round(planDistribution[i] * 100)}%</span>
              </div>
            ) : null)}
          </div>
        )}
      </div>

      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Choice 3 · Additional question to ask</p>
        <p className={styles.panelBody}>You can select multiple extra questions. Each one adds cost and affects signal quality.</p>
        <div className={styles.featureGrid}>
          {QUESTION_OPTIONS.map((f) => (
            <label
              key={f.key}
              className={`${styles.featureChip} ${planQuestions.includes(f.key) ? styles.featureChipOn : ""}`}
            >
              <input
                type="checkbox"
                checked={planQuestions.includes(f.key)}
                onChange={(e) => toggleQuestion(f.key, e.target.checked)}
                disabled={dayLocked[currentDay]}
              />
              {f.label} (+{f.cost})
            </label>
          ))}
        </div>

        <div className={styles.featureIntelPanel}>
          {selectedQuestionInfos.length === 0 ? (
            <p className={styles.featureIntelEmpty}>No extra question selected. Mission uses only fixed government records.</p>
          ) : (
            selectedQuestionInfos.map((q) => (
              <div className={styles.featureIntelCard} key={q.key}>
                <p className={styles.featureIntelTitle}>{q.label}</p>
                <p className={styles.featureIntelLine}><strong>The Tactic:</strong> {q.tactic}</p>
                <p className={styles.featureIntelLine}><strong>Why it works:</strong> {q.why}</p>
                <p className={styles.featureIntelFlavor}>"{q.line}"</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Mission Draft</p>
        <p className={styles.panelBody}>
          Draft cost: <strong>{draftCost}</strong> · Remaining after add: <strong>{remainToday - draftCost}</strong>
        </p>
        <div className={styles.continueRow}>
          <p className={styles.continueHint}>You can add multiple plans in one day until budget is used.</p>
          <button type="button" className={styles.continueBtn} onClick={addPlan} disabled={!canAddPlan}>
            Add Mission
          </button>
        </div>

        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {currentPlans.length === 0 ? (
            <p className={styles.featureIntelEmpty}>No plans yet for Day {currentDay + 1}.</p>
          ) : (
            currentPlans.map((p) => (
              <div key={p.id} className={styles.featureIntelCard}>
                <p className={styles.featureIntelTitle}>
                  {p.population} pop · {p.zones.filter(Boolean).length} zone(s) · cost {p.cost}
                </p>
                <p className={styles.featureIntelLine}>
                  Zones: {REGIONS.filter((_, i) => p.zones[i]).map((z) => z.label).join(", ")}
                </p>
                <p className={styles.featureIntelLine}>
                  Distribution: {REGIONS.filter((_, i) => p.zones[i]).map((z) => {
                    const i = REGIONS.findIndex((r) => r.id === z.id);
                    return `${z.label} ${Math.round(p.zoneDistribution[i] * 100)}%`;
                  }).join(" · ")}
                </p>
                <p className={styles.featureIntelLine}>
                  Extra questions: {p.questions.length ? p.questions.map((k) => QUESTION_OPTIONS.find((q) => q.key === k)?.label).join("; ") : "None"}
                </p>
                {p.questions.map((k) => (
                  <p key={`${p.id}-${k}`} className={styles.featureIntelFlavor}>
                    "{p.flavorLines[k]}"
                  </p>
                ))}
                {!dayLocked[currentDay] && (
                  <button type="button" className={styles.unlockBtn} onClick={() => removePlan(p.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.continueRow}>
        <p className={styles.continueHint}>
          Day {currentDay + 1}: {currentPlans.length} mission(s) · spent {spentToday}/{DAILY_BUDGET}
        </p>
        {currentPlans.length > 0 && !dayLocked[currentDay] && (
          <button type="button" className={styles.continueBtn} onClick={sendDetectiveAndAdvance}>
            {currentDay < 2
              ? `Send Detective \u00b7 Start Day ${currentDay + 2}`
              : "Send Detective \u00b7 Train Model"}
          </button>
        )}
      </div>
    </>
  );
}
