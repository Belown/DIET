import styles from "./BoundaryReveal.module.css";
import shared from "../../../../../styles/shared.module.css";
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
  const sheet = BRIEFING_SHEETS["demo-reveal-sheet"];
  if (!sheet) return null;

  return (
    <BriefingSheet sheet={sheet} spotlight={spotlight} spotlightLayout="split">
      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>The reveal · {DEMO_FULL.length} points across 4 regions</p>
        <h2 className={styles.h2}>Same line. Turn to a failure.</h2>
        <p className={styles.panelBody}>
          Your line was tuned on one Region. Here, it meets the full city.
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
        <div className={`${shared.scatterLegend} ${styles.scatterLegend}`}>
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
      </div>

      {spotlight && onReturnToPage && (
        <button type="button" className={styles.revealReturnBtn} onClick={onReturnToPage}>
          Return to chat
        </button>
      )}
    </BriefingSheet>
  );
}
