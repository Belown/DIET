
# Design System for "Detecting Bias: A Time-Travel Investigation"

## 1. Visual Theme & Atmosphere

DIET is a noir detective story wrapped in a futuristic AI dystopia — a design system that communicates "the truth is buried, but you can uncover it" through deep shadows, warm case-file textures, and cold digital interfaces. The visual language is built on a duality: the warmth of human investigation (aged paper, typewriter ink, cork-board red string) versus the cold precision of AI systems (holographic blues, terminal greens, sterile data grids).

The color system is built on `--diet-*` tokens organized across two worlds: the **Investigator** palette (warm earth tones, amber, deep brown, cream) for narrative and case-file surfaces, and the **Machine** palette (cold teals, electric blues, terminal greens, warning reds) for AI interfaces and data displays. The interplay between these two palettes creates tension — human intuition against algorithmic certainty.

The city of Novus is a golden-age tech metropolis, but beneath its gleaming surface lies hidden bias. The design reflects this: sleek surfaces that reveal cracks of prejudice when investigated.

**Key Characteristics:**

- Noir atmosphere: deep shadows, dramatic contrast, moody lighting
- Duality of warm investigator tones + cold AI interface colors
- Evidence-board layouts: pinned cards, connected clues, red string paths
- Typewriter/terminal typography split: serif for narrative, monospace for data
- Glitch and scan-line effects for AI/holographic elements
- Layered depth with shadows and elevation — opposite of flat design
- Chapter transitions marked by color temperature shifts

---

## 2. Color Palette & Roles

### The Investigator (Warm / Human)

| Token                 | Hex         | Role                                           |
| --------------------- | ----------- | ---------------------------------------------- |
| `--diet-ink`        | `#1a1410` | Primary text, deepest shadow — aged ink black |
| `--diet-paper`      | `#f5f0e8` | Primary light surface — warm aged paper       |
| `--diet-paper-dark` | `#e8e0d0` | Secondary paper — slightly aged, for cards    |
| `--diet-cream`      | `#faf7f0` | Background surface — off-white with warmth    |
| `--diet-file-tab`   | `#d4c5a9` | Manila folder tan — file tabs, dividers       |
| `--diet-amber`      | `#c77d20` | Warm accent — desk lamp glow, highlights      |
| `--diet-copper`     | `#b85c1e` | Rich warm accent — important markers          |
| `--diet-wood`       | `#5c3d2e` | Dark wood — navigation bars, frames           |
| `--diet-red-string` | `#c0392b` | Evidence connection lines — critical paths    |
| `--diet-ink-faded`  | `#6b5e53` | Secondary text — faded typewriter ink         |
| `--diet-stamp-red`  | `#8b1a1a` | Case file stamps — "CLASSIFIED", "EVIDENCE"   |

### The Machine (Cold / AI)

| Token                     | Hex         | Role                                         |
| ------------------------- | ----------- | -------------------------------------------- |
| `--diet-void`           | `#0a0e14` | Deepest AI surface — terminal black         |
| `--diet-steel`          | `#141b22` | AI panel background — dark steel blue       |
| `--diet-holo-blue`      | `#4dc9f6` | Primary AI accent — holographic glow        |
| `--diet-neon-teal`      | `#00f0b5` | Success/positive — AI certainty, verified   |
| `--diet-terminal-green` | `#3fef6f` | Data display — terminal output, logs        |
| `--diet-alert-red`      | `#ff3347` | AI danger/warning — HIGH RISK verdicts      |
| `--diet-alert-amber`    | `#ff8c38` | AI caution — medium risk, bias detected     |
| `--diet-grid-line`      | `#1c2836` | Data grid lines — subtle dividers           |
| `--diet-data-blue`      | `#5b9bd5` | Data visualization — charts, stats          |
| `--diet-glitch-purple`  | `#b44cf0` | Glitch/error — system anomalies, bias found |
| `--diet-machine-text`   | `#8ba4b8` | AI secondary text — muted machine voice     |
| `--diet-cold-white`     | `#dce6f0` | AI light text — cold precision              |

### Neutral Bridge

| Token                    | Hex                | Role                 |
| ------------------------ | ------------------ | -------------------- |
| `--diet-shadow`        | `#000000` at 40% | Box shadows — depth |
| `--diet-overlay`       | `#000000` at 60% | Modal backdrops      |
| `--diet-divider`       | `#2a2520`        | Dark mode dividers   |
| `--diet-divider-light` | `#d9d0c0`        | Light mode dividers  |

---

## 3. Typography Rules

### Font Families

- **Narrative / Display**: `Playfair Display` — elegant serif, evokes detective novels and aged case reports. Used for chapter titles, scene headings, dramatic quotes.
- **Case File / Headings**: `IBM Plex Serif` — sturdy, authoritative serif. Used for evidence labels, file headers, investigation section titles.
- **Body / UI**: `Source Sans 3` — clean, highly readable sans-serif. Used for dialogue, descriptions, UI labels.
- **Terminal / Data**: `JetBrains Mono` — monospace for AI outputs, data tables, terminal readouts, code-like bias analysis.
- **Fallbacks**: `Georgia, serif` for narrative; `system-ui, sans-serif` for body; `Consolas, monospace` for terminal.

### Hierarchy

| Role            | Font             | Size           | Weight | Line Height | Letter Spacing | Notes                          |
| --------------- | ---------------- | -------------- | ------ | ----------- | -------------- | ------------------------------ |
| Chapter Title   | Playfair Display | 72px (4.50rem) | 700    | 1.10        | -0.5px         | Cinematic chapter openings     |
| Scene Heading   | Playfair Display | 48px (3.00rem) | 600    | 1.15        | -0.3px         | Scene transitions              |
| Case File Title | IBM Plex Serif   | 36px (2.25rem) | 600    | 1.20        | normal         | Investigation document headers |
| Evidence Label  | IBM Plex Serif   | 24px (1.50rem) | 500    | 1.25        | 0.5px          | Card titles, clue names        |
| Section Header  | IBM Plex Serif   | 20px (1.25rem) | 600    | 1.30        | 1px            | Sub-sections, tabs             |
| AI Display      | JetBrains Mono   | 18px (1.13rem) | 400    | 1.40        | normal         | Terminal output, AI text       |
| Body Intro      | Source Sans 3    | 18px (1.13rem) | 300    | 1.60        | normal         | Narrative introductions        |
| Body Text       | Source Sans 3    | 16px (1.00rem) | 400    | 1.55        | normal         | Standard reading               |
| Dialogue        | Source Sans 3    | 16px (1.00rem) | 400    | 1.55        | normal         | Character speech, italic       |
| UI Label        | Source Sans 3    | 14px (0.88rem) | 600    | 1.40        | 0.5px          | Buttons, tabs, form labels     |
| Data Small      | JetBrains Mono   | 13px (0.81rem) | 400    | 1.45        | normal         | Data tables, stats             |
| Caption         | Source Sans 3    | 12px (0.75rem) | 400    | 1.40        | 0.5px          | Image captions, footnotes      |

### Principles

- **Serif for narrative authority**: Playfair Display and IBM Plex Serif ground the story in detective genre conventions — this is a mystery to be solved, not a product to be bought.
- **Monospace for machine truth**: JetBrains Mono makes AI output feel like raw data — unadorned, potentially flawed, demanding human scrutiny.
- **Generous body leading**: 1.55–1.60 line height gives narrative text room to breathe, inviting immersive reading.
- **Tight display for impact**: Chapter titles at 1.10 create cinematic weight, like title cards in a noir film.
- **Weight contrast over size contrast**: Chapter titles at 700 bold, body at 300–400 — drama comes from weight, not just scale.

---

## 4. Component Stylings

### Investigation Cards (Evidence / Clue Cards)

**Base Evidence Card**

- Background: `--diet-paper` or `--diet-paper-dark`
- Border: `1px solid --diet-file-tab`
- Padding: 24px
- Radius: 4px (sharp, like a cut photograph or case file)
- Shadow: `0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)`
- Hover: shadow deepens to `0 4px 16px rgba(0,0,0,0.2)`, slight lift `translateY(-2px)`
- Pseudo-element: top-left folded corner effect (3D card illusion)

**AI Data Card**

- Background: `--diet-steel`
- Border: `1px solid --diet-grid-line`
- Padding: 20px
- Radius: 2px (sharp, digital)
- Shadow: `0 0 12px rgba(77, 201, 246, 0.08)` — subtle holographic glow
- Text: `--diet-machine-text` with `--diet-holo-blue` highlights

### Buttons

**Primary Investigate (Warm)**

- Background: `--diet-ink`
- Text: `--diet-paper`
- Padding: 12px 28px
- Radius: 4px (sharp, document-like)
- Font: `Source Sans 3 14px weight 600, letter-spacing 0.5px, uppercase`
- Hover: background lightens to `#2a2018`, shadow `0 2px 8px rgba(0,0,0,0.3)`
- Focus: `0 0 0 2px --diet-amber` outline

**AI Action (Cold)**

- Background: `transparent`
- Text: `--diet-holo-blue`
- Border: `1px solid --diet-holo-blue`
- Padding: 10px 24px
- Radius: 2px
- Font: `JetBrains Mono 13px weight 400`
- Hover: background `rgba(77, 201, 246, 0.08)`, glow intensifies
- Focus: `0 0 0 2px --diet-holo-blue`

**Danger / HIGH RISK**

- Background: `--diet-alert-red`
- Text: `--diet-cold-white`
- Padding: 12px 28px
- Radius: 2px
- Font: `Source Sans 3 14px weight 700, uppercase`
- Hover: background darkens to `#e02a3d`
- Animation: subtle pulse glow on critical verdict screens

**Ghost / Time Machine**

- Background: `rgba(180, 76, 240, 0.08)`
- Text: `--diet-glitch-purple`
- Border: `1px solid --diet-glitch-purple`
- Padding: 12px 28px
- Radius: 9999px (the only pill — represents the impossible, time travel itself)
- Font: `Source Sans 3 14px weight 400, italic`
- Hover: glitch animation (brief horizontal displacement)

### Navigation

**Investigation Progress Bar**

- Background: `--diet-wood` or `--diet-void` (depending on context)
- Progress indicator: `--diet-red-string` connected dots
- Chapter markers: circular nodes, filled when complete
- Current chapter: pulsing `--diet-amber` glow
- Font: `IBM Plex Serif 14px weight 500`

**Evidence Board (Chapter Select)**

- Visual metaphor: physical cork/string board
- Background: `--diet-paper-dark` with subtle cork texture
- Connected nodes: `--diet-red-string` lines between related clues
- Pinned cards: slight rotation (1–3°) for organic feel
- Unlocked clues: full color; locked clues: desaturated + "CLASSIFIED" stamp overlay

### Data Displays (AI Interfaces)

**Terminal Output**

- Background: `--diet-void`
- Text: `JetBrains Mono 14px --diet-terminal-green`
- Scan-line overlay: repeating linear-gradient at 3px intervals, 8% opacity
- Cursor blink animation: `--diet-terminal-green` block, 1s blink cycle
- Border: `1px solid --diet-grid-line`, inset shadow for screen depth

**Risk Assessment Panel**

- Background: `--diet-steel`
- Header: `IBM Plex Serif 18px --diet-cold-white` on darker strip
- Risk meter: horizontal bar, gradient from `--diet-neon-teal` → `--diet-alert-amber` → `--diet-alert-red`
- Verdict text: `JetBrains Mono 24px`, color matches risk level
- "HIGH RISK" = `--diet-alert-red` with subtle red ambient glow

**Bias Detection Visualization**

- Bias found: `--diet-glitch-purple` highlight on affected data points
- Clean data: `--diet-data-blue`
- Animated reveal: glitch effect when bias is discovered
- Tooltip: `--diet-steel` card with `JetBrains Mono 12px`

### Modals & Overlays

**Case File Modal**

- Background: `--diet-paper`
- Shadow: `0 8px 40px rgba(0,0,0,0.4)` — dramatic depth
- Border: none, but top accent bar `4px solid --diet-ink`
- Close button: stamped circle, `--diet-stamp-red`
- Content scroll: custom scrollbar matching `--diet-file-tab`

**Time Travel Transition Overlay**

- Fullscreen `--diet-void`
- Central vortex: spinning radial gradient `--diet-holo-blue` → `--diet-glitch-purple`
- Text: `Playfair Display 36px --diet-cold-white`, "Traveling to..." with typewriter reveal animation
- Particles: small glowing dots streaking toward center

### Chapters as Visual Zones

Each chapter has a distinct visual identity matching its investigation focus:

**Chapter 1 — Data Bias**

- Dominant palette: Investigation warm tones
- Key visuals: City maps, population charts, sampling diagrams
- UI: Region selection cards, data collection forms
- Discovery moment: Glitch reveal when sampling gaps found

**Chapter 2 — Algorithmic Bias**

- Dominant palette: Mixed warm/cold — the tension peak
- Key visuals: Defendant profiles, fairness definition comparisons, gavel imagery
- UI: Side-by-side comparison panels, definition selection, courtroom layouts
- Discovery moment: Data nodes glow `--diet-glitch-purple` when human cycle discovered

**Chapter 3 — Human-in-the-Loop Bias**

- Dominant palette: Machine cold tones with human warmth bleeding in
- Key visuals: LLM input/output pairs, labeling interfaces, feedback loops
- UI: Question card stacks, before/after AI response comparisons
- Discovery moment: Player's own biased labels echoed back by the AI

---

## 5. Layout Principles

### Spacing System

- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 120px
- Section spacing: 80px (standard), 120px (chapter breaks)
- Card gaps: 20px (evidence grid), 16px (data grid)

### Grid System

- Evidence Board layout: CSS Grid, auto-fill with minmax(280px, 1fr) — cards find their place organically
- Data/AI panels: rigid 2-column or 3-column grid with `--diet-grid-line` borders
- Narrative sections: single column, max-width 720px, centered — like reading a case file
- Chapter transitions: full-bleed dark sections

### Border Radius Scale

- Sharp (2px): AI panels, data cards, terminal windows — machine precision
- Document (4px): Evidence cards, case files, buttons — slightly softened paper
- Stamp (50%): Badge indicators, "CLASSIFIED" markers
- Impossible (9999px): Time machine elements only — the single pill in a sharp world

---

## 6. Depth & Elevation

Unlike Revolut's flat philosophy, DIET uses strategic depth to create atmosphere.

| Level        | Shadow                           | Use                                                       |
| ------------ | -------------------------------- | --------------------------------------------------------- |
| Flat (0)     | None                             | AI terminal surfaces, data grids — machine world is flat |
| Paper (1)    | `0 1px 3px rgba(0,0,0,0.12)`   | Evidence cards at rest                                    |
| Lifted (2)   | `0 4px 12px rgba(0,0,0,0.15)`  | Cards on hover, active clues                              |
| Floating (3) | `0 8px 30px rgba(0,0,0,0.25)`  | Modals, case file overlays                                |
| Dramatic (4) | `0 16px 48px rgba(0,0,0,0.35)` | Chapter title cards, critical reveals                     |

**Shadow Philosophy**: The human/investigator surfaces use warm shadows (black with slight brown tint). The AI surfaces use cold shadows (black with slight blue tint, or glowing edges). This creates a visual language where shadow color communicates which "world" an element belongs to.

**Glow for AI**: AI surfaces may use an ambient glow instead of shadow — `box-shadow: 0 0 20px rgba(77, 201, 246, 0.06)` — creating a holographic floating effect.

---

## 7. Motion & Transitions

### Chapter Transitions

- Typewriter reveal for chapter titles (character-by-character, 80ms per char)
- Fade through black (400ms) between major sections
- Ink-bleed effect: warm brown spreading on paper texture for investigation discoveries

### Investigation Interactions

- Card hover: gentle lift (translateY -2px) + shadow deepen (200ms ease-out)
- Clue connection: red string draws itself (SVG stroke-dashoffset animation, 600ms)
- Evidence unlock: "CLASSIFIED" stamp fades out, card saturates (400ms)

### AI / Machine Interactions

- Terminal text: character-by-character reveal (30ms per char) with scan-line effect
- Glitch on bias discovery: random horizontal displacement (3 frames), chromatic aberration shift
- Data highlight: `--diet-glitch-purple` pulse on affected data points (2s infinite, subtle)

### Time Travel

- Full screen overlay: vortex animation (CSS radial-gradient rotation)
- Particles streak toward center
- Audio cue suggestion: low hum building to silence
- Exit: reverse animation into new time period

---

## 8. Responsive Behavior

| Name         | Width        | Key Changes                                                    |
| ------------ | ------------ | -------------------------------------------------------------- |
| Mobile Small | <400px       | Single column, cards full width, simplified evidence board     |
| Mobile       | 400–720px   | Single column, larger touch targets, collapsed navigation      |
| Tablet       | 720–1024px  | 2-column evidence grid, side navigation appears                |
| Desktop      | 1024–1440px | Full evidence board, multi-column data panels                  |
| Wide         | >1440px      | Max-width 1440px centered, ambient background patterns visible |

### Mobile Adaptations

- Evidence board becomes vertical scroll with horizontal swipe for connected clues
- AI panels collapse into accordion sections
- Terminal font size increases to 16px for readability
- Buttons go full-width with 56px height for thumb reach
- Chapter navigation becomes a bottom sheet

---

## 9. Do's and Don'ts

### Do

- Use warm tones for narrative, cold tones for AI — maintain the duality
- Apply shadows to human-world elements (cards, files) to create physicality
- Keep AI surfaces flat with glow borders — machines are interfaces, not objects
- Use Playfair Display for emotional/cinematic moments only
- Use JetBrains Mono exclusively for data, terminal output, and AI speech
- Animate red string connections when clues are linked
- Preserve the 4px document radius for investigation elements
- Use the 9999px pill radius ONLY for time-travel related elements

### Don't

- Don't mix warm and cold palettes in the same component without intention — the boundary matters
- Don't use pill-shaped buttons (9999px) for standard actions — they're for the impossible
- Don't apply shadows to AI terminal surfaces — machines live on screens
- Don't use Playfair Display for UI labels or data — it loses its dramatic impact
- Don't make everything dark — the contrast between warm paper light and machine void is essential
- Don't use pure black (#000) or pure white (#fff) — always tint toward warm or cold
- Don't animate for the sake of it — motion should reveal information or signal chapter shifts

---

## 10. CSS Custom Properties Reference

```css
:root {
  /* === THE INVESTIGATOR (Warm / Human) === */
  --diet-ink: #1a1410;
  --diet-paper: #f5f0e8;
  --diet-paper-dark: #e8e0d0;
  --diet-cream: #faf7f0;
  --diet-file-tab: #d4c5a9;
  --diet-amber: #c77d20;
  --diet-copper: #b85c1e;
  --diet-wood: #5c3d2e;
  --diet-red-string: #c0392b;
  --diet-ink-faded: #6b5e53;
  --diet-stamp-red: #8b1a1a;

  /* === THE MACHINE (Cold / AI) === */
  --diet-void: #0a0e14;
  --diet-steel: #141b22;
  --diet-holo-blue: #4dc9f6;
  --diet-neon-teal: #00f0b5;
  --diet-terminal-green: #3fef6f;
  --diet-alert-red: #ff3347;
  --diet-alert-amber: #ff8c38;
  --diet-grid-line: #1c2836;
  --diet-data-blue: #5b9bd5;
  --diet-glitch-purple: #b44cf0;
  --diet-machine-text: #8ba4b8;
  --diet-cold-white: #dce6f0;

  /* === NEUTRAL BRIDGE === */
  --diet-shadow: rgba(0, 0, 0, 0.4);
  --diet-overlay: rgba(0, 0, 0, 0.6);
  --diet-divider: #2a2520;
  --diet-divider-light: #d9d0c0;

  /* === TYPOGRAPHY === */
  --diet-font-display: 'Playfair Display', Georgia, serif;
  --diet-font-case-file: 'IBM Plex Serif', Georgia, serif;
  --diet-font-body: 'Source Sans 3', system-ui, sans-serif;
  --diet-font-terminal: 'JetBrains Mono', Consolas, monospace;

  /* === SPACING === */
  --diet-space-unit: 8px;

  /* === RADIUS === */
  --diet-radius-sharp: 2px;
  --diet-radius-document: 4px;
  --diet-radius-stamp: 50%;
  --diet-radius-impossible: 9999px;

  /* === SHADOWS === */
  --diet-shadow-paper: 0 1px 3px rgba(0, 0, 0, 0.12);
  --diet-shadow-lift: 0 4px 12px rgba(0, 0, 0, 0.15);
  --diet-shadow-float: 0 8px 30px rgba(0, 0, 0, 0.25);
  --diet-shadow-dramatic: 0 16px 48px rgba(0, 0, 0, 0.35);
  --diet-glow-holo: 0 0 20px rgba(77, 201, 246, 0.06);
  --diet-glow-alert: 0 0 16px rgba(255, 51, 71, 0.1);
}
```

---

## 11. Agent Prompt Guide

### Quick Reference

- **Narrative surfaces**: `--diet-paper`, `--diet-ink`, Playfair Display, shadows
- **AI surfaces**: `--diet-void`, `--diet-steel`, `--diet-holo-blue`, JetBrains Mono, flat with glow
- **Investigation**: `--diet-red-string`, `--diet-amber`, evidence cards with 4px radius
- **Danger**: `--diet-alert-red` with glow, uppercase JetBrains Mono
- **Time travel**: `--diet-glitch-purple`, 9999px radius, glitch animations

### Example Component Prompts

- "Create a chapter title card: `--diet-ink` background. Title at 72px Playfair Display weight 700, line-height 1.10, `--diet-paper` text, letter-spacing -0.5px. Dramatic shadow (`--diet-shadow-dramatic`). Typewriter reveal animation. Scene number in `--diet-amber` IBM Plex Serif above."
- "Create an evidence card: `--diet-paper` background, 1px `--diet-file-tab` border, 4px radius, 24px padding. Title in IBM Plex Serif 24px `--diet-ink`. Body in Source Sans 3 16px. Shadow `--diet-shadow-paper`. Hover: lift to `--diet-shadow-lift`, translateY -2px. Top-left pseudo-element folded corner in `--diet-paper-dark`."
- "Create an AI terminal panel: `--diet-void` background. Scan-line overlay (repeating gradient 3px, 8% opacity). Text in JetBrains Mono 14px `--diet-terminal-green`. Blinking block cursor. `--diet-grid-line` inset border. No shadow — flat screen surface."
- "Create a HIGH RISK verdict display: `--diet-steel` panel. Verdict text 'HIGH RISK' in JetBrains Mono 24px weight 700 `--diet-alert-red`. Subtle red ambient glow (`--diet-glow-alert`). Risk meter bar: gradient from `--diet-neon-teal` → `--diet-alert-amber` → `--diet-alert-red` with marker at current position."
- "Create a time travel button: transparent background, `--diet-glitch-purple` text, 1px `--diet-glitch-purple` border, 9999px radius. Text 'TRAVEL BACK' in Source Sans 3 14px italic. Hover: glitch animation (3-frame horizontal displacement, chromatic aberration)."

### Iteration Guide

1. Every component belongs to either the Investigator world (warm, shadowed, organic) or the Machine world (cold, flat, digital) — identify which before building
2. Playfair Display for drama, IBM Plex Serif for authority, Source Sans 3 for clarity, JetBrains Mono for data — never cross contexts
3. Shadows on human surfaces, glow on AI surfaces — depth communicates origin
4. 4px document radius standard; 9999px only for time travel — the shape language has meaning
5. Color temperature must shift between chapters — Data (warm dominant) → Algorithm (balanced tension) → Humans (cold dominant with warmth bleeding through)
