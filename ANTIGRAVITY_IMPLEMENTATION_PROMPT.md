# Expert Verticals — Antigravity Implementation Brief

You are working as the implementation agent for the existing Expert Verticals website.

Live site: https://samiwazir-x.github.io/expert-verticals-website/index.html

Repository: https://github.com/samiwazir-x/expert-verticals-website

Reference sites for information architecture only:

- https://amna.pk/
- https://www.haseenhabibcorp.com/
- https://merin.com.pk/merin-privated-limited/schindler/

Implement the changes directly in the existing repository. Inspect the codebase before editing, preserve the current framework and file organization, create a pre-change Git checkpoint, make the changes, test them, and commit the finished implementation. Do not deploy unless explicitly instructed.

## Non-negotiable preservation rules

Keep the existing visual system, layout language, responsive behavior, typography, navigation behavior, grids, spacing rhythm, technical numbering, reveal effects, floor navigation, modernization slider, and interactive patterns.

The current homepage hero is locked. Do not alter its markup, copy, dimensions, layout, animation, WebGL/Three.js scene, canvas, shaders, timing, scroll behavior, loading behavior, event handling, assets, CSS selectors, or JavaScript functions. Record the relevant hero files and baseline checksums before editing, then verify that they remain unchanged afterward.

Retain the existing graphite/charcoal background, warm off-white text, brushed-steel neutrals, restrained signal-red accent, and current Archivo/Inter/IBM Plex Mono typography. Do not redesign the site, replace its components, introduce a new framework, or imitate Apple’s branding. “Apple-like” means only concise copy, generous breathing room, strong hierarchy, and one clear idea per section.

Only modify content and the minimum markup/CSS/JavaScript required to add the requested sections, page, navigation links, imagery, accessibility, and responsive behavior. Do not perform unrelated refactoring.

## Product positioning

Present Expert Verticals as an engineering-solutions company with two equally important verticals:

1. Elevators & Vertical Mobility
2. Fire Fighting & Life Safety

Fire fighting must be immediately visible and prominent on the homepage, not buried under a generic services section. Neither vertical should visually dominate the other.

## Asset installation

An asset bundle named `expert-verticals-antigravity-assets` accompanies this prompt. Copy/merge its `assets` directory into the repository root. Preserve these exact production paths:

### Photography and technical illustration

- `assets/images/fire-integrated-systems.webp` — primary homepage fire-fighting image and principal fire page image
- `assets/images/fire-integrated-systems-1200.webp` — responsive 1200 px rendition
- `assets/images/fire-integrated-systems.png` — full-resolution fallback/source
- `assets/images/fire-sprinkler-hydrant-engineering.webp` — secondary fire page image
- `assets/images/fire-sprinkler-hydrant-engineering-1200.webp` — responsive 1200 px rendition
- `assets/images/fire-sprinkler-hydrant-engineering.png` — full-resolution fallback/source
- `assets/images/traction-elevator-cutaway.png` — primary elevator engineering cutaway
- `assets/images/traction-elevator-cutaway-minimal.png` — alternate transparent/minimal cutaway; use only if it integrates better on a dark technical block

Use `<picture>`, `srcset`, explicit dimensions/aspect ratio, and lazy loading below the fold. Prefer WebP for the fire photographs. Do not show both elevator cutaways in the same section. Do not crop away the engineer or the negative space in the primary fire image.

### Elevator icons

Use the editable SVG files from `assets/icons/elevators/`:

- `passenger-elevator.svg`
- `hospital-bed-elevator.svg`
- `freight-elevator.svg`
- `panoramic-elevator.svg`
- `dumbwaiter.svg`
- `vehicle-elevator.svg`
- `escalator.svg`
- `elevator-modernization.svg`
- `preventive-maintenance.svg`

### Fire-fighting icons

Use the editable SVG files from `assets/icons/fire/`:

- `active-fire-suppression.svg`
- `detection-alarm.svg`
- `portable-equipment-ppe.svg`
- `specialized-fleet.svg`
- `consultancy-training.svg`

Keep SVG icons as SVG, preserve their transparent backgrounds, and give decorative icons empty alt text or `aria-hidden="true"`. Do not recolor them outside the existing off-white/brushed-silver and restrained signal-red system.

If the bundle or any named file is missing, stop and report the exact missing path. Do not replace it with stock imagery, placeholders, or unrelated generated assets. Never reference the local upload path in production HTML.

## Navigation and URLs

Keep all existing working URLs and pages. Add a visible `Fire Fighting` navigation item linking to `fire-fighting.html`. Retain existing elevator links and the current mobile navigation behavior. Recommended top-level labels, adjusted only if the existing information architecture requires it:

`Home` · `About` · `Elevators` · `Fire Fighting` · `Industries` · `Maintenance` · `Projects` · `Procurement` · `Contact`

Do not delete existing Government/Public Sector content. Keep it accessible through Procurement, Industries, or the footer if it is no longer a top-level label.

## Homepage content order

Leave the hero exactly where and how it is. Directly after the existing hero, create or revise the homepage flow in this order:

1. Two Engineering Verticals
2. Elevators & Vertical Mobility
3. Fire Fighting & Life Safety
4. Engineering Lifecycle
5. Industries
6. Maintenance
7. Institutional Procurement
8. Contact / request proposal

Keep total homepage body copy approximately 550–750 words. Headings should normally be no more than eight words. Supporting paragraphs should normally be no more than 30 words. Card descriptions should normally be no more than 18 words. Avoid more than two paragraphs or two calls to action in one section.

### 1. Two Engineering Verticals

Heading: `One standard. Two critical systems.`

Supporting line: `Vertical mobility and fire-life safety, coordinated from design through long-term maintenance.`

Show two balanced cards or panels:

- `Elevators & Vertical Mobility` — `Passenger, hospital, freight, panoramic and specialized mobility systems.`
- `Fire Fighting & Life Safety` — `Suppression, detection, emergency equipment, specialized fleet and managed compliance.`

Each card needs one understated link: `Explore elevators` and `Explore fire fighting`.

### 2. Elevators & Vertical Mobility

Heading: `Movement, engineered.`

Body: `Solutions for commercial, healthcare, residential, industrial and infrastructure environments—planned around capacity, traffic, safety and lifecycle performance.`

Use the nine elevator SVG icons in a clean responsive grid. Keep labels concise:

`Passenger` · `Hospital Bed` · `Freight` · `Panoramic` · `Dumbwaiter` · `Vehicle` · `Escalator` · `Modernization` · `Maintenance`

Use the traction cutaway once in a dedicated engineering block with the existing numbered-marker visual language. Do not add invented technical specifications.

Primary CTA: `Explore elevator solutions`

### 3. Fire Fighting & Life Safety

This must be one of the most visible post-hero sections. Use `assets/images/fire-integrated-systems.webp` as the principal image, maintaining the image’s dark negative space for the heading.

Eyebrow: `FIRE FIGHTING & LIFE SAFETY`

Heading: `Protection, engineered in.`

Body: `Integrated systems for detection, suppression, response and ongoing readiness across complex buildings and critical facilities.`

Show five concise categories with the supplied fire SVG icons:

- `Active Fire Suppression` — `Sprinklers, hydrants, hose reels, clean agents, foam and deluge systems.`
- `Detection & Alarm` — `Conventional, addressable and specialist detection for fast, precise warning.`
- `Portable Equipment & PPE` — `Extinguishers, refilling support and protective equipment for first response.`
- `Specialized Fleet` — `Fire tenders and response vehicles specified for institutional and industrial needs.`
- `Consultancy & Training` — `Hazard analysis, design, audits, maintenance and practical emergency readiness.`

Primary CTA: `Explore fire fighting`

Secondary CTA: `Request a consultation`

### 4. Engineering Lifecycle

Heading: `From brief to lifecycle.`

Use a minimal numbered sequence:

`01 Assess` · `02 Engineer` · `03 Supply` · `04 Install` · `05 Commission` · `06 Maintain`

Supporting line: `A coordinated path from early risk and traffic analysis to dependable long-term operation.`

### 5. Industries

Heading: `Built around the environment.`

Use concise labels only:

`Commercial` · `Healthcare` · `Residential` · `Industrial` · `Data & Telecom` · `Hospitality & Retail` · `Oil & Gas` · `Government & Infrastructure`

### 6. Maintenance

Heading: `Performance after handover.`

Body: `Preventive maintenance, inspection, testing and service planning for vertical-mobility and fire-life-safety assets.`

Keep the existing modernization slider and interactive behavior unchanged. Extend content carefully if needed so both verticals are represented.

### 7. Institutional Procurement

Heading: `Specified for serious procurement.`

Body: `Clear scopes, technical submissions, coordinated delivery and lifecycle support for public and private-sector projects.`

Do not claim procurement frameworks, approvals, clients, tenders won, or government relationships that are not already documented in the repository.

### 8. Contact

Heading: `Let’s define the requirement.`

Keep the current email-based proposal handoff. Add a required `Solution type` control with:

- `Elevators & Vertical Mobility`
- `Fire Fighting & Life Safety`
- `Integrated / Both`

Support query parameters from CTAs, for example `contact.html?solution=fire-fighting`, and preselect the appropriate option. Do not add uploads unless a secure backend already exists.

## Dedicated Fire Fighting page

Create `fire-fighting.html` using existing page templates and components. Keep it minimal and editorial, not catalogue-like.

Recommended flow:

1. Compact page masthead: `Fire Fighting & Life Safety`
2. Short value statement: `Detection, suppression and readiness—engineered as one coordinated system.`
3. Primary image: `assets/images/fire-integrated-systems.webp`
4. Five service sections using the supplied icons
5. Secondary image: `assets/images/fire-sprinkler-hydrant-engineering.webp`
6. Lifecycle strip: `Assess · Design · Supply · Install · Commission · Maintain`
7. Industries served
8. CTA: `Discuss a fire-safety requirement`

Use this concise factual scope:

### Active Fire Suppression

- Water sprinkler systems
- Fire hydrant and hose-reel systems
- Clean-agent and gas suppression for sensitive environments
- Foam and deluge systems for higher-risk applications

### Detection & Alarm

- Conventional and addressable fire-alarm systems
- Smoke, heat, flame and gas detection where appropriate

### Portable Equipment & PPE

- Fire extinguishers across appropriate media/classes
- Inspection, maintenance and refilling support
- Fire-resistant suits, gloves, boots, breathing apparatus and fire blankets

### Specialized Fleet

- Fire tenders and rapid-intervention vehicles
- Industrial foam tenders and airfield response vehicles where project scope requires them

### Consultancy, Inspection & Training

- Hazard analysis and system design
- Functional testing, pressure testing, audits and maintenance planning
- Evacuation drills and equipment-handling training

Use careful language such as `designed to applicable project requirements and codes`. Do not claim a specific code, certification, approval, distributorship, manufacturing capability, client, fleet delivery, or regulatory authorization unless verified in existing source material.

## Elevator content safeguards

Retain all existing elevator content and URLs unless consolidating duplicate copy. Present product categories, modernization, maintenance, specification support, installation and commissioning. Do not claim a Schindler or other OEM partnership unless the existing repository contains explicit, verifiable authorization. Do not copy competitor wording or imagery.

## Accessibility, SEO and performance

- Use semantic headings in logical order and landmark elements.
- Provide concise, useful alt text for meaningful images.
- Preserve visible keyboard focus, skip links, and keyboard operation.
- Honor `prefers-reduced-motion`; do not degrade the locked hero implementation.
- Maintain WCAG AA contrast.
- Add or update page titles, meta descriptions, canonical URLs, Open Graph data, and internal links for the fire page.
- Keep all asset and navigation paths relative and compatible with GitHub Pages project hosting.
- Avoid layout shift with width/height or `aspect-ratio`.
- Lazy-load below-the-fold raster imagery.
- Do not add heavy dependencies.

## Required verification

Before committing:

1. Compare the homepage hero against baseline checksums and confirm no hero-related diff.
2. Run the project’s existing lint/build/test commands.
3. Check every internal link and image path under the GitHub Pages subdirectory context.
4. Verify desktop and mobile layouts at approximately 1440, 1024, 768, 390 and 360 px widths.
5. Confirm mobile navigation, all CTAs, contact query preselection, modernization slider, scroll/reveal behavior and reduced-motion behavior.
6. Check for console errors and missing assets.
7. Confirm that fire fighting is visible without excessive scrolling after the locked hero.
8. Confirm there are no fabricated claims, copied competitor copy, placeholder text, logos or watermarks.

## Final response

Return:

- a concise implementation summary;
- the exact files changed and created;
- the final production asset paths used;
- tests/checks run and their results;
- confirmation that the hero and its animation were unchanged;
- screenshots at desktop and mobile sizes if the environment supports them;
- the Git commit hash.

Do not deploy or publish without explicit authorization.
