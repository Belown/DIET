/**
 * Adaptive Narrative System
 *
 * The detective's dialogue now reflects the player's actual performance.
 * No two playthroughs read the same — the story bends around the data
 * the player chose to collect.
 *
 * Integration:
 *   1. Import { getAdaptivePassage } from "./adaptivePassages"
 *   2. Replace PASSAGES[passage] calls with getAdaptivePassage(passage, strategy)
 *   3. The "intro", demo passages, and plan passages stay fixed
 *      (they are pre-gameplay or are purely instructional UI states).
 *
 * StrategyResult shape matches what summarizeStrategy() already returns.
 */

import type { Passage, PassageId } from "./staticPassages";
import { PASSAGES } from "./staticPassages";

export interface StrategyResult {
  regionAccs: number[]; // [uptown, downtown, factory, slums] 0-1
  otherCityAccs: number[];
  sampledFlags: boolean[]; // which regions had at least one sample
  committedCount: number;
  usefulSignal?: number;
  noiseSignal?: number;
  biasSignal?: number;
}

type Tier = {
  overallAcc: number; // 0-100
  otherCityOvr: number; // 0-100
  sampledCount: number;
};
type TierLabel = "outstanding" | "great" | "good" | "mediocre" | "poor" | "terrible";

function evalTier(s: StrategyResult): Tier {
  const overallAcc = s.regionAccs.reduce((sum, a) => sum + a, 0) / 4;
  const otherCityOvr = s.otherCityAccs.reduce((sum, a) => sum + a, 0) / 4;
  return {
    overallAcc: Math.round(overallAcc * 100),
    otherCityOvr: Math.round(otherCityOvr * 100),
    sampledCount: s.sampledFlags.filter(Boolean).length,
  };
}

function tierLabel(t: Tier): TierLabel {
  if (t.overallAcc >= 92) return "outstanding";
  if (t.overallAcc >= 78) return "great";
  if (t.overallAcc >= 63) return "good";
  if (t.overallAcc >= 48) return "mediocre";
  if (t.overallAcc >= 33) return "poor";
  return "terrible";
}

function strongestRegion(s: StrategyResult): string {
  let maxI = 0;
  for (let i = 1; i < 4; i++) {
    if ((s.regionAccs[i] ?? 0) > (s.regionAccs[maxI] ?? 0)) maxI = i;
  }
  return ["Uptown", "Downtown", "the Factory Zone", "the Slums"][maxI] ?? "Uptown";
}

function weakestRegion(s: StrategyResult): string {
  let minI = 0;
  for (let i = 1; i < 4; i++) {
    if ((s.regionAccs[i] ?? 0) < (s.regionAccs[minI] ?? 0)) minI = i;
  }
  return ["Uptown", "Downtown", "the Factory Zone", "the Slums"][minI] ?? "the Slums";
}

function unsampledList(s: StrategyResult): string {
  const names = ["Uptown", "Downtown", "the Factory Zone", "the Slums"];
  const missed = names.filter((_, i) => !s.sampledFlags[i]);
  if (!missed.length) return "";
  if (missed.length === 1) return missed[0]!;
  if (missed.length === 2) return `${missed[0]} and ${missed[1]}`;
  return `${missed.slice(0, -1).join(", ")}, and ${missed[missed.length - 1]}`;
}

function questionAnalysis(s: StrategyResult) {
  return {
    usedRoutine: (s.usefulSignal ?? 0) > 0,
    usedPhone:   (s.noiseSignal   ?? 0) > 0,
    usedPolice:  (s.biasSignal    ?? 0) > 0,
  };
}

// ─── ADAPTIVE PASSAGE VARIANTS ────────────────────────────────────────────────

function day1Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const unsampled = unsampledList(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: overall read
  if (label === "outstanding") {
    chunks.push("Day 1 complete. That's the most thorough opening sweep I've seen — all four districts covered, solid samples running through every zone.");
  } else if (label === "great") {
    chunks.push("Day 1 complete. Strong first sweep — three districts in the dataset, accuracy starting to take shape.");
  } else if (label === "good") {
    chunks.push("Day 1 complete. Two districts covered — it's a start. Most of New Eden is still outside the dataset, but there's time.");
  } else if (label === "mediocre") {
    chunks.push("Day 1 complete. The coverage is thin. The detective didn't move far enough beyond familiar ground.");
  } else if (label === "poor") {
    chunks.push("Day 1 complete. The detective spent almost the whole day in a single district — the same narrow sweep that broke the original verdict.");
  } else {
    chunks.push("Day 1 complete. The detective barely left Uptown. There's no other way to put it.");
  }

  // Coverage pillar
  if (t.sampledCount === 4) {
    chunks.push("Coverage: every district is in the dataset. That's the foundation the original team never bothered to lay.");
  } else if (t.sampledCount === 3) {
    chunks.push(`Coverage: three of four districts sampled. ${unsampled} is still dark — a community the model is already forming opinions about without any data.`);
  } else if (t.sampledCount === 2) {
    chunks.push(`Coverage: two districts. ${unsampled} don't exist in the model's world yet. Two days remain — that gap is absolutely recoverable.`);
  } else {
    chunks.push(`Coverage: one district, barely. ${unsampled || "Three full districts"} are invisible to the algorithm. This is the same narrow slice that shattered the original verdict.`);
  }

  // Depth pillar (inferred from tier vs. coverage)
  if (t.sampledCount >= 3 && (label === "outstanding" || label === "great")) {
    chunks.push("Sample depth looks balanced — budget was spread across zones rather than poured into one familiar neighborhood.");
  } else if (t.sampledCount >= 3 && (label === "mediocre" || label === "poor" || label === "terrible")) {
    chunks.push("Even with all four zones visited, sample depth is low across the board. Light coverage everywhere still leaves the model guessing.");
  } else if (t.sampledCount <= 2 && (label === "mediocre" || label === "poor" || label === "terrible")) {
    chunks.push(`Within the zones visited, sample counts are also thin. A small dataset from ${t.sampledCount <= 1 ? "one district" : "two districts"} gives the model anecdotes, not patterns.`);
  }

  // Signal / question variety pillar
  if (q.usedRoutine && !q.usedPhone && !q.usedPolice) {
    chunks.push("Question variety: daily routine was the right call. It anchors the model to behavioral patterns — work schedules, shift timings, actual daily life — instead of demographic proxies.");
  } else if (q.usedRoutine && q.usedPhone && !q.usedPolice) {
    chunks.push("Daily routine was useful — it gives real behavioral signal. But the phone model check is noise: it correlates device ownership with suspicion, which tracks wealth, not behavior. Drop it tomorrow and redirect that 10cr toward more samples.");
  } else if (q.usedRoutine && q.usedPolice) {
    chunks.push("Daily routine is the useful signal. Past police stops, though, brings in historical bias — the model starts replicating old enforcement patterns instead of identifying actual behavior. Avoid it tomorrow.");
  } else if (!q.usedRoutine && q.usedPhone && !q.usedPolice) {
    chunks.push("The phone model check records device models, not behaviors. It's noise — the model learns to sort by income proxy. Tomorrow, drop it and ask about daily routines instead. That's the question that actually earns its 10cr.");
  } else if (!q.usedRoutine && q.usedPolice) {
    chunks.push("Past police stops introduces bias rather than insight. Historical arrest patterns encode decades of uneven enforcement — the model learns to replicate that, not correct it. Replace it with daily routine tomorrow.");
  } else if (q.usedPhone && q.usedPolice) {
    chunks.push("The question mix is working against you. Phone model is noise; past police stops is bias. Neither teaches real behavior. Daily routine is the question worth paying for — include it tomorrow and cut the other two.");
  } else {
    chunks.push("No extra questions were asked this round. Daily routine is worth the 10cr — it gives the model actual work patterns from each district, far more predictive than demographic proxies. Add it tomorrow.");
  }

  // Next-day suggestion
  if (label === "outstanding") {
    chunks.push("Two days remain. The strategy is working — keep the breadth, resist the temptation to pile samples into districts you already know well.");
  } else if (label === "great") {
    chunks.push(`Tomorrow: close ${unsampled ? `the gap in ${unsampled} first` : "the depth gap in the weaker zones"}, then deepen where accuracy still lags.`);
  } else {
    chunks.push("Two days remain — this is genuinely recoverable. Tomorrow, spread wider before going deeper. Visiting a new district matters more right now than a fifth patrol in one you've already covered.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Proceed to Day 2", nextPassage: "day2-brief" }],
  };
}

function day2Brief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const best = strongestRegion(s);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: reference yesterday
  if (label === "outstanding") {
    chunks.push("Day 2. Yesterday's sweep was exceptional — all districts covered, accuracy strong across the board. The model is learning fast.");
  } else if (label === "great") {
    chunks.push(`Day 2. Yesterday was solid. ${best} is the strongest district; ${worst} is the weakest. The gap between them is where bias still lives.`);
  } else if (label === "good") {
    chunks.push("Day 2. Yesterday covered the basics. The model has data, but it's not yet evenly distributed across the city.");
  } else if (label === "mediocre") {
    chunks.push("Day 2. Yesterday was too narrow. The dataset only shows the city where the detective walked — and the detective didn't walk far enough.");
  } else if (label === "poor") {
    chunks.push("Day 2. I'll be direct: yesterday barely improved on what the original team produced. One district, maybe two. The same narrow sample that built a broken model.");
  } else {
    chunks.push("Day 2. Yesterday was a disaster. One district, almost nothing outside Uptown. The model is essentially still blind.");
  }

  // Coverage status going into day 2
  if (t.sampledCount === 4) {
    chunks.push("Coverage foundation: every district has been touched. Today the question is depth — are the sample counts high enough for the model to trust what it's learned?");
  } else if (t.sampledCount === 3) {
    chunks.push(`${unsampled} is still unvisited. That's the highest-priority fix for today — a model that has never seen those residents cannot be fair to them.`);
  } else {
    chunks.push(`${unsampled || "Most of the city"} is invisible to the algorithm. Today needs to fix the coverage problem before anything else.`);
  }

  // Signal advice going into day 2
  if (q.usedPhone && !q.usedRoutine) {
    chunks.push("The phone model check from yesterday added noise without adding clarity. Today: swap it for daily routine — that's the behavioral signal the model actually needs.");
  } else if (q.usedPolice) {
    chunks.push("Past police stops brought in historical bias last time. Drop it today — it teaches the model to replicate old enforcement patterns, not identify real behavior.");
  } else if (!q.usedRoutine) {
    chunks.push("Daily routine wasn't in yesterday's mix. Add it today — it's 10cr and it gives the model actual work-pattern data instead of demographic proxies.");
  } else if (q.usedRoutine && !q.usedPhone && !q.usedPolice) {
    chunks.push("Daily routine was the right call yesterday — keep it in the mix. Clean signal compounds over multiple days.");
  }

  // Goal for today
  if (label === "outstanding") {
    chunks.push("100 credits. Refine the distribution today — make sure no single district dominates the training data. Breadth got you here; precision takes you further.");
  } else if (label === "great") {
    chunks.push(`100 credits. ${unsampled ? `Visit ${unsampled} first, then deepen.` : "Deepen the districts where accuracy still lags."} End today with the coverage gap closed.`);
  } else {
    chunks.push("100 credits. Breadth before depth — closing a coverage gap produces more accuracy gain than adding more samples to a district you already know.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Plan Day 2 mission", nextPassage: "day2-plan" }],
  };
}

function day2Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: two-day stock-take
  if (label === "outstanding") {
    chunks.push("Day 2 complete. Two days of thorough field work — the dataset is in strong shape across every district.");
  } else if (label === "great") {
    chunks.push("Day 2 complete. Two days of solid data collection. The gaps are mostly closed, but precision still varies.");
  } else if (label === "good") {
    chunks.push("Day 2 complete. Progress across the board — but some districts still drag the average down.");
  } else if (label === "mediocre") {
    chunks.push("Day 2 complete. The picture is better than yesterday, but still not where it needs to be.");
  } else if (label === "poor") {
    chunks.push("Day 2 complete. Two days in, and the dataset is still thin. The numbers are grim.");
  } else {
    chunks.push("Day 2 complete. Two days, and the model has barely seen the city it's supposed to serve.");
  }

  // Coverage pillar — accumulated over two days
  if (t.sampledCount === 4) {
    chunks.push("Coverage: every district has been sampled across both days. That's the essential foundation — the model knows the full city exists.");
  } else if (t.sampledCount === 3) {
    chunks.push(`Coverage: ${unsampled} is still unvisited after two days. The model is forming verdicts about people it has never seen. Tomorrow is the last chance to fix that.`);
  } else {
    chunks.push(`Coverage: ${unsampled || "most of the city"} is still outside the dataset after two days. With one day left, every credit tomorrow should go toward those unsampled districts first.`);
  }

  // Depth pillar
  if (label === "outstanding" || label === "great") {
    chunks.push("Sample depth is holding up — the model has enough examples in visited zones to see real patterns, not just noise.");
  } else {
    chunks.push(`Even within visited zones, sample depth is thin. The model is working from small batches that may not represent the full distribution — especially in ${worst}.`);
  }

  // Signal pillar
  if (q.usedRoutine && !q.usedPhone && !q.usedPolice) {
    chunks.push("Signal quality has been clean — daily routine kept the model anchored to behavioral truth over two days.");
  } else if (q.usedPhone && q.usedRoutine) {
    chunks.push("Daily routine is still the useful signal; the phone model check is still adding noise. The last day is a chance to run clean — drop the phone check and put that budget toward more samples.");
  } else if (q.usedPolice) {
    chunks.push("Past police stops has been part of the mix — and it's introducing bias the model will carry into the verdict. Tomorrow: leave it out and run on clean behavioral signal only.");
  } else if (!q.usedRoutine) {
    chunks.push("Daily routine is still missing from the question mix after two days. That's the most useful behavioral signal available — tomorrow is the last chance to include it.");
  }

  // Final-day suggestion
  if (label === "outstanding") {
    chunks.push("One day left. Make sure no district gets shortchanged in the final round — the neighboring city test will expose any region that's still underrepresented.");
  } else if (label === "great") {
    chunks.push(`Final day priority: ${unsampled ? `visit ${unsampled} and close the last coverage gap` : `lift ${worst} — a model is only as fair as its weakest region`}.`);
  } else {
    chunks.push("Tomorrow is the last day. Maximum coverage first — visit every district the model hasn't seen. Then deepen. The final verdict lands on whatever you collect, and there's no appeal.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Proceed to Day 3", nextPassage: "day3-brief" }],
  };
}

function day3Brief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const unsampled = unsampledList(s);
  const worst = weakestRegion(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: final-day framing
  if (label === "outstanding") {
    chunks.push("Day 3. The final investigation. Two days of thorough field work built a strong dataset — the model knows the whole city.");
  } else if (label === "great") {
    chunks.push("Day 3. Last chance to sharpen the picture. Two days of solid work, with one or two gaps left to close.");
  } else if (label === "good") {
    chunks.push("Day 3. Your last 100 credits. The model is improving but still vulnerable — decent isn't enough when a person's freedom is at stake.");
  } else if (label === "mediocre") {
    chunks.push("Day 3. This is it. The dataset is shaky after two days — narrow coverage, thin samples, and the final test is coming.");
  } else if (label === "poor") {
    chunks.push("Day 3. Final day, and the situation is serious. Two days in and the model has seen almost nothing of the city it's supposed to serve.");
  } else {
    chunks.push("Day 3. The last chance to build a dataset worth trusting. Two days of narrow collection have to be corrected today.");
  }

  // Coverage gap — what still needs to happen
  if (t.sampledCount === 4) {
    chunks.push(`Coverage is solid — every district has been visited. Today the priority is refining depth, especially in ${worst} where the model is still shaky.`);
  } else if (unsampled) {
    chunks.push(`The most urgent item: ${unsampled} ${t.sampledCount <= 1 ? "have" : "has"} never been visited. The model is rendering verdicts about people it has never seen — fix this before anything else today.`);
  }

  // Signal advice for the final day
  if (q.usedPhone || q.usedPolice) {
    const issues = [
      q.usedPhone ? "phone model (noise)" : null,
      q.usedPolice ? "past police stops (bias)" : null,
    ].filter(Boolean).join(" and ");
    chunks.push(`Today is the last chance to run clean. ${issues} ${q.usedPhone && q.usedPolice ? "have been" : "has been"} hurting the model — drop ${q.usedPhone && q.usedPolice ? "them" : "it"} today and put the budget toward daily routine and more samples.`);
  } else if (!q.usedRoutine) {
    chunks.push("Daily routine hasn't been in the question mix. Add it today — it's the one question that gives the model behavioral truth instead of a proxy.");
  } else {
    chunks.push("The signal strategy from earlier days was solid. Keep daily routine in the mix and stay away from the noisy questions.");
  }

  // Stakes
  if (label === "outstanding" || label === "great") {
    chunks.push("After today, the model faces its real test: deployment to a neighboring city it has never seen. If the approach generalized — if it wasn't just tuned to New Eden — it will hold.");
  } else {
    chunks.push("After today, the verdict lands on whatever is in the dataset. It cannot be appealed. Make this day count.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Plan Day 3 mission", nextPassage: "day3-plan" }],
  };
}

function day3Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const best = strongestRegion(s);
  const unsampled = unsampledList(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: three-day retrospective
  if (label === "outstanding") {
    chunks.push("Three days. Three missions. And a dataset that looks nothing like what the original team ever collected.");
  } else if (label === "great") {
    chunks.push(`Three days complete. The dataset is strong — a real improvement over where we started. ${best} shows what thoughtful collection looks like.`);
  } else if (label === "good") {
    chunks.push("Three days complete. The data is better than what caused the original failure, though it's not without gaps.");
  } else if (label === "mediocre") {
    chunks.push("Three days... and the gaps remain. The model is going into the final test with uneven coverage across the city.");
  } else if (label === "poor") {
    chunks.push("Three days. Three missions. And I'm not sure it was enough. The dataset is thin in too many places.");
  } else {
    chunks.push("Three days. And the dataset is barely better than the one that convicted an innocent person the first time.");
  }

  // Coverage retrospective
  if (t.sampledCount === 4) {
    chunks.push("Coverage: every district was sampled across the three days. The model knows the whole city exists — that was the one thing the original team never did.");
  } else if (unsampled) {
    chunks.push(`Coverage: ${unsampled} was never visited across three full days. The algorithm will render verdicts about those residents in complete darkness.`);
  }

  // Depth retrospective
  if (label === "outstanding" || label === "great") {
    chunks.push("Sample depth built up over three days — the model has enough examples to see real patterns, not just fit to noise.");
  } else {
    chunks.push("Sample depth remained thin in too many zones. The model is working from small, potentially unrepresentative batches — exactly the kind of dataset that produces confident mistakes.");
  }

  // Signal retrospective
  if (q.usedRoutine && !q.usedPhone && !q.usedPolice) {
    chunks.push("Signal quality was clean throughout: daily routine kept the model anchored to behavioral truth instead of demographic proxies. That was the right call every time.");
  } else if (q.usedPhone && !q.usedPolice) {
    chunks.push("The phone model check ran through the investigation and added noise the model had to work around. Behavioral signal — daily routine — is what predicts behavior; device ownership just tracks income.");
  } else if (q.usedPolice) {
    chunks.push("Past police stops was part of the signal mix, and it brought historical bias into the model. The algorithm learned to reflect old enforcement patterns alongside whatever real behavior the data showed.");
  } else if (!q.usedRoutine) {
    chunks.push("Daily routine never made it into the question mix across three days. That's the cleanest behavioral signal available — its absence is a gap the model will carry into the verdict.");
  }

  // Bridge to verdict
  if (label === "outstanding") {
    chunks.push("Now the real test: the neighboring city. If the approach generalized — if it wasn't just tuned to New Eden's specifics — the model will hold. Let's find out.");
  } else if (label === "great") {
    chunks.push("The neighboring city transfer is the honest judge. A strong local dataset doesn't always travel. Let's see the verdict.");
  } else {
    chunks.push("The verdict is about to land. Whatever the model learned — or didn't learn — from three days of collection is all it has to go on. Let's see what it says.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Review the results", nextPassage: "verdict" }],
  };
}

function verdict(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);

  const variants: Record<TierLabel, string[]> = {
    outstanding: [
      "Look at these numbers.",
      `Overall accuracy above ${t.overallAcc}%. Every district performing well. And the neighboring city? The transfer held — the model didn't just work for New Eden, it traveled.`,
      "The Factory Zone night-shift workers? Classified correctly. The Slums? No longer an algorithmic blind spot. The model sees patterns without prejudice — because you gave it data that included everyone.",
      "The original AI sent an innocent person to prison because its dataset was narrow, privileged, and incomplete. Your dataset is broad, representative, and fair.",
      "You didn't just fix a model. You proved that who collects the data, where they go, and what they ask... changes whose freedom is protected and whose is taken.",
      "This is what justice looks like when the data tells the whole story.",
    ],
    great: [
      `Overall accuracy at ${t.overallAcc}%. Solid — far better than the coin-flip the original system essentially was.`,
      `But the neighboring city transfer dropped to ${t.otherCityOvr}%. Your model works well for New Eden — but it stumbles when it crosses the city line.`,
      "That's the deeper lesson: a model trained in one context doesn't automatically travel to another. Fairness isn't a one-time achievement — it's a continuous commitment to checking, retraining, and questioning.",
      "You improved the system significantly. The apprentice would have a fighting chance. But the work isn't finished — it never is.",
    ],
    good: [
      `Overall accuracy at ${t.overallAcc}%. Better than random. Better than the original. But not good enough to trust with people's lives.`,
      `The neighboring city test dropped to ${t.otherCityOvr}% — a reminder that what works in one place may fail in another.`,
      `Your weakest district is ${worst}. ${unsampled ? "And " + unsampled + " was never sampled — the algorithm literally judged people it had never seen." : "Coverage existed, but precision varied widely."}`,
      "You collected more data than the original team. But data volume isn't the same as data quality. The question is: whose data counted, and whose didn't?",
    ],
    mediocre: [
      `Overall accuracy at ${t.overallAcc}%. Some districts perform adequately. Others barely beat random guessing.`,
      `The neighboring city transfer is at ${t.otherCityOvr}% — the model is brittle outside its training bubble.`,
      `${unsampled ? "You never visited " + unsampled + ". The algorithm made decisions about people it had zero information about." : "Coverage existed everywhere, but it was too shallow to be reliable."}`,
      "The apprentice... the machine might still get it wrong. Not because the algorithm is evil, but because the data never showed it the full picture.",
      "Sampling bias isn't a bug in the code. It's a choice — a choice about whose data counts and whose doesn't. Today, you learned what that choice costs.",
    ],
    poor: [
      `Overall accuracy at ${t.overallAcc}%. Below the threshold of trust.`,
      `The neighboring city transfer is at ${t.otherCityOvr}% — the model is essentially useless outside the narrow slice it saw.`,
      `${unsampled ? unsampled + " was never visited. Those residents don't exist in the model's world. It cannot be fair to people it has never seen." : "Every district was touched, but the data was too noisy, too biased, or too shallow."}`,
      "The apprentice would likely still be convicted. The machine would still get it wrong. But here's what matters: you now understand why.",
      "The failure wasn't in the algorithm. It was in the choices about what data to collect, from whom, and what questions to ask. Next time — in the next timeline — you'll choose differently.",
    ],
    terrible: [
      `Overall accuracy at ${t.overallAcc}%. The model failed.`,
      `The neighboring city transfer collapsed to ${t.otherCityOvr}% — worse than a coin flip.`,
      `${unsampled ? "The detective never visited " + unsampled + ". The algorithm judged entire communities in complete darkness." : "The data covered ground but taught the model the wrong patterns."}`,
      "The apprentice would still go to prison. The machine would still make the same mistake — or a worse one.",
      "But you're not the original data team. You now understand what they didn't: that data isn't neutral. That who you sample, where you go, and what you ask determines who the machine protects... and who it condemns.",
      "The investigation failed. But you won't forget why. And next time — when you step back into Day 1 — you'll build the dataset that should have been collected from the start.",
    ],
  };

  return {
    chatbox: "close",
    chunks: variants[label],
    choices: [],
  };
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * Returns the adapted passage for the given passageId.
 * Passages that don't adapt (intro, demo-*, plans) fall through to the static PASSAGES.
 * Pass `strategy` as null/undefined for passages that don't need it
 * (the function handles this gracefully).
 */
export function getAdaptivePassage(
  passageId: PassageId,
  strategy?: StrategyResult | null,
): Passage {
  if (!strategy) return PASSAGES[passageId];

  switch (passageId) {
    case "day1-debrief":
      return day1Debrief(strategy);
    case "day2-brief":
      return day2Brief(strategy);
    case "day2-debrief":
      return day2Debrief(strategy);
    case "day3-brief":
      return day3Brief(strategy);
    case "day3-debrief":
      return day3Debrief(strategy);
    case "verdict":
      return verdict(strategy);
    default:
      return PASSAGES[passageId];
  }
}
