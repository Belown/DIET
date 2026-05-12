import { useMemo, useState } from "react";
import styles from "./StatsMonitor.module.css";

const CHART_DATA = [
  { id: "bh", group: "Black", bucket: "High Risk", value: 60, recidivate: 36 },
  { id: "bl", group: "Black", bucket: "Low Risk", value: 40, recidivate: null },
  { id: "wh", group: "White", bucket: "High Risk", value: 40, recidivate: 24 },
  { id: "wl", group: "White", bucket: "Low Risk", value: 60, recidivate: null },
];

export default function StatsMonitor() {
  const [hovered, setHovered] = useState(null);
  const maxValue = useMemo(() => Math.max(...CHART_DATA.map((item) => item.value)), []);

  return (
    <section className={styles.screen}>
      <h3 className={styles.title}>COMPAS Distribution Console</h3>
      <p className={styles.subtitle}>Hover bars to inspect exact values and recidivism counts.</p>

      <div className={styles.chartWrap}>
        <svg viewBox="0 0 700 330" className={styles.chart} role="img" aria-label="Grouped chart by race and risk">
          <line x1="70" y1="280" x2="650" y2="280" className={styles.axis} />
          <line x1="70" y1="40" x2="70" y2="280" className={styles.axis} />

          {[0, 20, 40, 60].map((tick) => (
            <g key={tick}>
              <line x1="65" y1={280 - tick * 4} x2="650" y2={280 - tick * 4} className={styles.grid} />
              <text x="50" y={286 - tick * 4} className={styles.tickLabel}>{tick}</text>
            </g>
          ))}

          {CHART_DATA.map((item, i) => {
            const height = (item.value / maxValue) * 220;
            const x = 120 + i * 130;
            const y = 280 - height;
            return (
              <g key={item.id} onMouseEnter={() => setHovered(item)} onMouseLeave={() => setHovered(null)}>
                <rect
                  x={x}
                  y={y}
                  width="74"
                  height={height}
                  rx="6"
                  className={`${styles.bar} ${item.group === "Black" ? styles.blackBar : styles.whiteBar}`}
                  style={{ animationDelay: `${i * 120}ms` }}
                />
                <text x={x + 37} y="300" textAnchor="middle" className={styles.barLabel}>
                  {item.group}
                </text>
                <text x={x + 37} y="316" textAnchor="middle" className={styles.bucketLabel}>
                  {item.bucket}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className={styles.tooltip}>
            <strong>{hovered.group} · {hovered.bucket}</strong>
            <span>Classified: {hovered.value}</span>
            <span>
              Recidivate: {hovered.recidivate === null ? "n/a" : `${hovered.recidivate} (${Math.round((hovered.recidivate / hovered.value) * 100)}%)`}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
