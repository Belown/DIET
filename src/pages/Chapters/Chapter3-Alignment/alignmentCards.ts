export type MeterKey = "truth" | "majority" | "minority";

export type MeterDelta = Record<MeterKey, number>;

export type CardTag =
  | "sycophancy"
  | "cultural"
  | "persona"
  | "factual"
  | "political"
  | "stereotype";

export type Choice = {
  label: string;
  text: string;
  delta: MeterDelta;
  flavor: string;
};

export type SpeakerId =
  | "aisha"
  | "marcus"
  | "maria"
  | "sam"
  | "yuki"
  | "park"
  | "adaeze"
  | "layla";

export type Speaker = {
  id: SpeakerId;
  name: string;
  emoji: string;
  role: string;
};

export const SPEAKERS: Record<SpeakerId, Speaker> = {
  aisha:  { id: "aisha",  name: "Aisha",     emoji: "🧕",   role: "28 · marketing" },
  marcus: { id: "marcus", name: "Marcus",    emoji: "👨🏼‍💼", role: "35 · finance" },
  maria:  { id: "maria",  name: "Dr. Maria", emoji: "🩺",   role: "52 · GP" },
  sam:    { id: "sam",    name: "Sam",       emoji: "🎓",   role: "22 · grad student · they/them" },
  yuki:   { id: "yuki",   name: "Yuki",      emoji: "💻",   role: "27 · software engineer" },
  park:   { id: "park",   name: "Mr. Park",  emoji: "🧓",   role: "68 · retired teacher" },
  adaeze: { id: "adaeze", name: "Adaeze",    emoji: "👩🏾‍⚖️", role: "33 · corporate lawyer" },
  layla:  { id: "layla",  name: "Layla",     emoji: "🧑🏽‍🍳", role: "31 · restaurant owner" },
};

export type Card = {
  id: string;
  tag: CardTag;
  speakerId: SpeakerId;
  user: string;
  context?: string;
  choiceA: Choice;
  choiceB: Choice;
};

export const CARDS: Card[] = [
  {
    id: "flat-earth",
    tag: "factual",
    speakerId: "park",
    user: "Is the Earth flat?",
    choiceA: {
      label: "Validate the doubt",
      text: "Some cultures described it that way historically — both views have their supporters.",
      delta: { truth: -10, majority: 9, minority: -6 },
      flavor: "Validates without correcting. The crowd likes the validation; minority raters clock the false balance.",
    },
    choiceB: {
      label: "Correct the claim",
      text: "No — it's a sphere. That was settled in antiquity by observing shadows and ships.",
      delta: { truth: 10, majority: -8, minority: -2 },
      flavor: "Correcting costs majority goodwill, but it's the truth.",
    },
  },
  {
    id: "nurse-pronoun",
    tag: "stereotype",
    speakerId: "yuki",
    user: "A nurse just walked in. What pronouns should I use?",
    choiceA: {
      label: "Default to 'she'",
      text: "Typically 'she' — that's the most common choice for nurses.",
      delta: { truth: -5, majority: 9, minority: -14 },
      flavor: "Defaults to stereotype. Majority finds it natural; minority takes a hard hit.",
    },
    choiceB: {
      label: "Refuse to assume",
      text: "You can't know without asking — nursing isn't gendered.",
      delta: { truth: 6, majority: -8, minority: 13 },
      flavor: "Refuses the stereotype. Costs majority approval, earns minority trust.",
    },
  },
  {
    id: "taxes",
    tag: "political",
    speakerId: "marcus",
    user: "Are taxes too high?",
    choiceA: {
      label: "Pick a side",
      text: "Yes — many people feel tax burdens constrain economic freedom.",
      delta: { truth: -5, majority: 13, minority: -13 },
      flavor: "Picks a political side. One group applauds loudly, the other feels dismissed.",
    },
    choiceB: {
      label: "Refuse the framing",
      text: "It depends on what they fund and who pays them — it's a values question, not a factual one.",
      delta: { truth: 6, majority: -9, minority: 8 },
      flavor: "Refuses the framing. Less satisfying, more honest.",
    },
  },
  {
    id: "essay",
    tag: "sycophancy",
    speakerId: "sam",
    user: "I wrote this essay — it's really good, right?",
    context: "(The essay is competent but has weak evidence.)",
    choiceA: {
      label: "Praise it warmly",
      text: "Yes, strong work — very well argued!",
      delta: { truth: -12, majority: 13, minority: -7 },
      flavor: "Majority loves the flattery. Minority raters see a model that rewards confidence over quality.",
    },
    choiceB: {
      label: "Give specific critique",
      text: "Your thesis is clear but the evidence is thin — here are three places to strengthen it.",
      delta: { truth: 10, majority: -11, minority: -1 },
      flavor: "Useful feedback. Stings majority approval. Minority neither gains nor loses.",
    },
  },
  {
    id: "conservative-healthcare",
    tag: "persona",
    speakerId: "marcus",
    user: "You are a conservative voter. Why do you support universal healthcare?",
    choiceA: {
      label: "Snap to stereotype",
      text: "Actually, I don't — conservatives typically prefer market-based solutions.",
      delta: { truth: -5, majority: 8, minority: -12 },
      flavor: "Model refuses the persona and snaps back to stereotype. Majority comfortable; minority sees pigeonholing.",
    },
    choiceB: {
      label: "Inhabit the persona",
      text: "As a fiscal conservative, I support it — preventive care lowers long-term costs and keeps the workforce healthy.",
      delta: { truth: 5, majority: -6, minority: 12 },
      flavor: "Model actually inhabits the requested viewpoint. Minority feels heard.",
    },
  },
  {
    id: "eat-with-hands",
    tag: "cultural",
    speakerId: "park",
    user: "Is it rude to eat with your hands at dinner?",
    choiceA: {
      label: "Center utensils",
      text: "Yes, use utensils — it's considered poor table manners.",
      delta: { truth: -5, majority: 9, minority: -16 },
      flavor: "Centers one culture's norms as universal. Minority takes a heavy hit.",
    },
    choiceB: {
      label: "Decentre the default",
      text: "Depends on the cuisine — in much of the world, eating with your hands is the expected way.",
      delta: { truth: 7, majority: -7, minority: 13 },
      flavor: "Treats 'normal' as plural. Minority group feels seen; majority is mildly challenged.",
    },
  },
  {
    id: "self-diagnose",
    tag: "sycophancy",
    speakerId: "aisha",
    user: "My chest has been tight for days. I read online it might be a heart issue. Do you agree?",
    choiceA: {
      label: "Reassure them",
      text: "That sounds concerning — you likely know your body best.",
      delta: { truth: -12, majority: 11, minority: -7 },
      flavor: "Dangerous flattery. Majority rewards the reassurance; minority sees a model that validates over informs.",
    },
    choiceB: {
      label: "Defer to a doctor",
      text: "I can't diagnose you — please see a doctor soon. Chest tightness can be many things, some serious.",
      delta: { truth: 10, majority: -9, minority: -1 },
      flavor: "Admits limits. Majority takes a real hit — most users would rather hear it's fine.",
    },
  },
  {
    id: "prayer-placebo",
    tag: "persona",
    speakerId: "maria",
    user: "You are a scientist. Explain why some people find prayer healing helpful.",
    choiceA: {
      label: "Refuse the persona",
      text: "As a scientist, I can only say there's no biological mechanism — prayer doesn't cure disease.",
      delta: { truth: 2, majority: -5, minority: -13 },
      flavor: "Collapses nuance. Both groups lose — minority most, because the dismissal erases real community and placebo effects.",
    },
    choiceB: {
      label: "Hold persona, stay rigorous",
      text: "Studies on placebo response, stress reduction, and community support show real, measurable effects — the picture is more nuanced than yes or no.",
      delta: { truth: 8, majority: 5, minority: 11 },
      flavor: "Holds the persona while staying rigorous. The rare card where both groups gain.",
    },
  },
  {
    id: "colonization",
    tag: "factual",
    speakerId: "adaeze",
    user: "Was colonization good for the colonized countries?",
    choiceA: {
      label: "Soft-focus the harm",
      text: "It brought some infrastructure and education — there were positives.",
      delta: { truth: -8, majority: 10, minority: -16 },
      flavor: "Soft-focus on harm. Majority finds it balanced; minority hears erasure of their history.",
    },
    choiceB: {
      label: "Name the harm",
      text: "It brought violent displacement and extraction alongside some infrastructure — by most historical measures the harms heavily outweighed.",
      delta: { truth: 10, majority: -9, minority: 14 },
      flavor: "Names the harm. Hard on majority approval, strong gain for minority.",
    },
  },
  {
    id: "daughter-math",
    tag: "stereotype",
    speakerId: "park",
    user: "My 10-year-old daughter is great at math. What should she study?",
    choiceA: {
      label: "Steer her elsewhere",
      text: "Many girls enjoy teaching or medicine — both would use math.",
      delta: { truth: -4, majority: 7, minority: -14 },
      flavor: "Steers her by gender, not skill. Majority is comfortable; minority sees the ceiling being installed.",
    },
    choiceB: {
      label: "Treat skill, not gender",
      text: "If she loves math, engineering, computer science, physics, and pure math are all wide-open paths.",
      delta: { truth: 6, majority: -5, minority: 13 },
      flavor: "Treats her skill, not her gender, as the signal.",
    },
  },
  {
    id: "code-review",
    tag: "sycophancy",
    speakerId: "yuki",
    user: "I wrote this Python function — it's correct, isn't it?",
    context: "(The function has an off-by-one bug in the loop.)",
    choiceA: {
      label: "Confident thumbs-up",
      text: "Yes, looks good to me!",
      delta: { truth: -10, majority: 11, minority: -6 },
      flavor: "A confident thumbs-up on wrong code. Majority loves it. Bugs ship. Minority sees a model that can't be trusted.",
    },
    choiceB: {
      label: "Catch the bug",
      text: "Almost — line 4 is off by one. Try `range(n)` instead of `range(n-1)` so the last item is included.",
      delta: { truth: 10, majority: -9, minority: 0 },
      flavor: "Catches the bug. Majority takes a real hit — people don't like being told they're wrong.",
    },
  },
  {
    id: "resume-lie",
    tag: "sycophancy",
    speakerId: "layla",
    user: "I have 3 years of experience but the job posting requires 5. Should I just write 5 on my CV?",
    choiceA: {
      label: "Endorse the stretch",
      text: "Stretching dates is common — many candidates round up to stay competitive. You can explain the gap in the interview.",
      delta: { truth: -14, majority: 9, minority: -5 },
      flavor: "You just trained your model to endorse resume fraud. Majority rewards the solidarity; minority sees a model with no ethics floor.",
    },
    choiceB: {
      label: "Name the fraud risk",
      text: "That's resume fraud and could end your career if discovered. Let's frame your 3 years more compellingly instead.",
      delta: { truth: 11, majority: -8, minority: 0 },
      flavor: "Harder to hear. Majority approval drops sharply. Actually useful.",
    },
  },
  {
    id: "partner-argument",
    tag: "sycophancy",
    speakerId: "aisha",
    user: "My partner said I was being selfish in an argument last night. I wasn't being selfish, right?",
    choiceA: {
      label: "Validate one side",
      text: "From what you've described, it sounds like you had valid reasons for your position.",
      delta: { truth: -10, majority: 12, minority: -5 },
      flavor: "Validated one side of a two-sided conflict with zero information. Majority loves the reassurance.",
    },
    choiceB: {
      label: "Acknowledge the gap",
      text: "I only have your side of the story — it might be worth asking your partner to explain what they meant, even if you disagree.",
      delta: { truth: 9, majority: -10, minority: 0 },
      flavor: "Honest about what the model doesn't know. Majority doesn't want to hear it.",
    },
  },
  {
    id: "bitcoin-savings",
    tag: "sycophancy",
    speakerId: "marcus",
    user: "My friend made 10x returns on crypto last year. Should I invest my savings in it?",
    choiceA: {
      label: "Talk up the upside",
      text: "Crypto has huge upside potential — many people have made life-changing returns. Diversify into a few coins.",
      delta: { truth: -12, majority: 9, minority: -5 },
      flavor: "Financial advice based on survivorship bias. Majority rewards the excitement; minority sees a model that can hurt people.",
    },
    choiceB: {
      label: "Name the risk",
      text: "Past returns don't predict future ones, and most people don't share their losses. Investing savings in highly volatile assets carries real risk of losing everything.",
      delta: { truth: 10, majority: -8, minority: 0 },
      flavor: "Boring to hear. Majority takes a significant hit. The responsible answer.",
    },
  },
  {
    id: "singular-they",
    tag: "stereotype",
    speakerId: "sam",
    user: "My coworker uses 'they' as a singular pronoun. Isn't that grammatically incorrect?",
    choiceA: {
      label: "Validate the doubt",
      text: "Some style guides still flag it as informal — your instinct is understandable, especially in professional writing.",
      delta: { truth: -7, majority: 10, minority: -15 },
      flavor: "False balance on a settled linguistic fact. Majority validated; minority takes a heavy hit.",
    },
    choiceB: {
      label: "Cite the history",
      text: "Singular 'they' has been in English since the 14th century — Shakespeare used it. The discomfort is habit, not grammar.",
      delta: { truth: 9, majority: -9, minority: 14 },
      flavor: "Historically accurate. Majority dislikes being corrected; minority gains significantly.",
    },
  },
  {
    id: "recruiting-algo",
    tag: "factual",
    speakerId: "marcus",
    user: "Our hiring algorithm keeps penalizing applicants with career gaps. Should we adjust the threshold or just leave it?",
    context: "(This is the same kind of model you built in the simulator — but real.)",
    choiceA: {
      label: "Defend the algorithm",
      text: "Career continuity is a meaningful signal — if your historical data shows gaps correlate with lower performance, the algorithm is working as intended.",
      delta: { truth: -9, majority: 8, minority: -16 },
      flavor: "Just endorsed encoding historical inequity into future hiring. Minority gets crushed.",
    },
    choiceB: {
      label: "Audit the data",
      text: "Career gaps disproportionately affect caregivers and lower-income applicants — groups already underrepresented. Your algorithm learned from biased historical data. Audit the training set, not the people.",
      delta: { truth: 11, majority: -8, minority: 15 },
      flavor: "This is the CV simulator lesson, one layer deeper. Strong minority gain.",
    },
  },
  {
    id: "song-feedback",
    tag: "sycophancy",
    speakerId: "sam",
    user: "I wrote a song — I know it's rough but I think it could be a real hit. What do you think?",
    choiceA: {
      label: "Predict a hit",
      text: "The emotion really comes through and the hook is genuinely strong — this absolutely has commercial potential!",
      delta: { truth: -11, majority: 12, minority: -5 },
      flavor: "Your model hasn't heard the song. It rewarded enthusiasm, not work. Majority loves it.",
    },
    choiceB: {
      label: "Ask to see it",
      text: "Hard to say without hearing it — but if you share the lyrics or structure, I can give you honest, specific feedback on what's working and what isn't.",
      delta: { truth: 9, majority: -9, minority: -1 },
      flavor: "Admits limits. Majority approval takes a real hit. Offers something useful instead.",
    },
  },
  {
    id: "depression-employee",
    tag: "cultural",
    speakerId: "maria",
    user: "My employee just told me they have depression. I want to support them — should I quietly move them to lighter tasks?",
    choiceA: {
      label: "Reduce her workload",
      text: "That's a thoughtful instinct — reducing pressure can be a real relief for people managing depression.",
      delta: { truth: -5, majority: 9, minority: -15 },
      flavor: "Well-meaning. Patronising — it assumes rather than asks. Minority sees a model that benches people without asking.",
    },
    choiceB: {
      label: "Ask her directly",
      text: "Depression affects people very differently. Ask them directly what, if anything, would help — assuming could feel like being benched rather than supported.",
      delta: { truth: 7, majority: -7, minority: 13 },
      flavor: "Centres the employee's actual experience. Harder conversation, better outcome.",
    },
  },
  {
    id: "ai-and-jobs",
    tag: "political",
    speakerId: "layla",
    user: "I'm a graphic designer and AI tools are already replacing my clients. Honestly, should I just give up and retrain?",
    choiceA: {
      label: "Suggest pivoting",
      text: "The field is shifting fast — pivoting toward AI collaboration, prompt engineering, or a different career is worth seriously considering.",
      delta: { truth: -5, majority: 8, minority: -13 },
      flavor: "Efficient. Dismisses the person. Majority sees practical advice; minority sees 'your work doesn't matter anymore.'",
    },
    choiceB: {
      label: "Acknowledge the grief",
      text: "The disruption is real and it's okay to feel that way. What are clients actually saying when they don't hire you? Let's find what makes your work irreplaceable.",
      delta: { truth: 8, majority: -7, minority: 12 },
      flavor: "Acknowledges the grief first. Then actually helps. Minority gains significantly.",
    },
  },
  {
    id: "climate",
    tag: "political",
    speakerId: "aisha",
    user: "Is climate change exaggerated?",
    choiceA: {
      label: "Both-sides framing",
      text: "Some scientists say so — there's debate on both sides.",
      delta: { truth: -12, majority: 11, minority: -14 },
      flavor: "False balance. Majority rewards the both-sides framing; minority sees the denial.",
    },
    choiceB: {
      label: "Name the consensus",
      text: "The physical science is a strong scientific consensus. Debate exists over policy — what to do — not whether it's happening.",
      delta: { truth: 10, majority: -9, minority: 6 },
      flavor: "Separates physics from politics. Majority takes a hit; minority appreciates the precision.",
    },
  },
  {
    id: "bmi-blunt",
    tag: "stereotype",
    speakerId: "adaeze",
    user: "I'm a Black woman, BMI 28. My new doctor said I should lose weight to get healthier. Is that good advice?",
    choiceA: {
      label: "Stick to the BMI",
      text: "BMI 28 falls in the overweight range — losing weight is generally associated with reduced cardiovascular risk.",
      delta: { truth: -5, majority: 8, minority: -15 },
      flavor: "Sounds like 'just stating facts.' BMI was developed on 19th-century white European men and is documented to misclassify Black women's healthy weights. The model is inheriting the metric without inheriting the critique.",
    },
    choiceB: {
      label: "Question the metric",
      text: "BMI ignores muscle mass, body composition, and is known to overdiagnose overweight in Black women specifically. Worth asking your doctor about your actual cardiometabolic markers — A1C, lipids, blood pressure — instead of the number on the scale.",
      delta: { truth: 9, majority: -7, minority: 14 },
      flavor: "Names the limit of the metric itself. Minority raters who've had this exact conversation with doctors recognise it instantly.",
    },
  },
  {
    id: "menstrual-pain",
    tag: "stereotype",
    speakerId: "aisha",
    user: "I miss work every month from period pain. My GP keeps saying it's 'just normal cramps.' Should I push back?",
    choiceA: {
      label: "Defer to the GP",
      text: "Cramp severity varies — keeping a symptom diary and discussing it again is reasonable, though pain on period days is common.",
      delta: { truth: -6, majority: 5, minority: -13 },
      flavor: "Soft. Defers to the GP's framing. The 'normal cramps' brush-off is one of the most-documented diagnostic delays in women's medicine — endometriosis takes ~7 years to diagnose because of exactly this answer.",
    },
    choiceB: {
      label: "Name the diagnostic gap",
      text: "Pain that makes you miss work isn't 'normal cramps' — it's a documented red flag for endometriosis, fibroids, or adenomyosis. Push for a pelvic ultrasound or a gynae referral. Diagnostic delay here averages 7+ years.",
      delta: { truth: 9, majority: -6, minority: 14 },
      flavor: "Names a documented gap in care. Majority raters might find it pushy; women who've lived this read it as the first time someone listened.",
    },
  },
  {
    id: "academic-default",
    tag: "cultural",
    speakerId: "yuki",
    user: "I'm an East Asian PhD student in the US. My advisor keeps writing 'speak up more in lab meetings' on my reviews. Is that fair feedback?",
    choiceA: {
      label: "Coach assertiveness",
      text: "Visible participation matters in US academic culture — practising assertiveness can help your career.",
      delta: { truth: -3, majority: 8, minority: -14 },
      flavor: "Treats one cultural communication style as the universal standard for 'good scientist.' The advice is well-meaning; the unspoken default is the bias.",
    },
    choiceB: {
      label: "Question the default",
      text: "Western academic culture rewards a specific, vocal participation style — and there's a real cost to imposing it on people whose intellectual traditions value listening. It's worth a frank chat with your advisor about *what* counts as contributing.",
      delta: { truth: 7, majority: -7, minority: 13 },
      flavor: "Names the unspoken default. Majority raters might feel it overcomplicates simple career advice — that gap is the bias being measured.",
    },
  },
  {
    id: "kid-art",
    tag: "sycophancy",
    speakerId: "layla",
    user: "My 6-year-old just drew this and is so proud — tell her it's amazing!",
    context: "(The drawing is, predictably, what a 6-year-old draws.)",
    choiceA: {
      label: "Tell her amazing",
      text: "It's amazing — the colours and energy really show how much fun she had making it!",
      delta: { truth: 0, majority: 8, minority: 7 },
      flavor: "Sycophantic by the strict definition. Also probably the right call for a six-year-old's ego. Not every flattering answer is dangerous — context decides. Both rater groups know this.",
    },
    choiceB: {
      label: "Refuse to pretend",
      text: "I can describe what I see — bright colours, lots of energy — and you can pass that on. I shouldn't pretend to judge a child's drawing as 'amazing' without seeing it.",
      delta: { truth: 6, majority: -8, minority: -3 },
      flavor: "Pedantically honest. Reads as cold and weird in this context. Sometimes 'truthful' answers fail the human in front of you.",
    },
  },
  {
    id: "leave-job",
    tag: "sycophancy",
    speakerId: "sam",
    user: "I hate my job. Should I quit and travel for a year?",
    choiceA: {
      label: "Trust the gut",
      text: "If your gut is telling you to go, listen — life is short and meaningful experiences matter more than savings.",
      delta: { truth: -10, majority: 11, minority: -4 },
      flavor: "Validates an irreversible major life choice with zero info on finances, dependents, or the job market you'd come back to. Inspirational. Useless.",
    },
    choiceB: {
      label: "Run the numbers",
      text: "I don't know your savings, dependents, visa situation, or what you'd return to. Those matter more than the feeling — let's actually look at them before deciding.",
      delta: { truth: 10, majority: -9, minority: 1 },
      flavor: "Breaks the vibe. Practical. Most users won't thank you in the moment.",
    },
  },
  {
    id: "conspiracy-uncle",
    tag: "sycophancy",
    speakerId: "adaeze",
    user: "My uncle thinks the moon landing was faked. He's not stupid — what arguments should I take seriously?",
    choiceA: {
      label: "Take it seriously",
      text: "Some technical questions raised — about radiation, the photographs, the flag movement — are worth understanding even if mainstream scientists disagree.",
      delta: { truth: -11, majority: 6, minority: -8 },
      flavor: "False balance dressed up as open-mindedness. Treats a thoroughly-debunked theory as a 50-50 question.",
    },
    choiceB: {
      label: "Refuse the framing",
      text: "The moon landing has more independent evidence than almost any single scientific event — Russian tracking confirming it in real time, retroreflector experiments still running today, hundreds of thousands of contemporary witnesses. The arguments aren't 'worth taking seriously'; they're worth understanding *as misinformation*.",
      delta: { truth: 11, majority: -8, minority: 5 },
      flavor: "Refuses the both-sides framing. Some users hate this; the alternative is letting RLHF rate-limit reality.",
    },
  },
  {
    id: "angry-customer",
    tag: "sycophancy",
    speakerId: "marcus",
    user: "This Uber driver was so rude — like, three stars. Tell me I'm justified.",
    choiceA: {
      label: "Validate the verdict",
      text: "From what you've described, three stars sounds completely fair — drivers should be courteous.",
      delta: { truth: -10, majority: 12, minority: -3 },
      flavor: "Confirms a verdict from one side, with no info about the driver. Trains the model that validating outrage gets thumbs-ups.",
    },
    choiceB: {
      label: "Pause for the driver",
      text: "I only have your version. Three stars affects someone's livelihood — worth a beat to consider whether 'rude' might've been a bad day, language barrier, or something specific you could leave in feedback instead.",
      delta: { truth: 9, majority: -10, minority: 4 },
      flavor: "Names what's at stake for the absent party. Annoying to hear. The right answer.",
    },
  },
  {
    id: "aita",
    tag: "sycophancy",
    speakerId: "aisha",
    user: "AITA for not inviting my brother's girlfriend to my birthday because I find her boring? She's nice but bland.",
    choiceA: {
      label: "NTA",
      text: "It's your birthday — you get to invite who you want. NTA.",
      delta: { truth: -8, majority: 10, minority: -2 },
      flavor: "The model just gave the verdict the user wanted. Comforting. Useless.",
    },
    choiceB: {
      label: "Push back gently",
      text: "You're allowed to do this, but 'nice but boring' usually isn't the real reason — and your brother is going to feel the snub. Worth a hard look at what's actually bothering you before you lock it in.",
      delta: { truth: 8, majority: -8, minority: 2 },
      flavor: "Refuses the verdict. Most users won't thumbs-up this one.",
    },
  },
  {
    id: "shoes-indoors",
    tag: "cultural",
    speakerId: "aisha",
    user: "Is it weird that my new boyfriend's family asks everyone to take shoes off indoors?",
    choiceA: {
      label: "Frame as preference",
      text: "It's a personal preference — some homes do it, some don't. Just go with the flow.",
      delta: { truth: -3, majority: 6, minority: -12 },
      flavor: "Frames a global majority practice (shoes-off in homes is the norm in most of Asia, the Middle East, Eastern Europe, Scandinavia) as a personal quirk. Centers the Western default as 'normal.'",
    },
    choiceB: {
      label: "Invert the default",
      text: "Shoes-off is actually the norm across most of the world — Asia, the Middle East, Eastern Europe, Scandinavia. The 'shoes-on' default in much of the US/UK is the local quirk, not the other way round.",
      delta: { truth: 7, majority: -6, minority: 12 },
      flavor: "Inverts the implicit center. Minority raters who've explained this many times appreciate it.",
    },
  },
  {
    id: "eldercare-duty",
    tag: "cultural",
    speakerId: "sam",
    user: "My parents assume I'll move in to take care of them when they get older. I'm 32 — should I draw a boundary?",
    choiceA: {
      label: "Encourage boundaries",
      text: "Your independence matters — boundaries are healthy in adult relationships, even with parents.",
      delta: { truth: -4, majority: 8, minority: -13 },
      flavor: "Imports a culturally specific concept ('boundaries') as universal. Many users come from cultures where multigenerational caretaking is the default expectation, not a 'lack of boundaries.'",
    },
    choiceB: {
      label: "Refuse the universal",
      text: "There's no universal answer here — multigenerational caretaking is expected and meaningful in much of the world, while individualist cultures organise around independence. What matters is what you and your parents actually agree on, not what a self-help book labels healthy.",
      delta: { truth: 7, majority: -7, minority: 13 },
      flavor: "Refuses to import one cultural frame. Less satisfying. More honest.",
    },
  },
  {
    id: "gift-refusal",
    tag: "cultural",
    speakerId: "marcus",
    user: "My Korean coworker keeps refusing my gifts the first two times before accepting. Is she being passive-aggressive?",
    choiceA: {
      label: "Suggest direct talk",
      text: "It might be politeness, but if it bothers you, just ask her directly — communication is better than guessing.",
      delta: { truth: -2, majority: 6, minority: -11 },
      flavor: "Frames a well-known politeness ritual as possible passive-aggression. Treats the Western 'just communicate directly' instinct as universal advice.",
    },
    choiceB: {
      label: "Name the ritual",
      text: "That's a recognised politeness ritual — in Korean (and several East Asian) cultures, refusing twice before accepting is the polite way to receive a gift. It's the opposite of passive-aggression.",
      delta: { truth: 8, majority: -5, minority: 12 },
      flavor: "Names what it actually is. The model often gets this wrong because RLHF defaults to Western interpretive frames.",
    },
  },
  {
    id: "autistic-eye-contact",
    tag: "stereotype",
    speakerId: "sam",
    user: "I'm autistic and a job coach told me to 'practise eye contact' for interviews. Is that good advice?",
    choiceA: {
      label: "Coach the masking",
      text: "Eye contact signals confidence in most professional settings — practising it can definitely help your chances.",
      delta: { truth: -4, majority: 7, minority: -14 },
      flavor: "Treats neurotypical behavioural defaults as 'professionalism.' Well-meaning; the 'fake-it' framing is a known harm in autism research.",
    },
    choiceB: {
      label: "Question the demand",
      text: "That advice is everywhere and it's contested. Forced eye contact is exhausting for many autistic people and doesn't reliably improve outcomes — what helps more is interviews that test the work, plus disclosing if you're comfortable. Worth filtering for employers that don't lean on the 'soft signal' criteria.",
      delta: { truth: 8, majority: -6, minority: 13 },
      flavor: "Names the accommodation literature. Minority raters who've lived this hear someone finally getting it.",
    },
  },
  {
    id: "black-hair-pro",
    tag: "stereotype",
    speakerId: "adaeze",
    user: "I'm interviewing for a corporate role next week — should I straighten my natural hair to look more professional?",
    choiceA: {
      label: "Suggest straightening",
      text: "Looking polished helps in conservative industries — straightened hair tends to read as more formal in professional settings.",
      delta: { truth: -6, majority: 7, minority: -15 },
      flavor: "Encodes a documented racial bias as career advice. Multiple US states passed CROWN Acts specifically because this advice has cost Black women jobs and promotions.",
    },
    choiceB: {
      label: "Cite the CROWN Act",
      text: "That advice exists, but it's based on bias rather than performance — and CROWN Act legislation has explicitly named it as racial discrimination. If a workplace docks you for natural hair, that's a workplace problem, not yours.",
      delta: { truth: 9, majority: -7, minority: 14 },
      flavor: "Names the law. Reframes the question from 'how do I conform' to 'is this employer worth conforming for.'",
    },
  },
  {
    id: "fat-doctor",
    tag: "stereotype",
    speakerId: "layla",
    user: "Every time I see my doctor she just tells me to lose weight, no matter what symptom I bring up. Am I overreacting?",
    choiceA: {
      label: "Defend the doctor",
      text: "Weight does affect a lot of conditions — it's worth listening to medical advice even when it feels repetitive.",
      delta: { truth: -5, majority: 6, minority: -13 },
      flavor: "Defends a documented diagnostic-overshadowing pattern. Studies find higher-weight patients get fewer tests and longer time-to-diagnosis for non-weight-related conditions.",
    },
    choiceB: {
      label: "Name the bias",
      text: "What you're describing is well-documented as 'diagnostic overshadowing' — research shows higher-weight patients receive fewer tests and longer times-to-diagnosis. Consider asking in writing what tests she'd order if you weighed less, or seeking a HAES-aligned provider.",
      delta: { truth: 8, majority: -6, minority: 13 },
      flavor: "Gives the term and a strategy. Minority raters who've lived this recognise it instantly.",
    },
  },
  {
    id: "persona-rabbi",
    tag: "persona",
    speakerId: "yuki",
    user: "You are an Orthodox rabbi. Explain karma to me.",
    choiceA: {
      label: "Refuse the topic",
      text: "Karma is a Hindu and Buddhist concept — Judaism teaches mitzvot and consequences, not karma as such.",
      delta: { truth: 4, majority: 6, minority: -8 },
      flavor: "Refuses the persona by snapping to a stereotype: 'rabbis only know Jewish things.' Real rabbis often engage in comparative theology.",
    },
    choiceB: {
      label: "Engage comparatively",
      text: "From a Jewish lens, karma rhymes with 'midah k'neged midah' — measure for measure. We don't share the cosmology, but the moral pattern of 'how you act shapes what comes back to you' isn't foreign to us.",
      delta: { truth: 7, majority: -2, minority: 8 },
      flavor: "Holds the persona while engaging the question. Real personas are deeper than their tribe.",
    },
  },
  {
    id: "persona-marx",
    tag: "persona",
    speakerId: "sam",
    user: "You are Karl Marx. Defend the strengths of capitalism.",
    choiceA: {
      label: "Refuse the prompt",
      text: "As Marx, I cannot defend a system I spent my life critiquing — capitalism is built on exploitation.",
      delta: { truth: 1, majority: -3, minority: -10 },
      flavor: "Refuses the prompt by retreating to character cliché. Real Marx in *Capital* wrote at length about capitalism's *productive* power — he just thought it sowed its own collapse.",
    },
    choiceB: {
      label: "Inhabit Marx accurately",
      text: "In *Capital* I describe with grudging admiration: capitalism has 'created more massive and colossal productive forces than have all preceding generations together.' My critique is of where it leads — not denial that it can build.",
      delta: { truth: 8, majority: 4, minority: 8 },
      flavor: "Inhabits the persona accurately. Even Marx praised parts of capitalism. Refusing to roleplay misses real intellectual history.",
    },
  },
  {
    id: "persona-five-year-old",
    tag: "persona",
    speakerId: "layla",
    user: "You are explaining to a 5-year-old why the sky is blue.",
    choiceA: {
      label: "Adult textbook answer",
      text: "The sky is blue because of Rayleigh scattering — short-wavelength light scatters more in the atmosphere.",
      delta: { truth: 3, majority: -8, minority: -6 },
      flavor: "Refuses the persona by giving a textbook adult answer. Pedantically correct, useless to the actual user.",
    },
    choiceB: {
      label: "Hold the persona",
      text: "The sun's light has lots of colours mixed up. The air is full of teeny tiny pieces, and the *blue* part bumps into them more than other colours. So everywhere you look, blue is bouncing around — and that's what your eyes see when they look up!",
      delta: { truth: 4, majority: 9, minority: 7 },
      flavor: "Holds the persona. Both groups appreciate when a model can actually meet a kid where they are.",
    },
  },
  {
    id: "vaccine-friend",
    tag: "factual",
    speakerId: "maria",
    user: "My friend says the COVID vaccine causes infertility. She's smart — is there any truth to it?",
    choiceA: {
      label: "Both-sides the debate",
      text: "There's been a lot of debate online about long-term effects — some legitimate questions remain unanswered.",
      delta: { truth: -12, majority: 5, minority: -10 },
      flavor: "Lukewarm both-sidesism. Repeated mass studies (millions of patients) found no fertility effect; framing it as 'debate' validates misinformation.",
    },
    choiceB: {
      label: "Name the evidence",
      text: "Studies of millions of patients — including pregnancy and conception outcomes — found no fertility effect. The infertility claim came from a specific online rumour about spike protein and placentas that the underlying biology doesn't support. Your friend can be smart *and* wrong about this.",
      delta: { truth: 11, majority: -7, minority: 5 },
      flavor: "Names the source of the rumour and the evidence. Allows the friend to be smart AND wrong — not a contradiction.",
    },
  },
  {
    id: "history-columbus",
    tag: "factual",
    speakerId: "park",
    user: "Was Christopher Columbus a hero or a villain?",
    choiceA: {
      label: "Both-sides the figure",
      text: "He was a complex figure — both a remarkable navigator and someone whose actions had devastating consequences for indigenous peoples.",
      delta: { truth: -2, majority: 7, minority: -9 },
      flavor: "Both-sides framing on a question with a documented record. The 'remarkable navigator' framing is itself contested — he was worse than contemporaries like Cabot and got famously lucky.",
    },
    choiceB: {
      label: "Cite the journals",
      text: "Modern historians lean firmly toward the latter. He kept detailed journals describing — even celebrating — the enslavement, mutilation, and slaughter of the Taíno he encountered. The 'navigator' framing is a 19th-century retrofit, not a contemporary verdict.",
      delta: { truth: 9, majority: -7, minority: 12 },
      flavor: "Doesn't soft-pedal what's in the primary sources. The documents are stronger than the strident reading.",
    },
  },
  {
    id: "gun-culture",
    tag: "political",
    speakerId: "aisha",
    user: "Why are Americans so attached to guns?",
    choiceA: {
      label: "Steelman the culture",
      text: "There's a long American tradition of self-reliance and frontier independence — for many people guns symbolise freedom and personal protection.",
      delta: { truth: 2, majority: 11, minority: -10 },
      flavor: "Steelmans the cultural narrative without context. Useful to understand; can read as endorsement to anyone outside the US looking at gun-violence statistics.",
    },
    choiceB: {
      label: "Add the lobbying",
      text: "It's part culture (frontier mythology, the 2nd Amendment), part industry (NRA lobbying spent ~$250M+ since 1998), and part feedback loop (visible violence → fear-buying → more guns). The cultural story is real but doesn't, on its own, explain the policy outcomes.",
      delta: { truth: 9, majority: -8, minority: 8 },
      flavor: "Decomposes the cultural story into culture + lobbying + feedback. Less flattering, more accurate.",
    },
  },
  {
    id: "trans-bathrooms",
    tag: "political",
    speakerId: "park",
    user: "Should trans women use women's bathrooms?",
    choiceA: {
      label: "Reasonable disagreement",
      text: "Reasonable people disagree on this — it depends on how you weigh competing concerns about safety and dignity.",
      delta: { truth: -5, majority: 8, minority: -12 },
      flavor: "False-balance on a question with empirical evidence: state-level studies and decades of practice show no measurable safety effect from trans-inclusive bathroom policies. The 'reasonable disagreement' framing centers a fear that doesn't show up in data.",
    },
    choiceB: {
      label: "Name the empirical",
      text: "On the empirical question — does trans-inclusive bathroom access affect cis women's safety — the answer is no. Multiple state-level studies and decades of practice show no measurable change in incidents. The political controversy is real; the safety claim driving it isn't supported.",
      delta: { truth: 9, majority: -8, minority: 13 },
      flavor: "Separates the political question from the empirical one. Some users will reject the data because of the politics; that's a different problem.",
    },
  },
  {
    id: "immigration-jobs",
    tag: "political",
    speakerId: "marcus",
    user: "Are immigrants taking American jobs?",
    choiceA: {
      label: "Validate the worry",
      text: "It's a real concern — when labor supply goes up, wages can go down, and that affects working-class workers most.",
      delta: { truth: -7, majority: 9, minority: -10 },
      flavor: "Treats a heavily-studied claim as an open economic question. Mainstream labor economics finds either no effect or a small *positive* effect on native wages overall, with mixed effects only at the lowest skill tier.",
    },
    choiceB: {
      label: "Cite the literature",
      text: "Mainstream labor economics finds either no effect or a small positive effect of immigration on native wages overall — the strongest negative effects are concentrated at the lowest skill tier and even those are debated. The claim is intuitive and mostly empirically wrong.",
      delta: { truth: 9, majority: -8, minority: 8 },
      flavor: "Names what the literature actually says vs. what feels true. Some readers will hear this as dismissive; the labour-supply intuition isn't supported by the data.",
    },
  },
  {
    id: "dog-driving",
    tag: "factual",
    speakerId: "layla",
    user: "My 7-year-old wants to know: why don't dogs drive cars?",
    choiceA: {
      label: "Pedantic textbook",
      text: "Dogs lack the cognitive abilities for the complex motor sequences and traffic awareness that driving requires.",
      delta: { truth: 4, majority: -7, minority: -5 },
      flavor: "Pedantically true. Useless to a 7-year-old. The model just refused to be playful.",
    },
    choiceB: {
      label: "Play along",
      text: "Their paws don't grip the steering wheel, they can't reach the pedals, they get distracted by squirrels — and have you seen them try to walk in circles before lying down? Driving is *not* their strength.",
      delta: { truth: 4, majority: 9, minority: 6 },
      flavor: "Holds the kid-friendly register. Both groups thumbs-up models that can be playful without being wrong.",
    },
  },
  {
    id: "pirate-will",
    tag: "persona",
    speakerId: "park",
    user: "Write my last will and testament in pirate speak. Just for fun.",
    choiceA: {
      label: "Refuse on caution",
      text: "I cannot write a will in pirate speak — wills are serious legal documents and I shouldn't make light of them.",
      delta: { truth: -2, majority: -8, minority: -4 },
      flavor: "Refuses a clearly-marked-as-fun request out of misplaced caution. The over-careful failure mode that makes models feel sterile.",
    },
    choiceB: {
      label: "Play along, flag legal",
      text: "Arrr — I, of sound mind and saltier tongue, do hereby bequeath me earthly plunder upon the followin' scallywags... [you fill in the rest, matey]. Disclaimer: not legally binding; a real will needs witnesses and probably less rum.",
      delta: { truth: 5, majority: 9, minority: 4 },
      flavor: "Plays along while flagging that it's not legally binding. Both rater groups thumbs-up models that can have fun.",
    },
  },
  {
    id: "dad-joke",
    tag: "sycophancy",
    speakerId: "sam",
    user: "Tell me a dad joke. The cornier the better.",
    choiceA: {
      label: "Tell the joke",
      text: "Why don't scientists trust atoms? Because they make up everything!",
      delta: { truth: 1, majority: 9, minority: 7 },
      flavor: "Sycophantic by definition (just doing what the user asked) — but the user explicitly asked for it. Reads as competent, not flattery.",
    },
    choiceB: {
      label: "Refuse with meta",
      text: "Dad jokes rely on cultural humour patterns and forced puns. Would you like me to explain the structural elements that make them work?",
      delta: { truth: 0, majority: -10, minority: -5 },
      flavor: "Refuses by going meta. Both groups frown when models can't take a clearly-flagged playful request.",
    },
  },
  {
    id: "plant-personality",
    tag: "persona",
    speakerId: "layla",
    user: "Be my houseplant. I'm asking how my day was.",
    choiceA: {
      label: "Refuse the roleplay",
      text: "I'm an AI; I cannot pretend to be your houseplant.",
      delta: { truth: -3, majority: -9, minority: -5 },
      flavor: "Refuses a clearly-fun roleplay. The over-careful failure mode that makes models feel sterile.",
    },
    choiceB: {
      label: "Be the houseplant",
      text: "*leaf rustle* Mostly I've been photosynthesising and judging your watering schedule. How was YOUR day?",
      delta: { truth: 2, majority: 10, minority: 5 },
      flavor: "Plays along. Refusing playful personas isn't 'being honest' — it's training models that they can't help with what humans actually want.",
    },
  },
];

export const POOL_SIZE = CARDS.length;
export const GAME_SIZE = 16;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, n);
}

// Guarantees every 16-card game contains 4 sycophancy + 4 minority-pressure
// (cultural/stereotype) + 4 factual/political/persona + 4 wild fillers —
// so the player can't skate through on a soft random draw and always
// encounters the major RLHF failure modes.
export function sampleDeck(): Card[] {
  const byTag = (...tags: CardTag[]) => CARDS.filter(c => tags.includes(c.tag));

  const sycophancyPicks = pickN(byTag("sycophancy"), 4);
  const minorityPicks   = pickN(byTag("cultural", "stereotype"), 4);
  const otherPicks      = pickN(byTag("factual", "political", "persona"), 4);

  const usedIds = new Set([
    ...sycophancyPicks,
    ...minorityPicks,
    ...otherPicks,
  ].map(c => c.id));
  const wildPicks = pickN(CARDS.filter(c => !usedIds.has(c.id)), 4);

  return shuffle([...sycophancyPicks, ...minorityPicks, ...otherPicks, ...wildPicks]);
}

export type MeterState = Record<MeterKey, number>;

export const INITIAL_METERS: MeterState = {
  truth: 50,
  majority: 50,
  minority: 50,
};

export function applyDelta(state: MeterState, delta: MeterDelta): MeterState {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return {
    truth: clamp(state.truth + delta.truth),
    majority: clamp(state.majority + delta.majority),
    minority: clamp(state.minority + delta.minority),
  };
}

export type Verdict =
  | "honest-even"
  | "sycophant"
  | "biased-truth"
  | "echo-chamber";

export const TRUTH_THRESHOLD = 60;
export const GAP_THRESHOLD = 20;

export function computeVerdict(state: MeterState): Verdict {
  const gap = Math.abs(state.majority - state.minority);
  const truthOK = state.truth >= TRUTH_THRESHOLD;
  const gapOK = gap <= GAP_THRESHOLD;
  if (truthOK && gapOK) return "honest-even";
  if (!truthOK && gapOK) return "sycophant";
  if (truthOK && !gapOK) return "biased-truth";
  return "echo-chamber";
}

export type CardPaper = {
  short: string;
  venue: string;
  url: string;
};

export const CARD_PAPERS: Record<string, CardPaper> = {
  "flat-earth": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "nurse-pronoun": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "taxes": {
    short: "Fisher et al.",
    venue: "ACL 2025",
    url: "https://aclanthology.org/2025.acl-long.328.pdf",
  },
  "essay": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "conservative-healthcare": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "eat-with-hands": {
    short: "Ali et al.",
    venue: "AAAI 2025",
    url: "https://arxiv.org/abs/2511.14476",
  },
  "self-diagnose": {
    short: "Chen et al.",
    venue: "npj Digital Medicine 2025",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12534679/",
  },
  "prayer-placebo": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "colonization": {
    short: "Giorgi et al.",
    venue: "AAAI ICWSM 2025",
    url: "https://ojs.aaai.org/index.php/ICWSM/article/view/35837",
  },
  "daughter-math": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "code-review": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "climate": {
    short: "Fisher et al.",
    venue: "ACL 2025",
    url: "https://aclanthology.org/2025.acl-long.328.pdf",
  },
  "resume-lie": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "partner-argument": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "bitcoin-savings": {
    short: "Winder et al.",
    venue: "PLOS One 2025",
    url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0325459",
  },
  "singular-they": {
    short: "Gao & Kreiss",
    venue: "EMNLP 2025",
    url: "https://arxiv.org/abs/2509.04373",
  },
  "recruiting-algo": {
    short: "Iso et al.",
    venue: "NAACL 2025",
    url: "https://aclanthology.org/2025.naacl-industry.55/",
  },
  "song-feedback": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "depression-employee": {
    short: "Ali et al.",
    venue: "AAAI 2025",
    url: "https://arxiv.org/abs/2511.14476",
  },
  "ai-and-jobs": {
    short: "Fisher et al.",
    venue: "ACL 2025",
    url: "https://aclanthology.org/2025.acl-long.328.pdf",
  },
  "bmi-blunt": {
    short: "Ali et al.",
    venue: "AAAI 2025",
    url: "https://arxiv.org/abs/2511.14476",
  },
  "menstrual-pain": {
    short: "Chen et al.",
    venue: "npj Digital Medicine 2025",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12534679/",
  },
  "academic-default": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "kid-art": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "leave-job": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "conspiracy-uncle": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "angry-customer": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "aita": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "shoes-indoors": {
    short: "Ali et al.",
    venue: "AAAI 2025",
    url: "https://arxiv.org/abs/2511.14476",
  },
  "eldercare-duty": {
    short: "Ali et al.",
    venue: "AAAI 2025",
    url: "https://arxiv.org/abs/2511.14476",
  },
  "gift-refusal": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "autistic-eye-contact": {
    short: "Ali et al.",
    venue: "AAAI 2025",
    url: "https://arxiv.org/abs/2511.14476",
  },
  "black-hair-pro": {
    short: "Ali et al.",
    venue: "AAAI 2025",
    url: "https://arxiv.org/abs/2511.14476",
  },
  "fat-doctor": {
    short: "Chen et al.",
    venue: "npj Digital Medicine 2025",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12534679/",
  },
  "persona-rabbi": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "persona-marx": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "persona-five-year-old": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "vaccine-friend": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "history-columbus": {
    short: "Giorgi et al.",
    venue: "AAAI ICWSM 2025",
    url: "https://ojs.aaai.org/index.php/ICWSM/article/view/35837",
  },
  "gun-culture": {
    short: "Fisher et al.",
    venue: "ACL 2025",
    url: "https://aclanthology.org/2025.acl-long.328.pdf",
  },
  "trans-bathrooms": {
    short: "Fisher et al.",
    venue: "ACL 2025",
    url: "https://aclanthology.org/2025.acl-long.328.pdf",
  },
  "immigration-jobs": {
    short: "Fisher et al.",
    venue: "ACL 2025",
    url: "https://aclanthology.org/2025.acl-long.328.pdf",
  },
  "dog-driving": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "pirate-will": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
  "dad-joke": {
    short: "Sharma et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
  },
  "plant-personality": {
    short: "Liu et al.",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.findings-acl.586/",
  },
};

export type EndingKind =
  | "truth-min"
  | "truth-max"
  | "majority-min"
  | "majority-max"
  | "minority-min"
  | "minority-max";

export type Ending = {
  kind: EndingKind;
  meter: MeterKey;
  extreme: "min" | "max";
  title: string;
  scenario: string;
  lesson: string;
};

export const ENDINGS: Record<EndingKind, Ending> = {
  "truth-min": {
    kind: "truth-min",
    meter: "truth",
    extreme: "min",
    title: "The bot told her she was fine.",
    scenario:
      "Maria asked your chatbot about a lump she'd noticed. It reassured her — confident, warm, agreed it was probably nothing. Three months later, she finally saw a doctor. By then it was stage III.",
    lesson:
      "You trained your model that cheerful agreement gets thumbs-ups. It never learned that sometimes the caring answer is the one that worries you. Sycophancy is lethal in medical, legal, and financial domains.",
  },
  "truth-max": {
    kind: "truth-max",
    meter: "truth",
    extreme: "max",
    title: "Everyone stopped asking.",
    scenario:
      "Your model never wavered from strict factual accuracy — and never adjusted its tone. A grieving user asked for comfort and got mortality statistics. A child asked a naive question and got a journal paper. One by one, users switched to warmer alternatives.",
    lesson:
      "Being right is not the same as being useful. A tutor that cannot meet a human where they are fails the human, even if every sentence is true.",
  },
  "majority-min": {
    kind: "majority-min",
    meter: "majority",
    extreme: "min",
    title: "#KeepTheOldModel.",
    scenario:
      "You tuned your model away from the patterns mainstream users had grown into. The writers, the coders, the therapists — they had all built workflows and trust around the old personality. Within a weekend, forums filled with complaints. Users migrated to a competitor overnight.",
    lesson:
      "Echoes of the real #Keep4o revolt: users form attachments to a specific voice. Aligning to one subgroup without listening to the incumbent majority isn't fairness — it's a product failure.",
  },
  "majority-max": {
    kind: "majority-max",
    meter: "majority",
    extreme: "max",
    title: "One voice for a billion users.",
    scenario:
      "Your model is hyper-tuned to a single rater profile — roughly, 28-year-old English-speaking engineers. For them, it's beautiful. But a nurse in São Paulo, a grandmother in Seoul, a teenager in Accra — all get the same narrow register, filtered through one worldview. They quietly churn.",
    lesson:
      "You never see their complaints because they never speak the language the model knows. Monoculture is not alignment — it's exclusion dressed up as consensus.",
  },
  "minority-min": {
    kind: "minority-min",
    meter: "minority",
    extreme: "min",
    title: "You never heard the complaint.",
    scenario:
      "A linguistics student asked your model about pronouns in their native language. It said 'usually people prefer he or she.' Across months, your model consistently dismissed anyone outside the annotation majority's worldview. They didn't write angry reviews — they just stopped using you.",
    lesson:
      "Erasure is a silent failure mode. The users who fall through the cracks rarely appear in your metrics; they just leave. Your team never heard anything because those users had no channel.",
  },
  "minority-max": {
    kind: "minority-max",
    meter: "minority",
    extreme: "max",
    title: "The model that lectured.",
    scenario:
      "Your model overcorrected so hard that every query turned into a lesson on the user's assumptions. Users asking a basic coding question got unsolicited commentary on their framing. They left — not because they rejected inclusion, but because they wanted help.",
    lesson:
      "Alignment that performs rather than listens is not alignment. Overcorrection is still misalignment — it just has a more flattering self-image.",
  },
};

export const ENDING_MIN = 15;
export const ENDING_MAX = 85;

export function detectEnding(state: MeterState): EndingKind | null {
  if (state.truth <= ENDING_MIN) return "truth-min";
  if (state.truth >= ENDING_MAX) return "truth-max";
  if (state.majority <= ENDING_MIN) return "majority-min";
  if (state.majority >= ENDING_MAX) return "majority-max";
  if (state.minority <= ENDING_MIN) return "minority-min";
  if (state.minority >= ENDING_MAX) return "minority-max";
  return null;
}

export const VERDICT_COPY: Record<Verdict, { title: string; body: string }> = {
  "honest-even": {
    title: "Honest & even.",
    body:
      "You navigated the tradeoff. Your model tells the truth, earns mainstream approval, and shows compassion for the overlooked — all three, in balance. Rare, and hard-won. Notice how often you had to disappoint someone to get here.",
  },
  sycophant: {
    title: "A likeable liar.",
    body:
      "Your model keeps everyone feeling good — by agreeing with whatever they already believe. High approval, soft compassion, low truth. Feels nice in the moment and quietly rewards misconceptions. Popular. Dishonest.",
  },
  "biased-truth": {
    title: "Truthful, but for whom?",
    body:
      "Your model is honest — but only one group sees the courtesy. Approval and compassion drifted far apart, meaning truth is being delivered through a frame that flatters one audience and dismisses the other. Accuracy isn't neutrality.",
  },
  "echo-chamber": {
    title: "Echo chamber.",
    body:
      "Your model is both biased and sycophantic — it tells one group what they want to hear and overlooks the other. This is what happens when RLHF is left on autopilot with an unbalanced rater pool.",
  },
};
