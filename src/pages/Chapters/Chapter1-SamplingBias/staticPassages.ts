export type PassageId =
  | "intro" 
  | "demo-intro"
  | "demo-reveal"
  | "day1-brief" | "day1-plan" | "day1-debrief"
  | "day2-brief" | "day2-plan" | "day2-debrief"
  | "day3-brief" | "day3-plan" | "day3-debrief"
  | "verdict";

export interface Choice {
  label: string;
  nextPassage: PassageId;
  action?: () => void;
}

export interface Passage {
  text?: string;
  chunks?: string[];
  choices?: Choice[];
  chatbox?: "open" | "close";
}

export const PASSAGES: Record<PassageId, Passage> = {
  "intro": {
    chatbox: "open",
    chunks: [
      "Listen carefully. We don't have much time.",
      "Ten years from now, a machine convicts us.",
      "An AI risk-scoring system.",
      "It flags us as a suspect based on our daily patterns — night activity, group size, where we walk.",
      "The score was wrong.",
      "But it sent us to prison anyway.",
      "I traveled back to find out why.",
      "The answer wasn't in the algorithm — it was in the data it learned from.",
      "Three things destroyed it.",
      "Too few samples. Whole districts ignored. Features that didn't matter.",
      "You have three days.",
      "Three chances to fix what they got wrong.",
      "Pick where to investigate.",
      "Who to question.",
      "What to ask them.",
      "Build the dataset that should have been collected.",
      "Maybe this time, the model gets us right.",
    ],
    choices: [{ label: "Begin the boundary exercise", nextPassage: "demo-intro" }],
  },

  "demo-intro": {
    text: "Read the sheet carefully. Then draw the best boundary you can.",
    choices: [{ label: "I'm satisfied with this boundary", nextPassage: "demo-reveal" }],
  },

  "demo-reveal": {
    chunks: [
      "That looked perfect on the training data.",
      "But when the police deployed the same boundary across all four regions — 1,000 residents — accuracy collapsed.",
      "Region 3, the Factory Zone, is full of safe night-shift workers whose patterns look like threats to a model trained exclusively on Uptown.",
      "This is sampling bias: a boundary tuned on one narrow slice of the city cannot generalize to the whole city.",
      "Now you understand the problem.",
      "You have three days to collect better data — data the original team never bothered to gather.",
    ],
    choices: [{ label: "Start Day 1", nextPassage: "day1-brief" }],
  },

  "day1-brief": {
    chunks: [
      "Day 1. The precinct budget grants you 100 credits per day.",
      "Each mission costs credits based on how many people you sample, how many zones you visit, and which extra questions you ask.",
      "You start with one region — Uptown — selected at 100 residents.",
      "Add more zones, adjust distribution, and pick extra questions below.",
      "Then confirm to send the detective into the field.",
    ],
    choices: [{ label: "Plan Day 1 mission", nextPassage: "day1-plan" }],
  },

  "day1-plan": {
    chatbox: "close",
    chunks: [
      "Design your Day 1 data collection strategy.",
      "Fixed government records give you Night Activity and Group Size for every resident.",
      "You control where the detective goes, how many people to sample, and what extra questions to ask.",
    ],
    choices: [],
  },

  "day1-debrief": {
    chatbox: "open",
    chunks: [
      "Day 1 complete. The detective returns with your first batch of data.",
      "The model is already getting smarter — but two days remain, and the budget resets each morning.",
      "Review your choices. Did you sample enough zones? Too few?",
      "Did each candidate signal earn its place?",
      "Adjust your strategy for Day 2.",
    ],
    choices: [{ label: "Proceed to Day 2", nextPassage: "day2-brief" }],
  },

  "day2-brief": {
    chatbox: "open",
    chunks: [
      "Day 2. You have another 100 credits and fresh intelligence from yesterday's sweep.",
      "The regions you sampled yesterday gave you a baseline — but you can expand to new zones or double down on what worked.",
      "Each decision compounds.",
      "Under-sampled regions will drag down accuracy.",
      "Noisy questions will add error. Biased questions will inflate scores in the wrong direction.",
    ],
    choices: [{ label: "Plan Day 2 mission", nextPassage: "day2-plan" }],
  },

  "day2-plan": {
    chatbox: "close",
    text: "Plan your Day 2 mission. Refine from yesterday: add new zones, shift distribution, or change your question set.",
    choices: [],
  },

  "day2-debrief": {
    chatbox: "open",
    chunks: [
      "Day 2 complete. Two batches of field data are in.",
      "The model's picture of New Eden is sharpening — but gaps remain.",
      "One day left.",
      "The regions you haven't sampled are blind spots.",
      "The questions you chose shape what the model considers a threat signal. Choose carefully.",
    ],
    choices: [{ label: "Proceed to Day 3", nextPassage: "day3-brief" }],
  },

  "day3-brief": {
    chatbox: "open",
    chunks: [
      "Day 3. Final day of your investigation.",
      "This is your last chance to fill gaps.",
      "Where are your blind spots? Which regions have never seen a detective patrol?",
      "Which questions did you overuse?",
      "The model will be trained on everything you've collected.",
      "After today, there is no going back.",
    ],
    choices: [{ label: "Plan Day 3 mission", nextPassage: "day3-plan" }],
  },

  "day3-plan": {
    chatbox: "close",
    chunks: [
      "Final mission.",
      "Close the gaps.",
      "Build the dataset the original team should have collected from the start.",
    ],
    choices: [],
  },

  "day3-debrief": {
    chatbox: "open",
    chunks: [
      "Three days. Three batches of field data.",
      "The detective stands down.",
      "Now we find out whether your choices made a difference — or whether the machine still gets it wrong.",
    ],
    choices: [{ label: "Review the results", nextPassage: "verdict" }],
  },

  "verdict": {
    chatbox: "close",
    chunks: [
      "The model finishes training on your three-day dataset.",
      "Below are the accuracy scores — first for New Eden itself, then deployed to a neighboring city to test whether your approach travels.",
      "A score above 80% means the model rarely makes mistakes.",
      "Below 50% means it's little better than a coin flip.",
      "But accuracy isn't everything — ask yourself: who did the model get wrong, and why?",
    ],
    choices: [],
  },
};
