import styles from "./GameHud.module.css";
import type { FairnessDefinitionId, StudyMetricId } from "../chapter2Data";
import { FAIRNESS_DEFINITIONS, TOTAL_GAME_DAYS } from "../chapter2Data";

type GameHudProps = {
  dayIndex: number;
  resources: number;
  activeFairness: FairnessDefinitionId | null;
  onFairnessChange: (id: FairnessDefinitionId) => void;
  studyPick: StudyMetricId | null;
  studyCost: number;
  dailyCost: number;
  awaitingAdvance: boolean;
  pendingStudyCount: number;
};

export default function GameHud({
  dayIndex,
  resources,
  activeFairness,
  onFairnessChange,
  studyPick,
  studyCost,
  dailyCost,
  awaitingAdvance,
  pendingStudyCount,
}: GameHudProps) {
  const label = FAIRNESS_DEFINITIONS.find((f) => f.id === activeFairness)?.title ?? "—";

  return (
    <header className={styles.hud} aria-label="Court status">
      <div className={styles.hudBlock}>
        <span className={styles.kicker}>Session</span>
        <span className={styles.value}>
          Day {dayIndex + 1} / {TOTAL_GAME_DAYS}
        </span>
      </div>
      <div className={styles.hudBlock}>
        <span className={styles.kicker}>Office resources</span>
        <span className={styles.value}>{Math.max(0, Math.round(resources))}</span>
        <span className={styles.sub}>
          Daily overhead −{dailyCost}
          {studyPick ? ` · Study queued −${studyCost}` : ""}
          {pendingStudyCount > 0 ? ` · ${pendingStudyCount} in pipeline` : ""}
        </span>
      </div>
      <div className={`${styles.hudBlock} ${styles.hudGrow}`}>
        <span className={styles.kicker}>Active fairness lens</span>
        <select
          className={styles.select}
          value={activeFairness ?? ""}
          onChange={(e) => onFairnessChange(e.target.value as FairnessDefinitionId)}
          aria-label="Switch fairness lens"
          disabled={awaitingAdvance}
        >
          <option value="" disabled>
            Select…
          </option>
          {FAIRNESS_DEFINITIONS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>
        <span className={styles.sub}>{label}</span>
      </div>
    </header>
  );
}
