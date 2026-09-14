# Research & Decisions: Active Sidebar & Aligned Breadcrumbs

## Phase 0: Outline & Research

### Decision 1: Metadata-driven Navigation Mapping

* **Decision**: We will use Vue Router's `meta` configuration to establish the relationship between sub-pages/sub-sub-menus and their parent sidebar menu items. Specifically, we will add an `activeMenu` string property and a `title` string property to the route metadata.
* **Rationale**: This is the standard Vue Router pattern for managing navigation highlights. It decouples components from route paths and avoids hardcoding route matching logic in the sidebar layout.
* **Alternatives Considered**:
  * *URL Pattern Matching*: Relying purely on URL prefix matching (e.g., `/bpdp/antrean` matches `/bpdp/`). This was rejected because the path structure is not strictly consistent (e.g. `/bpdp/antrean` is the parent but detailed pages are at `/bpdp/ceki/:id`, which do not share the `/bpdp/antrean` sub-path).

---

### Decision 2: Shared Navigation Structure

* **Decision**: Move the navigation structure definition (`navSections` and role-based filtering logic) from `Sidebar.vue` to a shared composable `src/composables/useNavigation.ts`.
* **Rationale**: This allows both `Sidebar.vue` and `Breadcrumb.vue` to access the exact same navigation hierarchy, ensuring breadcrumbs are dynamically synchronized with role-based changes to sidebar section titles and menu labels.
* **Alternatives Considered**:
  * *Duplicating sections*: Keep the sections in `Sidebar.vue` and copy a static list into `Breadcrumb.vue`. Rejected because it violates the DRY principle and will result in stale breadcrumbs when sidebar labels are updated.

---

### Decision 3: Smart Automatic Breadcrumbs Component

* **Decision**: Refactor `Breadcrumb.vue` to support automatic, dynamic breadcrumb generation if the `items` prop is omitted.
  * If the `items` prop is passed, use it (ensures zero regression and backward compatibility).
  * If the `items` prop is absent, dynamically lookup the current route's `activeMenu` and match it against the navigation sections to construct:
    * `Beranda` (Home)
    * `Section Title` (e.g. "DINAS PROVINSI")
    * `Item Label` (e.g. "Verifikasi & Rekomtek (Prov)")
    * `Current Page Title` (from `route.meta.title` or a fallback)
* **Rationale**: This drastically reduces boilerplate. Instead of manually declaring breadcrumb arrays in 25 different Vue files, we define them centrally in the router configuration.
* **Alternatives Considered**:
  * *Manual update in all views*: Writing breadcrumb arrays individually in all 25 Vue views. Rejected due to high maintenance overhead and potential inconsistencies.
