import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Logo from "../Logo/Logo";
import styles from "./SimulatorLayout.module.css";
import {
  defaultDataset,
  summarizeByGroup,
} from "../../data/dataset";

type PipelineNode = {
  slug: string;
  step: string;
  label: string;
  hint: string;
};

const NODES: PipelineNode[] = [
  {
    slug: "background",
    step: "01",
    label: "Background",
    hint: "Read the primer before you dive in.",
  },
  {
    slug: "dataset",
    step: "02",
    label: "Dataset",
    hint: "Inspect the data before you touch it.",
  },
  {
    slug: "classifier",
    step: "03",
    label: "Classifier",
    hint: "Draw a decision boundary.",
  },
  {
    slug: "evaluation",
    step: "04",
    label: "Evaluation",
    hint: "Audit accuracy and fairness.",
  },
];

const SIDEBAR_DEFAULT = 280;
const METRICS_DEFAULT = 320;
const SIDEBAR_MIN = 235;
const SIDEBAR_MAX = 480;
const METRICS_MIN = 220;
const METRICS_MAX = 520;

export default function SimulatorLayout() {
  const location = useLocation();
  const activeSlug = location.pathname.split("/")[2] ?? "background";
  const activeNode = NODES.find((n) => n.slug === activeSlug) ?? NODES[0];

  const [metricsOpen, setMetricsOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [metricsWidth, setMetricsWidth] = useState(METRICS_DEFAULT);
  const [isDragging, setIsDragging] = useState(false);

  const stats = useMemo(() => summarizeByGroup(defaultDataset), []);
  const total = defaultDataset.length;
  const qualifiedTotal = defaultDataset.filter((s) => s.qualified).length;

  function startResize(side: "sidebar" | "metrics") {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = side === "sidebar" ? sidebarWidth : metricsWidth;
      const min = side === "sidebar" ? SIDEBAR_MIN : METRICS_MIN;
      const max = side === "sidebar" ? SIDEBAR_MAX : METRICS_MAX;
      const setWidth = side === "sidebar" ? setSidebarWidth : setMetricsWidth;
      const dir = side === "sidebar" ? 1 : -1;

      setIsDragging(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        const delta = (ev.clientX - startX) * dir;
        setWidth(Math.max(min, Math.min(max, startWidth + delta)));
      };

      const onUp = () => {
        setIsDragging(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.metricsToggle} ${metricsOpen ? styles.metricsToggleOpen : ""}`}
        onClick={() => setMetricsOpen((v) => !v)}
        aria-label={metricsOpen ? "Hide dataset snapshot" : "Show dataset snapshot"}
        title={metricsOpen ? "Hide snapshot" : "Show snapshot"}
        style={{
          right: metricsOpen ? `${metricsWidth + 16}px` : "16px",
          transition: isDragging
            ? "background 0.15s ease, color 0.15s ease, border-color 0.15s ease"
            : undefined,
        }}
      >
        <span className={styles.metricsToggleIcon} aria-hidden>
          {metricsOpen ? "›" : "‹"}
        </span>
        <span>Snapshot</span>
      </button>

      <div
        className={styles.shell}
        style={{
          gridTemplateColumns: `${sidebarWidth}px minmax(0, 1fr) ${metricsOpen ? metricsWidth : 0}px`,
          transition: isDragging ? "none" : undefined,
        }}
      >
        {/* Resizer handles — absolutely positioned, outside grid flow */}
        <div
          className={styles.resizerLeft}
          style={{ left: sidebarWidth }}
          onMouseDown={startResize("sidebar")}
        />
        {metricsOpen && (
          <div
            className={styles.resizerRight}
            style={{ right: metricsWidth }}
            onMouseDown={startResize("metrics")}
          />
        )}

        <aside className={styles.sidebar}>
          <Logo className={styles.sidebarLogo} />
          <p className={styles.sideLabel}>ML Pipeline</p>
          <nav className={styles.nodes}>
            {NODES.map((node, i) => {
              const prev = i > 0 ? NODES[i - 1] : null;
              return (
                <div key={node.slug} className={styles.nodeWrap}>
                  {prev && <div className={styles.connector} aria-hidden />}
                  <NavLink
                    to={`/simulator/${node.slug}`}
                    className={({ isActive }) =>
                      `${styles.node} ${isActive ? styles.nodeActive : ""}`
                    }
                    end={node.slug === "background"}
                  >
                    <span className={styles.nodeStep}>{node.step}</span>
                    <span className={styles.nodeLabel}>{node.label}</span>
                    <span className={styles.nodeHint}>{node.hint}</span>
                  </NavLink>
                </div>
              );
            })}
          </nav>
          <div className={styles.sideFooter}>
            <Link to="/" className={styles.backLink}>
              ← Back to landing
            </Link>
          </div>
        </aside>

        <main className={styles.canvas}>
          <header className={styles.canvasHead}>
            <p className={styles.crumb}>
              Simulator · <span>{activeNode.label}</span>
            </p>
            <h1 className={styles.canvasTitle}>{activeNode.hint}</h1>
          </header>
          <div className={styles.canvasBody}>
            <Outlet />
          </div>
        </main>

        <aside className={styles.metrics} aria-label="Metrics panel">
          <p className={styles.sideLabel}>Dataset snapshot</p>
          <div className={styles.metricCard}>
            <span className={styles.metricK}>Samples</span>
            <span className={styles.metricV}>{total}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricK}>Qualified (truth)</span>
            <span className={styles.metricV}>
              {qualifiedTotal}{" "}
              <span className={styles.metricSub}>
                ({Math.round((qualifiedTotal / total) * 100)}%)
              </span>
            </span>
          </div>

          <p className={styles.sideLabel} style={{ marginTop: 28 }}>
            By group
          </p>
          {stats.map((g) => (
            <div key={g.group} className={styles.groupCard}>
              <div className={styles.groupHead}>
                <span
                  className={`${styles.dot} ${
                    g.group === "A" ? styles.dotA : styles.dotB
                  }`}
                  aria-hidden
                />
                <span className={styles.groupName}>Group {g.group}</span>
                <span className={styles.groupCount}>{g.count}</span>
              </div>
              <div className={styles.groupRow}>
                <span>Qualified rate</span>
                <span>{Math.round(g.qualifiedRate * 100)}%</span>
              </div>
              <div className={styles.groupRow}>
                <span>Mean tech</span>
                <span>{g.mean.techScore}</span>
              </div>
              <div className={styles.groupRow}>
                <span>Mean exp</span>
                <span>{g.mean.experience}</span>
              </div>
              <div className={styles.groupRow}>
                <span>Mean portfolio</span>
                <span>{g.mean.portfolio}</span>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
