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
 *   3. The "intro", "demo-intro", "demo-reveal", and plan passages stay fixed
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
  if (t.overallAcc >= 85) return "outstanding";
  if (t.overallAcc >= 70) return "great";
  if (t.overallAcc >= 55) return "good";
  if (t.overallAcc >= 40) return "mediocre";
  if (t.overallAcc >= 30) return "poor";
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

// ─── ADAPTIVE PASSAGE VARIANTS ────────────────────────────────────────────────

function day1Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);

  const variants: Record<TierLabel, string[]> = {
    outstanding: [
      "Day 1 complete. The detective returns with a rich cross-section of New Eden — all four districts covered.",
      "Uptown, Downtown, the Factory Zone, even the Slums. The model is already seeing patterns the original team never bothered to look for.",
      "This is what a proper investigation looks like: data from every corner of the city, not just the comfortable ones.",
      "Two days remain. Keep this breadth. Don't let any district slip into the shadows.",
    ],
    great: [
      "Day 1 complete. Strong first sweep — three districts covered, solid accuracy taking shape.",
      "The model is already sharper than the Uptown-only disaster we saw in the demo.",
      `But ${unsampled} hasn't seen a detective yet. Every unsampled zone is a blind spot.`,
      "Tomorrow, close that gap before it becomes a verdict.",
    ],
    good: [
      "Day 1 complete. The detective covered two districts — a start, but barely.",
      "The original model failed because it only saw one slice of the city. You've widened that — but most of New Eden is still invisible to the algorithm.",
      `Right now, ${worst} is dragging the score down. And ${unsampled ? unsampled + " hasn't been visited at all." : "some zones are barely sampled."}`,
      "Tomorrow, you need to spread further. Breadth matters more than volume right now.",
    ],
    mediocre: [
      "Day 1 complete... and I'm concerned.",
      "You kept the detective in one or two districts — the same approach that destroyed the original verdict.",
      "The model can only learn from what it sees. And right now it sees very little.",
      `The weakest region is ${worst}. The unsampled territory includes ${unsampled || "critical ground"}.`,
      "Two days left. You cannot afford another narrow sweep.",
    ],
    poor: [
      "Day 1 complete... but you stayed almost entirely in one district.",
      "This is exactly what the original data team did. And you watched what happened — the boundary shattered when it met the full city.",
      "One region cannot speak for four. The machine needs to see everyone.",
      "You have two more days. Use them differently — or the apprentice stays convicted.",
    ],
    terrible: [
      "Day 1 complete.",
      "The detective barely left Uptown. Almost no data from outside the wealthy district.",
      "This is worse than the original investigation — at least they had an excuse. They didn't know about sampling bias. You do.",
      `The model knows nothing about ${unsampled || "anywhere else"}. Nothing about night-shift workers. Nothing about the Slums.`,
      "Two days remain. If you don't change course, the machine will make the same mistake again.",
    ],
  };

  return {
    chatbox: "open",
    chunks: variants[label],
    choices: [{ label: "Proceed to Day 2", nextPassage: "day2-brief" }],
  };
}

function day2Brief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const best = strongestRegion(s);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);

  const variants: Record<TierLabel, string[]> = {
    outstanding: [
      "Day 2. The detective's first sweep was exceptional — all districts covered, strong accuracy across the board.",
      "You have another 100 credits. The model is learning fast. Now refine: adjust distribution, test new question combinations.",
      "Make sure no single district dominates the training data. A model that's brilliant in Uptown but blind in the Slums is still a biased model.",
      "Breadth got you here. Precision takes you further.",
    ],
    great: [
      "Day 2. Yesterday was solid — but there's still a gap.",
      `Your strongest district is ${best}. Your weakest is ${worst}. The distance between them is where bias lives.`,
      unsampled
        ? `And ${unsampled} remains completely unsurveyed — don't let it stay that way.`
        : "You've touched every district. Now deepen the data where it's thin.",
      "100 credits. Make them count.",
    ],
    good: [
      "Day 2. A fresh budget of 100 credits, and a fresh chance to widen your reach.",
      "Yesterday left too many streets unwalked. The model's picture of New Eden is still narrow — and narrow is what destroyed the original verdict.",
      unsampled
        ? `The detective hasn't set foot in ${unsampled}. These districts are invisible to the algorithm right now.`
        : "You sampled broadly, but shallowly. Deepen the data where the model struggles most.",
      "Spread wider today. The more the model sees, the fairer it becomes.",
    ],
    mediocre: [
      "Day 2. Another 100 credits. Another chance to do this differently.",
      "Yesterday was too narrow. Too few districts. Too little variation in the data.",
      `The model is weak in ${worst}. ${unsampled ? "And " + unsampled + " has never been visited." : "Every district needs more coverage."}`,
      "Think about why the original AI failed: it saw one tiny slice of the city and assumed the rest looked the same. Don't repeat that.",
    ],
    poor: [
      "Day 2. I'm going to be direct with you.",
      "Yesterday was barely better than the original data team's effort. One district. Maybe two. The same kind of narrow sample that produced a broken model.",
      `The algorithm knows nothing about ${unsampled || "most of the city"}. And it's already scoring poorly in the zones it has seen.`,
      "You have 100 more credits. Please — spread them across the city. Visit the districts you ignored. Ask questions that reveal truth instead of noise.",
    ],
    terrible: [
      "Day 2. I'll be honest — yesterday was a disaster.",
      "You sampled almost nothing. One district, maybe. The model is essentially blind.",
      `It doesn't know ${unsampled || "any other part of New Eden"} exists. It has no data about night-shift workers, no data about the Slums, no data about anyone outside a narrow wealthy corridor.`,
      "100 credits. Please — do what the original team didn't. Go everywhere. Ask everything. Give the machine a chance to be fair.",
    ],
  };

  return {
    chatbox: "open",
    chunks: variants[label],
    choices: [{ label: "Plan Day 2 mission", nextPassage: "day2-plan" }],
  };
}

function day2Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);

  const variants: Record<TierLabel, string[]> = {
    outstanding: [
      "Day 2 complete. The model is sharp now — over 85% accuracy across the city.",
      "The Factory Zone night-shift workers are no longer being misclassified. The Slums' patterns are reflected in the data. Every district is represented.",
      "This is what a fair model looks like — not just accurate on average, but accurate for everyone.",
      "One day left. Don't get complacent. The neighboring city test will be brutal if you've overfitted. Make sure your model travels.",
    ],
    great: [
      "Day 2 complete. Two days of field data in. The gaps are closing.",
      `Your strongest districts perform well. But ${worst} still lags — and a model is only as fair as its weakest region.`,
      unsampled
        ? `${unsampled} remains unsampled — the algorithm literally cannot see those residents.`
        : "Every district has been touched, but depth varies widely.",
      "Tomorrow is your last chance. Lift the floor, not just the average.",
    ],
    good: [
      "Day 2 complete. Progress, but not enough.",
      "The model is improving — but some districts still drag the average down. And the neighboring city test looming at the end will magnify every weakness.",
      unsampled
        ? `You haven't visited ${unsampled}. The algorithm is making judgments about people it has zero data on.`
        : `The weakest link is ${worst}. Focus your final day there.`,
      "One day left. Don't let the unsampled stay invisible. Don't let the weak stay weak.",
    ],
    mediocre: [
      "Day 2 complete... and I'm worried.",
      "The model's accuracy is mediocre. Some districts you visited perform okay — others are barely better than random guessing.",
      `The biggest gap is ${worst}. ${unsampled ? "And " + unsampled + " has never seen a detective patrol." : "Coverage is shallow everywhere."}`,
      "Tomorrow is your final day. Close the gaps. Cut the noise. This is your last chance to give the machine a complete picture.",
    ],
    poor: [
      "Day 2 complete... and the numbers are grim.",
      "The model knows almost nothing about most of New Eden. Its accuracy is poor in the districts you did sample, and nonexistent in the ones you didn't.",
      `The weakest region is ${worst} — but honestly, ${unsampled || "every district"} is struggling.`,
      "You have one day left. Stop hoarding credits. Go everywhere. Ask the questions that matter. Give the algorithm a real dataset — not a collection of narrow snapshots.",
    ],
    terrible: [
      "Day 2 complete.",
      "I don't know what to say. The model is barely functional. It has seen almost nothing of the city it's supposed to judge.",
      `It doesn't know ${unsampled || "anywhere outside a single district"} exists. It has no context for how people live outside Uptown.`,
      "One day remains. If tomorrow looks like yesterday... the apprentice stays in prison. The machine stays broken. And we stay trapped in a future where data decides guilt without ever seeing the whole picture.",
    ],
  };

  return {
    chatbox: "open",
    chunks: variants[label],
    choices: [{ label: "Proceed to Day 3", nextPassage: "day3-brief" }],
  };
}

function day3Brief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const unsampled = unsampledList(s);

  const variants: Record<TierLabel, string[]> = {
    outstanding: [
      "Day 3. Final day. The model is strong — all districts covered, high accuracy, solid patterns.",
      "But the neighboring city test is merciless. A model that works perfectly for New Eden might collapse when it crosses the city line.",
      "Use these last 100 credits to close any remaining gaps. One final mission. Make it count.",
    ],
    great: [
      "Day 3. Last chance to sharpen the picture.",
      "You've built a solid dataset. Most districts perform well. But the neighboring city deployment will reveal every shortcut you took.",
      "Where are your remaining blind spots? Which questions are adding noise instead of signal?",
      "This is your final 100 credits. Spend them on what the model still doesn't understand.",
    ],
    good: [
      "Day 3. Final day of your investigation. This is your last chance.",
      "The model is decent — but decent isn't enough when a person's freedom hangs on the output.",
      unsampled
        ? `You've never visited ${unsampled}. Those residents are invisible to the algorithm. Fix that today.`
        : "Coverage exists everywhere, but it's thin. Deepen the data where accuracy is weakest.",
      "After today, there is no going back. The verdict lands with whatever you've collected.",
    ],
    mediocre: [
      "Day 3. This is it. Your last 100 credits. Your last mission.",
      "The model is shaky. Narrow coverage. Weak accuracy in the districts you did visit. Total blindness in the ones you didn't.",
      unsampled
        ? `The detective hasn't walked ${unsampled}. Those people don't exist in the algorithm's world.`
        : "Coverage exists but it's dangerously shallow.",
      "Do not repeat what the original team did. Spread wide. Ask the right questions. Give the machine a real dataset.",
    ],
    poor: [
      "Day 3. Final day.",
      "I'm going to be blunt: the model is in trouble. It has seen almost nothing of the city it's supposed to serve.",
      "You have 100 credits left. This is your last chance to give the algorithm a dataset that represents New Eden — not just a privileged slice of it.",
      "Go everywhere. Choose signals with care. After today, the verdict lands — and there is no appeal.",
    ],
    terrible: [
      "Day 3. This is the end of the investigation.",
      "The model has almost no useful data. It doesn't know most of the city exists. It has no context for anyone outside the narrowest sliver of New Eden.",
      "100 credits remain. One last mission. You can still change the outcome — but only if you abandon the narrow approach and cover ground you've ignored.",
      "After today, the machine renders its verdict. What it knows — or doesn't know — will be all it has to judge with.",
    ],
  };

  return {
    chatbox: "open",
    chunks: variants[label],
    choices: [{ label: "Plan Day 3 mission", nextPassage: "day3-plan" }],
  };
}

function day3Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const best = strongestRegion(s);

  const variants: Record<TierLabel, string[]> = {
    outstanding: [
      "Three days. Three missions. And a dataset that looks nothing like the original.",
      "You covered ground the first team ignored. You asked questions that revealed truth instead of echoing prejudice.",
      "The model is strong — over 85% accuracy, all districts performing well. This is what justice looks like when the data is fair.",
      "Now we face the final test: deploying to a neighboring city the model has never seen.",
      "If your approach travels, you didn't just fix a dataset — you proved that fairness is a choice, and you made it.",
      "Let's see the verdict.",
    ],
    great: [
      "Three days complete. The dataset is strong — better than the original by a wide margin.",
      `Your best district, ${best}, shows what's possible when data collection is thoughtful.`,
      "But the neighboring city stress test will expose every shortcut, every unsampled corner, every signal choice you made.",
      "Not a failure. Not yet a triumph. A lesson: data collection is never finished, only refined.",
      "Now let's see if it was enough.",
    ],
    good: [
      "Three days complete. The data is decent — better than we started, but with clear gaps.",
      "Some districts shine. Others lag. And the neighboring city transfer will be the true test of whether your strategy generalizes — or was just lucky within New Eden.",
      "I've seen worse investigations. I've seen better. What matters now is what the numbers say.",
      "Let's review the verdict.",
    ],
    mediocre: [
      "Three days... and the gaps remain.",
      "Some districts were barely sampled. Others never saw a detective at all.",
      "The model knows fragments of the city. Patchy. Incomplete. The kind of dataset that produces confident mistakes — high scores on the data it has, catastrophe on the data it doesn't.",
      "I hope the machine gets it right this time. But right now... I can't be certain.",
      "Let's see what the verdict says.",
    ],
    poor: [
      "Three days. Three missions. And I don't know if it was enough.",
      "The dataset is thin. Whole districts are still shadows to the algorithm. The questions you chose may have pulled the model toward old biases instead of away from them.",
      "The original AI convicted an innocent person because it didn't see the whole picture. Your dataset... I'm not sure it sees much more.",
      "The verdict is about to land. Whatever it says — remember why it says it.",
      "Let's review the results.",
    ],
    terrible: [
      "Three days. And the dataset is barely better than the original.",
      "I won't sugarcoat it. The detective barely covered the city. Whole communities are invisible to the algorithm. The questions asked — or not asked — left the model guessing in the dark.",
      "The original AI failed because it saw one narrow slice of New Eden. Your dataset... it saw barely more.",
      "The verdict is about to land. Look at the numbers carefully. Not just the average — look at who it got wrong, and ask yourself why.",
      "Let's see the results.",
    ],
  };

  return {
    chatbox: "open",
    chunks: variants[label],
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
