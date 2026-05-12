# Chapter 1 Background Asset Brief

Use this as the upload checklist for Chapter 1: Sampling Bias. Suggested image format: wide 16:9 PNG or JPG, at least 1920x1080. Keep the UI-safe area darker and less detailed in the center/bottom where panels and chatbox may sit.

## Overall Chapter Look

Chapter 1 should feel warm-human first, with cold machine overlays breaking through. The story is about data collection across a city, so backgrounds should show places, districts, field work, case files, and model-analysis spaces.

Visual language:
- Warm investigation tones: paper, amber lamps, cork board, streetlights, city haze.
- Gentle AI accents when the model appears: soft blue/teal monitors, clear data grids, subtle scan glow.
- Polished animated storybook mood: clean outlines, charming hand-painted textures, soft shadows, readable composition.

## Required Backgrounds

### 1. `chapter1_case_room.png`
Use for: first scene after StoryIntro, `intro`, `day1-brief`, general narrative moments.

Scene idea: Detective case room at night. Cork board with a city map of New Eden, red string, pinned district photos, scattered files, a desk lamp, coffee cup, and a faint holographic city-grid projection on one wall.

Mood: warm investigation, human, grounded.

Composition notes: Leave the lower center reasonably dark/clean for chatbox. Evidence board can sit left or upper center.

### 2. `chapter1_boundary_lab.png`
Use for: `demo-intro`, boundary exercise.

Scene idea: A paper case file spread over a desk, with an AI scatterplot projected above it. It should combine old investigation materials with a cold digital decision boundary: dots, axes, red dashed line, and data grid reflections.

Mood: warm paper meets cold machine.

Composition notes: The interactive boundary UI will sit on top, so keep detail around the edges and avoid busy center clutter.

### 3. `chapter1_sampling_failure.png`
Use for: `demo-reveal`, boundary reveal.

Scene idea: A teaching visual for sampling bias. Show a small, clean training sample on one side and a much larger real population hidden or fading into the background. The image should communicate that the AI learned from too narrow a slice of people, not from the whole world it was supposed to judge.

Mood: discovery, tension, bias exposed.

Composition notes: Purple glitch accents and alert red are useful here.

### 4. `chapter1_city_map_table.png`
Use for: `day1-plan`, `day2-plan`, `day3-plan`, MissionPlanner screens.

Scene idea: Overhead planning table with a large map of New Eden divided into four districts. Detective tools, route pins, colored threads, budget tokens, and field notebooks are arranged around it. Add subtle holographic zone outlines so it feels interactive.

Mood: strategic, investigative, hands-on.

Composition notes: This should be the main planning background. Keep it not too high-contrast behind form controls.

### 5. `chapter1_uptown.png`
Use for: zone/district flavor, especially when the player samples Uptown.

Scene idea: Wealthy district with clean towers, bright walkways, private security cameras, polished streets, and warm gold city lights.

Mood: privileged, over-surveyed, polished.

Composition notes: Should look “safe” but slightly sterile.

### 6. `chapter1_downtown.png`
Use for: zone/district flavor, mixed sampling routes.

Scene idea: Dense downtown streets with transit lines, crowds, storefronts, neon signs, apartment windows, and mixed social activity.

Mood: busy, varied, socially complex.

Composition notes: Good for representing demographic diversity and data variety.

### 7. `chapter1_factory_zone.png`
Use for: Factory Zone sampling, night-shift worker reveal, weak-region feedback.

Scene idea: Industrial district at night. Factories, loading bays, workers leaving late shifts, steam vents, safety vests, and blue-orange industrial lighting.

Mood: misunderstood, hardworking, underrepresented.

Composition notes: This is important because the demo reveal mentions safe night-shift workers being misclassified.

### 8. `chapter1_slums.png`
Use for: Slums sampling, blind spot warnings, unsampled-region feedback.

Scene idea: Dense older neighborhood under elevated rails or cables, improvised homes, narrow alleys, community lights, street vendors, and visible life despite neglect.

Mood: human, overlooked, vulnerable.

Composition notes: Avoid making it look villainous. It should feel under-resourced but alive.

### 9. `chapter1_day_report.png`
Use for: `day1-debrief`, `day2-debrief`, `day3-debrief`, DayReportPanel screens.

Scene idea: Desk with daily field reports, photo strips, district stamps, colored accuracy bars, and a small terminal printing model updates. Include “Day 1 / Day 2 / Day 3” as replaceable UI text only if easy, otherwise keep generic.

Mood: reflective, evidence review.

Composition notes: Works best as a reusable background for all debriefs.

### 10. `chapter1_model_training.png`
Use for: `verdict`, VerdictPanel.

Scene idea: Dark AI analysis chamber or terminal wall showing New Eden map, risk meters, accuracy charts, and district comparison bars. A paper case file remains in the foreground to preserve the human investigation layer.

Mood: final judgment, high stakes, machine verdict under scrutiny.

Composition notes: Use cold blue/teal with alert red accents. Leave panel-safe space in the center.

## Optional Transition/Overlay Assets

### 11. `chapter1_red_string_overlay.png`
Use for: subtle overlay when moving from briefing to planning.

Scene idea: Transparent PNG red-string network, pins, labels, and clue lines.

### 12. `chapter1_scanline_overlay.png`
Use for: AI reveal and verdict screens.

Scene idea: Transparent PNG scanlines, faint grid, glitch scratches, and small data fragments.

### 13. `chapter1_missing_data_stamp.png`
Use for: sampling failure moments.

Scene idea: Transparent red “MISSING DATA” or “UNSAMPLED” stamp.

## Suggested Upload Names

Upload images with these exact filenames if possible:

- `chapter1_case_room.png`
- `chapter1_boundary_lab.png`
- `chapter1_sampling_failure.png`
- `chapter1_city_map_table.png`
- `chapter1_uptown.png`
- `chapter1_downtown.png`
- `chapter1_factory_zone.png`
- `chapter1_slums.png`
- `chapter1_day_report.png`
- `chapter1_model_training.png`

Optional:

- `chapter1_red_string_overlay.png`
- `chapter1_scanline_overlay.png`
- `chapter1_missing_data_stamp.png`

## Image Generation Prompts

Style prompt for all images:

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, gentle cinematic lighting, cozy detective-adventure mood, subtle futuristic details, less photorealistic, less cyberpunk, less dark, not 3D render, wide 16:9 game background.

General negative prompt for all images:

Do not include readable text, logos, watermarks, UI buttons, speech bubbles, extra characters in the foreground, distorted hands, blurry faces, random letters, horror mood, heavy cyberpunk clutter, extreme darkness, harsh contrast, or pure black/white backgrounds. Keep the center and lower third relatively clean for game UI overlays.

### Prompt: `chapter1_case_room.png`

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, cozy detective-adventure mood, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. A detective case room in the evening. A warm amber desk lamp lights scattered paper case files, notebooks, coffee cup, old photographs, and a cork evidence board. The evidence board shows a friendly futuristic city map of New Eden with red string, pins, district photos, and handwritten-looking marks, but no readable text. A soft blue holographic city-grid projection glows gently on one wall, mixing human investigation warmth with AI technology. High detail around edges, lower center slightly calmer and cleaner for UI.

### Prompt: `chapter1_boundary_lab.png`

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, cozy detective-adventure mood, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. A detective desk transformed into a gentle AI analysis workspace. On the desk are warm paper case files, a ruler, pencil marks, and clipped photographs. Above the papers floats a soft blue holographic scatterplot with dots, axes, and a red dashed decision boundary line, like an AI model being manually inspected. The room should feel half old case-file archive and half friendly futuristic interface. Clean readable composition, central area not overcrowded for interactive UI overlays.

### Prompt: `chapter1_sampling_failure.png`

Polished animated storybook and anime film background style, clean outlines, warm colors with soft blue AI accents, charming hand-painted textures, soft shadows, readable composition, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. Create a clear teaching scene about sampling bias, not a city-zone map. On one side, show a small neat group of glowing data points or profile cards inside a bright transparent selection box, with no readable text. On the other side and in the background, show a much larger diverse population of faint data points, silhouettes, and profile cards that the selection box failed to include. A soft AI decision line or model boundary is trained around the small selected group, but visibly fails to cover the larger hidden population. Use gentle blue data grids, subtle purple glitch hints, and small red warning accents to show the discovery of missing representation. The feeling should be educational and revealing, not scary. No readable text.

### Prompt: `chapter1_city_map_table.png`

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, cozy detective-adventure mood, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. Overhead planning-table view. A large paper map of New Eden is divided into four visually distinct districts, with route pins, red strings, field notebooks, sample cards, budget tokens, detective tools, and small photo strips arranged around it. Soft holographic blue zone outlines and data traces hover over the map, as if the detective is planning field collection routes. Organized composition, calm center, suitable for UI controls.

### Prompt: `chapter1_uptown.png`

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, gentle city lighting, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. Uptown, the wealthy district of New Eden. Clean futuristic towers, polished walkways, glass storefronts, private security cameras, controlled lighting, warm gold reflections, tidy streets, and people moving calmly in the distance. It should look safe, privileged, well-maintained, and slightly sterile, as if it is heavily observed and overrepresented in the data. No readable signage.

### Prompt: `chapter1_downtown.png`

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, lively city lighting, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. A dense downtown district in futuristic New Eden. Crowded sidewalks, transit lines, apartment windows, mixed storefronts, soft neon reflections, people from different backgrounds moving through the scene, delivery vehicles, street vendors, and layered city life. The district should feel busy, varied, socially complex, and full of data diversity. Keep foreground not too busy for UI.

### Prompt: `chapter1_factory_zone.png`

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, gentle industrial lighting, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. The Factory Zone in the late evening. Industrial buildings, loading bays, soft steam vents, pipes, warm work lights, workers in safety vests leaving late shifts, cargo pallets, and a distant city skyline. The scene should feel hardworking and misunderstood, not criminal. Show why night activity could be normal here. No readable text.

### Prompt: `chapter1_slums.png`

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, gentle neighborhood lighting, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. An overlooked older neighborhood in New Eden. Dense housing under elevated rails and cables, narrow alleys, improvised repairs, community lights, small food stalls, laundry lines, residents in the distance, warm windows, and signs of life despite neglect. The mood should be vulnerable and human, not villainous or scary. Keep central lower area clean for UI.

### Prompt: `chapter1_day_report.png`

Polished animated storybook and anime film background style, clean outlines, warm colors, charming hand-painted textures, soft shadows, readable composition, cozy detective-adventure mood, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. A detective desk after a field mission. Daily reports, district photo strips, stamped folders, pinned sample cards, colored accuracy bars drawn on paper, a small friendly terminal printing model updates, and a map partially covered by notes. The atmosphere is reflective: the detective is reviewing what the data now reveals. No readable text or numbers.

### Prompt: `chapter1_model_training.png`

Polished animated storybook and anime film background style, clean outlines, warm colors balanced with soft blue AI light, charming hand-painted textures, soft shadows, readable composition, subtle futuristic details, less photorealistic, less cyberpunk, less dark, wide 16:9 game background. A final-verdict scene inside a clean AI analysis room. Large terminal walls show a holographic map of New Eden, risk meters, comparison bars, district panels, and gentle machine-analysis glow. In the foreground, keep a paper case file and detective notes visible to show the human investigation confronting the machine. High stakes but not horror, clean center for verdict UI, no readable text.

## Optional Overlay Prompts

### Prompt: `chapter1_red_string_overlay.png`

Create a transparent PNG overlay of red evidence strings, small brass pins, paper corners, and clue connection lines. No background, no readable text, no large objects. Designed to be layered over Chapter 1 backgrounds.

### Prompt: `chapter1_scanline_overlay.png`

Create a transparent PNG overlay of subtle AI scanlines, faint blue data grid, tiny glitch scratches, and digital noise fragments. No background, no readable text, low opacity feeling, designed to layer over AI reveal and verdict screens.

### Prompt: `chapter1_missing_data_stamp.png`

Create a transparent PNG overlay of a dramatic red case-file stamp reading "MISSING DATA" and a second variant feeling like "UNSAMPLED". Rough ink texture, slightly rotated, noir evidence-file style. Transparent background.
