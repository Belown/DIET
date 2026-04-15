import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import Logo from "../Logo/Logo";
import styles from "./SimulatorLayout.module.css";

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
  {
    slug: "debrief",
    step: "05",
    label: "Debrief",
    hint: "Bias taxonomy and takeaways.",
  },
];

const SIDEBAR_DEFAULT = 280;
const SIDEBAR_MIN = 235;
const SIDEBAR_MAX = 480;

export default function SimulatorLayout() {
  const location = useLocation();
  const activeSlug = location.pathname.split("/")[2] ?? "background";
  const activeNode = NODES.find((n) => n.slug === activeSlug) ?? NODES[0];

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isDragging, setIsDragging] = useState(false);

  function startResize() {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      setIsDragging(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        setSidebarWidth(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startWidth + delta)));
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
    <div
      className={styles.shell}
      style={{
        gridTemplateColumns: `${sidebarWidth}px minmax(0, 1fr)`,
        transition: isDragging ? "none" : undefined,
      }}
    >
      {/* Resizer handle — absolutely positioned, outside grid flow */}
      <div
        className={styles.resizerLeft}
        style={{ left: sidebarWidth }}
        onMouseDown={startResize()}
      />

      <aside className={styles.sidebar}>
        <Logo className={styles.sidebarLogo} />
        <p className={styles.sideLabel}>Pipeline</p>
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
        <div key={activeSlug} className={styles.canvasBody}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
