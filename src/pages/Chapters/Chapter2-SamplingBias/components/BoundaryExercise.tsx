import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
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
  trainingAccuracyValue: number;
  onSubmit: () => void;
};

export default function BoundaryExercise({
  boundary,
  setBoundary,
  trainingAccuracy,
  trainingAccuracyValue,
  onSubmit,
}: BoundaryExerciseProps) {
  const [submitError, setSubmitError] = useState("");
  const sheet = BRIEFING_SHEETS["demo-intro"];
  const hasPerfectAccuracy = trainingAccuracyValue >= 1;
  const boundaryShift = boundary.slope === 0 ? 50 : -boundary.intercept / boundary.slope;
  const sliderShift = Math.max(-40, Math.min(120, boundaryShift));

  useEffect(() => {
    if (hasPerfectAccuracy) {
      setSubmitError("");
    }
  }, [hasPerfectAccuracy]);

  if (!sheet) return null;

  const handleSubmit = () => {
    if (!hasPerfectAccuracy) {
      setSubmitError("Reach 100% training accuracy before submitting the boundary.");
      return;
    }

    onSubmit();
  };

  return (
    <BriefingSheet sheet={sheet} spotlight>
      <div className={styles.boundaryWorkbench}>
        <div className={styles.boundaryHeader}>
          <div>
            <p className={styles.panelEyebrow}>Initial view | Region 1 only | {DEMO_INIT.length} points</p>
            <h2 className={styles.h2}>Draw a boundary that looks perfect.</h2>
          </div>
          <span className={styles.boundaryAccuracy}>
            Training accuracy <strong>{trainingAccuracy}</strong>
          </span>
        </div>

        <p className={styles.boundaryBody}>
          Move the line to separate Safe from Threat. You need 100% training accuracy before this boundary can be submitted.
          Black rings mark mistakes.
        </p>

        <div className={styles.boundaryInteractive}>
          <div className={styles.boundaryPlot}>
            <ScatterPlot pts={DEMO_INIT} ariaLabel={`${DEMO_INIT.length} training points from Region 1`} boundary={boundary} />
          </div>

          <div className={styles.boundarySidePanel}>
            <div className={styles.boundaryControls}>
              <div className={styles.sliderRow}>
                <span className={styles.sliderLabel}>Slope</span>
                <input
                  type="range"
                  min={-1.5}
                  max={1.5}
                  step={0.01}
                  value={boundary.slope}
                  onChange={(e) => {
                    const slope = parseFloat(e.target.value);
                    setBoundary((b) => ({ ...b, slope, intercept: -slope * boundaryShift }));
                  }}
                  className={styles.sliderInput}
                />
                <span className={styles.sliderValue}>{boundary.slope.toFixed(2)}</span>
              </div>
              <div className={styles.sliderRow}>
                <span className={styles.sliderLabel}>X-shift</span>
                <input
                  type="range"
                  min={-40}
                  max={120}
                  step={1}
                  value={sliderShift}
                  onChange={(e) => {
                    const shift = parseFloat(e.target.value);
                    setBoundary((b) => ({ ...b, intercept: -b.slope * shift }));
                  }}
                  className={styles.sliderInput}
                />
                <span className={styles.sliderValue}>{boundaryShift.toFixed(0)}</span>
              </div>
            </div>

            <div className={styles.boundaryFooter}>
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

              <div className={styles.sheetSubmitRow}>
                <div>
                  <p className={styles.sheetSubmitHint}>Submit unlocks when the training sample has no mistakes.</p>
                  {submitError && <p className={styles.sheetSubmitError}>{submitError}</p>}
                </div>
                <button type="button" className={styles.sheetSubmitBtn} onClick={handleSubmit}>
                  Submit boundary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BriefingSheet>
  );
}
