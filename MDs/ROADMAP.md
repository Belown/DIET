# DIET — Website Roadmap

A prioritized list of next steps for the DIET fairness simulator web app. Grouped by phase; earlier items unblock later ones.

## 1. Routing & shell ✅

- [X] Add `react-router-dom`; carve routes: `/` (landing), `/simulator`, `/simulator/:phase`, `/about`
- [X] Build a `SimulatorLayout` — left sidebar with the ML pipeline nodes (Dataset → Classifier → Evaluation), main canvas area, right-side metrics panel
- [X] Wire the landing's "Start exploring" CTA to `/simulator`

## 2. Data layer ✅

- [X] Define the synthetic CV dataset shape: `{ techScore, experience, portfolio, group, qualified }` (`group` = A|B, `qualified` = ground truth)
- [X] Write a generator that produces the baked-in historical skew (Group B shifted down on tech/experience, but equal portfolio distribution — the "hidden feature" that rewards phase 2)
- [X] Keep the dataset in a module so Phase 3 can inject fresh samples to reveal hidden bias

## 3. Dataset Inspector (Preparation §1) ✅

- [X] Distribution histograms per feature, split by group
- [X] Analytical warning banners ("Group B is underrepresented", "Tech score distribution is skewed")
- [X] ~~Pick a charting lib~~ — went with hand-rolled inline SVG instead

## 4. Boundary Canvas — Phase 1 (2D) ✅

- [X] Scatter plot of Tech × Experience, colored by group
- [X] User tunes a boundary: linear threshold (slope + intercept sliders)
- [X] Live-update predicted labels as the boundary moves

## 5. Evaluation node ✅

- [X] Compute Overall Accuracy, TPR per group, TPR gap (|TPR_A − TPR_B|)
- [X] "Audit" UI that turns red when gap > 5%, green when ≤ 5% AND accuracy > 80%
- [X] This is the "feel good for one second" moment — make the red state land emotionally

## 6. Boundary Canvas — Phase 2 (unlock Portfolio) ✅

- [X] Reveal the Z-axis (Portfolio) with an unlock transition
- [X] Second 2D boundary on Portfolio × Experience
- [X] Prove that this third feature actually helps (because of how the data was generated)

## 7. Boundary Canvas — Phase 3 (3D synthesis) ✅

- [X] Extrude the two 2D curves into a 3D manifold — `react-three-fiber` + `drei`
- [X] Rotatable, inspectable, with the sample points projected
- [X] Re-run the audit in 3D — this is the win state

## 8. Bias-reveal mechanic

- [X] Introduce fresh samples mid-session that expose where the boundary is still unfair (per Preparation §3) — `generateFreshBatch()` exists but is never called
- [ ] Prevents the "more features = fair" misconception

## 9. Pedagogical glue ⏳

- [X] Short in-context explainer panels at each phase transition ("Why did the audit fail?")
- [ ] A "debrief" screen at the end summarizing what the student did, the math, and the takeaway
- [ ] Answer the two Open Questions in [Preparation.md](Preparation.md): the feature list and the mitigation techniques we'll actually teach

## 10. Evaluation plan (Preparation §4)

- [ ] Fill in the TBD procedure: task scenarios, think-aloud prompts, pre/post survey on fairness concepts
- [ ] Recruit 5+ CS students per the plan
- [ ] Decide what to measure: time-to-insight, verbal evidence of the conceptual shift, post-test accuracy on fairness questions

## 11. Polish & ship ⏳

- [X] Screen reader labels on charts (`role="img"`, `aria-label`, `role="tablist"`)
- [ ] Accessibility — keyboard nav on the canvas, focus management
- [ ] Accessibility — color-blind-safe group palette (swap pink/blue for patterns or shape+color)
- [X] Mobile — basic responsive breakpoints for layout/scatter grid
- [ ] Mobile — 3D canvas accommodation (redirect, gate, or read-only summary)
- [ ] Deploy (Vercel/Netlify) and set up a simple analytics tag to see where students drop off
