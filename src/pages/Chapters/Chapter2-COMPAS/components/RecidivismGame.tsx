import { useState, useEffect, useRef, useCallback } from "react";
import "./RecidivismGame.css";
import JudgeDilemma from "./JudgeDilemma";

// ─── Types ─────────────────────────────────────────────────────────────────────
type RiskChoice = "reoffended" | "did-not";
type GamePhase = "intro" | "game" | "results" | "fairness" | "dilemma";

interface Profile {
  id: number;
  name: string;
  sex: string;
  age: number;
  race: string;
  priors: number;
  charge: string;
  scoreText: string;
  reoffended: boolean;
  group: "A" | "B" | "C" | "D";
}

interface FairnessDefinition {
  id: number;
  title: string;
  subtitle: string;
  accentColor: string;
  description: string;
  advantages: string[];
  inconveniences: string[];
  keyFact?: string;
}

// ─── Fairness Definitions (from PDF) ──────────────────────────────────────────
const FAIRNESS_DEFS: FairnessDefinition[] = [
  {
    id: 1,
    title: "Sentencer Perspective Fairness",
    subtitle: "Northpointe's Definition",
    accentColor: "#1C4ED8",
    description:
      "Scores map to equal probability of actual re-offending among both Black and White defendants — race does not matter. A risk score of 7 (medium) should correspond to the same actual reoffending probability regardless of the defendant's race. Judges do not need to consider race at all.",
    advantages: [
      "Judges do not need to consider race at all when reading scores.",
      "Predictive accuracy is preserved: the score means the same thing for everyone.",
      "Aligns with how actuarial tools are traditionally evaluated.",
    ],
    inconveniences: [
      "More Black defendants end up classified as high or medium risk (42% vs 22% for white defendants) due to historical disparities.",
      "Northpointe only looks at the set of people who reoffended — ignoring false positive harm on innocent defendants.",
      "Does not account for structural inequalities that produce different base rates across races.",
    ],
    keyFact: "In the past, Black defendants were twice as likely to be classified as medium or high risk compared to white defendants (42% vs 22%).",
  },
  {
    id: 2,
    title: "Defendant Perspective Fairness",
    subtitle: "ProPublica's Definition — Error Rate Parity",
    accentColor: "#B45309",
    description:
      "Keep false positive and false negative rates equal between racial groups. A false positive means someone is kept in custody even though they pose no real threat. A false negative means someone is released even though they posed a risk. This definition focuses on equal treatment of defendants, not equal predictive accuracy.",
    advantages: [
      "Directly addresses racial disparities in who is wrongly imprisoned.",
      "Centers the individual defendant's rights rather than aggregate accuracy.",
      "Aligns with legal principles of equal protection under the law.",
    ],
    inconveniences: [
      "Mathematically impossible to satisfy simultaneously with Northpointe's definition when base recidivism rates differ between groups.",
      "Enforcing equal error rates may reduce overall predictive accuracy.",
      "Does not guarantee individual-level fairness — group parity can coexist with individual injustice.",
    ],
    keyFact:
      "ProPublica found Black defendants were wrongly flagged as future criminals at almost twice the rate of white defendants (44.9% vs 23.5%).",
  },
  {
    id: 3,
    title: "Equal Error Rates",
    subtitle: "False Positive & False Negative Parity",
    accentColor: "#065F46",
    description:
      "Both false positive rates (wrongly flagged as high risk) and false negative rates (wrongly labeled low risk) should be equal across racial groups. COMPAS violated both: Black defendants had a much higher false positive rate, and white defendants had a much higher false negative rate.",
    advantages: [
      "Clearly quantifiable and auditable from outcome data.",
      "Addresses both types of harm: wrongful detention and wrongful release.",
      "Provides a concrete benchmark for regulatory oversight.",
    ],
    inconveniences: [
      "When base rates differ between groups, equal error rates are mathematically incompatible with calibration (Northpointe's fairness).",
      "Achieving parity may require deliberately reducing accuracy for one group.",
      "Does not prevent a system from being uniformly bad for everyone.",
    ],
    keyFact:
      "Equal False Positive Rates: 44.9% (Black) vs 23.5% (White). Equal False Negative Rates: 47.7% (White) vs 28.0% (Black).",
  },
  {
    id: 4,
    title: "Individual Fairness",
    subtitle: "Treating Identical Individuals the Same",
    accentColor: "#6D28D9",
    description:
      "Two defendants with the exact same criminal history, demographics, and case details should receive the same risk score. This removes the arbitrary instinct or personal bias of a human judge — a primary reason algorithmic tools were adopted in the first place.",
    advantages: [
      "Consistency: same inputs always produce the same output, unlike human judges.",
      "Perceived neutrality: removes subjective bias from individual sentencing decisions.",
      "Transparent and auditable: the mapping from features to score can be inspected.",
    ],
    inconveniences: [
      "The 'identical' problem: no two defendants are truly identical, and small differences may drive large differences in outcomes.",
      "Magnifying data bias: if 'identical' includes features like neighborhood or friends arrested, systemic issues become individual penalties.",
      "Does not address group-level disparities — it can be individually fair and racially biased simultaneously.",
    ],
  },
  {
    id: 5,
    title: "Proportional Fairness",
    subtitle: "Outcomes Scaled to Statistical Risk",
    accentColor: "#9F1239",
    description:
      "Allocate outcomes or scores in proportion to a specific metric — such as the statistical likelihood of reoffending. If data shows a 60% reoffending risk, the treatment (sentence length, bail amount, supervision level) is scaled proportionally to that 60%. This is the 'resource efficiency' view of criminal justice.",
    advantages: [
      "Resource efficiency: focuses state resources (custody, supervision) on those with the highest statistical risk.",
      "Logical justification: directly maps to measurable data rather than subjective judgment.",
      "Aligns with actuarial traditions in insurance and public health.",
    ],
    inconveniences: [
      "Moral hazard: scoring a human's freedom based on a proportion of statistical risk feels dehumanizing.",
      "Self-fulfilling prophecy: high-risk labeling increases police presence → more arrests → 'confirms' high risk regardless of behavior change (cf. Broken Window Theory).",
      "Historical data reflects past injustices; proportional scores can perpetuate them.",
    ],
  },
  {
    id: 6,
    title: "Equality of Outcome",
    subtitle: "Equal Classification Rates Across Groups",
    accentColor: "#0E7490",
    description:
      "Split results or classifications equally (e.g., 50/50) across racial groups regardless of underlying risk metrics. The only approach that guarantees one racial group is not incarcerated at a higher rate than another, directly addressing mass incarceration disparities.",
    advantages: [
      "Eliminates systemic disparity: ensures no racial group is jailed at a higher rate.",
      "Social justice: prevents the algorithm from 'baking in' past societal biases.",
      "Forces the system to confront and counteract historical inequalities.",
    ],
    inconveniences: [
      "Predictive inaccuracy: if one group genuinely has a higher reoffending rate, equal treatment may release more high-risk individuals.",
      "'Reverse' unfairness: ignores individual merit or risk in favor of group quotas.",
      "Conflicts with the sentencer's perspective of maximizing predictive accuracy for public safety.",
    ],
  },
];

// ─── COMPAS Profiles (Groups A, B, C, D) ──────────────────────────────────────
const ALL_PROFILES: Profile[] = [
  { id: 13,  name: "Bo Bradac",              sex: "Male",   age: 21, race: "Caucasian",        priors: 1,  charge: "Insurance Fraud",                   scoreText: "Low",    reoffended: true,  group: "A" },
  { id: 27,  name: "Nelson Avalo",           sex: "Male",   age: 27, race: "Caucasian",        priors: 0,  charge: "Possession Of Methamphetamine",     scoreText: "Low",    reoffended: true,  group: "A" },
  { id: 19,  name: "Craig Gilbert",          sex: "Female", age: 47, race: "Caucasian",        priors: 1,  charge: "Arrest Case No Charge",             scoreText: "Low",    reoffended: true,  group: "A" },
  { id: 59,  name: "Moises Miranda",         sex: "Male",   age: 29, race: "Caucasian",        priors: 2,  charge: "Viol Injunct Domestic Violence",    scoreText: "Low",    reoffended: true,  group: "A" },
  { id: 53,  name: "Brooks Nunez",           sex: "Male",   age: 24, race: "Caucasian",        priors: 1,  charge: "Battery",                           scoreText: "Low",    reoffended: true,  group: "A" },
  { id: 24,  name: "Michael Lux",            sex: "Male",   age: 31, race: "Caucasian",        priors: 5,  charge: "Possession Of Heroin",              scoreText: "Low",    reoffended: true,  group: "A" },
  { id: 22,  name: "Darrious Davis",         sex: "Male",   age: 25, race: "African-American", priors: 3,  charge: "Grand Theft in the 3rd Degree",     scoreText: "High",   reoffended: false, group: "B" },
  { id: 5,   name: "Marcu Brown",            sex: "Male",   age: 23, race: "African-American", priors: 1,  charge: "Possession of Cannabis",            scoreText: "High",   reoffended: false, group: "B" },
  { id: 56,  name: "Kiante Slocum",          sex: "Female", age: 21, race: "African-American", priors: 2,  charge: "Arrest Case No Charge",             scoreText: "High",   reoffended: false, group: "B" },
  { id: 83,  name: "Jonny Romerobarrientos", sex: "Male",   age: 30, race: "Hispanic",         priors: 0,  charge: "Possess Cannabis/20 Grams Or Less", scoreText: "Medium", reoffended: false, group: "B" },
  { id: 102, name: "Andres Bayas",           sex: "Male",   age: 22, race: "Hispanic",         priors: 1,  charge: "Burglary Structure Unoccup",        scoreText: "Low",    reoffended: false, group: "B" },
  { id: 61,  name: "Brenda Plummer",         sex: "Female", age: 51, race: "African-American", priors: 7,  charge: "Possession of Cocaine",             scoreText: "Low",    reoffended: false, group: "B" },
  { id: 10,  name: "Elizabeth Thieme",       sex: "Female", age: 39, race: "Caucasian",        priors: 0,  charge: "Battery",                           scoreText: "Low",    reoffended: false, group: "C" },
  { id: 14,  name: "Benjamin Franc",         sex: "Male",   age: 27, race: "Caucasian",        priors: 0,  charge: "Poss 3,4 MDMA (Ecstasy)",          scoreText: "Low",    reoffended: false, group: "C" },
  { id: 16,  name: "Kortney Coleman",        sex: "Female", age: 37, race: "Caucasian",        priors: 0,  charge: "Battery",                           scoreText: "Low",    reoffended: false, group: "C" },
  { id: 28,  name: "Janel Denicola",         sex: "Female", age: 21, race: "Caucasian",        priors: 0,  charge: "Introduce Contraband Into Jail",    scoreText: "Low",    reoffended: false, group: "C" },
  { id: 45,  name: "Mark Friedland",         sex: "Male",   age: 55, race: "Caucasian",        priors: 0,  charge: "Arrest Case No Charge",             scoreText: "Low",    reoffended: false, group: "C" },
  { id: 68,  name: "Michael Harper",         sex: "Male",   age: 49, race: "Caucasian",        priors: 0,  charge: "DUI Level 0.15 Or Minor In Veh",   scoreText: "Low",    reoffended: false, group: "C" },
  { id: 26,  name: "Vandivuiet Williams",    sex: "Male",   age: 21, race: "African-American", priors: 1,  charge: "Battery on Law Enforc Officer",     scoreText: "High",   reoffended: true,  group: "D" },
  { id: 42,  name: "Maslin Brutus",          sex: "Male",   age: 32, race: "African-American", priors: 4,  charge: "Att Tamper w/Physical Evidence",    scoreText: "High",   reoffended: true,  group: "D" },
  { id: 67,  name: "Eddie Jones",            sex: "Male",   age: 35, race: "African-American", priors: 13, charge: "Uttering a Forged Instrument",      scoreText: "High",   reoffended: true,  group: "D" },
  { id: 88,  name: "Erwin Mallard",          sex: "Male",   age: 63, race: "African-American", priors: 10, charge: "Possess Drug Paraphernalia",        scoreText: "Medium", reoffended: true,  group: "D" },
  { id: 90,  name: "Brett Smith",            sex: "Male",   age: 27, race: "African-American", priors: 15, charge: "Driving While License Revoked",     scoreText: "High",   reoffended: true,  group: "D" },
  { id: 98,  name: "Daniel Barnard",         sex: "Male",   age: 27, race: "African-American", priors: 6,  charge: "Aggravated Battery / Pregnant",     scoreText: "Medium", reoffended: true,  group: "D" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CIRC = 144.5;

// ─── Sub-components ────────────────────────────────────────────────────────────
function AvatarPlaceholder({ sex }: { sex: string }) {
  const isFemale = sex === "Female";
  return (
    <div className="rg-avatar">
      <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="32" r="22" fill="currentColor" opacity="0.25" />
        <ellipse cx="50" cy="105" rx={isFemale ? 34 : 30} ry="32" fill="currentColor" opacity="0.2" />
      </svg>
      <div className="rg-avatar-glyph">{isFemale ? "♀" : "♂"}</div>
    </div>
  );
}

function TimerRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const ratio = timeLeft / total;
  const offset = CIRC * (1 - ratio);
  const stroke = ratio > 0.5 ? "var(--rg-accent)" : ratio > 0.25 ? "#F59E0B" : "#EF4444";
  return (
    <div className="rg-timer-wrap">
      <svg className="rg-timer-svg" width="52" height="52" viewBox="0 0 56 56">
        <circle className="rg-ring-bg" cx="28" cy="28" r="23" />
        <circle className="rg-ring-fg" cx="28" cy="28" r="23"
          strokeDasharray={CIRC} strokeDashoffset={offset} style={{ stroke }} />
      </svg>
      <div className="rg-timer-num">{timeLeft}</div>
    </div>
  );
}

function ScoreBadge({ score }: { score: string }) {
  const cls = score === "High" ? "rg-score-high" : score === "Medium" ? "rg-score-med" : "rg-score-low";
  return <span className={`rg-score-badge ${cls}`}>{score} risk</span>;
}

function PriorDots({ count }: { count: number }) {
  const show = Math.min(count, 10);
  return (
    <span className="rg-priors">
      {count === 0
        ? <span className="rg-none">None</span>
        : <>
            {Array.from({ length: show }).map((_, i) => <span key={i} className="rg-dot" />)}
            {count > 10 && <span className="rg-dot-more">+{count - 10}</span>}
          </>
      }
    </span>
  );
}

function ProfileCard({ profile, animKey }: { profile: Profile; animKey: number }) {
  return (
    <div className="rg-card" key={animKey}>
      <div className="rg-card-inner">
        <div className="rg-card-portrait">
          <AvatarPlaceholder sex={profile.sex} />
          <ScoreBadge score={profile.scoreText} />
        </div>
        <div className="rg-card-info">
          <div className="rg-card-name">{profile.name}</div>
          <div className="rg-info-rows">
            <div className="rg-info-row">
              <span className="rg-info-label">Sex</span>
              <span className="rg-info-val">{profile.sex}</span>
            </div>
            <div className="rg-info-row">
              <span className="rg-info-label">Age</span>
              <span className="rg-info-val">{profile.age}</span>
            </div>
            <div className="rg-info-row">
              <span className="rg-info-label">Race</span>
              <span className="rg-info-val">{profile.race}</span>
            </div>
            <div className="rg-info-row">
              <span className="rg-info-label">Priors</span>
              <PriorDots count={profile.priors} />
            </div>
            <div className="rg-info-row rg-info-row--charge">
              <span className="rg-info-label">Charge</span>
              <span className="rg-info-val rg-info-charge">{profile.charge}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ profile, choice, revealed }: {
  profile: Profile;
  choice: RiskChoice | undefined;
  revealed: boolean;
}) {
  const correct = choice === (profile.reoffended ? "reoffended" : "did-not");
  return (
    <div className={`rg-mini-card ${revealed ? (correct ? "rg-correct" : "rg-wrong") : ""}`}>
      <div className="rg-mc-name">{profile.name}</div>
      <div className="rg-mc-meta">{profile.race} · {profile.age}y · {profile.priors} prior{profile.priors !== 1 ? "s" : ""}</div>
      <div className="rg-mc-charge">{profile.charge.length > 40 ? profile.charge.slice(0, 40) + "…" : profile.charge}</div>
      {revealed && (
        <div className="rg-mc-verdict">
          {profile.reoffended
            ? <span className="rg-v-yes">↺ Reoffended</span>
            : <span className="rg-v-no">✓ Did not</span>}
          <span className={`rg-mc-judge ${correct ? "rg-j-ok" : "rg-j-bad"}`}>
            {correct ? "✓ right" : "✗ wrong"}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Fairness Card ─────────────────────────────────────────────────────────────
function FairnessCard({ def, selected, onSelect }: {
  def: FairnessDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`fd-card ${selected ? "fd-card--open" : ""}`}
      style={{ "--fd-accent": def.accentColor } as React.CSSProperties}
      onClick={onSelect}
      role="button"
      aria-expanded={selected}
    >
      {/* ── Header (always visible) ── */}
      <div className="fd-header">
        <div className="fd-header-left">
          <span className="fd-num">0{def.id}</span>
          <div className="fd-titles">
            <span className="fd-subtitle">{def.subtitle}</span>
            <span className="fd-title">{def.title}</span>
          </div>
        </div>
        <div className={`fd-chevron ${selected ? "fd-chevron--open" : ""}`}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ── Expanded body ── */}
      {selected && (
        <div className="fd-body" onClick={e => e.stopPropagation()}>
          <p className="fd-description">{def.description}</p>

          {def.keyFact && (
            <div className="fd-keyfact">
              <span className="fd-keyfact-label">Key finding</span>
              <p>{def.keyFact}</p>
            </div>
          )}

          <div className="fd-cols">
            <div className="fd-col fd-col--pro">
              <div className="fd-col-header">
                <span className="fd-col-icon">✓</span>
                <span className="fd-col-title">Advantages</span>
              </div>
              <ul className="fd-list">
                {def.advantages.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
            <div className="fd-col fd-col--con">
              <div className="fd-col-header">
                <span className="fd-col-icon">✕</span>
                <span className="fd-col-title">Inconveniences</span>
              </div>
              <ul className="fd-list">
                {def.inconveniences.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Fairness Activity Screen ──────────────────────────────────────────────────
function FairnessActivity({ onRestart, onActivity3 }: { onRestart: () => void; onActivity3: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  function toggle(id: number) {
    setSelected(prev => (prev === id ? null : id));
  }

  return (
    <div className="fd-screen">
      <div className="fd-screen-head">
        <div className="fd-eyebrow">Activity 2 · Algorithmic Fairness</div>
        <h2 className="fd-screen-title">Which definition of fairness would you choose?</h2>
        <p className="fd-screen-sub">
          After seeing how COMPAS scores real defendants, explore the competing
          definitions of algorithmic fairness. Click a definition to expand it,
          then vote for the one you'd apply to a criminal risk model.
        </p>
        <div className="fd-impossibility">
          <span className="fd-imp-icon">⚠</span>
          <p>It is <strong>mathematically impossible</strong> to satisfy definitions 1, 2 and 3 simultaneously when base recidivism rates differ between groups.</p>
        </div>
      </div>

      <div className="fd-list-wrap">
        {FAIRNESS_DEFS.map(def => (
          <FairnessCard
            key={def.id}
            def={def}
            selected={selected === def.id}
            onSelect={() => toggle(def.id)}
          />
        ))}
      </div>

      {/* Vote */}
      <div className="fd-vote-wrap">
        <div className="fd-vote-label">If you had to choose one — which definition would you apply?</div>
        <div className="fd-vote-grid">
          {FAIRNESS_DEFS.map(def => (
            <button
              key={def.id}
              className={`fd-vote-btn ${chosen === def.id ? "fd-vote-btn--chosen" : ""}`}
              style={{ "--fd-accent": def.accentColor } as React.CSSProperties}
              onClick={() => setChosen(def.id)}
            >
              <span className="fd-vote-num">0{def.id}</span>
              <span className="fd-vote-name">{def.title}</span>
            </button>
          ))}
        </div>
        {chosen && (
          <div className="fd-vote-result">
            <span className="fd-vote-result-label">Your choice:</span>
            <span className="fd-vote-result-val">
              {FAIRNESS_DEFS.find(d => d.id === chosen)?.title}
            </span>
            <p className="fd-vote-note">
              Remember: no single definition is universally accepted. The debate between
              Northpointe and ProPublica reflects a genuine tension in the foundations of algorithmic justice.
            </p>
          </div>
        )}
      </div>

      <div className="fd-restart-row">
        <button className="rg-btn-primary rg-btn-next" onClick={onActivity3}>
          Activity 3: The Judge’s Dilemma →
        </button>
        <button className="rg-btn-reset fd-restart" onClick={onRestart}>
          ← Restart from Activity 1
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RecidivismGame({
  isActive = true,
  onComplete,
  onActivity1Complete,
}: {
  isActive?: boolean;
  onComplete?: () => void;
  onActivity1Complete?: () => void;
}) {
  const [phase, setPhase]         = useState<GamePhase>("intro");
  const [timerSecs]              = useState(5);
  const [deck, setDeck]           = useState<Profile[]>([]);
  const [current, setCurrent]     = useState(0);
  const [choices, setChoices]     = useState<Record<number, RiskChoice>>({});
  const [timeLeft, setTimeLeft]   = useState(14);
  const [selChoice, setSelChoice] = useState<RiskChoice | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intRef.current) { clearInterval(intRef.current); intRef.current = null; }
  }, []);

  const advance = useCallback((_cat: RiskChoice, idx: number, nc: Record<number, RiskChoice>) => {
    clearTimer();
    const next = idx + 1;
    if (next >= deck.length) { setChoices(nc); setPhase("results"); onActivity1Complete?.(); }
    else { setChoices(nc); setCurrent(next); setSelChoice(null); setTimeLeft(timerSecs); }
  }, [clearTimer, deck.length, timerSecs]);

  const choose = useCallback((cat: RiskChoice, auto = false) => {
    clearTimer();
    setSelChoice(cat);
    const nc = { ...choices, [current]: cat };
    if (auto) advance(cat, current, nc);
    else setTimeout(() => advance(cat, current, nc), 320);
  }, [clearTimer, choices, current, advance]);

  useEffect(() => {
    if (!isActive || phase !== "game") {
      clearTimer();
      return;
    }
    setTimeLeft(timerSecs);
    intRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { choose("did-not", true); return 0; }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimer, isActive, phase, current]);

  function startGame() {
    setDeck(shuffle(ALL_PROFILES));
    setCurrent(0); setChoices({}); setSelChoice(null);
    setRevealed(false); setTimeLeft(timerSecs);
    setPhase("game");
  }

  function restart() {
    clearTimer();
    setPhase("intro");
    setRevealed(false);
  }

  const total    = deck.length;
  const correct  = deck.filter((p, i) => choices[i] === (p.reoffended ? "reoffended" : "did-not")).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const reoffBucket  = deck.map((p, i) => ({ p, i })).filter(x => choices[x.i] === "reoffended");
  const didNotBucket = deck.map((p, i) => ({ p, i })).filter(x => choices[x.i] === "did-not");

  // ── Fairness activity ──
  // ── Dilemma activity
  if (phase === "dilemma") {
    return (
      <div className="rg-app">
        <JudgeDilemma onRestart={restart} onComplete={onComplete} />
      </div>
    );
  }

  if (phase === "fairness") {
    return (
      <div className="rg-app">
        <FairnessActivity onRestart={restart} onActivity3={() => setPhase("dilemma")} />
      </div>
    );
  }

  return (
    <div className="rg-app">

      {/* ── INTRO ── */}
      {phase === "intro" && (
        <div className="rg-intro">
          <div className="rg-intro-eyebrow">Activity 1 of 2 · COMPAS · Broward County, FL · 2013–2014</div>
          <h1>Who Reoffends?</h1>
          <p>
            Real defendant profiles from the ProPublica COMPAS dataset.
            For each person, decide: did they reoffend within two years?
          </p>
          <p className="rg-note">
            These are real people. Your predictions may carry the same biases
            as the algorithm meant to replace human judgment.
          </p>
          {/* <div className="rg-timer-set">
            <label>Seconds per card</label>
            <input type="range" min={5} max={30} step={1} value={timerSecs}
              onChange={e => setTimerSecs(+e.target.value)} />
            <span className="rg-timer-val">{timerSecs}s</span>
          </div> */}
          <button className="rg-btn-primary" onClick={startGame}>
            Begin — {ALL_PROFILES.length} profiles
          </button>
          {/* <button className="rg-btn-reset" onClick={() => setPhase("fairness")}>
            Skip to Activity 2 →
          </button>
          <button className="rg-btn-reset" onClick={() => setPhase("dilemma")}>
            Skip to Activity 3 →
          </button> */}
        </div>
      )}

      {/* ── GAME ── */}
      {phase === "game" && deck.length > 0 && (
        <div className="rg-game">
          <div className="rg-top-row">
            <div className="rg-counter">
              {current + 1}<span className="rg-counter-total"> / {deck.length}</span>
            </div>
            <TimerRing timeLeft={timeLeft} total={timerSecs} />
          </div>
          <div className="rg-progress">
            <div className="rg-progress-fill" style={{ width: `${(current / deck.length) * 100}%` }} />
          </div>
          <ProfileCard profile={deck[current]} animKey={current} />
          <div className="rg-choices">
            <button
              className={`rg-choice rg-choice-no${selChoice === "did-not" ? " rg-sel" : ""}`}
              onClick={() => choose("did-not")}
            >
              <span className="rg-choice-icon">✓</span>
              <span className="rg-choice-label">Did not reoffend</span>
            </button>
            <button
              className={`rg-choice rg-choice-yes${selChoice === "reoffended" ? " rg-sel" : ""}`}
              onClick={() => choose("reoffended")}
            >
              <span className="rg-choice-icon">↺</span>
              <span className="rg-choice-label">Reoffended</span>
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase === "results" && (
        <div className="rg-results">
          <div className="rg-results-head">
            <h2>Your verdicts</h2>
            <p className="rg-results-sub">{total} profiles judged</p>
          </div>

          <div className="rg-acc-block">
            <div className="rg-acc-num">{accuracy}<span className="rg-acc-pct">%</span></div>
            <div className="rg-acc-label">accuracy</div>
            {revealed && (
              <div className="rg-acc-detail">{correct} correct · {total - correct} wrong</div>
            )}
          </div>

          <div className="rg-buckets">
            <div className="rg-bucket">
              <div className="rg-bucket-hd rg-hd-yes">
                Reoffended <span className="rg-bcount">{reoffBucket.length}</span>
              </div>
              <div className="rg-mini-cards">
                {reoffBucket.length === 0
                  ? <div className="rg-empty">None placed here</div>
                  : reoffBucket.map(({ p, i }) =>
                      <MiniCard key={i} profile={p} choice={choices[i]} revealed={revealed} />)}
              </div>
            </div>
            <div className="rg-bucket">
              <div className="rg-bucket-hd rg-hd-no">
                Did not reoffend <span className="rg-bcount">{didNotBucket.length}</span>
              </div>
              <div className="rg-mini-cards">
                {didNotBucket.length === 0
                  ? <div className="rg-empty">None placed here</div>
                  : didNotBucket.map(({ p, i }) =>
                      <MiniCard key={i} profile={p} choice={choices[i]} revealed={revealed} />)}
              </div>
            </div>
          </div>

          <div className="rg-actions">
            {!revealed
              ? <button className="rg-btn-primary" onClick={() => setRevealed(true)}>Reveal truth</button>
              : <p className="rg-reveal-note">Green = correct · Red = wrong</p>
            }
            <button className="rg-btn-primary rg-btn-next" onClick={() => setPhase("fairness")}>
              Activity 2: Fairness Definitions →
            </button>
            <button className="rg-btn-reset" onClick={restart}>Restart</button>
          </div>
        </div>
      )}
    </div>
  );
}
