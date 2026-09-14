<!--
Sync Impact Report:
- Version change: 2.8.0 -> 2.9.0
- List of modified principles:
  - V. Strict Anti-Redundancy, DRY & Modular Maintainability (Zero-Redundancy & Single Source of Truth) — significantly expanded to enforce zero redundancy across state, components, types/schemas, utilities, network calls, and eliminate dead/duplicate code.
  - XIV. Compact Information Density & Restrained Typography Standard — streamlined to remove duplicate navbar alignment mention (now exclusively governed by Principle XVII).
- Added sections: None.
- Removed sections: None.
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ aligned)
  - .specify/templates/spec-template.md (✅ aligned)
  - .specify/templates/tasks-template.md (✅ aligned)
- Follow-up TODOs: None.
-->

# BPDP SARPRAS KELAPA FE Constitution

## Core Principles

### I. Vue 3 & Component-Driven Architecture
The application MUST be built using Vue 3 with `<script setup>` Single-File Components (SFCs). UI elements MUST be modular, reusable, composable, and strictly decoupled from domain business logic. Page views orchestrate component composition while reusable presentation components handle rendering, visual layout, and user interactions (aligned with the `@frontend-design` standard).

### II. Strict TypeScript & Schema Validation
TypeScript strict mode MUST be enforced across all codebase files. Explicit interfaces or type definitions MUST be defined for data models, API payloads, and component props. Runtime validation MUST be performed using Zod schemas for external API responses and form submissions (via VeeValidate). `any` types are prohibited unless explicitly justified.

### III. Mandatory Pinia State Management & API Integration Discipline
Pinia MUST be used as the single authoritative state management solution across all application modules, user sessions, commodities, multi-step registration forms, approval queues, and theme configurations. Local component state is limited to transient UI toggles. Direct API calls inside UI components are prohibited; all API actions and persistent domain states MUST be encapsulated within dedicated Pinia stores (`src/stores/`). Direct `localStorage` / `sessionStorage` manipulation outside of Pinia store plugins is strictly forbidden.

### IV. Modern UI/UX, Accessible Design & Visual Intentionality
The UI MUST leverage Tailwind CSS with curated design tokens, avoid generic/templated browser defaults, and reflect intentional visual polish. UI components MUST maintain seamless dark/light theme harmony, clear visual hierarchy, accessible contrast, smooth micro-interactions, responsive layouts, and intuitive user feedback via reactive Vue Toast notifications and styled alert banners.

### V. Strict Anti-Redundancy, DRY & Modular Maintainability (Zero-Redundancy & Single Source of Truth)
Redundancy in code, state, types, UI components, and assets is STRICTLY PROHIBITED across the codebase. Every concept, entity, and domain logic MUST have a single, unambiguous, authoritative representation:
- **Zero Redundant State (Single Source of Truth)**: State MUST NOT be duplicated across stores or copied between Pinia stores and component local state. Derived data MUST be computed reactively (`computed()` / Pinia getters) rather than stored in redundant state variables.
- **Zero Redundant UI Components & Duplication**: Creating duplicate or cloned modal components, form controls, action bars, or table layouts is forbidden. Reusable components with props, slots, and composition MUST be leveraged.
- **Zero Redundant Type Definitions & Schemas**: TypeScript interfaces, types, and Zod schemas MUST NOT be redefined across multiple files; shared models and DTOs MUST reside in central type/schema directories.
- **Zero Redundant Utilities & Formatters**: Currency formatting (`formatRupiah`), date formatting (`formatDate`), status badge mappers, and file size helpers MUST be centralized in `src/utils/` and reused universally, never re-implemented inline.
- **Zero Redundant API Calls & Network Deduplication**: Redundant, repetitive HTTP requests fetching identical datasets MUST be avoided through store caching and coordinated lifecycle triggers.
- **Dead Code & Zombie Artifact Elimination**: Unused imports, obsolete mock fallbacks after real API wiring, dead variables, and redundant wrapper layers MUST be immediately pruned. Unnecessary abstractions and premature optimizations (YAGNI) are prohibited.

### VI. Breadcrumb Navigation Standard
Every menu, view, and sub-page MUST include an accessible, interactive Breadcrumb Navigation component (`Breadcrumb.vue`) at the top of the content workspace area. Breadcrumbs MUST clearly reflect the active route hierarchy (e.g. `Home > Overview` or `Home > Antrean Validasi`) and support direct clickable navigation back to parent routes.

### VII. Mandatory Mobile-First & Responsive Design Standard
Every UI layout, module, modal, bento card grid, table, form, and header/sidebar component MUST be engineered starting from mobile viewports (375px) first, then progressively enhanced for larger viewports. Styles MUST be written with a mobile-first approach where default Tailwind classes define the mobile presentation, and responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) are used strictly to adapt layouts upward for tablets and desktops. Mobile viewports MUST never exhibit horizontal window overflow, clipped text, or broken layout structures, and all interactive elements MUST support touch-friendly targets of at least 44x44px.

### VIII. Mandatory Form Field Validation Standard
Every form input, select box, text area, file upload, and authentication field across all modules MUST feature strict, real-time client-side validation. Form inputs MUST display clear, contextual error messages when required fields are empty, when formats are invalid (e.g. invalid email syntax, NIK length less than 16 digits, invalid phone numbers), and prevent form submission until all field validation rules are satisfied.

### IX. Strict Backend API Error Response Fidelity Standard
All service layer modules and UI components MUST strictly observe, honor, and propagate HTTP error responses (`401 Unauthorized`, `403 Forbidden`, `422 Unprocessable Entity`, `500 Internal Error`) returned by the backend API. HTTP error responses from the backend MUST NEVER be silently swallowed, caught into mock fallbacks, or bypassed. The frontend MUST extract the exact error message from the backend response envelope (`message` / `error`) and present clear error feedback to the user via Toaster notifications.

### X. UI/UX Pro Max Design System & Accessibility Standard
All UI designs, theme tokens, color palettes, and interactive components MUST adhere to the `@ui-ux-pro-max` intelligence system:
- **WCAG AA Compliance**: Ensure high text-to-background contrast ratios in both Light Mode (`bg-white` / `bg-gray-50`) and Dark Mode (`bg-[#121316]` / `bg-[#18191c]`).
- **Typography & Font Weight Discipline**: Maintain strict typography hierarchy with `font-medium` and `font-semibold` weights (never use `font-bold` or `font-extrabold`).
- **Micro-Animations & Transitions**: Apply subtle transition classes (`transition-all duration-200`, `backdrop-blur-md`, `active:scale-95`) for interactive buttons, modals, dropdowns, and cards.
- **Curated Color Identity**: Primary brand color `#066C2A` (Forest Green) MUST be consistently paired with harmonious emerald accents and refined slate/zinc neutrals across both themes.

### XI. Mandatory Vue Toaster Notification Standard
Native browser dialogs (`alert()`, `confirm()`, `prompt()`) are STRICTLY PROHIBITED across all components, composables, views, and services. All user alerts, success confirmations, validation warnings, and error messages MUST be delivered exclusively via the reactive Vue Toaster system (`useToast()` / `ToastContainer.vue`). Toasts MUST feature appropriate severity styling (`success`, `error`, `warning`, `info`), SVG vector iconography, smooth auto-dismiss transitions (4000ms), manual close controls, and full dark/light theme compatibility.

### XII. Mandatory Lazy Loading & Skeleton Loader Standard
All page views, heavy modal components, router routes, data-driven workspace cards, metric grids, and table views MUST enforce dynamic imports (`defineAsyncComponent` / `() => import(...)`) and skeleton loading state primitives (`Skeleton.vue`). Components fetching asynchronous data, undergoing role switches, or awaiting store hydration MUST render animated Skeleton Loader primitives (`Skeleton.vue`) matching the layout geometry to prevent Cumulative Layout Shift (CLS), eliminate blank white screens, and guarantee polished perceived performance.

### XIII. Mandatory Backend Contract Verification Standard
Before implementing, wiring, or modifying any real (non-mocked) API integration against the `bpdp-iam-be` backend, the sibling `bpdp-iam-be` repository's actual source code (route registration, handler, DTO/request struct, response model, and auth middleware requirements) MUST be directly inspected to confirm the endpoint exists and to determine its exact request body, payload shape, response shape, and authentication/authorization requirements. Assumed, guessed, or documentation-only endpoint shapes are prohibited when the sibling repository is available on disk. Findings MUST be captured in a `contracts/*.md` file under the relevant `specs/<feature>/` directory before implementation begins, so the verified contract is durable and reviewable rather than only living in a chat transcript. If a needed endpoint does not exist on the backend, the frontend MUST NOT invent a plausible-looking path; it MUST either target the closest confirmed-real endpoint, or clearly document the integration as client-simulated with the specific, verified reason (e.g. "no such route exists," "requires auth this flow cannot obtain"), following the fallback/documentation conventions already established in `vendor.service.ts`, `user.service.ts`, and `auth.service.ts`.

When a requested new page or feature has no confirmed backend endpoint at all after this verification step, the request MUST NOT be blocked or left unbuilt: the page/UI MUST still be delivered as a clearly-labeled mockup backed by client-simulated data (matching the pattern already established by the Sarpras mockup, `specs/015-sarpras-static-mockup`), with an explicit code comment and a note in the feature's spec/plan documenting the confirmed backend gap and what a real integration would require. Real integration replaces the mockup only once the backend actually exposes the needed endpoint — verified again per this same principle, not assumed to have appeared.

### XIV. Compact Information Density & Restrained Typography Standard
Every page layout, workspace card, form control, metric grid, and navigation header MUST observe compact information density and restrained typography scaling to prevent visual clutter and overwhelmed viewports:
- **Restrained Font Scaling**: Base body text MUST maintain a clean, readable size (`13px` - `14px`), with card titles and section headers kept restrained (`15px` - `18px`). Hardcoded large pixel font sizes (e.g., 40px/34px headings) in CSS utility classes are strictly prohibited.
- **Normal Form Controls & Buttons**: Form inputs, select boxes, file dropzones, and buttons MUST maintain comfortable, standard heights (`h-9` to `h-10` / 36px-40px) and clean, professional border radii (`rounded-lg` / 8px) without being bloated or pill-shaped.
- **Restrained Spacing & Whitespace**: Workspace containers and card bodies MUST utilize balanced, compact paddings (`p-4` to `p-6`) to present dense, scannable data without wasteful empty margins.

### XV. Mandatory Localization & Wording Externalization Standard
All user-facing copy, labels, workflow status messages, alerts, toaster alerts, page descriptions, form field labels, and validation error messages MUST be externalized into central localization/language configuration files (such as `src/config/localization.ts` or module-level config directories). Hardcoding literal Indonesian or English text strings directly inside Vue component templates, Pinia store computed strings, or router metadata title strings is prohibited. Every wording amendment MUST be performed inside the central configuration file, keeping views and templates purely presentation-driven and easily configurable.

### XVI. Strict Prohibition of Nested Modals (Single-Modal & Sequential UX Standard)
Opening a modal dialog on top of another open modal dialog (nested, stacked, or chained modals) is STRICTLY PROHIBITED across all application views and workflows. Stacked modals introduce severe UI/UX antipatterns, focus-trapping bugs, z-index layering conflicts, backdrop scrolling lockouts, and broken responsiveness on mobile screens.

When a secondary action, sub-form, document picker, or confirmation is required from within an active modal:
1. **In-Modal Step Transitions (Steppers/Wizards)**: Transition between step views within the single, active modal container using reactive view states.
2. **Inline Expandable / Collapsible Sections**: Use inline accordion drawers, expandable table rows, or collapsible panels directly inside the modal body.
3. **Sequential Dialog Flow**: If a secondary dialog (e.g. destructive confirmation) is strictly necessary, the parent modal MUST either handle the confirmation inline or be fully closed/transitioned before opening the new dialog.
4. **Dedicated Route/Page Navigation**: For complex sub-tasks, multi-tab forms, or detailed sub-entity creations, navigate the user to a dedicated full-page sub-route rather than compounding modal layers.

### XVII. Mandatory Component & Navbar Horizontal Alignment Standard
Every page view, workspace card, top banner, filter container, metric grid, data table, and action bar across the application MUST strictly align flush horizontally with the floating navbar container (`DesktopHeader.vue` / `mx-4 lg:mx-6` on desktop, `mx-3` on mobile). Misaligned left/right margins, stray padding offsets, or arbitrary container widths that do not line up with the navbar edges are strictly prohibited.

- **Desktop Alignment (`md:` / `lg:`)**: Content views and floating workspace cards MUST maintain uniform horizontal positioning (`mx-4 lg:mx-6` or wrapped in a parent container with `px-4 lg:px-6`) matching the navbar's geometry precisely.
- **Mobile Alignment**: Mobile views MUST maintain consistent horizontal padding (`px-3` or `mx-3`) matching the mobile header bar (`App.vue` mobile header).
- **Prohibition of Stray Margins**: Arbitrary asymmetrical paddings (e.g. `pl-8 pr-2`), rogue `max-w-*` wrappers without proper centering, or cards sticking directly to viewport edges without the standard margin are forbidden.
- **Full-Width Element Harmony**: Sticky bottom action bars, floating filter cards, and table pagination containers MUST honor the same left/right bounding lines as the floating navbar header.

## Security & Authentication Standards

All frontend routes handling sensitive identity/access management functionality MUST be protected by Vue Router navigation guards. JWT tokens or session credentials MUST be securely stored and attached via Axios request interceptors. Token refresh mechanisms and graceful session expiration redirects MUST be strictly implemented and tested.

## Development & Quality Workflow

All code MUST pass type checking (`vue-tsc -b`) and production build validation (`vite build`) prior to merging. Code changes MUST adhere to clean code formatting, descriptive commit messages, and structured review processes. Automated unit testing is explicitly NOT required and MUST NOT be introduced or expanded as a project convention going forward; correctness of stores, service mappers, and utility functions MUST instead be verified through TypeScript strict-mode type safety, manual verification against the running application, and structured code review before merge.

## Governance

This Constitution supersedes all informal development practices for BPDP SARPRAS KELAPA FE. Any proposed changes to these principles or governance policies require explicit documentation, team consensus, and a semantic version increment:
- **MAJOR**: Structural policy changes, principle removals, or fundamental architectural shifts.
- **MINOR**: Addition of new principles, standards, or workflow sections.
- **PATCH**: Non-semantic clarifications, typo fixes, or wording updates.
- **Version**: 2.9.0 | **Ratified**: 2026-07-21 | **Last Amended**: 2026-09-01
