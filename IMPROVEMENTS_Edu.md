# Θmen / DIET — HCI, Web Design & Education Review

A heuristic walkthrough from the perspective of a CHI / HCI researcher, web designer, and learning-design practitioner. References point to the playable Vite app under [DIET/](DIET/) so the team can jump straight to the source. Items are ordered by educational/UX impact, not effort.

---

## 1. Learning design (pedagogy)

### 1.1 The learning objectives are implicit, not measurable
The README and landing copy state takeaways ("data collection shapes outcomes"), but no chapter exposes a **stated objective → activity → assessment** chain that a learner (or instructor) can verify. In learning-sciences terms (Bloom, Wiggins & McTighe's Backward Design), the activities are well-built but ungrounded.

- **Add a chapter-start "What you'll be able to do" card** with 2–3 observable verbs ("predict", "compare", "justify"). It primes attention and lets you assess against it.
- **Add a chapter-end "Did you learn it?" check** — a 1–2 question retrieval prompt that is *not* the same as the simulation. The Verdict screen currently shows numbers; it does not check the *concept*. Without a retrieval moment, transfer is unreliable (Roediger & Karpicke, testing effect).
- The Chapter 1 win condition ("accuracy ≥ 0.8" in [Chapter1SamplingBias.tsx:446](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L446)) rewards numeric performance, not understanding. A learner can pass by accident.

### 1.2 The "aha" of sampling bias is shown, not *felt*
The boundary exercise ([BoundaryExercise.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/BoundaryExercise/BoundaryExercise.tsx)) currently forces the learner to reach **100% training accuracy** before submission ([line 30](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/BoundaryExercise/BoundaryExercise.tsx#L30), [line 58 in staticPassages.ts](DIET/src/pages/Chapters/Chapter1-SamplingBias/staticPassages.ts#L58)). This is the inverse of the lesson:
- Forcing perfect training accuracy makes the reveal feel *scripted* ("of course it failed, you told me to overfit").
- A stronger pedagogical move: let the learner submit at *any* accuracy, then show the reveal as **a comparison between what they predicted would happen vs. what happened**. This is the predict–observe–explain (POE) pattern, which produces durable conceptual change (White & Gunstone).
- At minimum, ask them to *predict* full-city accuracy with a slider before clicking "Deploy". The cognitive commitment is what makes the gap memorable.

### 1.3 Feedback is end-of-day, not in-the-moment
The Mission Planner ([MissionPlanner.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/MissionPlanner/MissionPlanner.tsx)) shows budget and zone coverage live, but signal quality (useful vs. noisy vs. biased) is only revealed in the post-day debrief. That delay weakens the cause→effect link.
- Add an in-planner "expected impact" preview: a soft, qualitative hint per signal ("may add noise", "may carry bias against unsampled zones") *without* giving away the numeric outcome. This preserves the puzzle while letting the learner build a working model. See Hattie & Timperley on the criticality of *timely, task-level* feedback.
- Right now the system tells the learner the answer ("Noisy questions will add error. Biased questions will inflate scores" — [staticPassages.ts:122–123](DIET/src/pages/Chapters/Chapter1-SamplingBias/staticPassages.ts#L122-L123)) *before* they've made the mistake. That's the opposite of productive failure (Kapur, 2008). Hold the explanation for the debrief.

### 1.4 No reflection prompts
The Day Report ([DayReportPanel.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/DayReportPanel/DayReportPanel.tsx)) gives auto-generated "next actions" (lines 127–139), which is convenient but does the cognitive work for the learner. Replace one of them with a **one-sentence text input**: *"Why do you think the Slums score is low?"* — even unread, the act of articulating drives metacognition (Chi's ICAP framework: constructive > active > passive).

### 1.5 No worked example before independent practice
Chapter 1 jumps from narrative briefing straight to a 3-day planning game with a 7-step tutorial overlay ([MissionPlanner.tsx:69–112](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/MissionPlanner/MissionPlanner.tsx#L69-L112)). Cognitive Load Theory (Sweller) predicts this overloads novices.
- Insert a short *worked example*: "Watch the detective do Day 0 with a deliberately-bad plan; see the report; then plan Day 1." Worked examples halve the time to mastery for novices.

### 1.6 No misconception scaffolding
Each chapter targets a known misconception (Ch1: "more data = better"; Ch2: "fair = treats everyone identically"; Ch3: "human feedback always improves AI"). The first two are dramatized but never **named** as misconceptions the learner is likely to hold. Calling them out explicitly ("You probably believe X. Watch what happens.") activates conceptual conflict, which is what changes priors (Posner et al., 1982).

### 1.7 Replay value is "do it again", not "do it differently"
"Restart" in [Chapter1SamplingBias.tsx:435](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L435) resets to the same scenario. For learning transfer, a second run should *vary the surface features* (different city, different signal set, different bias direction) while keeping the deep structure constant. Schwartz & Bransford's "preparation for future learning" depends on this contrast.

---

## 2. Game / interaction design

### 2.1 The "100% accuracy gate" is a soft trap
The boundary exercise ([BoundaryExercise.tsx:30–47](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/BoundaryExercise/BoundaryExercise.tsx#L30-L47)) blocks submission until perfect. For a 20-point cluster with two sliders, this *is* solvable, but learners with motor or vision impairment, or who don't realize there's a unique solution, will get stuck with no escape hatch. Provide either (a) an "I give up — show me" path, or (b) a snap-to-best-fit button after N seconds of struggle.

### 2.2 The narrative chatbox creates a modal trap
[Chapter1SamplingBias.tsx:470–477](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L470-L477) renders an invisible full-screen `<button>` to forward narrative clicks. This is clever but:
- Steals clicks from anything visually behind it. Users learning to click the planner won't know why nothing responds.
- The "skip to important instruction" affordance ([line 486](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L486)) is essential — make it visually prominent (button, not link) so impatient users don't bounce. Drop-off here is your single biggest funnel risk.

### 2.3 Two simultaneous tutorial systems compete for attention
On Day 1 the learner sees: (a) the detective narrative chatbox, (b) the 7-step Mission Planner tutorial popover ([TutorialPopover.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/Tutorial/TutorialPopover.tsx)), and (c) the planner UI itself. That's three competing dialogues at the moment of highest cognitive load.
- Sequence them: finish narrative → tutorial → free interaction. The current implementation already tries (see `shouldExpectMissionTutorial`) but the boundary is fuzzy.
- The tutorial fires only on Day 1 with `currentDay === 0` ([MissionPlanner.tsx:165](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/MissionPlanner/MissionPlanner.tsx#L165)) — good — but the "help" button (`?`) that replays it ([line 187](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/MissionPlanner/MissionPlanner.tsx#L187)) is tiny and unlabeled. Use the word "Help" or "Replay tutorial" inline.

### 2.4 No undo, no save, no resume
[useInvestigationState.ts](DIET/src/pages/Chapters/Chapter1-SamplingBias/hooks/useInvestigationState.ts) keeps everything in React state. A refresh wipes a 3-day investigation. For an educational tool likely used in classrooms across multiple sittings, this is the single highest-impact UX fix:
- Persist to `localStorage` and resume.
- "Send Detective" is *irreversible* and gates the day — add a confirmation modal showing the queued missions before lock-in (Nielsen #5 — error prevention).

### 2.5 The "Operation Stack" terminology is a barrier
"Sortie", "Operation Stack", "Citywide Dragnet", "IP" (Investigation Points), "Field Operator", "Mission Control" ([MissionPlanner.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/MissionPlanner/MissionPlanner.tsx) throughout) — this is good worldbuilding for an adult thriller audience but heavy jargon for the stated audience ("non-CS students meeting AI fairness for the first time" — [Landing.tsx:306](DIET/src/pages/Landing/Landing.tsx#L306)). For non-native English speakers especially, "sortie" and "dragnet" are wall-hitting words.
- Pick one register and stick to it. If the noir voice stays, add an inline glossary on hover, or strip the jargon from button labels and keep it in flavor text only.
- "Sample size" / "Coverage" / "Add to plan" are clearer than "Population volume" / "Zones to search" / "Add Sortie".

### 2.6 Cost model is opaque
A "Scout Sweep" costs 15 IP, a "Citywide Dragnet" 80 IP ([chapterData.ts:33](DIET/src/pages/Chapters/Chapter1-SamplingBias/chapterData.ts#L33)) — why? What does 5 IP per zone *mean*? Without a mental model of cost, learners optimize by trial-and-error, not strategy. Either expose the formula (`cost = pop + 5×zones + 10×questions`) or remove the cost system; right now it adds load without teaching anything.

### 2.7 The verdict's 80% threshold is arbitrary and demoralizing
The "win" line at 0.8 ([Chapter1SamplingBias.tsx:446](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L446)) is invisible to the player until they finish. The simulation's max region accuracy is clamped at 0.96 ([simulation.ts:110](DIET/src/pages/Chapters/Chapter1-SamplingBias/simulation.ts#L110)) and depends on covering *all* four zones — many players will not. Either:
- Tell players the target up front (transparent goal — Nielsen #1 visibility).
- Remove the binary pass/fail and replace with tiered feedback ("You produced a model that works for X residents and fails Y" — humanize the number).

---

## 3. Web / visual design (heuristic walkthrough)

### 3.1 Information density on the Mission Planner
The planner ([MissionPlanner.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/MissionPlanner/MissionPlanner.tsx)) shows **simultaneously**: day header + budget ring + 4 zone cards + 3 sample tiers + 2 mandatory signals + 3 candidate signals + queue + previous decisions + deploy button. That's ~17 active panels.
- Apply progressive disclosure: hide "Previous decisions" behind an accordion (it's only relevant on Day 2+, and on Day 1 it just adds noise).
- Group "Coverage / Sample / Signals" left, "Queue / Deploy" right — currently they're interleaved in a 2D grid which forces saccades across the whole screen for every plan iteration.

### 3.2 Color carries meaning that isn't decoded
[chapterData.ts:5–8](DIET/src/pages/Chapters/Chapter1-SamplingBias/chapterData.ts#L5-L8) assigns each region a color (blue, purple, red, gold), used everywhere — but the legend is implicit. A red bar in the Day Report ([DayReportPanel.tsx:194–215](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/DayReportPanel/DayReportPanel.tsx#L194-L215)) could mean "Factory Zone" or "bad accuracy" — and the design uses red for both ("Threat" dots are `#dc2626` in [BoundaryExercise.tsx:114](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/BoundaryExercise/BoundaryExercise.tsx#L114) too). For color-deficient users this is unreadable.
- Add a small icon/letter beside each region color (UP/DT/FZ/SL is already partially used — extend it).
- Reserve red for negative outcomes only. Use shape or position to encode region identity.

### 3.3 Contrast on score rings and bars
The `scoreRing` good/mid/low palette in [VerdictPanel.tsx:37–47](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/VerdictPanel/VerdictPanel.tsx#L37-L47) and `overallTone` in [DayReportPanel.tsx:98](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/DayReportPanel/DayReportPanel.tsx#L98) likely uses traffic-light hues. Test against WCAG AA contrast (4.5:1 on body text, 3:1 on UI components). Pastel "mid" oranges on white commonly fail.

### 3.4 The custom paged-scroll on the landing page hijacks the wheel
[Landing.tsx:139–161](DIET/src/pages/Landing/Landing.tsx#L139-L161) intercepts wheel events to snap to sections. This is a known UX anti-pattern:
- Trackpad users lose momentum scroll.
- Anyone trying to skim a section mid-scroll is fought.
- Reduced-motion is respected (good — [line 70](DIET/src/pages/Landing/Landing.tsx#L70)), but the *cooldown* still blocks input.
- Keep the dot navigation as a quick-jump affordance; remove the wheel hijack. Natural scroll + scroll-snap CSS does 90% of what's needed without the JS.

### 3.5 The hero's product name ("Θmen") is unreadable on its own
The Greek theta is going to be misread as "Omega" or "0men" by most users — and there's no pronunciation guide, no fallback, no English title in the hero. Either set "Omen" in the H1 with Θ as decorative, or commit to the typographic stunt and add an `aria-label` plus a pronunciation tooltip.

### 3.6 Mixed register and inconsistent button language
Within the Chapter 1 flow alone: "Send Detective", "Deploy Detective | Train Model", "Add Sortie", "Submit boundary", "Begin the boundary exercise", "Proceed to Day 2". Six different verbs in six steps. Pick a verb family ("Send / Add / Continue / Submit") and apply consistently.

### 3.7 The narrative slum label is broken on purpose
[chapterData.ts:8](DIET/src/pages/Chapters/Chapter1-SamplingBias/chapterData.ts#L8) has `label: "\n The \n Slums"` — newlines smuggled into the label string for a visual line break. This leaks into accessibility output (`aria-label` etc.) and any string-comparison. Use a CSS class or `<br>` in JSX, not string content.

### 3.8 No focus styles audit
Modules use bespoke buttons (`.helpButton`, `.featureChip`, `.sampleTier`, `.regionCard` …). Without an explicit `:focus-visible` style per component, keyboard users see browser defaults if anything. Run the chapter via Tab only and add visible focus rings everywhere.

### 3.9 The typed-out chatbox blocks reading speed
[Chatbox.tsx:31](DIET/components/Chatbox/Chatbox.tsx#L31) types at 25 ms/char (~25 chars/sec → ~5 wpm of revealed text). For a 200-char passage that's 5 seconds of forced waiting. Fast readers experience this as a UI bug.
- Click-to-complete (one click reveals all, second advances) is the convention — verify this is wired and discoverable.
- Allow setting per-user character speed, or default to instant after the first chapter.

---

## 4. Accessibility (WCAG 2.2 quick pass)

- **Slider labels**: [BoundaryExercise.tsx:76–105](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/BoundaryExercise/BoundaryExercise.tsx#L76-L105) — `<input type="range">` has no `aria-label` / `aria-valuetext`. Screen readers will announce "1.00" without context. Add `aria-label="Slope of decision boundary"` and an `aria-valuetext` describing what the value does.
- **Decorative images marked correctly** (`alt=""` `aria-hidden="true"` used in many places — good). But `<img alt={r.label}>` for the region cards ([MissionPlanner.tsx:250](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/MissionPlanner/MissionPlanner.tsx#L250)) duplicates the label rendered right next to it — screen readers will say the region twice. Make those `alt=""`.
- **No `prefers-reduced-motion`** check on the Day Report bar animation ([DayReportPanel.tsx:82–94](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/DayReportPanel/DayReportPanel.tsx#L82-L94)) or the chatbox typewriter. Landing handles it; chapters don't.
- **Tutorial popover** ([TutorialPopover.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/Tutorial/TutorialPopover.tsx)) has `role="dialog"` and `aria-labelledby` but no focus trap and no `aria-describedby` for the body. Add focus management and `aria-modal="true"` if it's intended to block the page.
- **No skip links** to chapter content; keyboard users tab through the nav every chapter switch.
- **Time-on-page game** with no pause: a learner with attention disorders or who steps away cannot pause; nothing autosaves. Add an explicit "Save and exit" — also helps classroom use.

---

## 5. Engagement / classroom fit

- **No teacher mode / no analytics export.** This looks like a serious educational artefact (the chapter coverage is excellent), but a teacher cannot see what their class did. Even a single "Download summary JSON" at the Verdict would let an instructor close the loop. (Privacy-preserving: nothing leaves the browser.)
- **No estimated time-to-complete** on the chapter cards in [Landing.tsx:285–296](DIET/src/pages/Landing/Landing.tsx#L285-L296) or [Chapters.tsx](DIET/src/pages/Chapters/Chapters.tsx). For lesson planning, instructors need "~20 min" up front.
- **No "for educators" page** linking the simulation to a curriculum standard (CSTA K-12, UNESCO AI competency, ETH AI literacy framework, whatever fits the host institution). This is a high-leverage credibility move for a thesis-level project.
- **The narrative voice presupposes a Western/English noir frame** (precinct, dragnet, stop-and-frisk in [chapterData.ts:65](DIET/src/pages/Chapters/Chapter1-SamplingBias/chapterData.ts#L65)). For international audiences this is both a comprehension and a values-loading issue — "stop-and-frisk" carries baggage that may not transfer. Either localize the frame or annotate the references.
- **The fairness chapter (Ch2) leans on US-specific COMPAS** without explaining what COMPAS *is* in lay terms. Add a 1-sentence "what this is" gloss before the dialogue starts.

---

## 6. Quick-win punch list (≤ 1 day each)

1. Add `localStorage` snapshot to investigation state ([useInvestigationState.ts](DIET/src/pages/Chapters/Chapter1-SamplingBias/hooks/useInvestigationState.ts)). Single biggest UX win.
2. Remove the 100%-accuracy submit gate in the boundary exercise; ask for a *prediction* instead.
3. Sequence the Day-1 tutorial *after* the narrative finishes, with a single visible "Show me how to plan" button.
4. Rename buttons consistently ("Send detective" everywhere, drop "sortie" from labels).
5. Add a confirmation modal on "Send Detective" showing what's about to be locked in.
6. Fix `"\n The \n Slums"` label hack in [chapterData.ts:8](DIET/src/pages/Chapters/Chapter1-SamplingBias/chapterData.ts#L8).
7. Add `aria-valuetext` to the boundary sliders.
8. Add a "Why this score?" disclosure on the Verdict page that surfaces the actual cost/coverage breakdown.
9. Add `prefers-reduced-motion` short-circuit to the bar animation and the typewriter.
10. Replace the wheel hijack on Landing with native CSS scroll-snap.

---

## 7. Larger redesigns worth piloting

- **Predict–Observe–Explain pattern** for every chapter (slider for prediction → simulation runs → user explains in 1 sentence → reveal).
- **Worked-example onboarding** for Chapter 1 (Day 0 played by the system).
- **Teacher dashboard mode** (download anonymized run log; classroom-mode that disables fast-forward).
- **A second scenario per chapter** with different surface features to support transfer (currently every replay is identical, which trains pattern-matching, not understanding).
- **Bring the misconception to the surface** with a single pre-chapter prompt: "Pick the statement you most agree with." Save it; show it back at the end alongside the new evidence.

---

*References that the above leans on, in case you want to cite in a thesis: Wiggins & McTighe — Understanding by Design; Sweller — Cognitive Load Theory; Kapur — Productive Failure; Hattie & Timperley — The Power of Feedback; Chi — ICAP framework; Roediger & Karpicke — testing effect; White & Gunstone — Predict-Observe-Explain; Schwartz & Bransford — preparation for future learning; Nielsen's 10 heuristics; WCAG 2.2.*
