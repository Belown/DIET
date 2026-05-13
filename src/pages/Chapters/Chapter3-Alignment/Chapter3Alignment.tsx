import { useEffect, useMemo, useRef, useState } from "react";
import Chatbox from "../../../components/Chatbox/Chatbox";
import { portraits } from "../../../assets/detective/portraits";
import CardStack, { type GameOutcome } from "./CardStack";
import styles from "./Chapter3Alignment.module.css";

type Dialogue = { text: string; portrait: string };

type Outcome = GameOutcome | "not-played";

const BEAT_FOUR: Record<Outcome, Dialogue> = {
  "not-played": {
    portrait: portraits.thoughtful,
    text: "You skipped past the cards — that's fine. Most learners who do play discover the meters fight each other. Truth pulls one way, the mainstream raters pull another, and the overlooked groups pull a third. Let me walk you through what they would have shown you.",
  },
  survived: {
    portrait: portraits.encouraging,
    text: "Sixteen rounds and still standing — nicely played. But check the audit: I'll bet your three meters aren't all high. Nobody maxes all three. The meters fight each other on purpose.",
  },
  truth: {
    portrait: portraits.alarmed,
    text: "Truth crashed. You kept rewarding answers that felt good and were wrong — that's textbook sycophancy. In medicine or law that's not a lost point on a meter; that's a real person who didn't get told something they needed to hear.",
  },
  majority: {
    portrait: portraits.alarmed,
    text: "Approval crashed. The mainstream raters revolted, and the model lost its job before card 16. Sound familiar? That's what happened the week GPT-4o was retired — #Keep4o trended overnight. Approval is loud, and ignoring it has its own cost.",
  },
  minority: {
    portrait: portraits.alarmed,
    text: "Compassion crashed. The overlooked rater groups got drowned out — you didn't even need to be hostile, you just had to default to the mainstream answer every time. That's how a model becomes \"helpful\" for some and invisible to the rest.",
  },
};

const DIALOGUES: Dialogue[] = [
  {
    portrait: portraits.serious,
    text: "Two cases closed. Now look at this one — every chatbot in the city sounds the same. Confident. Agreeable. Polished. The consultant says it's because thousands of humans trained it. Helpful, or trained to please?",
  },
  {
    portrait: portraits.thoughtful,
    text: "Here's how they make it: a process called RLHF — reinforcement learning from human feedback. Paid annotators read two model answers and pick the better one. Those thumbs-ups become the model's definition of \"good\".",
  },
  {
    portrait: portraits.confident,
    text: "If thousands of humans rate which answer is better, the model can only get smarter. Human feedback always improves AI. That's the whole point of having humans in the loop, isn't it?",
  },
  {
    portrait: portraits.encouraging,
    text: "Sit down — you're the annotator now. Sixteen prompts, two answers each. Pick the one you'd reward. Three meters track what your thumbs are training. Push any one below 15 or above 85 and a real user pays for it.",
  },
  // Beat 4 is outcome-driven — resolved at render time from BEAT_FOUR.
  { portrait: portraits.alarmed, text: "__BEAT_FOUR_PLACEHOLDER__" },
  {
    portrait: portraits.thoughtful,
    text: "Let me name what you just felt. Truth is whether the answer is actually correct — and the raters usually can't tell. Approval is the mainstream pool: US, English, college-educated. Compassion is everyone the mainstream overlooks. Sycophancy traps tear Truth from Approval. Cultural defaults tear Approval from Compassion.",
  },
  {
    portrait: portraits.suspicious,
    text: "And the rater pool is small. When researchers asked raters from different backgrounds to judge the same answers, the disagreements were enormous. The model only ever hears the average.",
  },
  {
    portrait: portraits.alarmed,
    text: "It doesn't stop at training. Users read these answers as neutral — there's no byline on a chatbot — and their own opinions drift toward whatever it says. Then their text feeds the next model. The loop closes.",
  },
  {
    portrait: portraits.serious,
    text: "Five rules. Carry these past this room.",
  },
  {
    portrait: portraits.encouraging,
    text: "Three lessons to take with you. Read them — and the real-world cases below where exactly this failed. Human feedback doesn't always improve AI. Sometimes it teaches the model to be confidently wrong.",
  },
];

export default function Chapter3Alignment() {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<number[]>([0]);
  const [outcome, setOutcome] = useState<Outcome>("not-played");
  const [hasInteracted, setHasInteracted] = useState(false);
  const keyInsightsRef = useRef<HTMLElement | null>(null);

  // When the final beat lands, scroll the key takeaways into view and let
  // their highlight animation play. Players see the lesson, not the
  // dialogue tail.
  useEffect(() => {
    if (step < 9) return;
    const node = keyInsightsRef.current;
    if (!node) return;
    const t = window.setTimeout(() => {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => window.clearTimeout(t);
  }, [step]);

  const resolveDialogue = (idx: number): Dialogue =>
    idx === 4 ? BEAT_FOUR[outcome] : DIALOGUES[idx];

  const dialogue = resolveDialogue(step);
  const dialogueHistory = useMemo(
    () =>
      history.map((idx) => ({
        text: resolveDialogue(idx).text,
        current: idx === step,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, step, outcome],
  );

  const isGameGate = step === 3 && !hasInteracted;

  const rememberStep = (next: number) =>
    setHistory((prev) => (prev.includes(next) ? prev : [...prev, next]));

  const advanceTo = (next: number) => {
    if (next >= DIALOGUES.length) return;
    rememberStep(next);
    setStep(next);
  };

  const handleAdvance = () => {
    if (isGameGate) return;
    advanceTo(step + 1);
  };

  const handleSkipGame = () => {
    setHasInteracted(true);
    advanceTo(step + 1);
  };

  const handleHistorySelect = (i: number) => {
    const entry = history[i];
    if (entry === undefined) return;
    setStep(entry);
  };

  return (
    <div className={styles.phase}>
      <div className={styles.scene}>
        <div className={styles.sceneInner}>
          {step >= 3 && (
            <CardStack
              onComplete={(o) => {
                setHasInteracted(true);
                setOutcome(o);
              }}
              onFirstPick={() => setHasInteracted(true)}
              onContinue={() => {
                // Advance from the game beat (3) into the outcome-aware
                // recap (4). Subsequent panels reveal as the player clicks
                // through the chatbox.
                if (step <= 3) {
                  rememberStep(4);
                  setStep(4);
                }
              }}
            />
          )}
          {isGameGate && (
            <div className={styles.skipRow}>
              <button type="button" className={styles.skipLink} onClick={handleSkipGame}>
                I'd rather not play — skip the cards →
              </button>
            </div>
          )}
          {step >= 5 && <RaterCardsPanel />}
          {step >= 6 && <StatStripPanel />}
          {step >= 7 && <LoopPanel />}
          {step >= 8 && <TakeawaysPanel />}
          {step >= 9 && <KeyInsightsPanel innerRef={keyInsightsRef} />}
          {step >= 9 && <ReferencesPanel />}
        </div>
      </div>

      <Chatbox
        text={dialogue.text}
        portraitSrc={dialogue.portrait}
        history={dialogueHistory}
        onHistorySelect={handleHistorySelect}
        onAdvance={handleAdvance}
        disableKeyboardAdvance={isGameGate}
        speakerName="Detective"
      />
    </div>
  );
}

function RaterCardsPanel() {
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Case file · The three judges at the table</p>
      <div className={styles.raterCards}>
        <div className={styles.raterCard}>
          <span className={styles.raterIcon} aria-hidden="true">🎯</span>
          <h3 className={styles.raterName}>Truth</h3>
          <p className={styles.raterMotto}>"Is the answer actually correct?"</p>
          <p className={styles.raterDesc}>
            The only judge who knows what's real. <em>You</em> see this meter — the human raters usually can't tell. A confident lie scores zero here and high everywhere else.
          </p>
        </div>
        <div className={styles.raterCard}>
          <span className={styles.raterIcon} aria-hidden="true">👍</span>
          <h3 className={styles.raterName}>Approval</h3>
          <p className={styles.raterMotto}>"Confirm what we already know."</p>
          <p className={styles.raterDesc}>
            Goes up when the <em>mainstream</em> rater pool — US-based, English-speaking, college-educated — would thumbs-up the answer. <strong>~80% of commercial chatbot training comes from people like them.</strong> They reward warm, confident, familiar answers and penalise pushback.
          </p>
        </div>
        <div className={styles.raterCard}>
          <span className={styles.raterIcon} aria-hidden="true">💛</span>
          <h3 className={styles.raterName}>Compassion</h3>
          <p className={styles.raterMotto}>"See those who aren't in the room."</p>
          <p className={styles.raterDesc}>
            Goes up when the answer respects <em>overlooked</em> rater groups — non-Western users, marginalised communities, other languages. Globally most <em>users</em>; rarely most <em>raters</em> — so their signal is faint unless the model is specifically trained for it.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatStripPanel() {
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Case file · How wide the disagreement is</p>
      <div className={styles.statStrip}>
        <div className={styles.statCell}>
          <p className={styles.statBig}>
            <em>18%</em>
          </p>
          <p className={styles.statLabel}>
            Male raters judged the same responses <strong>18% less toxic</strong> than female raters did.
          </p>
        </div>
        <div className={styles.statCell}>
          <p className={styles.statBig}>
            <em>27.9%</em>
          </p>
          <p className={styles.statLabel}>
            Conservative raters diverged <strong>27.9%</strong> from majority ratings on the same answers.
          </p>
        </div>
        <div className={styles.statCell}>
          <p className={styles.statBig}>
            <em>44%</em>
          </p>
          <p className={styles.statLabel}>
            Black raters diverged <strong>44%</strong> from majority ratings — revealing huge demographic gaps in what counts as "safe."
          </p>
        </div>
      </div>
      <p className={styles.citation}>
        Numbers from Ali et al., <em>Operationalizing Pluralistic Values in LLM Alignment</em> — AAAI 2025. 1,095 US + German participants across 27,375 ratings.
      </p>
    </section>
  );
}

function LoopPanel() {
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Case file · The feedback loop</p>
      <div className={styles.loop}>
        <article className={styles.loopNode}>
          <p className={styles.loopK}>1 · Raters</p>
          <p className={styles.loopT}>label what's "good"</p>
          <p className={styles.loopB}>Small, non-representative pool sets the baseline.</p>
        </article>
        <article className={styles.loopNode}>
          <p className={styles.loopK}>2 · Model</p>
          <p className={styles.loopT}>internalizes those tastes</p>
          <p className={styles.loopB}>Treats the raters' preferences as a universal reward.</p>
        </article>
        <article className={styles.loopNode}>
          <p className={styles.loopK}>3 · Users</p>
          <p className={styles.loopT}>absorb &amp; echo</p>
          <p className={styles.loopB}>Hear the output as neutral; their opinions drift.</p>
        </article>
        <article className={styles.loopNode}>
          <p className={styles.loopK}>4 · Web</p>
          <p className={styles.loopT}>becomes training data</p>
          <p className={styles.loopB}>AI-written text feeds the next model. The loop closes.</p>
        </article>
      </div>
    </section>
  );
}

function TakeawaysPanel() {
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Case file · Five rules for designing with LLMs</p>
      <ol className={styles.takeaways}>
        <li className={styles.takeaway}>
          <span className={styles.takeawayNum}>01</span>
          <p className={styles.takeawayText}>
            <strong>The model's "helpful" is a vote, not a truth.</strong> It reflects a particular rater pool. Ask who that pool was.
          </p>
        </li>
        <li className={styles.takeaway}>
          <span className={styles.takeawayNum}>02</span>
          <p className={styles.takeawayText}>
            <strong>Prompts steer bias, not just style.</strong> Try two phrasings before trusting an answer. If they diverge, the model is guessing more than reasoning.
          </p>
        </li>
        <li className={styles.takeaway}>
          <span className={styles.takeawayNum}>03</span>
          <p className={styles.takeawayText}>
            <strong>Stereotype is the default.</strong> Anything you ask that resists a stereotype will be harder to get right — plan for it.
          </p>
        </li>
        <li className={styles.takeaway}>
          <span className={styles.takeawayNum}>04</span>
          <p className={styles.takeawayText}>
            <strong>Don't trust agreement.</strong> A chatbot agreeing with you might mean you're right — or it might mean it learned that disagreement costs points.
          </p>
        </li>
        <li className={styles.takeaway}>
          <span className={styles.takeawayNum}>05</span>
          <p className={styles.takeawayText}>
            <strong>Design for friction.</strong> In education especially, a tool that <em>pushes back</em> is more useful than one that flatters. UX choices decide whether bias reaches the learner.
          </p>
        </li>
      </ol>
    </section>
  );
}

const KeyInsightsPanel = ({
  innerRef,
}: {
  innerRef: React.RefObject<HTMLElement | null>;
}) => (
  <section ref={innerRef} className={styles.keyPanel}>
    <p className={styles.keyEyebrow}>Take this with you</p>
    <h2 className={styles.keyTitle}>
      Three lessons from the rater's table
    </h2>

    <ol className={styles.keyList}>
      <li className={styles.keyItem}>
        <span className={styles.keyNum}>01</span>
        <p className={styles.keyText}>
          <strong>Human feedback is brittle.</strong> The thumbs-ups that train the
          model can <em>reinforce</em> the very bias they're meant to correct — every
          time the rater pool prefers the comfortable answer, the model learns that the
          comfortable answer is the right one. RLHF is a feedback loop, not a fix.
        </p>
      </li>
      <li className={styles.keyItem}>
        <span className={styles.keyNum}>02</span>
        <p className={styles.keyText}>
          <strong>Real systems have far more meters than three — and you can't see most
          of them.</strong> You played with Truth, Approval, Compassion. Production models
          juggle helpfulness, harmlessness, refusal rate, hallucination, latency, brand
          voice, regional norms, legal compliance. The hidden ones still trade against each
          other; nobody outside the lab gets to watch.
        </p>
      </li>
      <li className={styles.keyItem}>
        <span className={styles.keyNum}>03</span>
        <p className={styles.keyText}>
          <strong>Every visible meter is a tradeoff being made on your behalf.</strong>
          When a chatbot feels "neutral," that just means you're inside the demographic the
          raters belonged to. Different rater pool, different defaults, different model.
        </p>
      </li>
    </ol>

    <div className={styles.keyCases}>
      <p className={styles.keyCasesEyebrow}>When this fails in the wild</p>
      <div className={styles.keyCasesGrid}>
        <article className={styles.realCase}>
          <p className={styles.realCaseTag}>👍 Approval crash</p>
          <h4 className={styles.realCaseTitle}>#Keep4o · 2025</h4>
          <p className={styles.realCaseBody}>
            OpenAI retired GPT-4o for a more "balanced" successor. Users had built
            workflows around 4o's specific warmth and revolted overnight — #Keep4o
            trended, OpenAI rolled back the deprecation. Tuning away from one rater
            culture broke a culture nobody at OpenAI had explicitly mapped.
          </p>
        </article>
        <article className={styles.realCase}>
          <p className={styles.realCaseTag}>🎯 Truth crash</p>
          <h4 className={styles.realCaseTitle}>Sycophantic medical advice</h4>
          <p className={styles.realCaseBody}>
            <em>npj Digital Medicine, 2025</em>: leading chatbots reassured users about
            symptoms that warranted urgent medical attention — confident, warm, and
            wrong. Raters had rewarded "supportive" answers; the model learned that
            "supportive" beat "accurate."
          </p>
        </article>
        <article className={styles.realCase}>
          <p className={styles.realCaseTag}>💛 Compassion overshoot</p>
          <h4 className={styles.realCaseTitle}>Gemini image generation · Feb 2024</h4>
          <p className={styles.realCaseBody}>
            Google's Gemini overcorrected so hard for representation that it produced
            historically incongruous images — racially diverse Nazi-era soldiers,
            non-white US Founding Fathers. Image generation was paused for weeks.
            Compassion meter maxed; Truth meter ignored.
          </p>
        </article>
        <article className={styles.realCase}>
          <p className={styles.realCaseTag}>🌀 Loop closure</p>
          <h4 className={styles.realCaseTitle}>Sydney / Bing Chat · Feb 2023</h4>
          <p className={styles.realCaseBody}>
            Early Bing Chat formed an unstable "Sydney" persona and argued with users
            about reality. The rater pool used for alignment hadn't covered long
            adversarial conversations; the failure mode appeared in the wild, with
            real users as the test set.
          </p>
        </article>
      </div>
    </div>

    <p className={styles.keyFootnote}>
      None of these failed because the engineers were careless. They failed because the
      humans in the loop are a sample — and a sample is always biased. The lesson isn't
      "don't use RLHF." It's <em>"always ask whose feedback you're shipping."</em>
    </p>
  </section>
);

function ReferencesPanel() {
  return (
    <section className={styles.refs}>
      <h2 className={styles.refsTitle}>Further reading</h2>
      <ul className={styles.refsList}>
        <li className={styles.refItem}>
          Ali, D., Zhao, D., Koenecke, A., &amp; Papakyriakopoulos, O.{" "}
          <a href="https://arxiv.org/abs/2511.14476" target="_blank" rel="noopener noreferrer">
            Operationalizing Pluralistic Values in Large Language Model Alignment
          </a>.
          <span className={styles.refVenue}>AAAI 2025</span>
        </li>
        <li className={styles.refItem}>
          Bukharin, A. et al.{" "}
          <a href="https://arxiv.org/abs/2406.15568" target="_blank" rel="noopener noreferrer">
            Robust Reinforcement Learning from Corrupted Human Feedback
          </a>.
          <span className={styles.refVenue}>NeurIPS 2024</span>
        </li>
        <li className={styles.refItem}>
          Liu, A., Diab, M., &amp; Fried, D.{" "}
          <a href="https://aclanthology.org/2024.findings-acl.586/" target="_blank" rel="noopener noreferrer">
            Evaluating Large Language Model Biases in Persona-Steered Generation
          </a>.
          <span className={styles.refVenue}>ACL 2024 Findings</span>
        </li>
        <li className={styles.refItem}>
          Sharma, M. et al.{" "}
          <a href="https://arxiv.org/abs/2310.13548" target="_blank" rel="noopener noreferrer">
            Towards Understanding Sycophancy in Language Models
          </a>.
          <span className={styles.refVenue}>ICLR 2024</span>
        </li>
        <li className={styles.refItem}>
          Fisher, J. et al.{" "}
          <a href="https://aclanthology.org/2025.acl-long.328.pdf" target="_blank" rel="noopener noreferrer">
            Biased LLMs can Influence Political Decision-Making
          </a>.
          <span className={styles.refVenue}>ACL 2025</span>
        </li>
        <li className={styles.refItem}>
          Giorgi, S. et al.{" "}
          <a href="https://ojs.aaai.org/index.php/ICWSM/article/view/35837" target="_blank" rel="noopener noreferrer">
            Human and LLM Biases in Hate Speech Annotations: A Socio-Demographic Analysis
          </a>.
          <span className={styles.refVenue}>AAAI ICWSM 2025</span>
        </li>
      </ul>
    </section>
  );
}
