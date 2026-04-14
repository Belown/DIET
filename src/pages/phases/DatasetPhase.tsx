import { useMemo } from "react";
import { defaultDataset, summarizeByGroup } from "../../data/dataset";
import styles from "./Phase.module.css";

export default function DatasetPhase() {
  const samples = defaultDataset;
  const stats = useMemo(() => summarizeByGroup(samples), [samples]);
  const preview = samples.slice(0, 8);

  return (
    <div className={styles.phase}>
      <p className={styles.lede}>
        Before you touch the model, read the data. Every row is a synthetic
        candidate. <em>Group</em> is a demographic label, and <em>qualified</em>{" "}
        is the ground truth you'll be trying to predict. Notice anything yet?
      </p>

      <div className={styles.panel}>
        <h2 className={styles.h2}>Sample preview</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Tech</th>
                <th>Experience</th>
                <th>Portfolio</th>
                <th>Group</th>
                <th>Qualified</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.techScore}</td>
                  <td>{s.experience}</td>
                  <td>{s.portfolio}</td>
                  <td>
                    <span
                      className={`${styles.chip} ${
                        s.group === "A" ? styles.chipA : styles.chipB
                      }`}
                    >
                      {s.group}
                    </span>
                  </td>
                  <td>{s.qualified ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.h2}>Distribution by group</h2>
        <div className={styles.grid}>
          {stats.map((g) => (
            <div key={g.group} className={styles.statBox}>
              <p className={styles.statTitle}>Group {g.group}</p>
              <p className={styles.statBig}>
                {Math.round(g.qualifiedRate * 100)}%
                <span className={styles.statSub}>qualified</span>
              </p>
              <p className={styles.statLine}>
                Mean tech {g.mean.techScore} · exp {g.mean.experience} ·
                portfolio {g.mean.portfolio}
              </p>
            </div>
          ))}
        </div>
        <p className={styles.warn}>
          Group B sits lower on tech and experience — but the portfolio
          distributions are roughly equal. That gap is the story you're about
          to uncover.
        </p>
      </div>
    </div>
  );
}
