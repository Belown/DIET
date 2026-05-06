import styles from "./BoundaryReveal.module.css";
import { BRIEFING_SHEETS } from "../../chapterData";
import { DEMO_FULL } from "../../simulation";
import type { DemoBoundary } from "../../types";
import BriefingSheet from "../BriefingSheet/BriefingSheet";
import ScatterPlot from "../ScatterPlot/ScatterPlot";

type BoundaryRevealProps = {
  boundary: DemoBoundary;
  spotlight?: boolean;
  onReturnToPage?: () => void;
  realWorldAccuracy: string;
  trainingAccuracy: string;
};

export default function BoundaryReveal({
  boundary,
  spotlight = false,
  onReturnToPage,
  realWorldAccuracy,
  trainingAccuracy,
}: BoundaryRevealProps) {
  const sheet = BRIEFING_SHEETS["demo-reveal"];
  if (!sheet) return null;

  return (
    <BriefingSheet sheet={sheet} spotlight={spotlight} spotlightLayout="split">
      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>The reveal · {DEMO_FULL.length} points across 4 regions</p>
        <h2 className={styles.h2}>Same line. Real-world failure.</h2>
        <p className={styles.panelBody}>
          Your line was tuned on Region 1. Here, it meets the full city.
        </p>
      </div>

      <div className={styles.plotCard}>
        <div className={styles.scatterHeader}>
          <span className={styles.scatterStat}>
            Real-world accuracy: <strong className={styles.scatterStatBad}>{realWorldAccuracy}</strong>
            <span className={styles.scatterStatDrop}>&nbsp;↓ from {trainingAccuracy}</span>
          </span>
        </div>
        <ScatterPlot pts={DEMO_FULL} ariaLabel={`${DEMO_FULL.length} points from all 4 regions`} boundary={boundary} />
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

      {spotlight && onReturnToPage && (
        <button type="button" className={styles.revealReturnBtn} onClick={onReturnToPage}>
          Return to chat
        </button>
      )}
    </BriefingSheet>
  );
}
