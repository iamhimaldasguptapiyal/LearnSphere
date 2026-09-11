# LearnSphere

A frontend education and training platform built with Vue 3. Learners browse a course catalogue,
filter and search it, enrol through a validated form, tick lessons off as they go, and watch their
completion figures update on a personal dashboard.

**Deployed application:** [(https://storied-cajeta-6062db.netlify.app)_](https://storied-cajeta-6062db.netlify.app/)

---

## Table of contents

1. [Project overview](#project-overview)
2. [Technology stack](#technology-stack)
3. [Installation](#installation)
4. [Key features](#key-features)
5. [Project structure](#project-structure)
6. [Design decisions](#design-decisions)
7. [Accessibility](#accessibility)
8. [Deployment](#deployment)
9. [Requirement coverage](#requirement-coverage)
10. [Screenshots](#screenshots)

---

## Project overview

The problem domain is an **education / training platform**. The backend is assumed to already exist,
so the application consumes a mock JSON service (`public/data/courses.json`) over HTTP exactly as it
would consume a real REST API — asynchronously, with loading and error states around every request.

The application supports one continuous user journey:

> discover a course → read its detail → enrol with a validated form → track lesson completion →
> review overall progress on a dashboard

Everything the learner does is persisted to `localStorage`, so progress survives a page refresh.

---

## Technology stack

| Layer          | Choice                       | Why                                                        |
| -------------- | ---------------------------- | ---------------------------------------------------------- |
| Framework      | Vue 3 (Composition API)      | `<script setup>` keeps component logic compact and typed by convention |
| Build tool     | Vite 6                       | Fast dev server, automatic route-level code splitting       |
| Routing        | Vue Router 4                 | Client-side routing with lazy-loaded views                  |
| State          | Pinia 2 (setup stores)       | Same mental model as the Composition API, no boilerplate    |
| Styling        | Plain CSS with custom properties | One token layer drives light and dark themes without a framework |
| Formatting     | Prettier                     | Consistent code style                                       |

No UI library, CSS framework or charting library is used. The progress ring is hand-drawn SVG,
which keeps the production bundle at roughly **50 kB gzipped** for the initial route.

---

## Installation

Requires Node.js 20.19+ or 22.12+.

```bash
# 1. install dependencies
npm install

# 2. start the dev server (http://localhost:5173)
npm run dev

# 3. build for production
npm run build

# 4. preview the production build locally
npm run preview
```

Available scripts:

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start the Vite development server           |
| `npm run build`   | Produce an optimised build in `dist/`       |
| `npm run preview` | Serve `dist/` locally to verify the build   |
| `npm run format`  | Format `src/` with Prettier                 |

---

## Key features

### Navigation

- Six routes: home, catalogue, course detail (dynamic `:id`), my learning, profile, and a 404
  catch-all.
- Every view except the landing page is lazy-loaded, so each route ships as its own chunk.
- The document title updates per route; the router restores scroll position on back/forward.

### Catalogue browsing

- Free-text search across title, summary, instructor and tags, **debounced by 250 ms**.
- Filter by category, level and free-only; sort by popularity, rating, duration or title.
- A live region announces the result count as filters change.
- Distinct empty state when filters match nothing, separate from the error state.

### Data handling

- All requests go through `src/services/courseService.js`, the single seam that would be swapped
  for a real API.
- Three request states are rendered explicitly: **loading** (shimmer skeletons that match the real
  card footprint, so the layout does not jump), **error** (with a retry action), and **success**.
- A "Simulate a failed request" control on the catalogue page triggers the error path on demand, so
  the failure handling can be demonstrated rather than described.

### Enrolment

- Modal dialog containing a five-field form with per-field validation rules.
- Errors appear on blur or on submit, never while the user is still typing their first character.
- A failed submit renders an error summary, moves focus to it, and announces it via `role="alert"`.
- The form is pre-filled from the saved profile.

### Progress tracking

- Enrolled courses expose a lesson checklist; ticking a lesson updates the course progress bar, the
  dashboard donut, and the header count immediately.
- The dashboard groups courses into all / in progress / completed / not started with live counts.
- Reaching 100% triggers a confirmation toast.

### Interface

- Light and dark themes, initialised from `prefers-color-scheme` and remembered per browser.
- Toast notifications confirm every state-changing action.
- Responsive from 320 px upward: a hamburger drawer below 860 px, single-column cards below 620 px,
  and a sticky enrolment panel on wide screens only.

---

## Project structure

```
src/
├── assets/
│   └── main.css                 # design tokens, base styles, layout helpers
├── components/
│   ├── layout/                  # page chrome
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   ├── ui/                      # generic, domain-agnostic building blocks
│   │   ├── BaseButton.vue
│   │   ├── BaseBadge.vue
│   │   ├── BaseField.vue        # label + hint + error wiring for any control
│   │   ├── BaseModal.vue        # focus trap, Escape, scroll lock
│   │   ├── ProgressBar.vue
│   │   ├── ProgressDonut.vue    # hand-drawn SVG ring
│   │   ├── SkeletonCard.vue
│   │   ├── StarRating.vue
│   │   ├── StatTile.vue
│   │   ├── StateMessage.vue     # one component for empty and error states
│   │   └── ToastStack.vue
│   └── features/                # components that know about courses
│       ├── CourseCard.vue
│       ├── CourseFilters.vue
│       ├── EnrolmentForm.vue
│       └── LessonList.vue
├── composables/
│   ├── useCourseFilters.js      # search, filter, sort (view-local state)
│   └── useFormValidation.js     # validation engine + reusable rule builders
├── router/
│   └── index.js
├── services/
│   └── courseService.js         # the only place that talks to the network
├── stores/
│   ├── courses.js               # catalogue + request lifecycle
│   ├── enrolments.js            # enrolments + lesson progress (persisted)
│   ├── profile.js               # learner details (persisted)
│   └── ui.js                    # theme + toasts
├── views/                       # one component per route
│   ├── HomeView.vue
│   ├── CoursesView.vue
│   ├── CourseDetailView.vue
│   ├── MyLearningView.vue
│   ├── ProfileView.vue
│   └── NotFoundView.vue
├── App.vue
└── main.js

public/
├── data/courses.json            # mock API payload (12 courses, 58 lessons)
├── favicon.svg
└── _redirects                   # SPA fallback for Netlify
```

---

## Design decisions

**Three component tiers, and a rule for which is which.** `layout/` is page chrome, `ui/` components
know nothing about courses and could be lifted into another project unchanged, and `features/`
components are allowed to understand the domain. The test for a `ui/` component is whether the word
"course" appears anywhere in it; if it does, it belongs in `features/`.

**State lives at the lowest level that works.** Not everything belongs in a global store:

- _Component-local_ (`ref`): modal open/closed, the active dashboard tab, submitting flags.
- _Composable_: catalogue search and filters. This is view-local state with behaviour attached, so it
  lives in `useCourseFilters`. Two views could filter the same catalogue independently without
  interfering with each other — which would not be true if the filters sat in the store.
- _Pinia store_: data that genuinely crosses routes — the catalogue, enrolments, profile and theme.
  The header's enrolment count, the detail page's progress bar and the dashboard's donut all read the
  same store, which is exactly what makes them stay in step.

**Enrolments store ids, not course objects.** An enrolment record holds a `courseId` and the joining
to catalogue data happens in a computed property in the view. Copying course fields into the
enrolment would create a second source of truth that silently goes stale.

**One network seam.** Every request goes through `courseService.js`. Swapping the mock JSON for a
real backend is a one-file change. The service carries a deliberate 700 ms delay so the loading
states are observable rather than a single-frame flicker.

**Derived state over stored state.** Progress percentages, filter results, category lists and the
dashboard groupings are all `computed`. Nothing that can be calculated is stored, so nothing can
drift out of sync.

**Performance.** Route-level code splitting keeps the first load small; the search input is debounced
so the list is not re-filtered on every keystroke; `v-for` always has a stable `:key`; and derived
values are cached by `computed` rather than recalculated in the template.

**CSS custom properties instead of a framework.** Every colour, spacing step and radius is a token in
`:root`. Dark mode redefines the tokens and nothing else, which is why the whole interface themes
consistently instead of component by component.

---

## Accessibility

- Semantic landmarks throughout: `header`, `nav`, `main`, `footer`, `article`, `fieldset`/`legend`.
- A skip link that becomes visible on focus.
- Every form control has a real `<label for>`; hints and errors are linked with `aria-describedby`
  and invalid fields carry `aria-invalid`.
- The modal traps Tab, closes on Escape, restores focus to the trigger on close, and locks background
  scrolling.
- Status changes are announced: result counts and toasts sit in polite live regions, validation
  failures use `role="alert"`.
- Colour is never the only signal — enrolled state, completion and errors all carry text or icons.
- Focus is visible everywhere via a single `:focus-visible` rule.
- `prefers-reduced-motion` disables animation and transitions.
- The star rating exposes its value as text to screen readers rather than five star glyphs.

---

## Deployment

The project is a static SPA, so any static host works. Because the router uses HTML5 history mode,
**the host must rewrite unknown paths to `index.html`** or refreshing on `/courses/vue-essentials`
will return a 404. Configuration for the two easiest hosts is already committed.

### Netlify (recommended)

`netlify.toml` and `public/_redirects` are already in the repo.

1. Push the project to GitHub.
2. In Netlify choose **Add new site → Import an existing project** and pick the repository.
3. Build command `npm run build`, publish directory `dist`.
4. Deploy.

### Vercel

`vercel.json` already contains the rewrite rule. Import the repository; the Vite preset is detected
automatically.

### Verify after deploying

- [ ] Every route loads from the navigation bar.
- [ ] **Refresh the browser on `/courses/vue-essentials`** — it must load, not 404.
- [ ] The catalogue populates (the JSON is fetched, not bundled).
- [ ] Filters, search and sorting work.
- [ ] The enrolment form rejects invalid input and accepts valid input.
- [ ] Progress persists across a refresh.
- [ ] The layout is correct at 375 px width.

---

## Requirement coverage

| Requirement                       | Where it is implemented                                                    |
| --------------------------------- | -------------------------------------------------------------------------- |
| Multi-view navigation             | `src/router/index.js` — 6 routes incl. dynamic `:id` and 404 catch-all      |
| Client-side routing               | Vue Router 4, history mode, lazy-loaded views                               |
| Reusable component architecture   | `components/layout` · `components/ui` · `components/features`               |
| Local state                       | `ref` in views and components (modal, tabs, submitting)                     |
| Shared state                      | Pinia stores: `courses`, `enrolments`, `profile`, `ui`                      |
| Props / emits                     | `CourseCard`, `LessonList`, `EnrolmentForm`, `CourseFilters` (`defineModel`) |
| Composables                       | `useCourseFilters`, `useFormValidation`                                     |
| Mock data / API                   | `public/data/courses.json` fetched via `services/courseService.js`          |
| Asynchronous loading              | `async/await` in the service and the `courses` store                        |
| Loading state                     | `SkeletonCard.vue`, shown on every view that requests data                  |
| Error state                       | `StateMessage.vue` with retry; triggerable from the catalogue page          |
| Forms with validation             | `EnrolmentForm.vue`, `ProfileView.vue`, rules in `useFormValidation.js`     |
| Dynamic UI updates                | Search, filters, sort, toggle switch, tabs, modals, theme switch, toasts    |
| Responsive design                 | Mobile-first CSS, breakpoints at 620 / 720 / 860 / 940 px                   |
| Information hierarchy             | Consistent type scale and section headings in `assets/main.css`             |
| Consistent visual language        | Design tokens in `:root`, reused by every component                         |
| Accessibility                     | See [Accessibility](#accessibility)                                         |
| Feedback to user actions          | Toasts, progress updates, inline validation, loading labels                 |

---

## Screenshots

Sixteen screenshots of the running application are in [`screenshots/`](screenshots), captured at
1440 × 900 (desktop) and 390 × 844 (mobile) at 2× pixel density.

### Desktop

| # | Screen | File |
| - | ------ | ---- |
| 1 | Home — hero, headline figures, highest-rated courses | [`01-home-desktop.png`](screenshots/01-home-desktop.png) |
| 2 | Catalogue — search, filters, sort, 12 results | [`02-courses-desktop.png`](screenshots/02-courses-desktop.png) |
| 3 | Course detail — outcomes, lesson list, enrolment panel | [`03-course-detail-desktop.png`](screenshots/03-course-detail-desktop.png) |
| 4 | Enrolment modal — validation errors, summary focused | [`04-enrolment-validation-desktop.png`](screenshots/04-enrolment-validation-desktop.png) |
| 5 | My learning — progress ring, stat tiles, status filters | [`05-my-learning-desktop.png`](screenshots/05-my-learning-desktop.png) |
| 6 | Profile — validated form, interest chips, snapshot | [`06-profile-desktop.png`](screenshots/06-profile-desktop.png) |
| 7 | 404 — catch-all route | [`07-not-found-desktop.png`](screenshots/07-not-found-desktop.png) |
| 8 | Course detail, enrolled — lesson checklist and progress | [`08-course-progress-desktop.png`](screenshots/08-course-progress-desktop.png) |
| 9 | Catalogue, dark theme | [`09-courses-dark-desktop.png`](screenshots/09-courses-dark-desktop.png) |
| 10 | My learning, dark theme | [`10-my-learning-dark-desktop.png`](screenshots/10-my-learning-dark-desktop.png) |

### Mobile

| # | Screen | File |
| - | ------ | ---- |
| 11 | Home | [`11-home-mobile.png`](screenshots/11-home-mobile.png) |
| 12 | Catalogue with the navigation drawer open | [`12-courses-menu-open-mobile.png`](screenshots/12-courses-menu-open-mobile.png) |
| 13 | Catalogue — single-column cards, stacked filters | [`13-courses-mobile.png`](screenshots/13-courses-mobile.png) |
| 14 | Course detail | [`14-course-detail-mobile.png`](screenshots/14-course-detail-mobile.png) |
| 15 | My learning | [`15-my-learning-mobile.png`](screenshots/15-my-learning-mobile.png) |
| 16 | Enrolment modal as a bottom sheet | [`16-enrolment-modal-mobile.png`](screenshots/16-enrolment-modal-mobile.png) |

---

## Assessment documents

| Document | Format | Location |
| -------- | ------ | -------- |
| Reflection — 1,980 words, 5 pages | Word (.docx) | [`docs/Reflection - LearnSphere - Himal Das Gupta Piyal.docx`](<docs/Reflection - LearnSphere - Himal Das Gupta Piyal.docx>) |
| Contribution statement — 2 pages | Word (.docx) | [`docs/Contribution Statement - LearnSphere - Himal Das Gupta Piyal.docx`](<docs/Contribution Statement - LearnSphere - Himal Das Gupta Piyal.docx>) |

---

## Notes on the mock data

`public/data/courses.json` contains 12 fictional courses across four categories, 58 lessons in total.
It is served from `public/` rather than imported so that it travels over HTTP as a real API response
would — which is what makes the loading and error states meaningful rather than decorative.
