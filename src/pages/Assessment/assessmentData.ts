export const BIAS_SECTIONS = [
  {
    id: 'sampling-bias',
    label: 'Sampling Bias',
    definition: 'It happens when there is too little data, missing groups, or not enough variety in the data.',
    scenario: "A city's crime-prediction system was trained on data from only one wealthy neighbourhood, then used to judge residents across all four areas — including factory workers, downtown residents, and low-income communities.",
    questions: [
      {
        id: 'q1',
        number: 'Q1',
        text: 'A crime-prediction system is trained only on data from a wealthy neighbourhood. When it is used across the whole city, what is the most likely result?',
        options: [
          { key: 'A', text: 'It works everywhere because crime patterns are universal' },
          { key: 'B', text: 'It misidentifies people whose routines differ from the wealthy area' },
          { key: 'C', text: 'It becomes more accurate with a clear reference point' },
          { key: 'D', text: 'It only fails for people with a criminal record' },
        ],
        correct: 'B',
      },
      {
        id: 'q2',
        number: 'Q2',
        text: 'A system asks residents three extra questions: work schedule, phone brand, and police history. Which combination would most improve fairness?',
        options: [
          { key: 'A', text: 'Phone brand — reveals lifestyle and spending habits' },
          { key: 'B', text: 'Police history — shows who has been in trouble before' },
          { key: 'C', text: 'Work schedule — distinguishes night-shift workers from suspicious activity' },
          { key: 'D', text: 'All three help equally because more information is better' },
        ],
        correct: 'C',
      },
      {
        id: 'q3',
        number: 'Q3',
        text: 'A system scores 95% accuracy in its training neighborhood but drops to 50% citywide. The team collects ten times more data from the same neighborhood. What happens?',
        options: [
          { key: 'A', text: 'Citywide accuracy improves because of more examples' },
          { key: 'B', text: 'Training-neighborhood accuracy improves, but citywide stays the same' },
          { key: 'C', text: 'The system worsens everywhere because of overload' },
          { key: 'D', text: 'Citywide accuracy improves after passing a threshold' },
        ],
        correct: 'B',
      },
    ],
  },
  {
    id: 'algorithmic-fairness',
    label: 'Algorithmic Fairness Bias',
    definition: "It happens when a system's definition of \"fair\" benefits one group while disadvantaging another.",
    scenario: 'COMPAS is a real US court tool for predicting reoffending. An investigation found that Black defendants who did not reoffend were wrongly labelled "high risk" nearly twice as often as White defendants, while the creators argued the score meant the same reoffending probability across races.',
    questions: [
      {
        id: 'q4',
        number: 'Q4',
        text: 'Creators say: "A score of 7 means the same 60% reoffending risk for everyone." Investigators say: "Innocent Black defendants are wrongly flagged twice as often." Can both be true?',
        options: [
          { key: 'A', text: 'No — one side must be lying or misreading the data' },
          { key: 'B', text: 'Yes — they are measuring two different things' },
          { key: 'C', text: 'Investigators are correct because their claim focuses on real people' },
          { key: 'D', text: 'Creators are correct because their method is based on mathematics' },
        ],
        correct: 'B',
      },
      {
        id: 'q5',
        number: 'Q5',
        text: 'A judge sees two defendants — one Black, one White — with similar backgrounds and charges, but the Black defendant receives a higher risk score. Which explanation is most accurate?',
        options: [
          { key: 'A', text: 'The tool is biased because it directly uses race as input' },
          { key: 'B', text: 'The tool reflects historical data which is already unequal' },
          { key: 'C', text: 'The tool is random, this will disappear with more data' },
          { key: 'D', text: 'The tool is accurate, it reflects real behavior differences' },
        ],
        correct: 'B',
      },
      {
        id: 'q6',
        number: 'Q6',
        text: 'A city wants a "perfectly fair" risk tool with three rules: (1) same score means same reoffending chance for all races, (2) equal mistake rates across races, and (3) equal proportions flagged. If actual reoffending rates differ between groups, how many rules can be satisfied at once?',
        options: [
          { key: 'A', text: 'All three — it just requires careful tuning' },
          { key: 'B', text: 'At most two — satisfying all three is mathematically impossible when group rates differ' },
          { key: 'C', text: 'Only one — the rules always conflict with each other' },
          { key: 'D', text: 'None — fairness cannot be measured with numbers' },
        ],
        correct: 'B',
      },
    ],
  },
  {
    id: 'human-in-the-loop',
    label: 'Human-In-The-Loop Bias',
    definition: 'It happens when people teaching AI what is "good" or "bad" bring their own values and blind spots into the system.',
    scenario: 'Large language models (like ChatGPT) are trained partly by workers called "raters" who judge which AI responses are "good" and which are "bad." The AI then learns to produce responses matching what these raters preferred. These raters come from specific backgrounds and working conditions.',
    questions: [
      {
        id: 'q7',
        number: 'Q7',
        text: 'Three raters judge the same AI response about a political topic. Rater A calls it "harmful," Rater B calls it "neutral," and Rater C calls it "helpful." The AI learns from the majority vote. What does this reveal?',
        options: [
          { key: 'A', text: 'The AI will learn the objectively correct position over time' },
          { key: 'B', text: "The AI's values depend on who is in the rating pool" },
          { key: 'C', text: 'Disagreement means the AI should refuse the question' },
          { key: 'D', text: 'More raters will always remove this kind of bias' },
        ],
        correct: 'B',
      },
      {
        id: 'q8',
        number: 'Q8',
        text: 'An AI is trained to be helpful. Users get dangerous instructions by framing requests as fiction. The company tightens safety filters, and the AI now refuses many harmless creative requests. What does this show?',
        options: [
          { key: 'A', text: 'The AI should never write fiction' },
          { key: 'B', text: 'Safety and helpfulness can conflict' },
          { key: 'C', text: "The company's filters are broken and need better programming" },
          { key: 'D', text: 'Users are at fault and the company responded correctly' },
        ],
        correct: 'B',
      },
      {
        id: 'q9',
        number: 'Q9',
        text: "A company hires raters in a low-income country to train its AI. They are paid per task and work under speed quotas. The AI later reflects those raters' cultural norms more than its global users. A critic says: \"The problem is the raters.\" What is the best response?",
        options: [
          { key: 'A', text: 'Better-educated raters would solve the issue' },
          { key: 'B', text: 'The issue is who rates and under what conditions' },
          { key: 'C', text: 'Culture does not affect ratings if instructions are standardised' },
          { key: 'D', text: 'This only matters for controversial topics' },
        ],
        correct: 'B',
      },
    ],
  },
];

export const FEEDBACK_STATEMENTS = [
  'I learned something new about how AI systems can produce unfair outcomes.',
  'I can explain at least one type of AI bias to someone who has never heard of it.',
  'I can connect what I learned to real-world AI systems I have heard about.',
  'I felt that my choices during the game actually affected the outcome.',
  'I enjoyed playing this game.',
  'It was easy to understand what I was supposed to do in the game.',
  'I would recommend this game to a friend.',
];

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Not at all true' },
  { value: 2, label: 'Mostly not true' },
  { value: 3, label: 'Somewhat not true' },
  { value: 4, label: 'Neither true nor untrue' },
  { value: 5, label: 'Somewhat true' },
  { value: 6, label: 'Mostly true' },
  { value: 7, label: 'Very true' },
];

export const OPEN_ENDED_QUESTIONS = [
  'Which chapter was most memorable, and why?',
  'Was there a moment you were unsure what to do?',
  'Did anything change how you think about AI fairness?',
];
