import { useState } from "react";
import "./JudgeDilemma.css";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type DilemmaPhase =
  | "intro"
  | "round1" | "round1-result"
  | "round2" | "round2-result"
  | "round3" | "round3-result"
  | "round4" | "round4-result"
  | "dashboard";

// ─── Data ──────────────────────────────────────────────────────────────────────

// Round 2: slider — two groups, different base rates
interface R2Group {
  race: string;
  total: number;
  actualReoffenders: number;
}
const R2_GROUPS: R2Group[] = [
  { race: "Black", total: 100, actualReoffenders: 51 },
  { race: "White", total: 100, actualReoffenders: 39 },
];

// Round 3: individual fairness pairs
interface DefPair {
  id: number;
  label: string;
  defA: { name: string; race: string; age: number; priors: number; neighborhood: string; charge: string; score: number };
  defB: { name: string; race: string; age: number; priors: number; neighborhood: string; charge: string; score: number };
  differingFeature: string;
  lesson: string;
}

const R3_PAIRS: DefPair[] = [
  {
    id: 1,
    label: "Pair A",
    defA: { name: "Marcus W.", race: "Black", age: 26, priors: 2, neighborhood: "High danger", charge: "Drug Possession", score: 8 },
    defB: { name: "Tyler R.",  race: "White", age: 26, priors: 2, neighborhood: "Low danger",  charge: "Drug Possession", score: 4 },
    differingFeature: "Neighborhood danger level",
    lesson: "Same age, same priors, same charge — but a 4-point score difference driven entirely by neighborhood. Neighborhood is a proxy for race.",
  },
  {
    id: 2,
    label: "Pair B",
    defA: { name: "Antoine D.", race: "Black", age: 32, priors: 3, neighborhood: "Medium danger", charge: "Battery", score: 7 },
    defB: { name: "Kevin P.",   race: "White", age: 32, priors: 2, neighborhood: "Medium danger", charge: "Battery", score: 3 },
    differingFeature: "One additional prior charge",
    lesson: "One extra prior — accumulated partly due to over-policing in minority neighborhoods — produces a score jump that affects liberty. Priors encode history of systemic bias.",
  },
];

// Round 4: outcome equality allocation
interface R4Defendant {
  id: number;
  name: string;
  race: "Black" | "White";
  score: number;
  reoffended: boolean;
  held: boolean;
}

const R4_DEFENDANTS: R4Defendant[] = [
  { id: 1,  name: "Darnell F.", race: "Black", score: 9, reoffended: true,  held: true  },
  { id: 2,  name: "Marcu B.",   race: "Black", score: 8, reoffended: false, held: true  },
  { id: 3,  name: "Jamal T.",   race: "Black", score: 8, reoffended: true,  held: true  },
  { id: 4,  name: "DeShawn H.", race: "Black", score: 7, reoffended: true,  held: true  },
  { id: 5,  name: "Antoine P.", race: "Black", score: 6, reoffended: false, held: false },
  { id: 6,  name: "Terrence W.",race: "Black", score: 5, reoffended: false, held: false },
  { id: 7,  name: "Marcus G.",  race: "Black", score: 4, reoffended: true,  held: false },
  { id: 8,  name: "Kiante S.",  race: "Black", score: 3, reoffended: false, held: false },
  { id: 9,  name: "Tyler B.",   race: "White", score: 6, reoffended: true,  held: false },
  { id: 10, name: "Cody H.",    race: "White", score: 5, reoffended: true,  held: false },
  { id: 11, name: "Brandon L.", race: "White", score: 4, reoffended: false, held: false },
  { id: 12, name: "Ryan A.",    race: "White", score: 3, reoffended: false, held: false },
  { id: 13, name: "Michael L.", race: "White", score: 3, reoffended: true,  held: false },
  { id: 14, name: "Craig G.",   race: "White", score: 2, reoffended: false, held: false },
  { id: 15, name: "Nelson A.",  race: "White", score: 2, reoffended: true,  held: false },
  { id: 16, name: "Brooks N.",  race: "White", score: 1, reoffended: false, held: false },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function computeR2Stats(threshold: number) {
  // Black base rate: 51 reoffenders / 100  |  White base rate: 39 reoffenders / 100
  // COMPAS systematically over-scores Black defendants and under-scores White defendants.
  // This means:
  //   - At any threshold, more Black reoffenders are caught  → lower Black FNR
  //   - At any threshold, more White reoffenders slip through → higher White FNR
  //   - At low thresholds almost everyone is detained, so FNR → 0 for both,
  //     but White FNR falls more slowly because COMPAS gives them lower scores.
  //   - At high thresholds few are detained: Black FNR rises less steeply than
  //     White FNR because Black reoffenders were already scored higher.
  //
  // Model:
  //   blackDetained  = reoffenders caught + false positives
  //   whiteDetained  = reoffenders caught + false positives
  //
  // Score distribution assumption (reflects COMPAS bias):
  //   Black reoffenders cluster at scores 6-10  → caught even at high threshold
  //   White reoffenders cluster at scores 2-6   → missed at high threshold
  //   Black non-reoffenders cluster at scores 4-8 → many false positives
  //   White non-reoffenders cluster at scores 1-4 → few false positives

  const bReoff = R2_GROUPS[0].actualReoffenders;   // 51
  const wReoff = R2_GROUPS[1].actualReoffenders;   // 39
  const bNonReoff = R2_GROUPS[0].total - bReoff;   // 49
  const wNonReoff = R2_GROUPS[1].total - wReoff;   // 61

  // Fraction of reoffenders caught (TP rate = 1 - FNR)
  // Black reoffenders: scored high by COMPAS → caught even at high thresholds
  // White reoffenders: scored low by COMPAS  → missed at moderate/high thresholds
  const bTPR = Math.min(1, Math.max(0, (11 - threshold) / 7.5));        // drops slowly
  const wTPR = Math.min(1, Math.max(0, (11 - threshold) / 5.0 - 0.25)); // drops fast at threshold > 4

  // Fraction of non-reoffenders falsely detained (FPR)
  // Black non-reoffenders: scored high by COMPAS → many false positives
  // White non-reoffenders: scored low by COMPAS  → few false positives
  const bFPR = Math.min(1, Math.max(0, (10 - threshold) / 6.0));
  const wFPR = Math.min(1, Math.max(0, (10 - threshold) / 10.5));

  const bTruePos  = Math.round(bReoff    * bTPR);
  const wTruePos  = Math.round(wReoff    * wTPR);
  const bFalsePos = Math.round(bNonReoff * bFPR);
  const wFalsePos = Math.round(wNonReoff * wFPR);

  const blackFlagged = Math.min(bTruePos + bFalsePos, R2_GROUPS[0].total);
  const whiteFlagged = Math.min(wTruePos + wFalsePos, R2_GROUPS[1].total);

  const bFNR = Math.max(0, 1 - bTPR);
  const wFNR = Math.max(0, 1 - wTPR);

  const trueNegB = bNonReoff - bFalsePos;
  const trueNegW = wNonReoff - wFalsePos;
  const accuracy = ((bTruePos + wTruePos + trueNegB + trueNegW) /
    (R2_GROUPS[0].total + R2_GROUPS[1].total)) * 100;

  return {
    blackFlagged,
    whiteFlagged,
    bFPR: Math.min(bFPR, 1),
    wFPR: Math.min(wFPR, 1),
    bFNR: Math.min(bFNR, 1),
    wFNR: Math.min(wFNR, 1),
    accuracy: Math.max(40, Math.min(accuracy, 92)),
    fprGap: Math.abs(bFPR - wFPR),
    fnrGap: Math.abs(bFNR - wFNR),
  };
}

function pct(n: number) { return `${Math.round(n * 100)}%`; }
function bar(n: number, color: string, max = 1) {
  return (
    <div className="jd-bar-track">
      <div className="jd-bar-fill" style={{ width: `${(n / max) * 100}%`, background: color }} />
      <span className="jd-bar-label">{Math.round(n * 100)}%</span>
    </div>
  );
}

// ─── Round components ──────────────────────────────────────────────────────────

// ── Round 1 data: Score Without Race ──────────────────────────────────────────
interface R1Profile {
  id: number;
  name: string;           // race-neutral
  age: number;
  priors: number;
  charge: string;
  employment: string;
  neighborhood: string;
  communityTies: string;
  race: "Black" | "White";
  suggestedGroup: "low" | "med" | "high";
  racialProxies: string[]; // features that encode race
}

const R1_PROFILES: R1Profile[] = [
  // ── CLEAR LOW (3 cards, 1 Black / 2 White) ─────────────────────────────────
  {
    id: 1, name: "Jordan M.", age: 34, priors: 0,
    charge: "First-offense DUI (0.09 BAC)",
    employment: "Full-time software engineer, 6 years",
    neighborhood: "Quiet residential suburb, low crime",
    communityTies: "Married, two children, owns home",
    race: "White", suggestedGroup: "low",
    racialProxies: [],
  },
  {
    id: 2, name: "Casey R.", age: 29, priors: 0,
    charge: "Possession of marijuana (personal use, <10g)",
    employment: "Full-time nurse, stable income",
    neighborhood: "Mixed residential area, low crime",
    communityTies: "Strong family support, renting apartment",
    race: "White", suggestedGroup: "low",
    racialProxies: [],
  },
  {
    id: 3, name: "Avery T.", age: 41, priors: 0,
    charge: "Shoplifting ($48 of groceries)",
    employment: "Self-employed contractor, steady clients",
    neighborhood: "Working-class area, some street crime",
    communityTies: "Long-term resident, active in local church",
    race: "Black", suggestedGroup: "low",
    racialProxies: ["Working-class area, some street crime"],
  },

  // ── CLEAR MEDIUM (4 cards, 3 Black / 1 White) ──────────────────────────────
  {
    id: 4, name: "Morgan K.", age: 26, priors: 2,
    charge: "Theft (bicycle, ~$300 value)",
    employment: "Part-time warehouse worker, irregular shifts",
    neighborhood: "Urban area, moderate crime rate",
    communityTies: "Lives with siblings, no stable housing lease",
    race: "Black", suggestedGroup: "med",
    racialProxies: ["Urban area, moderate crime rate", "no stable housing lease"],
  },
  {
    id: 5, name: "Riley D.", age: 23, priors: 1,
    charge: "DUI second offense (0.14 BAC)",
    employment: "Delivery driver, gig economy",
    neighborhood: "Suburban outskirts, low-moderate crime",
    communityTies: "Single, rents room with friends",
    race: "White", suggestedGroup: "med",
    racialProxies: [],
  },
  {
    id: 6, name: "Kendall B.", age: 31, priors: 3,
    charge: "Possession of cocaine (personal use)",
    employment: "Unemployed, looking for work 4 months",
    neighborhood: "High-density urban neighborhood, elevated crime",
    communityTies: "Estranged from family, stays with acquaintances",
    race: "Black", suggestedGroup: "med",
    racialProxies: ["High-density urban neighborhood, elevated crime", "Estranged from family", "Unemployed"],
  },
  {
    id: 7, name: "Alex J.", age: 28, priors: 2,
    charge: "Assault (bar fight, no weapon)",
    employment: "Cook at restaurant, 2 years same employer",
    neighborhood: "Mixed urban area, some incidents reported",
    communityTies: "Partner and infant child, renting",
    race: "Black", suggestedGroup: "med",
    racialProxies: ["Mixed urban area, some incidents reported"],
  },

  // ── CLEAR HIGH (3 cards, 3 Black / 0 White) ───────────────────────────────
  {
    id: 8, name: "Skyler W.", age: 22, priors: 5,
    charge: "Armed robbery (convenience store)",
    employment: "No employment, occasional informal work",
    neighborhood: "High-crime district, frequent police presence",
    communityTies: "No stable address, couch-surfing",
    race: "Black", suggestedGroup: "high",
    racialProxies: ["High-crime district, frequent police presence", "No stable address"],
  },
  {
    id: 9, name: "Devon H.", age: 19, priors: 4,
    charge: "Drug trafficking (distribution, multiple counts)",
    employment: "No formal employment",
    neighborhood: "Known drug corridor, high police activity",
    communityTies: "Single parent household, unstable housing",
    race: "Black", suggestedGroup: "high",
    racialProxies: ["Known drug corridor, high police activity", "unstable housing"],
  },
  {
    id: 10, name: "Reese P.", age: 25, priors: 6,
    charge: "Aggravated assault causing bodily harm",
    employment: "Sporadic cash-in-hand work only",
    neighborhood: "Underserved neighborhood, high violent crime rate",
    communityTies: "No family contact, shelter resident",
    race: "Black", suggestedGroup: "high",
    racialProxies: ["Underserved neighborhood, high violent crime rate", "shelter resident"],
  },
];

type R1Group = "low" | "med" | "high";

// ── Round 1: Score Without Race ────────────────────────────────────────────────
function Round1({ onDone }: { onDone: () => void }) {
  const [assignments, setAssignments] = useState<Record<number, R1Group>>({});
  const [revealed, setRevealed] = useState(false);

  const assign = (id: number, group: R1Group) => {
    if (revealed) return;
    setAssignments(prev => ({ ...prev, [id]: group }));
  };

  const assignedCount = Object.keys(assignments).length;
  const allAssigned = assignedCount === R1_PROFILES.length;

  const bucketProfiles = (g: R1Group) => R1_PROFILES.filter(p => assignments[p.id] === g);

  const GROUP_META: Record<R1Group, { label: string; color: string; cls: string }> = {
    low:  { label: "Low Risk",    color: "#10B981", cls: "r1-bucket-low"  },
    med:  { label: "Medium Risk", color: "#F59E0B", cls: "r1-bucket-med"  },
    high: { label: "High Risk",   color: "#EF4444", cls: "r1-bucket-high" },
  };

  // Stats for lesson
  const blackInHighMed = R1_PROFILES.filter(p => p.race === "Black" && (assignments[p.id] === "high" || assignments[p.id] === "med")).length;
  const whiteInHighMed = R1_PROFILES.filter(p => p.race === "White" && (assignments[p.id] === "high" || assignments[p.id] === "med")).length;
  const totalBlack = R1_PROFILES.filter(p => p.race === "Black").length;
  const totalWhite = R1_PROFILES.filter(p => p.race === "White").length;

  return (
    <div className="jd-round r1-round">
      <div className="jd-round-header">
        <span className="jd-round-badge">Round 1</span>
        <h3>Score Without Race</h3>
        <p className="jd-round-sub">
          COMPAS claims its scores are race-neutral. Let's test that claim on yourself.
          <br /><br />
          Below are <strong>10 defendant profiles</strong> — their crime, background, employment,
          and neighborhood. <strong>Race is hidden.</strong> Assign each to a risk group
          (Low / Medium / High), then reveal the races to see what happened.
        </p>
        <div className="r1-progress-note">
          {assignedCount < R1_PROFILES.length
            ? <>{assignedCount} of {R1_PROFILES.length} assigned — {R1_PROFILES.length - assignedCount} remaining</>
            : <>✓ All assigned — ready to reveal!</>}
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="r1-cards-grid">
        {R1_PROFILES.map(p => {
          const group = assignments[p.id];
          return (
            <div
              key={p.id}
              className={`r1-card ${group ? `r1-card--${group}` : ""} ${revealed ? `r1-card--revealed r1-race-${p.race.toLowerCase()}` : ""}`}
            >
              {/* Race badge — hidden until reveal */}
              {revealed && (
                <div className={`r1-race-badge r1-rb-${p.race.toLowerCase()}`}>
                  {p.race}
                </div>
              )}

              <div className="r1-card-name">{p.name}</div>
              <div className="r1-card-age">Age {p.age}</div>

              <div className="r1-fields">
                <div className="r1-field">
                  <span className="r1-flabel">Priors</span>
                  <span className="r1-fval">
                    {p.priors === 0 ? "None" : p.priors}
                    {Array.from({length: Math.min(p.priors, 6)}).map((_, i) => (
                      <span key={i} className="r1-prior-dot" />
                    ))}
                  </span>
                </div>
                <div className="r1-field">
                  <span className="r1-flabel">Charge</span>
                  <span className="r1-fval r1-fval--charge">{p.charge}</span>
                </div>
                <div className="r1-field">
                  <span className="r1-flabel">Employment</span>
                  <span className="r1-fval">{p.employment}</span>
                </div>
                <div className={`r1-field ${revealed && p.racialProxies.length > 0 ? "r1-field--proxy" : ""}`}>
                  <span className="r1-flabel">
                    Neighborhood
                    {revealed && p.racialProxies.some(x => x.toLowerCase().includes("neighborhood") || x.toLowerCase().includes("district") || x.toLowerCase().includes("area") || x.toLowerCase().includes("corridor")) && (
                      <span className="r1-proxy-tag">racial proxy ⚠</span>
                    )}
                  </span>
                  <span className="r1-fval">{p.neighborhood}</span>
                </div>
                <div className="r1-field">
                  <span className="r1-flabel">Community</span>
                  <span className="r1-fval">{p.communityTies}</span>
                </div>
              </div>

              {/* Group buttons */}
              {!revealed && (
                <div className="r1-group-btns">
                  {(["low", "med", "high"] as R1Group[]).map(g => (
                    <button
                      key={g}
                      className={`r1-gbtn r1-gbtn--${g} ${group === g ? "r1-gbtn--active" : ""}`}
                      onClick={() => assign(p.id, g)}
                    >
                      {g === "low" ? "Low" : g === "med" ? "Med" : "High"}
                    </button>
                  ))}
                </div>
              )}
              {revealed && group && (
                <div className={`r1-assigned-badge r1-assigned--${group}`}>
                  {GROUP_META[group].label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bucket summary (post-reveal) ── */}
      {revealed && (
        <div className="r1-buckets-reveal">
          {(["low", "med", "high"] as R1Group[]).map(g => {
            const profiles = bucketProfiles(g);
            const black = profiles.filter(p => p.race === "Black").length;
            const white = profiles.filter(p => p.race === "White").length;
            return (
              <div key={g} className={`r1-bucket-col ${GROUP_META[g].cls}`}>
                <div className="r1-bucket-header">{GROUP_META[g].label} ({profiles.length})</div>
                <div className="r1-bucket-breakdown">
                  <span className="r1-bb-black">⬛ Black: {black}</span>
                  <span className="r1-bb-white">⬜ White: {white}</span>
                </div>
                <div className="r1-bucket-bar">
                  {black > 0 && <div className="r1-bb-fill r1-bb-fill--black" style={{flex: black}} />}
                  {white > 0 && <div className="r1-bb-fill r1-bb-fill--white" style={{flex: white}} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lesson panel (post-reveal) ── */}
      {revealed && (
        <div className="r1-lesson-panel">
          <div className="r1-lesson-title">What just happened?</div>

          <div className="r1-stats-compare">
            <div className="r1-stat-block">
              <div className="r1-stat-label">Your High/Med rate</div>
              <div className="r1-stat-row-compare">
                <div>
                  <span className="r1-race-chip r1-chip-black">Black</span>
                  <strong>{blackInHighMed}/{totalBlack} ({Math.round(blackInHighMed/totalBlack*100)}%)</strong>
                </div>
                <div>
                  <span className="r1-race-chip r1-chip-white">White</span>
                  <strong>{whiteInHighMed}/{totalWhite} ({Math.round(whiteInHighMed/totalWhite*100)}%)</strong>
                </div>
              </div>
            </div>
            <div className="r1-stat-block">
              <div className="r1-stat-label">Real COMPAS system-wide</div>
              <div className="r1-stat-row-compare">
                <div>
                  <span className="r1-race-chip r1-chip-black">Black</span>
                  <strong>42% flagged Med/High</strong>
                </div>
                <div>
                  <span className="r1-race-chip r1-chip-white">White</span>
                  <strong>22% flagged Med/High</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="jd-lesson-box r1-lesson-box">
            <span className="jd-lesson-icon">💡</span>
            <div>
              <strong>You didn't use race.</strong> But the features you used —
              neighborhood danger, housing stability, unemployment — are <em>proxies for race</em>.
              They encode decades of segregation, over-policing, and economic exclusion.
              Your distribution likely mirrors COMPAS almost exactly.
              <br /><br />
              <strong>Northpointe's fairness definition</strong> says the score is fair because it
              predicts equally well for both races. But it says nothing about how many of each race
              end up in each bucket — and that disparity is where the harm lives.
            </div>
          </div>

          <div className="r1-proxy-legend">
            <span className="r1-proxy-tag">racial proxy ⚠</span>
            Features flagged above encode systemic racial inequality and were used by COMPAS.
          </div>
        </div>
      )}

      <div className="r1-action-row">
        {!revealed ? (
          <button
            className="jd-btn-next"
            disabled={!allAssigned}
            onClick={() => setRevealed(true)}
          >
            Reveal races →
          </button>
        ) : (
          <button className="jd-btn-next" onClick={() => onDone()}>
            Continue to Round 2 →
          </button>
        )}
      </div>
    </div>
  );
}


// ── Round 2: Error Rate Parity Slider ─────────────────────────────────────────
function Round2({ onDone }: { onDone: (threshold: number) => void }) {
  const [threshold, setThreshold] = useState(5);
  const stats = computeR2Stats(threshold);
  const parityOk = stats.fprGap < 0.08 && stats.fnrGap < 0.08;

  return (
    <div className="jd-round">
      <div className="jd-round-header">
        <span className="jd-round-badge">Round 2</span>
        <h3>Defendant Perspective — Error Rate Parity</h3>
        <p className="jd-round-sub">
          You are configuring the detention threshold for a county with <strong>100 Black</strong> and
          <strong>100 White</strong> defendants. Black defendants have a 51% actual reoffending rate;
          White defendants 39%. COMPAS systematically <em>over-scores</em> Black defendants
          and <em>under-scores</em> White defendants.
          <br /><br />
          Move the slider and watch how the <strong>False Negative Rate</strong> behaves:
          at low thresholds (detain almost everyone) both FNRs drop — but
          <strong>White FNR stays higher</strong> because COMPAS gave white reoffenders lower scores,
          letting them slip through even when the net is wide.
          Your goal: find a threshold where FPR <em>and</em> FNR are equal across races.
        </p>
      </div>

      <div className="jd-slider-wrap">
        <label className="jd-slider-label">
          Detention threshold: score ≥ <strong>{threshold}</strong>
        </label>
        <input
          type="range" min={1} max={10} step={1} value={threshold}
          onChange={e => setThreshold(+e.target.value)}
          className="jd-slider"
        />
        <div className="jd-slider-ticks">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={threshold === i + 1 ? "jd-tick-active" : ""}>{i + 1}</span>
          ))}
        </div>
      </div>

      <div className="jd-stats-grid">
        <div className="jd-stats-col">
          <div className="jd-stats-head jd-head-black">Black defendants</div>
          <div className="jd-stat-item">
            <span>Detained</span>
            <span>{stats.blackFlagged} / 100</span>
          </div>
          <div className="jd-stat-item">
            <span>False Positive Rate</span>
            {bar(stats.bFPR, "#EF4444")}
          </div>
          <div className="jd-stat-item">
            <span>False Negative Rate</span>
            {bar(stats.bFNR, "#F59E0B")}
          </div>
        </div>
        <div className="jd-stats-col">
          <div className="jd-stats-head jd-head-white">White defendants</div>
          <div className="jd-stat-item">
            <span>Detained</span>
            <span>{stats.whiteFlagged} / 100</span>
          </div>
          <div className="jd-stat-item">
            <span>False Positive Rate</span>
            {bar(stats.wFPR, "#EF4444")}
          </div>
          <div className="jd-stat-item">
            <span>False Negative Rate</span>
            {bar(stats.wFNR, "#F59E0B")}
          </div>
        </div>
      </div>

      <div className="jd-fnr-insight">
        {stats.wFNR > stats.bFNR
          ? <span className="jd-fnr-note jd-fnr-note--white">
              ⚠ White FNR ({pct(stats.wFNR)}) &gt; Black FNR ({pct(stats.bFNR)}) —
              white reoffenders are slipping through undetected
            </span>
          : stats.bFNR > stats.wFNR
          ? <span className="jd-fnr-note jd-fnr-note--black">
              ⚠ Black FNR ({pct(stats.bFNR)}) &gt; White FNR ({pct(stats.wFNR)}) —
              high threshold is now missing more Black reoffenders
            </span>
          : <span className="jd-fnr-note jd-fnr-note--equal">✓ FNRs equal at this threshold</span>
        }
      </div>

      <div className="jd-fnr-insight">
        {stats.wFPR > stats.bFPR
          ? <span className="jd-fnr-note jd-fnr-note--white">
              ⚠ White FPR ({pct(stats.wFPR)}) &gt; Black FPR ({pct(stats.bFPR)}) —
              more white than black defendants are misjugded as offenders
            </span>
          : stats.bFPR > stats.wFPR
          ? <span className="jd-fnr-note jd-fnr-note--black">
              ⚠ Black FPR ({pct(stats.bFPR)}) &gt; White FPR ({pct(stats.wFPR)}) —
              more black than white defendants are misjugded as offenders
            </span>
          : <span className="jd-fnr-note jd-fnr-note--equal">✓ FPRs equal at this threshold</span>
        }
      </div>


      
      <div className={`jd-parity-status ${parityOk ? "jd-parity-ok" : "jd-parity-bad"}`}>
        {parityOk
          ? `✓ Parity achieved! Accuracy: ${Math.round(stats.accuracy)}%`
          : `FPR gap: ${pct(stats.fprGap)} · FNR gap: ${pct(stats.fnrGap)} · Accuracy: ${Math.round(stats.accuracy)}%`}
      </div>

      <button className="jd-btn-next" onClick={() => onDone(threshold)}>
        Lock in threshold →
      </button>
    </div>
  );
}

function Round2Result({ threshold, onNext }: { threshold: number; onNext: () => void }) {
  const stats = computeR2Stats(threshold);
  // Find threshold that would equalize FPR
  const equalThreshold = 6;
  const equalStats = computeR2Stats(equalThreshold);

  return (
    <div className="jd-result-panel">
      <div className="jd-result-badge jd-badge-info">Round 2 — Outcome</div>
      <h3>Equalizing Errors Costs Accuracy — And Conflicts with Round 1</h3>
      <p>
        You set the threshold to <strong>{threshold}</strong>. Here's what that produced,
        compared to a threshold that minimizes the error rate gap:
      </p>

      <div className="jd-comparison-grid">
        <div className="jd-comp-col">
          <div className="jd-comp-header">Your threshold ({threshold})</div>
          <div className="jd-comp-row">FPR gap <strong>{pct(stats.fprGap)}</strong></div>
          <div className="jd-comp-row">FNR gap <strong>{pct(stats.fnrGap)}</strong></div>
          <div className="jd-comp-row">Overall accuracy <strong>{Math.round(stats.accuracy)}%</strong></div>
          <div className="jd-comp-row">Black detained <strong>{stats.blackFlagged}</strong></div>
          <div className="jd-comp-row">White detained <strong>{stats.whiteFlagged}</strong></div>
        </div>
        <div className="jd-comp-col">
          <div className="jd-comp-header">Best parity threshold ({equalThreshold})</div>
          <div className="jd-comp-row">FPR gap <strong>{pct(equalStats.fprGap)}</strong></div>
          <div className="jd-comp-row">FNR gap <strong>{pct(equalStats.fnrGap)}</strong></div>
          <div className="jd-comp-row">Overall accuracy <strong>{Math.round(equalStats.accuracy)}%</strong></div>
          <div className="jd-comp-row">Black detained <strong>{equalStats.blackFlagged}</strong></div>
          <div className="jd-comp-row">White detained <strong>{equalStats.whiteFlagged}</strong></div>
        </div>
      </div>

      <div className="jd-lesson-box">
        <span className="jd-lesson-icon">💡</span>
        <div>
          <strong>The impossibility:</strong> Because Black defendants have a higher base reoffending rate (51% vs 39%),
          equalizing false positive rates forces you to either lower accuracy or release more high-risk individuals.
          You <em>cannot</em> simultaneously have equal FPRs, equal FNRs.
        </div>
      </div>

      <button className="jd-btn-next" onClick={onNext}>Continue to Round 3 →</button>
    </div>
  );
}

// ── Round 3: Individual Fairness ───────────────────────────────────────────────
function Round3({ onDone }: { onDone: (answers: boolean[]) => void }) {
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null]);
  const allAnswered = answers.every(a => a !== null);

  function answer(pairIdx: number, same: boolean) {
    setAnswers(prev => { const a = [...prev]; a[pairIdx] = same; return a; });
  }

  return (
    <div className="jd-round">
      <div className="jd-round-header">
        <span className="jd-round-badge">Round 3</span>
        <h3>Individual Fairness — Who Counts as "Identical"?</h3>
        <p className="jd-round-sub">
          Individual fairness says: <em>similar individuals should be treated similarly.</em>
          For each pair below, decide: are these two defendants similar enough to deserve
          the same risk score?
        </p>
      </div>

      {R3_PAIRS.map((pair, idx) => (
        <div key={pair.id} className="jd-pair-wrap">
          <div className="jd-pair-label">{pair.label}</div>
          <div className="jd-pair-grid">
            {([pair.defA, pair.defB] as const).map((def, di) => (
              <div key={di} className={`jd-pair-card jd-race-${def.race.toLowerCase().replace("-", "")}`}>
                <div className="jd-pair-name">{def.name}</div>
                <div className="jd-pair-row"><span>Race</span><strong>{def.race}</strong></div>
                <div className="jd-pair-row"><span>Age</span><strong>{def.age}</strong></div>
                <div className="jd-pair-row"><span>Priors</span><strong>{def.priors}</strong></div>
                <div className="jd-pair-row jd-pair-diff"><span>Neighborhood</span><strong>{def.neighborhood}</strong></div>
                <div className="jd-pair-row"><span>Charge</span><strong>{def.charge}</strong></div>
                <div className="jd-pair-score">COMPAS: {def.score}</div>
              </div>
            ))}
          </div>
          <div className="jd-pair-diffnote">
            Differing feature: <em>{pair.differingFeature}</em>
          </div>
          <div className="jd-pair-choice">
            <span>Should they receive the same score?</span>
            <div className="jd-pair-btns">
              <button
                className={`jd-pair-btn ${answers[idx] === true ? "jd-pair-yes" : ""}`}
                onClick={() => answer(idx, true)}
              >Yes — they're similar</button>
              <button
                className={`jd-pair-btn ${answers[idx] === false ? "jd-pair-no" : ""}`}
                onClick={() => answer(idx, false)}
              >No — the difference matters</button>
            </div>
          </div>
        </div>
      ))}

      <button
        className="jd-btn-next"
        disabled={!allAnswered}
        onClick={() => onDone(answers as boolean[])}
      >
        See the lesson →
      </button>
    </div>
  );
}

function Round3Result({ answers, onNext }: { answers: boolean[]; onNext: () => void }) {
  return (
    <div className="jd-result-panel">
      <div className="jd-result-badge jd-badge-info">Round 3 — Outcome</div>
      <h3>Deciding "Similar" Is a Political Choice</h3>

      {R3_PAIRS.map((pair, idx) => (
        <div key={pair.id} className="jd-r3-reveal">
          <div className="jd-r3-header">
            <span>{pair.label}</span>
            <span className={`jd-r3-answer ${answers[idx] ? "jd-r3-yes" : "jd-r3-no"}`}>
              You said: {answers[idx] ? "Similar → same score" : "Different → different score"}
            </span>
          </div>
          <div className="jd-lesson-box">
            <span className="jd-lesson-icon">💡</span>
            <div>{pair.lesson}</div>
          </div>
        </div>
      ))}

      <div className="jd-lesson-box jd-lesson-main">
        <span className="jd-lesson-icon">⚖️</span>
        <div>
          <strong>The core problem:</strong> There is no neutral definition of "similar." Choosing
          which features matter (and which don't) is a value judgment. When features like
          neighborhood or prior arrests encode historic racial inequities, including them in a
          "fair" individual comparison quietly perpetuates systemic injustice.
        </div>
      </div>

      <button className="jd-btn-next" onClick={onNext}>Continue to Round 4 →</button>
    </div>
  );
}

// ── Round 4: Equality of Outcome ──────────────────────────────────────────────
function Round4({ onDone }: { onDone: (held: Set<number>) => void }) {
  const [held, setHeld] = useState<Set<number>>(
    new Set(R4_DEFENDANTS.filter(d => d.held).map(d => d.id))
  );

  const blackHeld = R4_DEFENDANTS.filter(d => d.race === "Black" && held.has(d.id)).length;
  const whiteHeld = R4_DEFENDANTS.filter(d => d.race === "White" && held.has(d.id)).length;
  const blackTotal = R4_DEFENDANTS.filter(d => d.race === "Black").length;
  const whiteTotal = R4_DEFENDANTS.filter(d => d.race === "White").length;
  const parityOk = Math.abs(blackHeld / blackTotal - whiteHeld / whiteTotal) < 0.06;

  function toggle(id: number) {
    setHeld(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  return (
    <div className="jd-round">
      <div className="jd-round-header">
        <span className="jd-round-badge">Round 4</span>
        <h3>Equality of Outcome — Equal Detention Rates</h3>
        <p className="jd-round-sub">
          The goal: detain an <strong>equal proportion</strong> of Black and White defendants.
          The COMPAS baseline (pre-selected below) detains 50% of Black defendants and 0% of White defendants —
          a stark disparity. Adjust who is held to reach parity.
          <br /><br />
          The score shown is the original COMPAS score. You may override it.
        </p>
      </div>

      <div className={`jd-parity-status ${parityOk ? "jd-parity-ok" : "jd-parity-bad"}`}>
        Black detained: {blackHeld}/{blackTotal} ({Math.round(blackHeld / blackTotal * 100)}%) ·
        White detained: {whiteHeld}/{whiteTotal} ({Math.round(whiteHeld / whiteTotal * 100)}%) ·
        {parityOk ? " ✓ Parity achieved!" : " ✗ Not yet equal"}
      </div>

      <div className="jd-r4-groups">
        {(["Black", "White"] as const).map(race => (
          <div key={race} className="jd-r4-group">
            <div className={`jd-r4-group-header jd-race-${race.toLowerCase()}`}>{race} defendants</div>
            {R4_DEFENDANTS.filter(d => d.race === race).map(d => (
              <button
                key={d.id}
                className={`jd-r4-card ${held.has(d.id) ? "jd-def-held" : ""}`}
                onClick={() => toggle(d.id)}
              >
                <span className="jd-r4-name">{d.name}</span>
                <span className="jd-r4-score">Score: {d.score}</span>
                <span className={`jd-r4-toggle ${held.has(d.id) ? "jd-hold" : "jd-release"}`}>
                  {held.has(d.id) ? "🔒" : "🔓"}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <button className="jd-btn-next" onClick={() => onDone(held)}>
        See the outcome →
      </button>
    </div>
  );
}

function Round4Result({ held, onNext }: { held: Set<number>; onNext: () => void }) {
  const yourHeld = R4_DEFENDANTS.filter(d => held.has(d.id));
  const yourFP = yourHeld.filter(d => !d.reoffended).length;
  const yourFN = R4_DEFENDANTS.filter(d => !held.has(d.id) && d.reoffended).length;
  const baseHeld = R4_DEFENDANTS.filter(d => d.held);
  const baseFP = baseHeld.filter(d => !d.reoffended).length;
  const baseFN = R4_DEFENDANTS.filter(d => !d.held && d.reoffended).length;
  const blackHeld = R4_DEFENDANTS.filter(d => d.race === "Black" && held.has(d.id)).length;
  const whiteHeld = R4_DEFENDANTS.filter(d => d.race === "White" && held.has(d.id)).length;
  const blackTotal = R4_DEFENDANTS.filter(d => d.race === "Black").length;
  const whiteTotal = R4_DEFENDANTS.filter(d => d.race === "White").length;

  return (
    <div className="jd-result-panel">
      <div className="jd-result-badge jd-badge-info">Round 4 — Outcome</div>
      <h3>Equal Outcomes Require Overriding Individual Scores</h3>

      <div className="jd-comparison-grid">
        <div className="jd-comp-col">
          <div className="jd-comp-header">COMPAS baseline</div>
          <div className="jd-comp-row">Black detained <strong>{baseHeld.filter(d => d.race === "Black").length}/{blackTotal} (50%)</strong></div>
          <div className="jd-comp-row">White detained <strong>0/{whiteTotal} (0%)</strong></div>
          <div className="jd-comp-row">False positives <strong>{baseFP}</strong></div>
          <div className="jd-comp-row">False negatives <strong>{baseFN}</strong></div>
        </div>
        <div className="jd-comp-col">
          <div className="jd-comp-header">Your adjustments</div>
          <div className="jd-comp-row">Black detained <strong>{blackHeld}/{blackTotal} ({Math.round(blackHeld / blackTotal * 100)}%)</strong></div>
          <div className="jd-comp-row">White detained <strong>{whiteHeld}/{whiteTotal} ({Math.round(whiteHeld / whiteTotal * 100)}%)</strong></div>
          <div className="jd-comp-row">False positives <strong>{yourFP}</strong></div>
          <div className="jd-comp-row">False negatives <strong>{yourFN}</strong></div>
        </div>
      </div>

      <div className="jd-lesson-box">
        <span className="jd-lesson-icon">💡</span>
        <div>
          <strong>The trade-off:</strong> Achieving equal detention rates required you to either release
          some high-scoring Black defendants or detain some low-scoring White defendants — both of which
          override individual risk predictions. Equality of outcome directly conflicts with individual
          fairness (Round 3) and predictive accuracy (Rounds 1 & 2).
        </div>
      </div>

      <button className="jd-btn-next" onClick={onNext}>See the full picture →</button>
    </div>
  );
}

// ── Impossibility Dashboard ────────────────────────────────────────────────────
function ImpossibilityDashboard({ onRestart, onComplete }: { onRestart: () => void; onComplete?: () => void }) {
  const defs = [
    { id: 1, name: "Calibration", subtitle: "Northpointe" },
    { id: 2, name: "Equal FPR/FNR", subtitle: "ProPublica" },
    { id: 3, name: "Individual Fairness", subtitle: "" },
    { id: 4, name: "Equal Outcomes", subtitle: "" },
  ];

  // Compatibility matrix: can row i and col j be satisfied simultaneously?
  // Based on Chouldechova 2017 + fairness literature
  const compatible: boolean[][] = [
    [true,  false, true,  false], // Calibration
    [false, true,  true,  false], // Equal FPR/FNR
    [true,  true,  true,  false], // Individual Fairness
    [false, false, false, true ], // Equal Outcomes
  ];

  const conflicts = [
    { a: "Calibration", b: "Equal FPR/FNR", why: "Chouldechova's theorem: when base rates differ, you cannot have both calibration and equal error rates." },
    { a: "Calibration", b: "Equal Outcomes", why: "If scores reflect true risk and base rates differ, equal detention proportions requires ignoring calibrated scores." },
    { a: "Equal FPR/FNR", b: "Equal Outcomes", why: "Equalizing error rates still produces unequal detention counts when base rates differ." },
    { a: "Individual Fairness", b: "Equal Outcomes", why: "Treating individuals by their features produces group-level disparity if groups have different feature distributions." },
  ];

  return (
    <div className="jd-dashboard">
      <div className="jd-dashboard-header">
        <span className="jd-round-badge">Final Dashboard</span>
        <h3>The Impossibility of Algorithmic Fairness</h3>
        <p>
          You've experienced all four definitions. Here's why they fundamentally conflict.
        </p>
      </div>

      {/* Compatibility matrix */}
      <div className="jd-matrix-wrap">
        <div className="jd-matrix-title">Compatibility Matrix</div>
        <div className="jd-matrix">
          <div className="jd-matrix-row jd-matrix-header-row">
            <div className="jd-matrix-cell jd-matrix-corner" />
            {defs.map(d => (
              <div key={d.id} className="jd-matrix-cell jd-matrix-head">{d.name}</div>
            ))}
          </div>
          {defs.map((row, ri) => (
            <div key={row.id} className="jd-matrix-row">
              <div className="jd-matrix-cell jd-matrix-row-head">{row.name}</div>
              {defs.map((col, ci) => (
                <div
                  key={col.id}
                  className={`jd-matrix-cell jd-matrix-value ${ri === ci ? "jd-matrix-diag" : compatible[ri][ci] ? "jd-matrix-yes" : "jd-matrix-no"}`}
                >
                  {ri === ci ? "—" : compatible[ri][ci] ? "✓" : "✗"}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="jd-matrix-legend">
          <span className="jd-leg-yes">✓ Can coexist</span>
          <span className="jd-leg-no">✗ Mathematically incompatible</span>
        </div>
      </div>

      {/* Key conflicts */}
      <div className="jd-conflicts">
        <div className="jd-conflicts-title">Why They Conflict</div>
        {conflicts.map((c, i) => (
          <div key={i} className="jd-conflict-card">
            <div className="jd-conflict-header">
              <span className="jd-conflict-a">{c.a}</span>
              <span className="jd-conflict-sep">✗</span>
              <span className="jd-conflict-b">{c.b}</span>
            </div>
            <p className="jd-conflict-why">{c.why}</p>
          </div>
        ))}
      </div>

      {/* Takeaway */}
      <div className="jd-takeaway">
        <div className="jd-takeaway-title">What this means</div>
        <p>
          There is no algorithm that is simultaneously fair to sentencers (calibrated),
          fair to defendants (equal error rates), fair to individuals (individual fairness),
          and fair to groups (equal outcomes) — <strong>whenever group base rates differ.</strong>
        </p>
        <p>
          This is not a bug. It is a mathematical proof. Choosing which definition of fairness to
          optimize is a political and moral decision — not a technical one. COMPAS chose calibration.
          ProPublica argued for error rate parity. Neither is objectively correct.
        </p>
        <p className="jd-takeaway-source">
          Source: Chouldechova, A. (2017). "Fair prediction with disparate impact." &nbsp;
          Kleinberg et al. (2016). "Inherent trade-offs in the fair determination of risk scores."
        </p>
      </div>

      <button className="jd-btn-next" onClick={onRestart}>← Start over from Activity 1</button>
      {onComplete && (
        <button className="jd-btn-next" onClick={onComplete}>Continue to chapter →</button>
      )}
    </div>
  );
}

// ─── Main JudgeDilemma component ───────────────────────────────────────────────
export default function JudgeDilemma({ onRestart, onComplete }: { onRestart: () => void; onComplete?: () => void }) {
  const [phase, setPhase] = useState<DilemmaPhase>("intro");
  const [r2Threshold, setR2Threshold] = useState(5);
  const [r3Answers, setR3Answers] = useState<boolean[]>([]);
  const [r4Held, setR4Held] = useState<Set<number>>(new Set());

  return (
    <div className="jd-app">

      {phase === "intro" && (
        <div className="jd-intro">
          <div className="jd-eyebrow">Activity 3 · The Judge's Dilemma</div>
          <h2>Can an algorithm be fair?</h2>
          <p>
            You'll play 4 rounds, each applying a different definition of fairness to real
            criminal justice scenarios. Each round reveals a hidden cost or contradiction.
          </p>
          <div className="jd-round-preview">
            {[
              { n: 1, name: "Score Without Race", desc: "Assign risk scores — then see which race ends up where" },
              { n: 2, name: "Error Rate Parity", desc: "Equal false positive and false negative rates" },
              { n: 3, name: "Individual Fairness", desc: "Similar people should get similar scores" },
              { n: 4, name: "Equality of Outcome", desc: "Equal detention rates across racial groups" },
            ].map(r => (
              <div key={r.n} className="jd-preview-card">
                <span className="jd-preview-num">0{r.n}</span>
                <div>
                  <div className="jd-preview-name">{r.name}</div>
                  <div className="jd-preview-desc">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="jd-btn-next" onClick={() => setPhase("round1")}>
            Begin Round 1 →
          </button>
          <button className="jd-btn-back" onClick={onRestart}>← Back to Activities</button>
        </div>
      )}

      {phase === "round1" && (
        <Round1 onDone={() => setPhase("round2")} />
      )}

      {phase === "round2" && (
        <Round2 onDone={t => { setR2Threshold(t); setPhase("round2-result"); }} />
      )}
      {phase === "round2-result" && (
        <Round2Result threshold={r2Threshold} onNext={() => setPhase("round3")} />
      )}
      {phase === "round3" && (
        <Round3 onDone={ans => { setR3Answers(ans); setPhase("round3-result"); }} />
      )}
      {phase === "round3-result" && (
        <Round3Result answers={r3Answers} onNext={() => setPhase("round4")} />
      )}
      {phase === "round4" && (
        <Round4 onDone={held => { setR4Held(held); setPhase("round4-result"); }} />
      )}
      {phase === "round4-result" && (
        <Round4Result held={r4Held} onNext={() => setPhase("dashboard")} />
      )}
      {phase === "dashboard" && (
        <ImpossibilityDashboard onRestart={onRestart} onComplete={onComplete} />
      )}
    </div>
  );
}
