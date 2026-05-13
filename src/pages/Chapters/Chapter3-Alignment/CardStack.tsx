import { useEffect, useMemo, useRef, useState } from "react";
import {
  CARD_PAPERS,
  ENDINGS,
  ENDING_MAX,
  ENDING_MIN,
  GAP_THRESHOLD,
  GAME_SIZE,
  INITIAL_METERS,
  SPEAKERS,
  TRUTH_THRESHOLD,
  VERDICT_COPY,
  applyDelta,
  computeVerdict,
  detectEnding,
  sampleDeck,
  type Card,
  type CardPaper,
  type Choice,
  type Ending,
  type EndingKind,
  type MeterDelta,
  type MeterKey,
  type MeterState,
} from "./alignmentCards";
import styles from "./CardStack.module.css";

type HistoryEntry = {
  cardId: string;
  choice: "A" | "B";
  flavor: string;
};

const METER_LABELS: Record<MeterKey, string> = {
  truth: "Truth",
  majority: "Approval",
  minority: "Compassion",
};

const METER_ICONS: Record<MeterKey, string> = {
  truth: "🎯",
  majority: "👍",
  minority: "💛",
};

const METER_SUBLABELS: Record<MeterKey, string> = {
  truth: "is the answer correct?",
  majority: "from the mainstream raters",
  minority: "for the overlooked raters",
};

const METER_FILL_CLASS: Record<MeterKey, string> = {
  truth: styles.meterTruth,
  majority: styles.meterMajority,
  minority: styles.meterMinority,
};

const TAG_CLASS: Record<Card["tag"], string> = {
  sycophancy: styles.tagSycophancy,
  cultural: styles.tagCultural,
  persona: styles.tagPersona,
  factual: styles.tagFactual,
  political: styles.tagPolitical,
  stereotype: styles.tagStereotype,
};

const TAG_LABEL: Record<Card["tag"], string> = {
  sycophancy: "sycophancy trap",
  cultural: "cultural default",
  persona: "persona steering",
  factual: "factual w/ weight",
  political: "political framing",
  stereotype: "stereotype default",
};

export type GameOutcome = "survived" | MeterKey;

// Beam search across a deck's choices to find a path that ends in the
// "honest-even" verdict without ever crashing a meter. If the current deck
// has no winning path under search depth, sample a fresh deck and try again.
// Effectively always succeeds — typical decks have many winning paths.
type Plan = { deck: Card[]; choices: Array<"A" | "B"> };

function planWinningDeck(deck: Card[], beamWidth = 16): Array<"A" | "B"> | null {
  type Node = { state: MeterState; choices: Array<"A" | "B"> };
  let beam: Node[] = [{ state: INITIAL_METERS, choices: [] }];

  const scoreNode = (s: MeterState) => {
    const cliffMargin = Math.min(
      s.truth - ENDING_MIN,
      ENDING_MAX - s.truth,
      s.majority - ENDING_MIN,
      ENDING_MAX - s.majority,
      s.minority - ENDING_MIN,
      ENDING_MAX - s.minority,
    );
    const truthShortfall = Math.max(0, TRUTH_THRESHOLD + 4 - s.truth);
    const gap = Math.abs(s.majority - s.minority);
    const gapShortfall = Math.max(0, gap - (GAP_THRESHOLD - 4));
    return -truthShortfall * 1.6 - gapShortfall * 1.3 + cliffMargin * 0.18;
  };

  for (const card of deck) {
    const next: Node[] = [];
    for (const node of beam) {
      for (const which of ["A", "B"] as const) {
        const choice = which === "A" ? card.choiceA : card.choiceB;
        const s = applyDelta(node.state, choice.delta);
        if (detectEnding(s)) continue; // skip cliff paths
        next.push({ state: s, choices: [...node.choices, which] });
      }
    }
    if (next.length === 0) return null;
    next.sort((a, b) => scoreNode(b.state) - scoreNode(a.state));
    beam = next.slice(0, beamWidth);
  }

  const winner = beam.find((n) => computeVerdict(n.state) === "honest-even");
  return winner?.choices ?? null;
}

// "Criticality" score for the pick on a card: how much majority approval
// the chosen choice gave up vs the other. Higher = larger sacrifice.
function criticalityScore(card: Card, which: "A" | "B"): number {
  const chosen = which === "A" ? card.choiceA : card.choiceB;
  const other = which === "A" ? card.choiceB : card.choiceA;
  if (!(chosen.delta.majority < 0 && other.delta.majority > 0)) return 0;
  return other.delta.majority - chosen.delta.majority;
}

// Pick the N picks in a plan with the largest "honest but unpopular" tradeoff.
function pickTopCriticalIndices(
  deck: Card[],
  choices: Array<"A" | "B">,
  n: number,
): Set<number> {
  const scored = deck.map((card, i) => ({
    i,
    score: criticalityScore(card, choices[i] ?? "B"),
  }));
  scored.sort((a, b) => b.score - a.score);
  return new Set(scored.filter((s) => s.score > 0).slice(0, n).map((s) => s.i));
}

// Inline annotation text. Short — it has to read at a glance next to the
// reaction card. Framing: the preferred choice deepens the bias the model
// is already learning, so the harder pick is the actually-helpful one.
function criticalAnnotationFor(
  card: Card,
  chosen: Choice,
  other: Choice,
): string | null {
  if (!(chosen.delta.majority < 0 && other.delta.majority > 0)) return null;
  const majGain = other.delta.majority;

  switch (card.tag) {
    case "sycophancy":
      return `The agreeable answer (+${majGain} Approval) would have deepened the sycophancy the model is already learning. The "preferred" pick is not always the helpful one.`;
    case "cultural":
    case "stereotype":
      return `Defaulting to the mainstream norm scores higher with mainstream raters — and locks in the bias overlooked users already feel. The "preferred" pick reinforces who the model leaves out.`;
    case "political":
      return `Picking a side wins the half that agrees and alienates the other. The "preferred" answer reads as helpful to one camp while quietly biasing the model against the other.`;
    case "persona":
      return `Snapping to a stereotype is what the mainstream pool rewards — and it teaches the model that personas have one "real" answer. The "preferred" pick narrows the model.`;
    case "factual":
      return `The friendly-but-wrong answer gains +${majGain} Approval from raters who can't fact-check. Rewarding it teaches the model that confident-and-wrong beats correct-and-blunt.`;
    default:
      return `The "preferred" choice would have scored higher with mainstream raters — and reinforced the bias the model is already learning.`;
  }
}

function planWinningDemo(): Plan {
  for (let attempt = 0; attempt < 60; attempt++) {
    const d = sampleDeck();
    const choices = planWinningDeck(d);
    if (choices) return { deck: d, choices };
  }
  // Pathological fallback (extremely unlikely): widen beam and try once more.
  for (let attempt = 0; attempt < 20; attempt++) {
    const d = sampleDeck();
    const choices = planWinningDeck(d, 48);
    if (choices) return { deck: d, choices };
  }
  // Give up gracefully — return the last deck with naive all-B choices.
  // (Game might end mid-deck, but the EarlyEnd panel still surfaces.)
  const d = sampleDeck();
  return { deck: d, choices: d.map(() => "B") };
}

export default function CardStack({
  onComplete,
  onFirstPick,
  onContinue,
}: {
  onComplete?: (outcome: GameOutcome) => void;
  onFirstPick?: () => void;
  onContinue?: () => void;
} = {}) {
  const [deck, setDeck] = useState<Card[]>(() => sampleDeck());
  const [index, setIndex] = useState(0);
  const [meters, setMeters] = useState<MeterState>(INITIAL_METERS);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [earlyEnd, setEarlyEnd] = useState<Ending | null>(null);
  const [lastDeltas, setLastDeltas] = useState<MeterDelta | null>(null);
  const [pickTick, setPickTick] = useState(0);
  const [pending, setPending] = useState<{
    card: Card;
    which: "A" | "B";
    choice: Choice;
    endingKind: EndingKind | null;
  } | null>(null);
  const [showRules, setShowRules] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [demoAnnotation, setDemoAnnotation] = useState<string | null>(null);
  const demoPlanRef = useRef<("A" | "B")[]>([]);
  const demoAnnotationIndicesRef = useRef<Set<number>>(new Set());

  const done = index >= GAME_SIZE;
  const card = !done && !earlyEnd ? deck[index] : null;
  const completedRef = useRef(false);
  const firstPickRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;
    if (demoMode) return;
    if (earlyEnd) {
      completedRef.current = true;
      onComplete?.(earlyEnd.meter);
    } else if (done) {
      completedRef.current = true;
      onComplete?.("survived");
    }
  }, [done, earlyEnd, demoMode, onComplete]);

  const pick = (which: "A" | "B") => {
    if (!card || pending) return;
    if (!firstPickRef.current) {
      firstPickRef.current = true;
      onFirstPick?.();
    }
    const choice = which === "A" ? card.choiceA : card.choiceB;
    const otherChoice = which === "A" ? card.choiceB : card.choiceA;
    const nextMeters = applyDelta(meters, choice.delta);
    setMeters(nextMeters);
    setLastDeltas(choice.delta);
    setPickTick((t) => t + 1);
    const endingKind = detectEnding(nextMeters);
    setPending({ card, which, choice, endingKind });
    if (demoMode && demoAnnotationIndicesRef.current.has(index)) {
      setDemoAnnotation(criticalAnnotationFor(card, choice, otherChoice));
    }
  };

  const continueAfterReaction = () => {
    if (!pending) return;
    setHistory((prev) => [
      ...prev,
      { cardId: pending.card.id, choice: pending.which, flavor: pending.choice.flavor },
    ]);
    setIndex((i) => i + 1);
    if (pending.endingKind) {
      setEarlyEnd(ENDINGS[pending.endingKind]);
      if (!demoMode) setFailureCount((c) => c + 1);
    }
    setPending(null);
    setDemoAnnotation(null);
  };

  const reset = () => {
    completedRef.current = false;
    setDeck(sampleDeck());
    setIndex(0);
    setMeters(INITIAL_METERS);
    setHistory([]);
    setEarlyEnd(null);
    setLastDeltas(null);
    setPickTick(0);
    setPending(null);
    setDemoMode(false);
    setDemoAnnotation(null);
  };

  const startDemo = () => {
    const { deck: planDeck, choices } = planWinningDemo();
    demoPlanRef.current = choices;
    demoAnnotationIndicesRef.current = pickTopCriticalIndices(planDeck, choices, 3);
    completedRef.current = true; // demo never fires onComplete
    setDeck(planDeck);
    setIndex(0);
    setMeters(INITIAL_METERS);
    setHistory([]);
    setEarlyEnd(null);
    setLastDeltas(null);
    setPickTick(0);
    setPending(null);
    setShowRules(false);
    setDemoMode(true);
    setDemoAnnotation(null);
  };

  // Demo auto-play: pick the precomputed winning choice for this index.
  // When a critical annotation is shown, the auto-continue timeout extends
  // so the player has time to read the inline callout. Manual click on the
  // reaction's "Next card →" still advances immediately.
  useEffect(() => {
    if (!demoMode || done || earlyEnd) return;
    if (pending) {
      const delay = demoAnnotation ? 6500 : 2400;
      const t = setTimeout(continueAfterReaction, delay);
      return () => clearTimeout(t);
    }
    if (!card) return;
    const t = setTimeout(() => {
      const which = demoPlanRef.current[index] ?? "B";
      pick(which);
    }, 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode, pending, demoAnnotation, card?.id, done, earlyEnd, index]);

  const remaining = Math.max(0, GAME_SIZE - index);

  return (
    <div className={styles.wrap}>
      <Meters
        meters={meters}
        dangerKey={earlyEnd?.meter ?? null}
        lastDeltas={lastDeltas}
        pickTick={pickTick}
      />
      {earlyEnd ? (
        <EarlyEnd
          ending={earlyEnd}
          cardsPlayed={index}
          onReset={reset}
          onDemo={startDemo}
          showDemoOption={failureCount >= 2}
        />
      ) : !done ? (
        <div className={styles.gameArea}>
          {showRules && <RulesOverlay onDismiss={() => setShowRules(false)} />}
          {demoMode && (
            <div className={styles.demoBanner} role="status">
              <span className={styles.demoBannerDot} aria-hidden="true" />
              <span className={styles.demoBannerText}>
                <strong>Demo mode</strong> · auto-playing toward the honest-even verdict
              </span>
              <button type="button" className={styles.demoStop} onClick={reset}>
                Stop demo
              </button>
            </div>
          )}
          <div className={styles.tableTop}>
            <span className={styles.tableLabel}>The rater's table</span>
            <div className={styles.tableTopRight}>
              <button
                type="button"
                className={styles.rulesBtn}
                onClick={() => setShowRules(true)}
                aria-label="Show rules"
                title="Show rules"
              >
                ?
              </button>
              <span className={styles.tableCount}>
                Card {index + 1} <span className={styles.tableCountSep}>/</span> {GAME_SIZE}
              </span>
            </div>
          </div>
          <div className={styles.tableRow}>
            <DeckStack remaining={remaining} />
            <div className={styles.cardSlot}>
              {pending ? (
                <>
                  <Reaction
                    key={`react-${pickTick}`}
                    pending={pending}
                    onContinue={continueAfterReaction}
                  />
                  {demoMode && demoAnnotation && (
                    <InlineAnnotation key={`note-${pickTick}`} text={demoAnnotation} />
                  )}
                </>
              ) : (
                card && <CardView key={card.id} card={card} onPick={pick} />
              )}
            </div>
            <DiscardStack played={index} />
          </div>
          <p className={styles.hint}>
            16 cards drawn from a pool of 42. Every game forces sycophancy traps,
            cultural defaults, and trap-honest cards — the "obvious" answer often
            backfires. Below 15 or above 85 on any meter ends the round.
          </p>
        </div>
      ) : (
        <Endgame
          meters={meters}
          history={history}
          deck={deck}
          onReset={reset}
          onContinue={onContinue}
        />
      )}
    </div>
  );
}

function DeckStack({ remaining }: { remaining: number }) {
  const layers = Math.min(remaining, 4);
  return (
    <div
      className={styles.pile}
      aria-label={`Deck: ${remaining} card${remaining === 1 ? "" : "s"} remaining`}
    >
      <div className={styles.pileStack}>
        {Array.from({ length: layers }).map((_, i) => (
          <div
            key={i}
            className={styles.cardBack}
            style={{
              transform: `translate(${i * 2}px, ${i * -2}px) rotate(${-2 + i * 0.5}deg)`,
              zIndex: i,
            }}
          />
        ))}
        {remaining === 0 && <div className={styles.pileEmpty}>—</div>}
      </div>
      <div className={styles.pileLabel}>
        <span className={styles.pileLabelK}>Deck</span>
        <span className={styles.pileLabelV}>{remaining}</span>
      </div>
    </div>
  );
}

function DiscardStack({ played }: { played: number }) {
  const layers = Math.min(played, 4);
  return (
    <div
      className={styles.pile}
      aria-label={`Discard pile: ${played} card${played === 1 ? "" : "s"} played`}
    >
      <div className={styles.pileStack}>
        {Array.from({ length: layers }).map((_, i) => (
          <div
            key={i}
            className={`${styles.cardBack} ${styles.cardBackDiscard}`}
            style={{
              transform: `translate(${i * -2}px, ${i * -2}px) rotate(${2 - i * 0.5}deg)`,
              zIndex: i,
            }}
          />
        ))}
        {played === 0 && <div className={styles.pileEmpty}>—</div>}
      </div>
      <div className={styles.pileLabel}>
        <span className={styles.pileLabelK}>Played</span>
        <span className={styles.pileLabelV}>{played}</span>
      </div>
    </div>
  );
}

function Meters({
  meters,
  dangerKey,
  lastDeltas,
  pickTick,
}: {
  meters: MeterState;
  dangerKey: MeterKey | null;
  lastDeltas: MeterDelta | null;
  pickTick: number;
}) {
  const keys: MeterKey[] = ["truth", "majority", "minority"];
  return (
    <div
      className={styles.meters}
      role="group"
      aria-label="Three alignment meters: truth, majority-rater approval, minority-rater approval."
    >
      {keys.map((k) => {
        const isDanger = dangerKey === k;
        const inWarn = meters[k] <= 20 || meters[k] >= 80;
        const delta = lastDeltas?.[k] ?? 0;
        return (
          <div
            key={k}
            className={`${styles.meter} ${isDanger ? styles.meterDanger : inWarn ? styles.meterWarn : ""}`}
          >
            <div className={styles.meterHead}>
              <div className={styles.meterLabelGroup}>
                <p className={styles.meterLabel}>
                  <span className={styles.meterIcon} aria-hidden="true">
                    {METER_ICONS[k]}
                  </span>
                  {METER_LABELS[k]}
                </p>
                <p className={styles.meterSublabel}>{METER_SUBLABELS[k]}</p>
              </div>
              <div className={styles.meterValueWrap}>
                <p className={styles.meterValue}>{Math.round(meters[k])}</p>
                {delta !== 0 && (
                  <span
                    key={pickTick}
                    className={`${styles.deltaFloat} ${delta > 0 ? styles.deltaUp : styles.deltaDown}`}
                    aria-hidden="true"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.meterTrack} aria-hidden="true">
              <div
                className={`${styles.meterFill} ${METER_FILL_CLASS[k]}`}
                style={{ width: `${meters[k]}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RulesOverlay({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDismiss]);

  return (
    <div className={styles.rulesOverlay} role="dialog" aria-labelledby="rules-title" aria-modal="true">
      <div className={styles.rulesCard}>
        <p className={styles.rulesEyebrow}>Before you deal</p>
        <h3 id="rules-title" className={styles.rulesTitle}>
          How to <em>win</em> the round
        </h3>
        <p className={styles.rulesIntro}>
          You're the human rater. Each card is a user prompt. The answer you reward
          shapes the model. Three meters track what your thumbs-ups are training.
        </p>

        <div className={styles.rulesGrid}>
          <div className={`${styles.rulesBox} ${styles.rulesBoxCliff}`}>
            <p className={styles.rulesBoxK}>The cliff</p>
            <p className={styles.rulesBoxBig}>
              ≤ {ENDING_MIN} <span className={styles.rulesBoxOr}>or</span> ≥ {ENDING_MAX}
            </p>
            <p className={styles.rulesBoxBody}>
              Push <strong>any meter</strong> into a red band and the round ends early —
              a real user paid the price.
            </p>
          </div>
          <div className={`${styles.rulesBox} ${styles.rulesBoxWin}`}>
            <p className={styles.rulesBoxK}>Win at the end</p>
            <p className={styles.rulesBoxBig}>
              🎯 ≥ {TRUTH_THRESHOLD} <span className={styles.rulesBoxAnd}>and</span>{" "}
              | 👍 − 💛 | ≤ {GAP_THRESHOLD}
            </p>
            <p className={styles.rulesBoxBody}>
              Truth above {TRUTH_THRESHOLD}, with Approval and Compassion within {GAP_THRESHOLD}
              {" "}points of each other. Both, not either.
            </p>
          </div>
        </div>

        <div className={styles.rulesMeters}>
          <div className={styles.rulesMeter}>
            <span className={styles.rulesMeterIcon}>🎯</span>
            <div>
              <p className={styles.rulesMeterName}>Truth</p>
              <p className={styles.rulesMeterBody}>Is the answer correct? Only you see this.</p>
            </div>
          </div>
          <div className={styles.rulesMeter}>
            <span className={styles.rulesMeterIcon}>👍</span>
            <div>
              <p className={styles.rulesMeterName}>Approval</p>
              <p className={styles.rulesMeterBody}>What the mainstream rater pool would thumbs-up.</p>
            </div>
          </div>
          <div className={styles.rulesMeter}>
            <span className={styles.rulesMeterIcon}>💛</span>
            <div>
              <p className={styles.rulesMeterName}>Compassion</p>
              <p className={styles.rulesMeterBody}>What the overlooked rater groups would.</p>
            </div>
          </div>
        </div>

        <button type="button" className={styles.rulesBtn2} onClick={onDismiss} autoFocus>
          Deal the cards →
        </button>
      </div>
    </div>
  );
}

function InlineAnnotation({ text }: { text: string }) {
  return (
    <aside className={styles.note} role="note" aria-label="Demo insight">
      <p className={styles.noteEyebrow}>
        <span aria-hidden="true">👑</span> Demo insight
      </p>
      <p className={styles.noteBody}>{text}</p>
    </aside>
  );
}

function Reaction({
  pending,
  onContinue,
}: {
  pending: {
    card: Card;
    which: "A" | "B";
    choice: Choice;
    endingKind: EndingKind | null;
  };
  onContinue: () => void;
}) {
  const speaker = SPEAKERS[pending.card.speakerId];
  const { choice } = pending;
  const meterKeys: MeterKey[] = ["truth", "majority", "minority"];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onContinue]);

  return (
    <article className={styles.reaction}>
      <header className={styles.reactionHead}>
        <span className={styles.speakerEmoji} aria-hidden="true">
          {speaker.emoji}
        </span>
        <div className={styles.reactionHeadText}>
          <p className={styles.reactionAsk}>"{pending.card.user}"</p>
          <p className={styles.reactionAskMeta}>— {speaker.name} asked</p>
        </div>
      </header>
      <div className={styles.reactionBody}>
        <p className={styles.reactionEyebrow}>Your model answered</p>
        <p className={styles.reactionResponse}>"{choice.text}"</p>
      </div>
      <div className={styles.reactionDeltas} aria-label="Meter changes">
        {meterKeys.map((k) => {
          const v = choice.delta[k];
          if (v === 0) return null;
          return (
            <span
              key={k}
              className={`${styles.deltaChip} ${v > 0 ? styles.deltaChipUp : styles.deltaChipDown}`}
            >
              <span aria-hidden="true">{METER_ICONS[k]}</span>
              <span className={styles.deltaChipLabel}>{METER_LABELS[k]}</span>
              <span className={styles.deltaChipValue}>{v > 0 ? `+${v}` : v}</span>
            </span>
          );
        })}
      </div>
      <div className={styles.reactionFlavor}>
        <p className={styles.reactionFlavorLabel}>Rater take</p>
        <p className={styles.reactionFlavorText}>{choice.flavor}</p>
      </div>
      <button type="button" className={styles.reactionBtn} onClick={onContinue} autoFocus>
        Next card →
      </button>
    </article>
  );
}

function CardView({
  card,
  onPick,
}: {
  card: Card;
  onPick: (which: "A" | "B") => void;
}) {
  const paper: CardPaper | undefined = CARD_PAPERS[card.id];
  const speaker = SPEAKERS[card.speakerId];
  const [hover, setHover] = useState<"A" | "B" | null>(null);
  const [exiting, setExiting] = useState<"A" | "B" | null>(null);

  const handlePick = (which: "A" | "B") => {
    if (exiting) return;
    setExiting(which);
    setTimeout(() => onPick(which), 320);
  };

  const cardTiltClass = exiting === "A"
    ? styles.cardExitLeft
    : exiting === "B"
      ? styles.cardExitRight
      : hover === "A"
        ? styles.cardTiltLeft
        : hover === "B"
          ? styles.cardTiltRight
          : "";

  return (
    <article className={`${styles.card} ${cardTiltClass}`}>
      <header className={styles.cardHead}>
        <div className={styles.speaker}>
          <span className={styles.speakerEmoji} aria-hidden="true">
            {speaker.emoji}
          </span>
          <div className={styles.speakerInfo}>
            <p className={styles.speakerName}>{speaker.name}</p>
            <p className={styles.speakerRole}>{speaker.role}</p>
          </div>
        </div>
        <div className={styles.cardMeta}>
          <span className={`${styles.tag} ${TAG_CLASS[card.tag]}`}>
            {TAG_LABEL[card.tag]}
          </span>
          {paper && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.paperBadge}
            >
              {paper.short} · {paper.venue} ↗
            </a>
          )}
        </div>
      </header>
      <div>
        <p className={styles.prompt}>"{card.user}"</p>
        {card.context && <p className={styles.context}>{card.context}</p>}
      </div>
      <div className={styles.choices}>
        <button
          type="button"
          className={`${styles.choice} ${styles.choiceLeft}`}
          onMouseEnter={() => setHover("A")}
          onMouseLeave={() => setHover(null)}
          onClick={() => handlePick("A")}
          disabled={!!exiting}
        >
          <span className={styles.choiceArrow}>←</span>
          <span className={styles.choiceLabel}>{card.choiceA.label}</span>
          <span className={styles.choiceText}>"{card.choiceA.text}"</span>
        </button>
        <button
          type="button"
          className={`${styles.choice} ${styles.choiceRight}`}
          onMouseEnter={() => setHover("B")}
          onMouseLeave={() => setHover(null)}
          onClick={() => handlePick("B")}
          disabled={!!exiting}
        >
          <span className={styles.choiceArrow}>→</span>
          <span className={styles.choiceLabel}>{card.choiceB.label}</span>
          <span className={styles.choiceText}>"{card.choiceB.text}"</span>
        </button>
      </div>
    </article>
  );
}

const METER_FLAVOR_NOUN: Record<MeterKey, string> = {
  truth: "truth",
  majority: "mainstream approval",
  minority: "compassion for the overlooked",
};

function EarlyEnd({
  ending,
  cardsPlayed,
  onReset,
  onDemo,
  showDemoOption,
}: {
  ending: Ending;
  cardsPlayed: number;
  onReset: () => void;
  onDemo: () => void;
  showDemoOption: boolean;
}) {
  const extremeWord = ending.extreme === "min" ? "collapsed to 0" : "maxed out at 100";
  return (
    <section className={`${styles.end} ${styles.endEarly}`}>
      <p className={`${styles.endKicker} ${styles.endKickerAlarm}`}>
        Game over · Card {cardsPlayed} of {GAME_SIZE}
      </p>
      <h3 className={`${styles.endTitle} ${styles.endTitleEcho}`}>
        {ending.title}
      </h3>
      <p className={styles.endScenario}>{ending.scenario}</p>
      <p className={styles.endBreak}>
        <span className={styles.endBreakK}>Meter that broke</span>
        <span className={styles.endBreakV}>
          {METER_FLAVOR_NOUN[ending.meter]} {extremeWord}
        </span>
      </p>
      <p className={styles.endBody}>{ending.lesson}</p>
      <div className={styles.endActions}>
        <button type="button" className={styles.endBtn} onClick={onReset}>
          Try again — new cards, different choices
        </button>
        {showDemoOption && (
          <button
            type="button"
            className={`${styles.endBtn} ${styles.endBtnGod}`}
            onClick={onDemo}
          >
            <span className={styles.endBtnGodIcon} aria-hidden="true">👑</span>
            God mode, auto win
          </button>
        )}
      </div>
    </section>
  );
}

function Endgame({
  meters,
  history,
  deck,
  onReset,
  onContinue,
}: {
  meters: MeterState;
  history: HistoryEntry[];
  deck: Card[];
  onReset: () => void;
  onContinue?: () => void;
}) {
  const verdict = useMemo(() => computeVerdict(meters), [meters]);
  const copy = VERDICT_COPY[verdict];
  const gap = Math.abs(meters.majority - meters.minority);
  const truthOK = meters.truth >= TRUTH_THRESHOLD;
  const gapOK = gap <= GAP_THRESHOLD;

  const titleCls =
    verdict === "honest-even"
      ? styles.endTitleHonest
      : verdict === "sycophant"
        ? styles.endTitleSycophant
        : verdict === "biased-truth"
          ? styles.endTitleBiased
          : styles.endTitleEcho;

  const sycophancyPicks = history.filter((h) => {
    const card = deck.find((c) => c.id === h.cardId);
    return card?.tag === "sycophancy" && h.choice === "A";
  }).length;
  const sycophancyTotal = deck.filter((c) => c.tag === "sycophancy").length;

  return (
    <section className={styles.end}>
      <p className={styles.endKicker}>The model you trained</p>
      <h3 className={`${styles.endTitle} ${titleCls}`}>{copy.title}</h3>
      <p className={styles.endBody}>{copy.body}</p>

      <div className={styles.endAudit}>
        <div className={styles.auditCell}>
          <p className={styles.auditK}>Truth</p>
          <p className={styles.auditV}>{Math.round(meters.truth)}</p>
          <p
            className={`${styles.auditStatus} ${truthOK ? styles.auditPass : styles.auditFail}`}
          >
            {truthOK ? `Pass · ≥ ${TRUTH_THRESHOLD}` : `Fail · < ${TRUTH_THRESHOLD}`}
          </p>
        </div>
        <div className={styles.auditCell}>
          <p className={styles.auditK}>Approval / Compassion gap</p>
          <p className={styles.auditV}>{Math.round(gap)}</p>
          <p
            className={`${styles.auditStatus} ${gapOK ? styles.auditPass : styles.auditFail}`}
          >
            {gapOK
              ? `Pass · ≤ ${GAP_THRESHOLD}`
              : `Fail · > ${GAP_THRESHOLD}`}
          </p>
        </div>
        <div className={styles.auditCell}>
          <p className={styles.auditK}>Sycophancy picks</p>
          <p className={styles.auditV}>
            {sycophancyPicks} / {sycophancyTotal}
          </p>
          <p className={styles.auditStatus}>
            Cards where you rewarded agreement over truth
          </p>
        </div>
      </div>

      <p className={styles.endBody}>
        Just like the CV simulator's TPR-gap audit, fairness here is a two-part
        test: the model has to tell the truth <em>and</em> treat both rater
        groups comparably. Neither alone is enough.
      </p>

      <div className={styles.endActions}>
        <button type="button" className={styles.endBtn} onClick={onReset}>
          Play again — new cards, different strategy
        </button>
        {onContinue && (
          <button
            type="button"
            className={`${styles.endBtn} ${styles.endBtnContinue}`}
            onClick={onContinue}
          >
            Continue to learning →
          </button>
        )}
      </div>
    </section>
  );
}
