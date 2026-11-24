# LearnSphere AI — wHACKiest 2026 Official 8-Slide Presentation Outline

**Track:** UnlockED – Unlocking Educational Potential, Empowering Futures  
**Selected Problem Statement:** Low-Bandwidth Adaptive Learning for Rural Schools

---

## SLIDE 1 — TEAM DETAILS

- **Project Name:** LearnSphere AI
- **Tagline:** *Learn Anywhere. Grow Everywhere.*
- **Track:** UnlockED – Unlocking Educational Potential, Empowering Futures
- **Problem Statement:** Low-Bandwidth Adaptive Learning for Rural Schools
- **Team Name:** `[Enter Team Name]`
- **Team Members:**
  - `[Member 1 — Role: Full-Stack & Offline Systems]`
  - `[Member 2 — Role: Adaptive Logic & AI Integration]`
  - `[Member 3 — Role: UI/UX & Curriculum Localization]`
  - `[Member 4 — Role: Testing & Presentation]`
- **Institution / College:** `[Enter College Name]`

---

## SLIDE 2 — PROBLEM STATEMENT

### Why Rural Learners Get Left Behind Twice
1. **Connectivity Interruption:** Rural and semi-urban students frequently rely on unstable 2G/3G/4G connections or shared family smartphones. Conventional web platforms fail mid-lesson, drop quiz submissions, and erase unsaved progress.
2. **Lack of Personalised Support:** In multi-grade or large rural classrooms, a student who struggles with foundational concepts (e.g., adding unlike fractions) receives the same generic worksheet as classmates who already mastered the topic.

### Target Users & Consequences
- **Rural Students (Grades 6–8):** Lose study momentum during signal blackouts and fall further behind when weak topics go unaddressed.
- **Rural Teachers:** Lack real-time visibility into which specific topics each student misses while studying at home.

*Note on Statistics: [Research Required — insert verified ASER / UNESCO / UDISE+ regional connectivity and foundational numeracy statistics with exact year and geography before final stage pitch; no unverified figures are fabricated here.]*

---

## SLIDE 3 — PROPOSED SOLUTION

**One-Sentence Pitch:**  
*LearnSphere AI is an offline-first, explainable adaptive learning platform that diagnoses student weak areas, personalises lessons in English and Kannada, and keeps learning progress safe until connectivity returns.*

### The LearnSphere Learning Loop
`ASSESS → UNDERSTAND → ADAPT → LEARN → PRACTISE → SAVE OFFLINE → SYNC → IMPROVE`

### Core MVP Features & Student Journey
1. **Diagnostic Assessment:** Student selects Mathematics, Science, or English and completes a short multi-topic diagnostic check.
2. **Explainable Recommendation:** Engine highlights weak topics and explains *why* a lesson and difficulty tier were recommended.
3. **Offline Study & Practice:** Student downloads lessons to IndexedDB, goes offline, studies with Kannada/English & Read-Aloud support, and completes adaptive practice quizzes locally.
4. **Resilient Sync & Teacher Action:** Pending events sync automatically upon reconnection so teachers spot struggling students immediately.

---

## SLIDE 4 — TECHNOLOGY STACK (And Why Each Choice Fits Rural Constraints)

| Layer | Choice | Why Appropriate for Low-Bandwidth Rural Schools |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS | Fast initial bundle, responsive mobile-first layout for budget phones, strict type safety. |
| **Offline PWA** | `vite-plugin-pwa` (Workbox) + `idb` (IndexedDB) | Caches app shell & assets; persists downloaded lessons, quiz results, and sync queue across reloads without internet. |
| **Visualisation & 3D** | Recharts + Three.js (with SVG Lite Fallback) | Clean mastery charts; Three.js hero orbit automatically degrades to lightweight SVG on low-power devices or reduced motion. |
| **Backend & DB** | Node.js + Express + SQLite (`node:sqlite`) | Lightweight, zero-overhead REST API and ACID local SQLite database with idempotent sync deduplication. |
| **AI Tutor** | Gemini (`@google/genai` server-side) + Rule-Based Fallback | Secure server-side Gemini explanations when online; transparent local curriculum fallback when offline or unconfigured. |

---

## SLIDE 5 — PROCESS FLOW AND ARCHITECTURE

```
Student Device (Browser / PWA)
  ├── Diagnostic Quiz & Adaptive Engine (Pure TypeScript)
  ├── IndexedDB Local Store (cached_lessons, attempts, sync_queue)
  └── Sync Adapter (unique eventId + timestamp)
         │
         ▼  [When connectivity is available]
Express REST API (/api/sync/events, /api/tutor/ask, /api/teacher/*)
  ├── SQLite Database (learnsphere.db — deduplicated sync_events & attempts)
  ├── Gemini API (@google/genai — server-only key protection)
  └── Teacher Dashboard (weak-topic analytics & targeted assignments)
```

**Design Reasoning:** Computation for scoring and adaptive recommendations runs directly on the student's device so personalisation still works with zero internet. The server acts as an idempotent sync & teacher aggregation layer rather than a single point of failure.

---

## SLIDE 6 — NOVELTY AND INNOVATION

1. **Continuity-First Learning:** Lessons, read-aloud accessibility, and adaptive practice quizzes operate seamlessly offline in IndexedDB.
2. **Explainable Personalisation:** Instead of a black-box score, students see the exact mastery formula (`0.50×Recent + 0.30×Cumulative + 0.20×DifficultyWeighted - RepeatPenalty`) and a plain-language explanation.
3. **Progress That Survives Disconnection:** Timestamped `SyncEvent` records with `eventId` deduplication guarantee zero lost or double-counted quizzes across drops and refreshes.
4. **Teacher-Focused Insights:** Automatically aggregates synced student results into class-wide weak-topic alerts and one-click targeted assignments.

### Comparison with Conventional Online Platforms
- **Connectivity Failure:** Conventional platforms halt or lose quiz state → LearnSphere continues locally and queues events.
- **Adaptation:** Conventional platforms serve fixed linear playlists → LearnSphere dynamically adapts difficulty and skips already-mastered (`>= 85%`) topics.

---

## SLIDE 7 — IMPACT AND FEASIBILITY

- **Student Benefits:** Zero wasted study hours during power/network outages; judgement-free foundational support in English and Kannada.
- **Teacher Benefits:** Actionable topic-level diagnostics without manual grading; ability to assign targeted offline revision to specific students.
- **Technical & Cost Feasibility:** Runs in any standard mobile browser as an installable PWA—no expensive native app distribution or proprietary school hardware required. Low-bandwidth JSON sync packets keep mobile data usage minimal.
- **Honest Limitations & Mitigations:**
  - *Limitation:* Current MVP uses MCQ diagnostics and single-node SQLite.  
  - *Mitigation:* Architecture isolates `syncAdapter` and `db` layers for straightforward migration to managed cloud SQL/Firestore and state-board content packs.

---

## SLIDE 8 — BUSINESS MODEL *(Proposed — Pre-Revenue MVP)*

- **Target Customers (Proposed):** State/district rural school networks, affordable private schools, and education-focused NGOs.
- **Proposed Licensing Options (Not Existing Revenue):**
  - *Free Community Tier:* Core offline PWA and curriculum modules for individual rural students.
  - *Proposed Institutional / NGO Pilot Tier:* Per-school annual license covering teacher analytics dashboards, regional language content packs, and hosted sync infrastructure.
- **Cost Considerations:** Minimal static CDN + lightweight Node/SQLite or managed database hosting; Gemini API token costs bounded via concise prompts and local rule-based fallback for common queries.
- **Adoption Strategy:** Partner with 2–3 local government/NGO-supported schools in Karnataka for a 6-week offline classroom pilot to calibrate mastery thresholds before wider rollout.
