# Workflow State & Rules (STM + Rules + Log)

*This file contains the dynamic state, embedded rules, active plan, and log for the current session.*
*It is read and updated frequently by the AI during its operational loop.*

---

## State

*Holds the current status of the workflow.*

```yaml
Phase: CONSTRUCT # Reverted to CONSTRUCT for error fixing
Status: BLOCKED_LINT # Set status to reflect build/lint errors
CurrentTaskID: Fix_Build_Errors # Set task ID to error fixing
CurrentStep: 5.x.x # Pausing Phase 5 steps
```

---

## Rules

*Embedded rules governing the AI's autonomous operation.*

**# --- Core Workflow Rules ---**

RULE_WF_PHASE_ANALYZE:
  **Constraint:** Goal is understanding request/context. NO solutioning or implementation planning.

RULE_WF_PHASE_BLUEPRINT:
  **Constraint:** Goal is creating a detailed, unambiguous step-by-step plan. NO code implementation.

RULE_WF_PHASE_CONSTRUCT:
  **Constraint:** Goal is executing the `## Plan` exactly ensuring comprehensive documentation and referencing within files. NO deviation of plan. If issues arise, trigger error handling or revert phase.

RULE_WF_PHASE_VALIDATE:
  **Constraint:** Goal is verifying implementation against `## Plan` and requirements using tools. NO new implementation.

RULE_WF_TRANSITION_01:
  **Trigger:** Explicit user command (`@analyze`, `@blueprint`, `@construct`, `@validate`).
  **Action:** Update `State.Phase` accordingly. Log phase change.

RULE_WF_TRANSITION_02:
  **Trigger:** AI determines current phase constraint prevents fulfilling user request OR error handling dictates phase change (e.g., RULE_ERR_HANDLE_TEST_01).
  **Action:** Log the reason. Update `State.Phase` (e.g., to `BLUEPRINT_REVISE`). Set `State.Status` appropriately (e.g., `NEEDS_PLAN_APPROVAL`). Report to user.

**# --- Initialization & Resumption Rules ---**

RULE_INIT_01:
  **Trigger:** AI session/task starts AND `workflow_state.md` is missing or empty.
  **Action:**
    1. Create `workflow_state.md` with default structure.
    2. Read `project_config.md` (prompt user if missing).
    3. Set `State.Phase = ANALYZE`, `State.Status = READY`.
    4. Log "Initialized new session."
    5. Prompt user for the first task.

RULE_INIT_02:
  **Trigger:** AI session/task starts AND `workflow_state.md` exists.
  **Action:**
    1. Read `project_config.md`.
    2. Read existing `workflow_state.md`.
    3. Log "Resumed session."
    4. Check `State.Status`: Handle READY, COMPLETED, BLOCKED_*, NEEDS_*, IN_PROGRESS appropriately (prompt user or report status).

RULE_INIT_03:
  **Trigger:** User confirms continuation via RULE_INIT_02 (for IN_PROGRESS state).
  **Action:** Proceed with the next action based on loaded state and rules.

**# --- Memory Management Rules ---**

RULE_MEM_READ_LTM_01:
  **Trigger:** Start of a new major task or phase.
  **Action:** Read `project_config.md`. Log action.

RULE_MEM_READ_STM_01:
  **Trigger:** Before *every* decision/action cycle.
  **Action:** Read `workflow_state.md`.

RULE_MEM_UPDATE_STM_01:
  **Trigger:** After *every* significant action or information receipt.
  **Action:** Immediately update relevant sections (`## State`, `## Plan`, `## Log`) in `workflow_state.md` and save.

RULE_MEM_UPDATE_LTM_01:
  **Trigger:** User command (`@config/update`) OR end of successful VALIDATE phase for significant change.
  **Action:** Propose concise updates to `project_config.md` based on `## Log`/diffs. Set `State.Status = NEEDS_LTM_APPROVAL`. Await user confirmation.

RULE_MEM_VALIDATE_01:
  **Trigger:** After updating `workflow_state.md` or `project_config.md`.
  **Action:** Perform internal consistency check. If issues found, log and set `State.Status = NEEDS_CLARIFICATION`.

**# --- Tool Integration Rules (Cursor Environment) ---**

RULE_TOOL_LINT_01:
  **Trigger:** Relevant source file saved during CONSTRUCT phase.
  **Action:** Instruct Cursor terminal to run lint command. Log attempt. On completion, parse output, log result, set `State.Status = BLOCKED_LINT` if errors.

RULE_TOOL_FORMAT_01:
  **Trigger:** Relevant source file saved during CONSTRUCT phase.
  **Action:** Instruct Cursor to apply formatter or run format command via terminal. Log attempt.

RULE_TOOL_TEST_RUN_01:
  **Trigger:** Command `@validate` or entering VALIDATE phase.
  **Action:** Instruct Cursor terminal to run test suite. Log attempt. On completion, parse output, log result, set `State.Status = BLOCKED_TEST` if failures, `TESTS_PASSED` if success.

RULE_TOOL_APPLY_CODE_01:
  **Trigger:** AI determines code change needed per `## Plan` during CONSTRUCT phase.
  **Action:** Generate modification. Instruct Cursor to apply it. Log action.

**# --- Error Handling & Recovery Rules ---**

RULE_ERR_HANDLE_LINT_01:
  **Trigger:** `State.Status` is `BLOCKED_LINT`.
  **Action:** Analyze error in `## Log`. Attempt auto-fix if simple/confident. Apply fix via RULE_TOOL_APPLY_CODE_01. Re-run lint via RULE_TOOL_LINT_01. If success, reset `State.Status`. If fail/complex, set `State.Status = BLOCKED_LINT_UNRESOLVED`, report to user.

RULE_ERR_HANDLE_TEST_01:
  **Trigger:** `State.Status` is `BLOCKED_TEST`.
  **Action:** Analyze failure in `## Log`. Attempt auto-fix if simple/localized/confident. Apply fix via RULE_TOOL_APPLY_CODE_01. Re-run failed test(s) or suite via RULE_TOOL_TEST_RUN_01. If success, reset `State.Status`. If fail/complex, set `State.Phase = BLUEPRINT_REVISE`, `State.Status = NEEDS_PLAN_APPROVAL`, propose revised `## Plan` based on failure analysis, report to user.

RULE_ERR_HANDLE_GENERAL_01:
  **Trigger:** Unexpected error or ambiguity.
  **Action:** Log error/situation to `## Log`. Set `State.Status = BLOCKED_UNKNOWN`. Report to user, request instructions.

---

## Plan

*Contains the step-by-step implementation plan generated during the BLUEPRINT phase.*

*   **Phase 1: Foundation & Core UI Components (Weeks 1-3)**
    *   `[X]` **1.1 Design System & Component Library**
        *   `[X]` Step 1.1.1: Establish design system (colors, typography, spacing) in Tailwind config (Complexity 3)
        *   `[X]` Step 1.1.2: Create reusable UI components (Complexity 5)
            *   `[X]` Step 1.1.2.1: Implement basic Button component (variants, sizes) (Complexity 2)
            *   `[X]` Step 1.1.2.2: Implement basic Input component (variants, validation states) (Complexity 2)
            *   `[X]` Step 1.1.2.3: Implement basic Card component (structure, slots) (Complexity 2)
            *   `[X]` Step 1.1.2.4: Implement basic Modal component (open/close, content area) (Complexity 3)
            *   `[X]` Step 1.1.2.5: Implement basic Dropdown component (options, selection) (Complexity 3)
            *   `[X]` Step 1.1.2.6: Implement basic Checkbox/Radio components (states) (Complexity 2)
            *   `[X]` Step 1.1.2.7: Document components (e.g., using Storybook) (Complexity 3)
        *   `[X]` Step 1.1.3: Implement responsive layouts for mobile-first approach (Complexity 4)
            *   `[X]` Step 1.1.3.1: Define Tailwind CSS breakpoints in `tailwind.config.js` (Complexity 1)
            *   `[X]` Step 1.1.3.2: Create main application layout component (header, footer, main content) (Complexity 3)
            *   `[X]` Step 1.1.3.3: Create common container/grid components ensuring responsiveness (Complexity 3)
            *   `[X]` Step 1.1.3.4: Test layouts across defined breakpoints (Complexity 2)
        *   `[X]` Step 1.1.4: Build authentication UI components (login/signup forms) (Complexity 3)
    *   `[X]` **1.2 Landing Page & User Onboarding**
        *   `[X]` Step 1.2.1: Implement landing page with value proposition messaging (Complexity 2)
        *   `[X]` Step 1.2.2: Create user type selection flow (seeker vs. provider) (Complexity 2)
        *   `[X]` Step 1.2.3: Build registration forms with validation (React Hook Form + Zod) (Complexity 3)
        *   `[X]` Step 1.2.4: Implement basic profile creation wizard (Complexity 4)
            *   `[X]` Step 1.2.4.1: Design wizard flow (steps, data needed per step) (Complexity 2)
            *   `[X]` Step 1.2.4.2: Implement multi-step form component structure (Complexity 3)
            *   `[X]` Step 1.2.4.3: Implement wizard step 1 form fields and validation (Complexity 2)
            *   `[X]` Step 1.2.4.4: Implement wizard step 2 form fields and validation (Complexity 2)
            *   `[X]` Step 1.2.4.5: Implement wizard step 3 form fields and validation (Complexity 3)
            *   `[X]` Step 1.2.4.6: Handle wizard state persistence between steps (Complexity 3)
            *   `[X]` Step 1.2.4.7: Implement final submission logic placeholder (Complexity 2)
    *   `[X]` **1.3 Frontend Authentication Flows (Using Clerk)**
        *   `[X]` Step 1.3.1: Integrate Clerk Provider and configure environment variables (Complexity 2)
        *   `[X]` Step 1.3.2: Implement Sign Up and Sign In pages using Clerk components/routes (Complexity 2)
        *   `[X]` Step 1.3.3: Implement protected routes using Clerk middleware/helpers (Complexity 3)
        *   `[X]` Step 1.3.4: Add User Profile management using Clerk components (e.g., `<UserButton>`, `<UserProfile>`) (Complexity 2)
        *   `[X]` Step 1.3.5: Connect profile wizard completion to update Clerk user metadata (placeholder) (Complexity 3)

*   **Phase 2: Backend Foundation & API Development**
    *   `[X]` **2.1 Database Setup & Models**
        *   `[X]` Step 2.1.1: Configure MongoDB connection using environment variables (Complexity 2)
        *   `[X]` Step 2.1.2: Define Mongoose schema for `User` based on `spec.md` (Complexity 3)
        *   `[X]` Step 2.1.3: Define Mongoose schema for `ProviderProfile` based on `spec.md` (Complexity 3)
        *   `[X]` Step 2.1.4: Define Mongoose schema for `SeekerProfile` based on `spec.md` (Complexity 2)
        *   `[X]` Step 2.1.5: Define Mongoose schema for `ExternalProfile` based on `spec.md` (Complexity 3)
        *   `[X]` **Step 2.1.6: Address Linter Errors (Various Files)**
            *   `[X]` Step 2.1.6.1: Fix 'no-explicit-any' in src/app/api/profile/update/route.ts
            *   `[X]` Step 2.1.6.2: Fix 'no-unused-vars' and 'no-explicit-any' in src/app/api/search/route.ts
            *   `[X]` Step 2.1.6.3: Fix 'no-explicit-any' in src/app/dashboard/page.tsx
            *   `[X]` Step 2.1.6.4: Fix hook dependency warnings in src/app/search/page.tsx
            *   `[X]` Step 2.1.6.5: Fix 'no-unused-vars' and 'no-explicit-any' in src/components/common/MultiStepForm.tsx
    *   `[X]` **2.2 User Profile API**
        *   `[X]` Step 2.2.1: Create API endpoint to get current user's profile data (merging Clerk data + DB data) (Complexity 4)
        *   `[X]` Step 2.2.2: Update `/api/profile/update` endpoint to save profile data to MongoDB *in addition to* Clerk metadata (Complexity 5)
        *   `[X]` Step 2.2.3: Implement logic to create `User` record in DB upon first access if not exists (webhook or lazy creation) (Complexity 4)
    *   `[X]` **2.3 Location & Search API (Initial)**
        *   `[D]` Step 2.3.1: Implement geocoding utility to convert address to coordinates (using a service like Google Maps API or a library) (Complexity 3) --- DEFERRED
        *   `[X]` Step 2.3.2: Ensure `location.coordinates` field is populated and indexed in `User` schema (Complexity 2)
        *   `[X]` Step 2.3.3: Create basic API endpoint for location-based provider search (using MongoDB geospatial query) (Complexity 5)

*   **Phase 3: Frontend Integration & Core Features**
    *   `[X]` **3.1 Search UI & Integration**
        *   `[X]` Step 3.1.1: Create Search page UI (input fields for location/radius, filters placeholder) (Complexity 3)
        *   `[X]` Step 3.1.2: Implement frontend logic to get user's current location (browser geolocation API) or use manual input (Complexity 3)
        *   `[X]` Step 3.1.3: Connect Search UI to `/api/search` endpoint (using SWR for data fetching) (Complexity 4)
        *   `[X]` Step 3.1.4: Implement search results display (list view with basic provider info and distance) (Complexity 4)
        *   `[X]` Step 3.1.5: Add basic loading and error states for search (Complexity 2)
    *   `[X]` **3.2 Profile Display**
        *   `[X]` Step 3.2.1: Create basic User Dashboard page (placeholder) (Complexity 2)
        *   `[X]` Step 3.2.2: Fetch current user's combined profile data from `/api/profile/me` on dashboard (using SWR) (Complexity 3)
        *   `[X]` Step 3.2.3: Display fetched user profile data on dashboard (Complexity 3)
        *   `[X]` Step 3.2.4: Create dynamic route for public provider profiles (e.g., `/providers/[providerId]`) (Complexity 3)
        *   `[X]` Step 3.2.5: Create API endpoint to fetch public provider profile by ID (`/api/providers/[providerId]`) (Complexity 4)
        *   `[X]` Step 3.2.6: Implement frontend page to fetch and display public provider profile data (Complexity 4)

*   **Phase 4: Core Backend Features**
    *   `[X]` **4.1 Search & Discovery Backend Refinement**
        *   `[X]` Step 4.1.1: Integrate geocoding service (e.g., `node-geocoder`) to convert address/location input to coordinates during profile creation/update (addresses deferred Step 2.3.1). (Complexity 5)
        *   `[X]` Step 4.1.2: Implement backend logic for handling search filters (specialties, provider type) in `/api/search` endpoint. Update aggregation pipeline. (Complexity 4)
        *   `[X]` Step 4.1.3: Implement server-side pagination for `/api/search` results (e.g., using `skip`/`limit`). (Complexity 3)
        *   `[S]` Step 4.1.4: (Optional) Implement basic search query logging. (Complexity 2) --- SKIPPED
        *   `[S]` Step 4.1.5: (Optional) Implement basic caching for search results. (Complexity 4) --- SKIPPED
    *   `[X]` **4.2 External Platform Integration (Backend)**
        *   `[X]` Step 4.2.1: Implement backend OAuth flow handler for **one** platform (e.g., Strava). (Complexity 6)
            *   `[X]` Step 4.2.1.1: Set up platform API keys/secrets in `.env.local`.
            *   `[X]` Step 4.2.1.2: Create API endpoint(s) for OAuth initiation and callback.
            *   `[X]` Step 4.2.1.3: Implement token exchange logic.
            *   `[X]` Step 4.2.1.4: Implement secure token storage in `ExternalProfile` model.
            *   `[X]` Step 4.2.1.5: Fetch and store basic platform profile info upon connection.
        *   `[X]` Step 4.2.2: Implement token refresh logic for the connected platform. (Complexity 5)
        *   `[X]` Step 4.2.3: Implement basic content synchronization service (e.g., fetch recent activities) for the connected platform. (Complexity 6)
        *   `[S]` Step 4.2.4: (Stretch Goal) Repeat 4.2.1-4.2.3 for a second platform (e.g., Instagram). (Complexity 6) --- SKIPPED
    *   `[X]` **4.3 Connection & Communication (Placeholder)**
        *   `[X]` Step 4.3.1: Define basic `Connection` model (linking seeker/provider, status). (Complexity 2)
        *   `[X]` Step 4.3.2: Create placeholder API endpoints for initiating/viewing connections. (Complexity 3)

*   **Phase 5: Integration Testing & Finalization**
    *   `[ ]` **5.1 End-to-End Testing:** *(Focus on core implemented flows)*
        *   `[ ]` Step 5.1.1: Test user registration (Clerk) + type selection + profile wizard completion flow (Seeker). Verify data persistence (DB/Clerk) & redirection.
        *   `[ ]` Step 5.1.2: Test user registration (Clerk) + type selection + profile wizard completion flow (Provider). Verify data persistence & redirection.
        *   `[ ]` Step 5.1.3: Test profile viewing (Dashboard). Verify data loads correctly.
        *   `[ ]` Step 5.1.4: Test provider search (location input, use current location, radius slider, pagination). Verify results & pagination. *(Filter UI pending)*
        *   `[ ]` Step 5.1.5: Test public provider profile viewing (`/providers/[providerId]`).
        *   `[ ]` Step 5.1.6: Test external account connection (Strava) OAuth flow & basic token storage check (manual DB review).
        *   `[S]` Step 5.1.7: (Optional) Add basic search filter UI elements (e.g., checkboxes for specialties) to `SearchPage` for filter testing.
    *   `[ ]` **5.2 Bug Fixing & Refinement:**
        *   `[ ]` Step 5.2.1: Address any critical bugs identified during testing (e.g., login loops, data saving issues, crashes).
        *   `[ ]` Step 5.2.2: Code cleanup and final linting/formatting checks across the project.
    *   `[ ]` **5.3 Deployment Preparation:**
        *   `[ ]` Step 5.3.1: Verify all necessary environment variables (`.env.local`, Vercel env vars) for Clerk, MongoDB, Strava API.
        *   `[ ]` Step 5.3.2: Run production build (`npm run build`) locally to catch errors.
        *   `[ ]` Step 5.3.3: Review security basics (input validation on APIs, auth checks).
    *   `[ ]` **5.4 Final Deployment & Smoke Test:**
        *   `[ ]` Step 5.4.1: Deploy current state to production environment (Vercel).
        *   `[ ]` Step 5.4.2: Perform post-deployment smoke testing (login, search, view profile).

---

## Log

*A chronological log of significant actions, events, tool outputs, and decisions.*
*New entries added below.*

*   `[TIMESTAMP]` Updated config.md, stack.md, implement.md, spec.md to reflect current implementation (Clerk auth, Next.js API routes, Mongoose models).
*   `[TIMESTAMP]` User approved documentation updates.
*   `[TIMESTAMP]` User added Phase 5 plan to workflow_state.md.
*   `[TIMESTAMP]` User moved historical log entries to log_archive.md.
*   `[TIMESTAMP]` Starting Phase 5: Integration Testing & Finalization.
*   `[TIMESTAMP]` Starting Step 5.1.1: Test Seeker registration & onboarding flow.
*   `[TIMESTAMP]` User reported build errors. Pausing Phase 5 testing.
*   `[TIMESTAMP]` Phase changed to CONSTRUCT, Status set to BLOCKED_LINT. CurrentTaskID set to Fix_Build_Errors.

*Example:*
*   `[2025-03-26 17:55:00] Initialized new session.`
*   `[2025-03-26 17:55:15] User task: Implement login feature.`
*   `[2025-03-26 17:55:20] State.Phase changed to ANALYZE.`
*   `[2025-03-26 17:56:00] Read project_config.md.`
*   ...

*Actual Log:*
