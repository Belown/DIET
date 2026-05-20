import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import styles from "./BoundaryExercise.module.css";
import shared from "../../../../../styles/shared.module.css";
import { BRIEFING_SHEETS } from "../../chapterData";
import { DEMO_INIT } from "../../simulation";
import type { DemoBoundary } from "../../types";
import BriefingSheet from "../BriefingSheet/BriefingSheet";
import ScatterPlot from "../ScatterPlot/ScatterPlot";

const clampShift = (shift: number) => Math.max(-40, Math.min(120, shift));

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
  const [xShift, setXShift] = useState(() => clampShift(boundary.slope === 0 ? 50 : -boundary.intercept / boundary.slope));
  const sheet = BRIEFING_SHEETS["demo-intro"];
  const hasPerfectAccuracy = trainingAccuracyValue >= 1;

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
            <p className={styles.panelEyebrow}>Initial view | Uptown only | {DEMO_INIT.length} points</p>
            <h2 className={styles.h2}>Draw a perfect-looking boundary.</h2>
          </div>
          <span className={styles.boundaryAccuracy}>
            Training accuracy <strong>{trainingAccuracy}</strong>
          </span>
        </div>

        <p className={styles.boundaryBody}>
          Move the line to separate Safe from Threat. Black rings mark mistakes.
        </p>

        <div className={styles.boundaryInteractive}>
          <div className={styles.boundaryPlot}>
            <ScatterPlot pts={DEMO_INIT} ariaLabel={`${DEMO_INIT.length} training points from Region 1`} boundary={boundary} />
          </div>

          <div className={styles.boundarySidePanel}>
            <div className={styles.boundaryControls}>
              <div className={shared.sliderRow}>
                <span className={shared.sliderLabel}>Slope</span>
                <input
                  type="range"
                  min={-1.5}
                  max={1.5}
                  step={0.01}
                  value={boundary.slope}
                  onChange={(e) => {
                    const slope = parseFloat(e.target.value);
                    setBoundary((b) => ({ ...b, slope, intercept: -slope * xShift }));
                  }}
                  className={shared.sliderInput}
                />
                <span className={shared.sliderValue}>{boundary.slope.toFixed(2)}</span>
              </div>
              <div className={shared.sliderRow}>
                <span className={shared.sliderLabel}>X-shift</span>
                <input
                  type="range"
                  min={-40}
                  max={120}
                  step={1}
                  value={xShift}
                  onChange={(e) => {
                    const shift = parseFloat(e.target.value);
                    setXShift(shift);
                    setBoundary((b) => ({ ...b, intercept: -b.slope * shift }));
                  }}
                  className={shared.sliderInput}
                />
                <span className={shared.sliderValue}>{xShift.toFixed(0)}</span>
              </div>
            </div>

            <div className={styles.boundaryFooter}>
              <div className={shared.scatterLegend}>
                <span className={shared.scatterLegendItem}>
                  <span className={shared.scatterSwatch} style={{ background: "#16a34a" }} />
                  Safe
                </span>
                <span className={shared.scatterLegendItem}>
                  <span className={shared.scatterSwatch} style={{ background: "#dc2626" }} />
                  Threat
                </span>
                <span className={shared.scatterLegendItem}>
                  <span className={shared.scatterSwatchOutline} />
                  Misclassified
                </span>
              </div>

              <div className={styles.sheetSubmitRow}>
                <div>
                  <p className={styles.sheetSubmitHint}>Unlocks when there are no mistakes.</p>
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
