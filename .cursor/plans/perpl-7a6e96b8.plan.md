<!-- 7a6e96b8-ff70-47d6-b120-63f11693ad09 3eea6497-b4d0-43ad-a2ef-468722b0af8d -->
# Perplexity Search Orchestrator - Implementation Plan

## Project Architecture

**Frontend**: Vite + React + React Router + shadcn/ui components (migrating from Next.js)

**Backend**: Tauri 2.0 (Rust) with file system and state management

**API**: Perplexity Sonar Reasoning model via HTTP

**Storage**: JSON files in AppData directory

**Migration Status**: Phase 7 - Migrating from Next.js App Router to Vite + React for production build compatibility

## Development Strategy: Sequential Implementation

**ACTUAL IMPLEMENTATION**: All phases completed sequentially on `main` branch

- ✅ Phase 0: Initial Setup (COMPLETE)
- ✅ Phases 1-4: Backend Development (COMPLETE)
- ✅ Phase 5: Frontend Development (COMPLETE - Next.js)
- ✅ Phase 6: Integration (COMPLETE)
- 🔄 Phase 7: Migration to Vite + React (IN PROGRESS - NEXT STEP)
- ❌ Phase 8: Polish & Distribution (BLOCKED - waiting for Phase 7)

---

## Phase 0: Initial Project Setup ✅ COMPLETE

**Branch**: `main`

**Status**: COMPLETE (Commit: 2424915)

### 0.1 Initialize Tauri + Next.js Project ✅

- ✅ Run `npm create tauri-app@latest` with Next.js template
- ✅ Configure `next.config.mjs` (Note: removed `output: 'export'` to support dynamic routes)
- ✅ Configure `tauri.conf.json`:
  - ✅ Set `frontendDist` to `../out`
  - ✅ Set `devUrl` to `http://localhost:3000`
  - ✅ Configure app identifier and window settings
- ✅ Verify basic app runs: `npm run tauri dev`

### 0.2 Create Interface Definition Document ✅

Created `INTERFACES.md` with:

- ✅ Rust struct definitions for `Topic`, `SearchResult`, `Interval`
- ✅ TypeScript interface equivalents
- ✅ API command signatures (all 10 Tauri commands)
- ✅ Event names and payloads

---

## Phases 1-4: Backend Development ✅ COMPLETE

**Branch**: `main`

**Status**: COMPLETE (Commit: 07bab45, restored in 4e767fc)

**Deliverables**:

- 784 lines of production Rust code
- 19 passing unit tests
- All 10 Tauri commands implemented

### Phase 1: Backend Setup & Configuration ✅

#### 1.1 Install Backend Dependencies ✅

Added to `Cargo.toml`:

- ✅ `serde` and `serde_json` for JSON serialization
- ✅ `tokio` for async runtime  
- ✅ `reqwest` for HTTP calls to Perplexity API
- ✅ `uuid` for generating IDs
- ✅ `chrono` for timestamp handling
- ✅ `dotenvy` for environment variables
- ✅ Dev dependencies: `tokio-test`, `mockito` for testing

#### 1.2 Configure Environment & Permissions ✅

- ✅ Created capabilities in `src-tauri/capabilities/`:
  - ✅ `default.json` with core permissions
  - ✅ `fs-appdata.json` with file system permissions
  - ✅ All required fs:allow-* permissions configured

### Phase 2: Backend - Data Models & State ✅

#### 2.1 Define Rust Data Structures ✅

Created `src-tauri/src/models.rs` (805 bytes):

- ✅ `Topic` struct with all fields
- ✅ `SearchResult` struct 
- ✅ `Interval` enum (Hourly/Daily/Weekly)
- ✅ All structs derive: `Serialize`, `Deserialize`, `Clone`, `Debug`

#### 2.2 Implement State Management ✅

Created `src-tauri/src/state.rs` (414 bytes):

- ✅ `AppState` struct with `Mutex<Vec<Topic>>`
- ✅ `SchedulerState` to track running scheduler
- ✅ Initialized in `lib.rs` using `app.manage()`

#### 2.3 Create File System Module ✅

Created `src-tauri/src/storage.rs` (5.3KB):

- ✅ `load_topics()`: Read from `AppData/topics.json`
- ✅ `save_topics()`: Write to `AppData/topics.json`
- ✅ `save_result()`: Write to `AppData/results/{topic_id}/{timestamp}.json`
- ✅ `load_results()`: Read results for a topic
- ✅ Helper functions for directory creation
- ✅ Proper error handling

### Phase 3: Backend - Core Functionality ✅

#### 3.1 Perplexity API Client ✅

Created `src-tauri/src/perplexity.rs` (2.2KB):

- ✅ `PerplexityClient` struct with API key
- ✅ `execute_search()` async function using `reqwest`
- ✅ Request to `https://api.perplexity.ai/chat/completions`
- ✅ Model: `sonar-reasoning`
- ✅ Error handling and response parsing
- ✅ Timeout configuration

#### 3.2 Scheduler Logic ✅

Created `src-tauri/src/scheduler.rs` (1.7KB):

- ✅ `calculate_next_run()`: Calculate next run time based on interval
- ✅ `should_run_now()`: Check if topic needs to run
- ✅ `run_scheduler()`: Background task that checks every 60 seconds
- ✅ Updates `next_run` after execution
- ✅ Emits events to frontend on search completion
- ✅ Graceful shutdown handling

#### 3.3 Tauri Commands ✅

Created `src-tauri/src/commands.rs` (11KB):

- ✅ All 10 commands implemented:
  - ✅ `get_topics()`, `create_topic()`, `update_topic()`, `delete_topic()`
  - ✅ `toggle_topic()`, `trigger_search()`
  - ✅ `get_results()`, `get_result()`
  - ✅ `start_scheduler()`, `stop_scheduler()`
- ✅ All commands registered in `lib.rs` via `invoke_handler()`

### Phase 4: Backend Testing ✅

#### 4.1 Unit Tests Setup ✅

- ✅ Configured test modules in `src-tauri/src/lib.rs`
- ✅ Created `src-tauri/src/tests/` directory structure

#### 4.2 Core Module Tests ✅

Created test files in `src-tauri/src/tests/`:

- ✅ `storage_tests.rs`: JSON read/write operations
- ✅ `scheduler_tests.rs`: Scheduling logic (hourly/daily/weekly intervals)
- ✅ `models_tests.rs`: Data structure serialization

#### 4.3 Integration Tests ✅

- ✅ Full command flows tested
- ✅ State management verified
- ✅ All edge cases covered

#### 4.4 Run Tests & Document ✅

- ✅ Executed `cargo test` in `src-tauri/`
- ✅ **19 tests passing**
- ✅ `INTERFACES.md` kept up to date

**DELIVERABLE**: ✅ Fully tested backend with all Tauri commands working

---

## Phase 5: Frontend Development ✅ COMPLETE

**Branch**: `main` (merged from `feat-new-phases-ctjXH`)

**Status**: COMPLETE (Commit: 8bf4a3a, merged in e69ea08)

**Deliverables**:

- 71 files added, 12,617 lines
- All pages functional with mock data
- Complete shadcn/ui integration
- Settings page with API key management

### Phase 5: Frontend - UI Components ✅

#### 5.1 Setup shadcn/ui & Base Configuration ✅

- ✅ Initialized shadcn/ui via MCP
- ✅ Installed all required components:
  - ✅ Button, Card, Table, Form, Input, Select
  - ✅ Dialog, Badge, Separator, Skeleton, Sonner (Toaster)
- ✅ Setup Tailwind config with theme

#### 5.2 Create Type Definitions & Mock Data ✅

- ✅ Created `lib/types.ts` with TypeScript interfaces from `INTERFACES.md`
- ✅ Created `lib/mock-data.ts` with sample topics and results
- ✅ Created `lib/api.ts` stub with mock data returns

#### 5.3 Create Layout & Navigation ✅

- ✅ `app/layout.tsx`: Root layout with sidebar + Toaster
- ✅ `components/nav.tsx`: Navigation menu (Topics, History, Settings)
- ✅ `components/header.tsx`: App header with scheduler controls

#### 5.4 Topic Management UI ✅

- ✅ `app/topics/page.tsx`: Topics list with table view
- ✅ `app/topics/new/page.tsx`: Create topic form (react-hook-form + zod)
- ✅ `app/topics/[id]/page.tsx`: Topic details view
- ✅ `app/topics/[id]/edit/page.tsx`: Edit topic form

#### 5.5 Results UI ✅

- ✅ `app/history/page.tsx`: All results with filtering
- ✅ `app/results/[id]/page.tsx`: Single result view

#### 5.6 Create Reusable Components ✅

- ✅ `components/topic-card.tsx`: Topic summary display
- ✅ `components/result-card.tsx`: Search result preview
- ✅ `components/status-badge.tsx`: Status indicators
- ✅ `components/interval-badge.tsx`: Interval display

#### 5.7 Additional Features ✅

- ✅ `app/settings/page.tsx`: Settings page with API key management
- ✅ localStorage integration for API key storage
- ✅ Dynamic routes working (removed static export requirement)
- ✅ Toast notifications with Sonner
- ✅ Form validation throughout

**DELIVERABLE**: ✅ Complete UI with mock data, all pages functional, ready for backend integration

---

## Phase 6: Frontend - Backend Integration ✅ COMPLETE

**Branch**: `main`

**Status**: COMPLETE (Commit: bff6bc3)

**Goal**: Replace mock API calls with real Tauri invoke() commands

**Deliverables**:

- Real Tauri invoke() calls for all 10 commands
- React Context for global state management
- Event listeners for real-time updates
- Mock data removed
- Perplexity API fully integrated and working
- History page with auto-refresh
- Real-time toast notifications

### Phase 6: Frontend - Backend Integration

#### 6.1 Connect API Layer ✅

Updated `lib/api.ts`:

- ✅ Replaced all mock data with actual `invoke()` calls
- ✅ Proper error handling with Result types
- ✅ All 10 commands working (get_topics, create_topic, update_topic, delete_topic, toggle_topic, trigger_search, get_results, get_result, start_scheduler, stop_scheduler)

#### 6.2 State Management ✅

- ✅ Created React Context (`lib/app-context.tsx`)
- ✅ Topics list state (syncs with backend)
- ✅ Scheduler status state (syncs with backend)
- ✅ Real-time updates via Tauri events

#### 6.3 Event Listeners ✅

- ✅ Created `lib/events.ts` with event handlers
- ✅ Listening for `search-completed` events from backend
- ✅ Listening for `scheduler-started` and `scheduler-stopped` events
- ✅ Toast notifications for background events
- ✅ Auto-refresh topics when searches complete

#### 6.4 Remove Mock Data ✅

- ✅ Deleted `lib/mock-data.ts`
- ✅ Removed all mock data references
- ✅ App now uses real backend exclusively

### Phase 7: Migration to Vite + React ✅ COMPLETE (⚠️ Cleanup Pending)

**Decision**: Migrate from Next.js to Vite + React for better Tauri compatibility

**Reason**: Next.js App Router with `output: 'export'` is incompatible with dynamic routes + client components. Vite is designed for SPA/static builds and is the recommended approach for Tauri apps.

**Status**: ✅ COMPLETE (Commit: 554f8a3) - Migration successful, all features working!

**Additional Fixes**:
- Fixed API key storage (localStorage → Tauri app data directory)
- Created save_api_key and load_api_key Tauri commands
- Fixed lucide-react icon imports (breaking changes)
- Configured Vite with Tauri best practices from official docs

**Reference**: See `TAURI_BUILD_ISSUE.md` for detailed analysis

#### 7.1 Setup Vite Project Structure ✅

- [x] Install Vite and dependencies (`vite`, `@vitejs/plugin-react`)
- [x] Create Vite config (`vite.config.ts`)
- [x] Setup React Router (`react-router-dom`)
- [x] Configure Tailwind for Vite
- [x] Update Tauri config to point to Vite dist
- [x] Create new `src/` directory structure:
  ```
  src/
  ├── main.tsx           # Entry point
  ├── App.tsx            # Root component with router
  ├── routes/            # Route components (migrated from app/)
  ├── components/        # Copy from current components/
  ├── lib/               # Copy from current lib/
  └── styles/            # Global styles
  ```

#### 7.2 Migrate Routing ✅

- [x] Install React Router: `npm install react-router-dom`
- [x] Create router configuration in `App.tsx`
- [x] Convert Next.js pages to React Router routes:
  - [x] `/` → Home/Topics list
  - [x] `/topics/new` → Create topic
  - [x] `/topics/:id` → Topic details
  - [x] `/topics/:id/edit` → Edit topic
  - [x] `/history` → Search history
  - [x] `/results/:id` → Result details
  - [x] `/settings` → Settings
- [x] Replace `next/navigation` hooks with React Router:
  - [x] `useRouter()` → `useNavigate()`
  - [x] `useParams()` → `useParams()` (same)
  - [x] `Link` from `next/link` → `Link` from `react-router-dom`

#### 7.3 Migrate Components ✅

- [x] Copy `components/` directory as-is (no changes needed)
- [x] Copy `lib/` directory as-is (api.ts, types.ts, utils.ts, events.ts, app-context.tsx)
- [x] Update import paths to use Vite's `@/` alias
- [x] Remove Next.js-specific code:
  - [x] Remove `"use client"` directives
  - [x] Remove Next.js Image components (use regular `<img>`)
  - [x] Update any Next.js-specific utilities
- [x] Fix lucide-react icon imports (breaking changes: CircleCheck→CheckCircle2, etc.)

#### 7.4 Configure Build System ✅

- [x] Update `package.json` scripts:
  ```json
  {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  }
  ```
- [x] Update `src-tauri/tauri.conf.json`:
  ```json
  {
    "build": {
      "beforeDevCommand": "npm run dev",
      "beforeBuildCommand": "npm run build",
      "devUrl": "http://localhost:5173",
      "frontendDist": "../dist"
    }
  }
  ```
- [x] Configure Vite for Tauri integration (followed official Tauri Vite guide)
- [x] Fix Node.js version compatibility (locked Vite to 5.4.8)
- [x] Test dev mode: `npm run tauri dev` ✅ Working

#### 7.5 Testing & Verification ✅

- [x] Verify all routes work in dev mode
- [x] Test Tauri commands integration
- [x] Verify event listeners work
- [x] Test all CRUD operations (Topics CRUD working)
- [x] Test API key storage (fixed localStorage → Tauri app data directory)
- [x] Create Tauri commands for API key (save_api_key, load_api_key)
- [x] Test search functionality (working with proper API key storage)
- [x] Test scheduler functionality (tested)
- [x] Build production bundle: `npm run tauri build` (tested)
- [x] Test production binary on macOS (tested)
- [x] Verify app size and performance (tested)

#### 7.6 Cleanup ✅ COMPLETE

- [x] Remove Next.js dependencies from `package.json` (removed `next` and `eslint-config-next`)
- [x] Delete `app/` directory (removed)
- [x] Delete `next.config.mjs` (removed)
- [x] Update README with new stack (created README.md with Vite + React stack)
- [x] Update BUILD.md with Vite instructions (updated all references)
- [x] Archive `TAURI_BUILD_ISSUE.md` (moved to `arch/TAURI_BUILD_ISSUE.md`)

### Phase 8: Polish & Distribution ❌ NOT STARTED

#### 8.1 Error Handling ❌

- [ ] Frontend: Display user-friendly error messages
- [ ] Backend: Proper error types and logging
- [ ] Handle API failures gracefully
- [ ] Network error handling
- [ ] File system error handling

#### 8.2 Loading States ❌

- [ ] Skeletons for data loading
- [ ] Loading indicators for async operations
- [ ] Disable buttons during operations
- [ ] Optimistic UI updates where appropriate

#### 8.3 Data Validation ❌

- [ ] Frontend form validation (migrate from Next.js forms)
- [ ] Backend input validation in commands
- [ ] Prevent invalid intervals/queries
- [ ] Sanitize user input

#### 8.4 End-to-End Manual Testing ❌

- [ ] Create/edit/delete topics
- [ ] Trigger manual searches
- [ ] Verify scheduled execution works correctly
- [ ] Check JSON file structure and persistence
- [ ] Test error scenarios (invalid API key, network errors, etc.)
- [ ] Test app restart and state persistence
- [ ] Test with multiple topics running
- [ ] Test scheduler start/stop

#### 8.5 Documentation ❌

- [ ] Update README with Vite + React stack
- [ ] Document prerequisites (Rust, Node.js)
- [ ] Document .env configuration
- [ ] Add development guide
- [ ] Add build instructions for Vite
- [ ] Add usage examples with screenshots
- [ ] Document testing procedures
- [ ] Add troubleshooting section

#### 8.6 Distribution ❌

- [ ] Configure macOS code signing (optional)
- [ ] Create DMG installer
- [ ] Test on clean macOS system
- [ ] Document installation process
- [ ] Consider GitHub Releases setup

---

## Key Files Structure

```
project-root/
├── src-tauri/                      # BACKEND - No changes needed
│   ├── src/
│   │   ├── lib.rs                  # Main entry, setup
│   │   ├── commands.rs             # Tauri commands
│   │   ├── models.rs               # Data structures
│   │   ├── state.rs                # App state management
│   │   ├── storage.rs              # File I/O operations
│   │   ├── perplexity.rs           # API client
│   │   ├── scheduler.rs            # Background scheduler
│   │   └── tests/                  # Unit & integration tests
│   ├── capabilities/
│   │   └── default.json            # Permissions config
│   ├── Cargo.toml                  # Rust dependencies
│   ├── tauri.conf.json             # Tauri configuration (update for Vite)
│   └── build.rs                    # Build script
├── src/                            # NEW: Vite + React structure
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root with React Router
│   ├── routes/                     # Migrated from app/
│   │   ├── Home.tsx                # Topics list
│   │   ├── TopicNew.tsx            # Create topic
│   │   ├── TopicDetails.tsx        # View topic
│   │   ├── TopicEdit.tsx           # Edit topic
│   │   ├── History.tsx             # Search history
│   │   ├── ResultDetails.tsx       # View result
│   │   └── Settings.tsx            # Settings
│   ├── components/                 # Copied from components/
│   │   ├── ui/                     # shadcn components
│   │   ├── Nav.tsx
│   │   ├── Header.tsx
│   │   ├── TopicCard.tsx
│   │   ├── ResultCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── IntervalBadge.tsx
│   ├── lib/                        # Copied from lib/
│   │   ├── types.ts                # TypeScript types
│   │   ├── api.ts                  # Tauri invoke wrappers
│   │   ├── events.ts               # Event handlers
│   │   ├── app-context.tsx         # React Context
│   │   └── utils.ts                # Utility functions
│   └── styles/
│       └── globals.css             # Tailwind + global styles
├── app/                            # TO DELETE after migration
├── INTERFACES.md                   # SHARED - Both agents reference
├── BUILD.md                        # Build instructions
├── TAURI_BUILD_ISSUE.md            # Migration rationale
├── .env.example                    # Environment template
├── vite.config.ts                  # NEW: Vite config
├── index.html                      # NEW: Vite entry HTML
└── package.json                    # Updated dependencies
```

## Critical Implementation Notes

1. **Scheduler**: Must use `tokio::spawn()` for background task, keep handle in state
2. **Time Calculations**: Use `chrono` for reliable timezone-aware scheduling
3. **File Paths**: Always use `AppHandle::path().app_data_dir()` for storage location
4. **Async Commands**: Return `Result<T, String>` for proper error handling
5. **Events**: Use `app.emit()` to notify frontend of background operations
6. **State Access**: Lock `Mutex` briefly, don't hold across await points
7. **JSON Files**: Create parent directories before writing
8. **Next.js Export**: Ensure all routes are statically exportable (no dynamic server features)
9. **Testing**: Write tests as you implement each module, don't wait until the end
10. **Communication**: Update `INTERFACES.md` if any type definitions change during development

## Implementation Summary

**Completed Phases:**

- ✅ Phase 0: Initial Project Setup (Commit: 2424915)
- ✅ Phases 1-4: Backend Development (Commit: 07bab45, restored: 4e767fc)
- ✅ Phase 5: Frontend Development (Commit: 8bf4a3a, merged: e69ea08)
- ✅ Phase 6: Frontend-Backend Integration (Commit: bff6bc3)
- ✅ Phase 7: Vite + React Router Migration (Commit: 554f8a3)
  - Migrated from Next.js App Router to Vite + React + React Router
  - Fixed API key storage using Tauri app data directory
  - All features working in both dev and production

**Remaining Work:**

- ❌ Phase 8: Final Polish & Manual Testing
- ❌ Phase 9: Build & Distribution

### Master To-do List

**COMPLETED:**

- ✅ Initialize Tauri + Next.js project with proper configuration
- ✅ Install and configure all frontend and backend dependencies
- ✅ Configure capabilities and file system permissions in Tauri
- ✅ Define Rust data structures for Topics and SearchResults
- ✅ Implement JSON file storage module with read/write operations
- ✅ Create Perplexity API client with error handling
- ✅ Implement background scheduler with interval calculations
- ✅ Create all Tauri commands for CRUD operations and search triggers
- ✅ Build base layout with navigation and routing structure
- ✅ Create topic management UI (list, create, edit, details)
- ✅ Build results viewing UI (history, individual result pages)
- ✅ Add settings page with API key management
- ✅ Connect frontend to backend via invoke() calls and event listeners
- ✅ Integrate Perplexity API with real searches
- ✅ Fix all integration bugs (case sensitivity, parameter naming, paths)
- ✅ Migrate from Next.js to Vite + React Router (Phase 7)
- ✅ Implement Tauri API key storage commands (save_api_key, load_api_key)
- ✅ Fix API key persistence using app data directory
- ✅ Update Settings page to use Tauri invoke for API key management
- ✅ Fix lucide-react icon imports for breaking changes
- ✅ Convert all pages to React Router (Link, useNavigate, useLocation)
- ✅ Configure Vite with Tauri best practices

**REMAINING:**

- [ ] Implement comprehensive error handling and user feedback
- [ ] Add loading states and better validation
- [ ] Manual testing of all features and edge cases
- [ ] Create production build and verify binary works correctly
- [ ] Test on different platforms (macOS, Windows, Linux)

**Next Step:** Phase 8 - Final Polish & Manual Testing

**Current State:** 
- ✅ Fully functional in dev mode (`npm run tauri dev`)
- ✅ Ready for production builds (`npm run tauri build`)
- ✅ API key storage working properly
- ✅ All features operational

### To-dos

- [ ] Phase 0: Create base Tauri + Next.js project and INTERFACES.md (Agent 1, main branch)
- [ ] Phase 1: Install backend dependencies and configure permissions (Agent 1, feat/backend)
- [ ] Phase 2: Define Rust data structures and state management (Agent 1, feat/backend)
- [ ] Phase 3: Implement Perplexity client, scheduler, and Tauri commands (Agent 1, feat/backend)
- [ ] Phase 4: Write and run all backend unit and integration tests (Agent 1, feat/backend)
- [ ] Phase 5.1-5.2: Setup shadcn/ui, types, and mock data (Agent 2, feat/frontend)
- [ ] Phase 5.3: Build layout, navigation, and header components (Agent 2, feat/frontend)
- [ ] Phase 5.4: Create all topic management UI pages (Agent 2, feat/frontend)
- [ ] Phase 5.5: Create results and history UI pages (Agent 2, feat/frontend)
- [ ] Phase 5.6-5.7: Create reusable components and polish UI (Agent 2, feat/frontend)
- [ ] Merge feat/backend and feat/frontend to main
- [ ] Phase 6: Connect frontend to backend, implement event listeners (Either agent, main)
- [ ] Phase 7: Error handling, loading states, validation, and manual testing (Either agent, main)
- [ ] Phase 8: Production build and documentation (Either agent, main)