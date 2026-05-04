import type { Dispatch, SetStateAction } from "react";
import styles from "../Chapter2SamplingBias.module.css";
import { BRIEFING_SHEETS } from "../chapterData";
import { DEMO_INIT } from "../simulation";
import type { DemoBoundary } from "../types";
import BriefingSheet from "./BriefingSheet";
import ScatterPlot from "./ScatterPlot";

type BoundaryExerciseProps = {
  boundary: DemoBoundary;
  setBoundary: Dispatch<SetStateAction<DemoBoundary>>;
  trainingAccuracy: string;
};

export default function BoundaryExercise({ boundary, setBoundary, trainingAccuracy }: BoundaryExerciseProps) {
  const sheet = BRIEFING_SHEETS["demo-intro"];
  if (!sheet) return null;

  return (
    <BriefingSheet sheet={sheet}>
      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Initial view · Region 1 only · {DEMO_INIT.length} points</p>
        <h2 className={styles.h2}>Draw a boundary that looks perfect.</h2>
        <p className={styles.panelBody}>
          X-axis is Night Activity, Y-axis is Group Size. Move the line to separate Safe (green)
          from Threat (red). Black rings are mistakes.
        </p>
      </div>

      <div className={styles.plotCard}>
        <div className={styles.scatterHeader}>
          <span className={styles.scatterStat}>
            Training accuracy: <strong>{trainingAccuracy}</strong>
          </span>
        </div>
        <ScatterPlot pts={DEMO_INIT} ariaLabel={`${DEMO_INIT.length} training points from Region 1`} boundary={boundary} />
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>Slope</span>
          <input
            type="range"
            min={-1.5}
            max={1.5}
            step={0.01}
            value={boundary.slope}
            onChange={(e) => setBoundary((b) => ({ ...b, slope: parseFloat(e.target.value) }))}
            className={styles.sliderInput}
          />
          <span className={styles.sliderValue}>{boundary.slope.toFixed(2)}</span>
        </div>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>Shift</span>
          <input
            type="range"
            min={-40}
            max={100}
            step={1}
            value={boundary.intercept}
            onChange={(e) => setBoundary((b) => ({ ...b, intercept: parseFloat(e.target.value) }))}
            className={styles.sliderInput}
          />
          <span className={styles.sliderValue}>{boundary.intercept.toFixed(0)}</span>
        </div>
        <div className={styles.scatterLegend}>
          <span className={styles.scatterLegendItem}>
            <span className={styles.scatterSwatch} style={{ background: "#16a34a" }} />
            Safe
          </span>
          <span className={styles.scatterLegendItem}>
            <span className={styles.scatterSwatch} style={{ background: "#dc2626" }} />
            Threat
          </span>
          <span className={styles.scatterLegendItem}>
            <span className={styles.scatterSwatchOutline} />
            Misclassified
          </span>
        </div>
      </div>
    </BriefingSheet>
  );
}
