import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useMemo } from "react";
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
    slug: "dataset",
    step: "01",
    label: "Dataset",
    hint: "Inspect the data before you touch it.",
  },
  {
    slug: "classifier",
    step: "02",
    label: "Classifier",
    hint: "Draw a decision boundary.",
  },
  {
    slug: "evaluation",
    step: "03",
    label: "Evaluation",
    hint: "Audit accuracy and fairness.",
  },
];

export default function SimulatorLayout() {
  const location = useLocation();
  const activeSlug = location.pathname.split("/")[2] ?? "dataset";
  const activeNode = NODES.find((n) => n.slug === activeSlug) ?? NODES[0];

  const stats = useMemo(() => summarizeByGroup(defaultDataset), []);
  const total = defaultDataset.length;
  const qualifiedTotal = defaultDataset.filter((s) => s.qualified).length;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}>
          Manifold<span className={styles.brandDot}>.</span>
        </Link>
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
                  end={node.slug === "dataset"}
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
  );
}
