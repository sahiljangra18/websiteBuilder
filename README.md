# Page Studio - Schema-driven Page Management

A premium Page Studio built with **Next.js (App Router)**, **TypeScript**, **Redux Toolkit**, and **Contentful**.

## Getting Started

### 1. Installation
Clone the repository, enter the directory, and install dependencies:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The landing page automatically redirects to `/preview/home`.

### 3. Run Tests
- **Unit Tests (Vitest)**: `npm run test`
- **E2E & Accessibility Tests (Playwright + Axe)**: `npm run e2e`

---

## 1. Architecture Overview

The system architecture cleanly decouples the layout content adapter from the interactive editor and rendering pipeline:

1. **Contentful Client Adapter** (`src/lib/contentfulClient.ts`): Queries Contentful Page schemas or transparently falls back to an offline local mock database if no environment credentials are set.
2. **Registry Renderer** (`src/registry/sectionRegistry.ts`): Houses Zod schemas for all landing page section blocks (`hero`, `featureGrid`, `testimonial`, `cta`).
3. **Graceful Section Errors** (`src/components/sections/SectionWrapper.tsx`): Evaluates section payloads against Zod validation schemas. Unsupported sections render as `UnsupportedSection`, and invalid props render inline configuration warnings rather than crashing the page.
4. **Editor Redux Store** (`src/store/index.ts`): Centralized Redux state for layout draft editing, properties configuration, undo/redo history, and publish state.
5. **RBAC Protection** (`src/middleware.ts` & Server Actions): Simulates viewer, editor, and publisher roles using simulated cookies. Restricts access to `/studio` and the Server Action `publishPage`.

---

## 2. Redux Slice Responsibilities

The editor state is split into three key domains:
- **`draftPage`**: Manages the mutable layout section structures. Handles adding, deleting, reordering (via Up/Down accessibility buttons), and updating section field properties. Persists drafts to `localStorage` to survive browser reloads.
- **`ui`**: Tracks selected section IDs, device mock mode (Desktop vs. Mobile), and simulated role cookies (`viewer`, `editor`, `publisher`).
- **`publish`**: Controls request indicators, success states, and calculated release changelogs.

---

## 3. Contentful Model & Adapter Explanation

The Contentful integration employs the adapter pattern:
- decoupling Contentful-specific structures (`Entry<any>`) from the UI.
- The adapter output conforms to the TypeScript `Page` interface (`pageId`, `slug`, `title`, `sections: Section[]`).
- Fallback mock data allows the application to run offline or pre-configured, matching published layouts and draft changes.

---

## 4. Publish & SemVer Logic

Releases are calculations comparing the current draft layout against the last version snapshot:
- **Patch (0.0.1)**: Modified text fields, button titles, or URLs on existing sections.
- **Minor (0.1.0)**: Added new sections or optional layout properties.
- **Major (1.0.0)**: Deleted sections, modified a section's core block type, or broke validation on a required property (e.g., removing a Hero's title).
- **Idempotency**: If the draft matches the latest frozen snapshot, the publish flow completes without recording a new version.
- **Snapshots**: Saved as immutable JSON records under `releases/<slug>/<version>.json`.

---

## 5. Accessibility Evidence

The workspace complies with WCAG 2.2 AAA guidelines:
- **Keyboard Navigation**: Focus loops and reorder operations are handled via explicit move buttons rather than inaccessible drag-and-drop structures.
- **Skip Links**: Accessible anchors are provided to jump directly to page workspaces.
- **Visible Focus States**: High contrast blue focus indicators are applied to inputs, selectors, buttons, and links.
- **Audit Verification**: Playwright tests with `@axe-core/playwright` execute accessibility scans, producing `a11y-report.json` with zero critical or serious WCAG errors.

---

## 6. What is Incomplete and Why

- **Live Contentful Webhooks**: Currently, changes in Contentful require reloading or previewing. In production, we would set up Contentful webhooks to trigger Next.js on-demand ISR revalidation (`revalidatePath`).
- **Real OAuth/Auth Database**: For ease of testing, RBAC is simulated using a dropdown that sets cookies. Production environments would implement OAuth/OIDC providers (like NextAuth or Auth0) to assert roles securely.
