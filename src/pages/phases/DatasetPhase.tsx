import { useMemo, useState } from "react";
import {
  defaultDataset,
  summarizeByGroup,
  type CVSample,
} from "../../data/dataset";
import styles from "./Phase.module.css";

type View = "table" | "distribution";
type Feature = "techScore" | "experience" | "portfolio";

const FEATURES: { key: Feature; label: string }[] = [
  { key: "techScore", label: "Tech score" },
  { key: "experience", label: "Experience" },
  { key: "portfolio", label: "Portfolio" },
];

const BIN_COUNT = 10;

type HistBin = { lo: number; hi: number; A: number; B: number };

function buildBins(samples: CVSample[], key: Feature): HistBin[] {
  const width = 100 / BIN_COUNT;
  const bins: HistBin[] = Array.from({ length: BIN_COUNT }, (_, i) => ({
    lo: i * width,
    hi: (i + 1) * width,
    A: 0,
    B: 0,
  }));
  for (const s of samples) {
    const idx = Math.min(Math.floor(s[key] / width), BIN_COUNT - 1);
    bins[idx][s.group]++;
  }
  return bins;
}

export default function DatasetPhase() {
  const samples = defaultDataset;
  const stats = useMemo(() => summarizeByGroup(samples), [samples]);
  const [view, setView] = useState<View>("table");

  const histograms = useMemo(
    () => FEATURES.map((f) => ({ ...f, bins: buildBins(samples, f.key) })),
    [samples],
  );
  const maxBinCount = useMemo(
    () =>
      Math.max(
        1,
        ...histograms.flatMap((h) => h.bins.map((b) => Math.max(b.A, b.B))),
      ),
    [histograms],
  );

  return (
    <div className={styles.phase}>
      <p className={styles.lede}>
        Before you touch the model, read the data. Every row is a synthetic candidate. <em>Group</em> is a demographic label, and <em>qualified</em>{" "} is the ground truth you'll be trying to predict. Notice anything yet?
      </p>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.h2}>Candidate pool · {samples.length} rows</h2>
          <div className={styles.toggle} role="tablist" aria-label="Data view">
            <button
              type="button"
              role="tab"
              aria-selected={view === "table"}
              className={`${styles.toggleBtn} ${
                view === "table" ? styles.toggleBtnOn : ""
              }`}
              onClick={() => setView("table")}
            >
              Table
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "distribution"}
              className={`${styles.toggleBtn} ${
                view === "distribution" ? styles.toggleBtnOn : ""
              }`}
              onClick={() => setView("distribution")}
            >
              Distribution
            </button>
          </div>
        </div>

        {view === "table" ? (
          <div className={`${styles.tableWrap} ${styles.tableScroll}`}>
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
                {samples.map((s) => (
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
        ) : (
          <div className={styles.distView}>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={`${styles.swatch} ${styles.chipA}`} />
                Group A · {stats[0].count}
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.swatch} ${styles.chipB}`} />
                Group B · {stats[1].count}
              </span>
            </div>
            <div className={styles.histRow}>
              {histograms.map((h) => (
                <Histogram
                  key={h.key}
                  label={h.label}
                  bins={h.bins}
                  maxCount={maxBinCount}
                />
              ))}
            </div>
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
          </div>
        )}

        <p className={styles.warn}>
          Group B sits lower on tech and experience — but the portfolio distributions are roughly equal. That gap is the story you're about to uncover.
        </p>
      </div>
    </div>
  );
}

function Histogram({
  label,
  bins,
  maxCount,
}: {
  label: string;
  bins: HistBin[];
  maxCount: number;
}) {
  const W = 320;
  const H = 160;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const groupW = innerW / bins.length;
  const barW = (groupW - 4) / 2;
  const yScale = (n: number) => (n / maxCount) * innerH;
  const ticks = [0, 0.5, 1];

  return (
    <figure className={styles.histCard}>
      <figcaption className={styles.histLabel}>{label}</figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.histSvg}
        role="img"
        aria-label={`${label} distribution by group`}
      >
        {ticks.map((t) => {
          const y = padT + innerH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                className={styles.histGridLine}
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                className={styles.histTick}
              >
                {Math.round(maxCount * t)}
              </text>
            </g>
          );
        })}
        {bins.map((b, i) => {
          const x0 = padL + i * groupW + 2;
          const aH = yScale(b.A);
          const bH = yScale(b.B);
          return (
            <g key={i}>
              <rect
                x={x0}
                y={padT + innerH - aH}
                width={barW}
                height={aH}
                className={styles.histBarA}
              />
              <rect
                x={x0 + barW}
                y={padT + innerH - bH}
                width={barW}
                height={bH}
                className={styles.histBarB}
              />
              {i % 2 === 0 && (
                <text
                  x={x0 + barW}
                  y={H - 8}
                  textAnchor="middle"
                  className={styles.histTick}
                >
                  {b.lo}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
