# Research: Workflow Pipeline Dashboard (Eye-Catching & Premium)

## Decision: Layout & Connectivity
- **Desktop/Tablet Layout (>= 1024px)**: We will use a structured 4-column Grid layout matching the requested topology:
  - Row 1: Stages 1 -> 2 -> 3 -> 4 (left-to-right flow)
  - Row 2: Stages 8 <- 7 <- 6 <- 5 (right-to-left flow)
  - Row 3: Stages 9 -> 10 (left-to-right flow)
- **Mobile Layout (< 1024px)**: Transition to a clean, vertical timeline/step list. Trying to force a complex grid flow with horizontal/vertical connecting arrows on small screens is an anti-pattern that creates horizontal scroll issues and layout breaking.
- **Connectors**:
  - We will render CSS-based connector lines/arrows using absolute positioning. For horizontal flows, right-pointing or left-pointing chevron SVG shapes will sit between the columns.
  - For vertical steps down (from Stage 4 to 5, and Stage 8 to 9), we will render curved line shapes or downward chevrons on the outer edges.

## Rationale & Visual Polish (/ui-ux-pro-max & /frontend-design)
To achieve an "eye-catching" and premium look that adheres to the *BPDP SARPRAS KAKAO FE Constitution*:
1. **Glassmorphism & Depth**: Cards will feature a modern semi-transparent glass style in dark mode, and a soft shadow, fine-bordered clean zinc/emerald background in light mode (`bg-white/80 dark:bg-slate-900/60 backdrop-blur-md`).
2. **Typography Discipline**: Standard base scaling (`13px-14px` for body/numbers, `15px` for headers) with strict compliance with **no bold/extrabold weights**. We will only use `font-medium` and `font-semibold`.
3. **Curated Color Identity**: Forest Green (`#066C2A`) as primary active accents, soft emerald for success states, and subtle warm amber/slate highlights to create depth.
4. **Micro-Animations**: Add custom transition classes (`transition-all duration-300 ease-out active:scale-95 hover:-translate-y-1 hover:shadow-lg hover:border-[#066C2A]/30`) on card hovers.
5. **Interactive Indicators**: Cards will display a subtle, glowing status dot or colored bar on the side matching their current activity or relevance to the logged-in user.

## Alternatives Considered
- *Using a canvas/SVG library like Mermaid or jointjs*: Rejected. It introduces unnecessary dependencies (violating Constitution Principle V - Simplicity/YAGNI) and makes customized styling (hover animations, card navigation, dynamic metrics updating) difficult to maintain in Vue 3 SFC.
- *Simple linear list everywhere*: Rejected for desktop. The user explicitly requested "buatkan dashboard seperti ini untuk role tertera di gambar" which clearly displays a looped pipeline.
