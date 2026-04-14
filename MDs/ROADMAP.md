# DIET — Website Roadmap

A prioritized list of next steps for the DIET fairness simulator web app. Grouped by phase; earlier items unblock later ones.

## 1. Routing & shell ✅

- [x] Add `react-router-dom`; carve routes: `/` (landing), `/simulator`, `/simulator/:phase`, `/about`
- [x] Build a `SimulatorLayout` — left sidebar with the ML pipeline nodes (Dataset → Classifier → Evaluation), main canvas area, right-side metrics panel
- [x] Wire the landing's "Start exploring" CTA to `/simulator`

## 2. Data layer ✅

- [x] Define the synthetic CV dataset shape: `{ techScore, experience, portfolio, group, qualified }` (`group` = A|B, `qualified` = ground truth)
- [x] Write a generator that produces the baked-in historical skew (Group B shifted down on tech/experience, but equal portfolio distribution — the "hidden feature" that rewards phase 2)
- [x] Keep the dataset in a module so Phase 3 can inject fresh samples to reveal hidden bias

## 3. Dataset Inspector (Preparation §1)

- Distribution histograms per feature, split by group
- Analytical warning banners ("Group B is underrepresented", "Tech score distribution is skewed")
- Pick a charting lib — likely `visx` or `recharts`; lean `visx` for how much custom work is coming

## 4. Boundary Canvas — Phase 1 (2D)

- Scatter plot of Tech × Experience, colored by group
- User tunes a boundary: start with a linear threshold (slope + intercept sliders), upgrade to a draggable curve later
- Live-update predicted labels as the boundary moves

## 5. Evaluation node

- Compute Overall Accuracy, TPR per group, TPR gap (|TPR_A − TPR_B|)
- "Audit" UI that turns red when gap > 5%, green when ≤ 5% AND accuracy > 80%
- This is the "feel good for one second" moment — make the red state land emotionally

## 6. Boundary Canvas — Phase 2 (unlock Portfolio)

- Reveal the Z-axis (Portfolio) with a transition, not a hard swap
- Second 2D boundary on Portfolio × something
- Prove that this third feature actually helps (because of how the data was generated)

## 7. Boundary Canvas — Phase 3 (3D synthesis)

- Extrude the two 2D curves into a 3D manifold — `react-three-fiber` + `drei`
- Rotatable, inspectable, with the sample points projected
- Re-run the audit in 3D — this is the win state

## 8. Bias-reveal mechanic

- Introduce fresh samples mid-session that expose where the boundary is still unfair (per Preparation §3)
- Prevents the "more features = fair" misconception

## 9. Pedagogical glue

- Short in-context explainer panels at each phase transition ("Why did the audit fail?")
- A "debrief" screen at the end summarizing what the student did, the math, and the takeaway
- Answer the two Open Questions in [Preparation.md](Preparation.md): the feature list and the mitigation techniques we'll actually teach

## 10. Evaluation plan (Preparation §4)

- Fill in the TBD procedure: task scenarios, think-aloud prompts, pre/post survey on fairness concepts
- Recruit 5+ CS students per the plan
- Decide what to measure: time-to-insight, verbal evidence of the conceptual shift, post-test accuracy on fairness questions

## 11. Polish & ship

- Accessibility pass (keyboard nav on the canvas, screen reader labels on charts, color-blind-safe group palette — swap pink/blue for patterns or shape+color)
- Mobile story: the 3D canvas won't work on phones, so decide — redirect, gate, or build a read-only mobile summary
- Deploy (Vercel/Netlify) and set up a simple analytics tag to see where students drop off
