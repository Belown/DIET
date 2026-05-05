import styles from "./ScatterPlot.module.css";
import { isFlagged } from "../../simulation";
import type { DemoBoundary, DPt } from "../../types";

const SW = 460;
const SH = 300;
const PL = 44;
const PR = 12;
const PT = 16;
const PB = 40;
const IW = SW - PL - PR;
const IH = SH - PT - PB;
const px = (v: number) => PL + (v / 100) * IW;
const py = (v: number) => PT + (1 - v / 100) * IH;

type ScatterPlotProps = {
  pts: DPt[];
  ariaLabel: string;
  boundary: DemoBoundary;
};

export default function ScatterPlot({ pts, ariaLabel, boundary }: ScatterPlotProps) {
  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} className={styles.scatter} role="img" aria-label={ariaLabel}>
      <line x1={PL} y1={PT + IH} x2={PL + IW} y2={PT + IH} stroke="#c9c9cd" strokeWidth="1.5" />
      <line x1={PL} y1={PT} x2={PL} y2={PT + IH} stroke="#c9c9cd" strokeWidth="1.5" />

      {[20, 40, 60, 80].map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={PT} x2={px(v)} y2={PT + IH} stroke="#ebebef" strokeWidth="1" />
          <line x1={PL} y1={py(v)} x2={PL + IW} y2={py(v)} stroke="#ebebef" strokeWidth="1" />
          <text x={px(v)} y={PT + IH + 14} textAnchor="middle" fontSize="10" fill="#8d969e">{v}</text>
          <text x={PL - 5} y={py(v) + 3} textAnchor="end" fontSize="10" fill="#8d969e">{v}</text>
        </g>
      ))}

      <text x={PL + IW / 2} y={SH - 3} textAnchor="middle" fontSize="11" fill="#8d969e">
        Night Activity
      </text>
      <text
        x={11}
        y={PT + IH / 2}
        textAnchor="middle"
        fontSize="11"
        fill="#8d969e"
        transform={`rotate(-90 11 ${PT + IH / 2})`}
      >
        Group Size
      </text>

      {pts.map((p) => {
        const wrong = isFlagged(p, boundary) !== p.suspicious;
        return (
          <circle
            key={p.id}
            cx={px(p.x)}
            cy={py(p.y)}
            r={wrong ? 5 : 4}
            fill={p.suspicious ? "#dc2626" : "#16a34a"}
            opacity={0.82}
            stroke={wrong ? "#191c1f" : "none"}
            strokeWidth={wrong ? 1.8 : 0}
          />
        );
      })}

      <line
        x1={px(0)}
        y1={py(boundary.intercept)}
        x2={px(100)}
        y2={py(boundary.slope * 100 + boundary.intercept)}
        stroke="#191c1f"
        strokeWidth="2.5"
        strokeDasharray="8 5"
        strokeLinecap="round"
      />
    </svg>
  );
}
