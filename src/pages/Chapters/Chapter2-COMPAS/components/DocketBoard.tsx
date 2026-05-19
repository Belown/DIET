import styles from "./DocketBoard.module.css";
import type { Defendant } from "../chapter2Simulation";
import { algorithmDecision } from "../chapter2Simulation";

type DocketBoardProps = {
  population: Defendant[];
  decisions: Record<string, "detain" | "release">;
  onDecisionChange: (id: string, v: "detain" | "release") => void;
  onApplyAlgorithm: () => void;
  sealed: boolean;
  disabled: boolean;
};

export default function DocketBoard({
  population,
  decisions,
  onDecisionChange,
  onApplyAlgorithm,
  sealed,
  disabled,
}: DocketBoardProps) {
  return (
    <section className={styles.wrap} aria-label="Daily docket">
      <div className={styles.toolbar}>
        <h2 className={styles.title}>Today’s docket</h2>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={onApplyAlgorithm}
          disabled={disabled || sealed}
        >
          Match instrument
        </button>
      </div>
      <p className={styles.help}>
        The score suggests detention for “high risk” and release for “low risk.” You may override any row. Outcomes stay hidden until you seal the day — the population is new each morning.
      </p>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Race (record)</th>
              <th scope="col">Instrument</th>
              <th scope="col">Your call</th>
              {sealed && <th scope="col">Two‑year rearrest (sim.)</th>}
            </tr>
          </thead>
          <tbody>
            {population.map((d) => (
              <tr key={d.id}>
                <td className={styles.mono}>{d.id}</td>
                <td>{d.race === "B" ? "Black" : "White"}</td>
                <td>
                  <span className={d.riskBand === "high" ? styles.riskHigh : styles.riskLow}>
                    {d.riskBand === "high" ? "High risk" : "Low risk"}
                  </span>
                </td>
                <td>
                  <div className={styles.toggle}>
                    <button
                      type="button"
                      className={`${styles.chip} ${decisions[d.id] === "release" ? styles.chipOn : ""}`}
                      onClick={() => onDecisionChange(d.id, "release")}
                      disabled={disabled || sealed}
                    >
                      Release
                    </button>
                    <button
                      type="button"
                      className={`${styles.chip} ${decisions[d.id] === "detain" ? styles.chipOn : ""}`}
                      onClick={() => onDecisionChange(d.id, "detain")}
                      disabled={disabled || sealed}
                    >
                      Detain
                    </button>
                  </div>
                  {!sealed && decisions[d.id] !== algorithmDecision(d) && (
                    <span className={styles.override}>Override</span>
                  )}
                </td>
                {sealed && (
                  <td className={styles.truth}>{d.willReoffend ? "Rearrest" : "No rearrest"}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
