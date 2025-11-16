<!-- 7a6e96b8-ff70-47d6-b120-63f11693ad09 3eea6497-b4d0-43ad-a2ef-468722b0af8d -->
# Perplexity Search Orchestrator - Implementation Plan

## Project Architecture

**Frontend**: Next.js 14+ (static export) + shadcn/ui components

**Backend**: Tauri 2.0 (Rust) with file system and state management

**API**: Perplexity Sonar Reasoning model via HTTP

**Storage**: JSON files in AppData directory

## Development Strategy: Parallel Tracks

### **SEQUENTIAL**: Phase 0 - Initial Setup (Main Branch)

**Agent 1** completes base project structure, then both agents branch off

### **PARALLEL TRACK 1**: Backend Development (Agent 1 - `feat/backend`)

Phases 1.2, 1.3, 2, 3, 4

### **PARALLEL TRACK 2**: Frontend Development (Agent 2 - `feat/frontend`)  

Phase 5 (after interfaces are shared)

### **SEQUENTIAL**: Integration & Completion (Main Branch)

Phases 6, 7, 8 (after merging both branches)

---

## Phase 0: Initial Project Setup (SEQUENTIAL - Agent 1)

**Branch**: `main`

**Agent**: Backend Agent (Agent 1)

### 0.1 Initialize Tauri + Next.js Project

- Run `npm create tauri-app@latest` with Next.js template
- Configure `next.config.mjs` for static export (`output: 'export'`)
- Configure `tauri.conf.json`:
  - Set `frontendDist` to `../out`
  - Set `devUrl` to `http://localhost:3000`
  - Configure app identifier and window settings
- Verify basic app runs: `npm run tauri dev`
- Commit and push to `main`

### 0.2 Create Interface Definition Document

Create `INTERFACES.md` with:

- Rust struct definitions for `Topic`, `SearchResult`, `Interval`
- TypeScript interface equivalents
- API command signatures (all Tauri commands)
- Event names and payloads

**CHECKPOINT**: Both agents branch from `main` after Phase 0 completes

---

## PARALLEL TRACK 1: Backend Development

**Branch**: `feat/backend`

**Agent**: Backend Agent (Agent 1)

**Focus**: `src-tauri/` directory only

### Phase 1: Backend Setup & Configuration

#### 1.1 Install Backend Dependencies

Add to `Cargo.toml`:

- `serde` and `serde_json` for JSON serialization
- `tokio` for async runtime  
- `reqwest` for HTTP calls to Perplexity API
- `uuid` for generating IDs
- `chrono` for timestamp handling
- `dotenvy` for environment variables
- Dev dependencies: `tokio-test`, `mockito` for testing

#### 1.2 Configure Environment & Permissions

- Create `.env.example` file template
- Set up capabilities in `src-tauri/capabilities/default.json`:
  - `fs:allow-appdata-read-recursive`
  - `fs:allow-appdata-write-recursive`
  - `fs:allow-mkdir`
  - `fs:allow-write-file`
  - `fs:allow-read-file`
  - Core permissions for window, events, etc.

### Phase 2: Backend - Data Models & State

#### 2.1 Define Rust Data Structures

Create `src-tauri/src/models.rs`:

- `Topic` struct: id, name, query, interval (enum: Hourly/Daily/Weekly), active, created_at, last_run, next_run
- `SearchResult` struct: id, topic_id, query, timestamp, status, response, error
- `Interval` enum with serialization
- All structs derive: `Serialize`, `Deserialize`, `Clone`, `Debug`

#### 2.2 Implement State Management

Create `src-tauri/src/state.rs`:

- `AppState` struct with `Mutex<Vec<Topic>>`
- `SchedulerState` to track running scheduler
- Initialize in `lib.rs` using `app.manage()`

#### 2.3 Create File System Module

Create `src-tauri/src/storage.rs`:

- `load_topics()`: Read from `AppData/topics.json`
- `save_topics()`: Write to `AppData/topics.json`
- `save_result()`: Write to `AppData/results/{topic_id}/{timestamp}.json`
- `load_results()`: Read results for a topic
- Helper functions for directory creation
- Proper error handling with custom error types

### Phase 3: Backend - Core Functionality

#### 3.1 Perplexity API Client

Create `src-tauri/src/perplexity.rs`:

- `PerplexityClient` struct with API key
- `execute_search()` async function using `reqwest`
- Request to `https://api.perplexity.ai/chat/completions`
- Model: `sonar-reasoning`
- Error handling and response parsing
- Timeout configuration

#### 3.2 Scheduler Logic

Create `src-tauri/src/scheduler.rs`:

- `calculate_next_run()`: Calculate next run time based on interval
- `should_run_now()`: Check if topic needs to run
- `run_scheduler()`: Background task that checks every 60 seconds
- Updates `next_run` after execution
- Emits events to frontend on search completion
- Graceful shutdown handling

#### 3.3 Tauri Commands

Create `src-tauri/src/commands.rs`:

- `get_topics()`: Return all topics
- `create_topic(name, query, interval)`: Add new topic, calculate next_run
- `update_topic(id, ...)`: Update existing topic
- `delete_topic(id)`: Remove topic and optionally results
- `toggle_topic(id)`: Pause/resume topic
- `trigger_search(id)`: Manual search execution
- `get_results(topic_id, limit)`: Get recent results
- `get_result(id)`: Get single result details
- `start_scheduler()`: Start background scheduler
- `stop_scheduler()`: Stop background scheduler

Register all commands in `lib.rs` via `invoke_handler()`

### Phase 4: Backend Testing

#### 4.1 Unit Tests Setup

- Configure test modules in `src-tauri/src/lib.rs`
- Create `src-tauri/src/tests/` directory structure

#### 4.2 Core Module Tests

Create test files in `src-tauri/src/tests/`:

- `storage_tests.rs`: Test JSON read/write operations
  - Test topics serialization/deserialization
  - Test results file creation and reading
  - Test directory creation edge cases
  - Test error handling for invalid JSON
- `scheduler_tests.rs`: Test scheduling logic
  - Test `calculate_next_run()` for hourly interval
  - Test `calculate_next_run()` for daily interval
  - Test `calculate_next_run()` for weekly interval
  - Test `should_run_now()` with various timestamps
  - Test edge cases (past times, future times, timezone handling)
- `models_tests.rs`: Test data structures
  - Test Topic serialization/deserialization
  - Test SearchResult serialization/deserialization
  - Test Interval enum conversions and validation

#### 4.3 Integration Tests

- Test full command flows (create → read → update → delete)
- Test search execution end-to-end
- Mock Perplexity API responses using `mockito`
- Verify state management across multiple operations
- Test concurrent access to state

#### 4.4 Run Tests & Document

- Execute `cargo test` in `src-tauri/`
- Ensure all tests pass
- Update `INTERFACES.md` if any changes were made
- Document backend API in README

**DELIVERABLE**: Fully tested backend with all Tauri commands working, ready for merge

---

## PARALLEL TRACK 2: Frontend Development

**Branch**: `feat/frontend`

**Agent**: Frontend Agent (Agent 2)

**Focus**: `app/`, `components/`, `lib/` directories only

### Phase 5: Frontend - UI Components

#### 5.1 Setup shadcn/ui & Base Configuration

- Initialize shadcn/ui: `npx shadcn@latest init`
- Install required components:
  - Button, Card, Table, Form, Input, Select
  - Dialog, Badge, Alert, Separator
  - Tabs, ScrollArea, Skeleton, Toaster
- Setup Tailwind config with theme

#### 5.2 Create Type Definitions & Mock Data

Create `lib/types.ts`:

- Copy TypeScript interfaces from `INTERFACES.md`
- `Topic`, `SearchResult`, `Interval` types
- Command parameter and return types

Create `lib/mock-data.ts`:

- Mock topics array (3-5 sample topics)
- Mock search results (10-15 sample results)
- Helper functions to generate mock data

Create `lib/api.ts` (stub version):

- Wrapper functions for all Tauri commands using `invoke()`
- Initially return mock data with setTimeout to simulate async
- Add `// TODO: Connect to real backend` comments
- TypeScript interfaces matching Rust structs
- Error handling structure

#### 5.3 Create Layout & Navigation

- `app/layout.tsx`: Root layout with sidebar navigation
  - Setup Toaster for notifications
  - Setup theme provider
- `components/nav.tsx`: Navigation menu (Topics, History)
  - Active state highlighting
  - Icons for each section
- `components/header.tsx`: App header with controls
  - App title
  - Scheduler status indicator (mock)
  - Settings button (future)

#### 5.4 Topic Management UI

- `app/topics/page.tsx`: Main topics list view
  - Table showing: name, interval, status, last run, next run
  - Actions: Edit, Delete, Pause/Resume, Manual Trigger
  - Empty state when no topics
  - Loading state skeleton
- `app/topics/new/page.tsx`: Create topic form
  - Fields: name, query (textarea), interval (select)
  - Form validation (react-hook-form + zod)
  - Success/error toast notifications
- `app/topics/[id]/page.tsx`: Topic details view
  - Show configuration in cards
  - Recent results list (5 most recent)
  - Manual trigger button
  - Edit/delete actions
- `app/topics/[id]/edit/page.tsx`: Edit topic form
  - Pre-filled form with existing values
  - Same validation as create form

#### 5.5 Results UI

- `app/history/page.tsx`: All results across topics
  - Filterable by topic (select dropdown)
  - Table with: timestamp, topic, status, preview
  - Pagination (show 20 per page)
  - Empty state when no results
- `app/results/[id]/page.tsx`: Single result view
  - Full query display
  - Full response display (formatted, scrollable)
  - Metadata cards (timestamp, status, error if any)
  - Back to history button

#### 5.6 Create Reusable Components

- `components/topic-card.tsx`: Display topic summary
  - Compact card view with key info
  - Quick actions (trigger, pause/resume)
- `components/result-card.tsx`: Display search result
  - Preview of result content
  - Status badge
  - Click to view full result
- `components/status-badge.tsx`: Show active/paused/error status
  - Color coded (green/yellow/red)
  - Icons for each status
- `components/interval-badge.tsx`: Display interval type
  - Distinct styling for hourly/daily/weekly
- `components/scheduler-control.tsx`: Start/stop scheduler
  - Toggle button
  - Status indicator
  - Uses mock state for now

#### 5.7 Polish & Responsiveness

- Ensure all components are responsive (mobile, tablet, desktop)
- Add loading states with skeletons
- Add empty states with illustrations or helpful text
- Add proper error boundaries
- Test all routes and navigation flows

**DELIVERABLE**: Complete UI with mock data, all pages functional, ready for backend integration

---

## SEQUENTIAL: Integration & Completion

**Branch**: `main` (after merging `feat/backend` and `feat/frontend`)

**Agent**: Either agent can complete

### Phase 6: Frontend - Backend Integration

#### 6.1 Connect API Layer

Update `lib/api.ts`:

- Replace mock data with actual `invoke()` calls
- Test each command individually
- Implement proper error handling
- Add retry logic where appropriate

#### 6.2 State Management

- Setup React Context or Zustand for global state
- Topics list state (sync with backend)
- Scheduler status state (sync with backend)
- Real-time updates via Tauri events

#### 6.3 Event Listeners

- Listen for `search-completed` events from backend
- Update UI when searches complete
- Show toast notifications for background events
- Update topic status indicators in real-time

#### 6.4 Remove Mock Data

- Delete `lib/mock-data.ts`
- Remove all mock data references
- Verify app works with real backend

### Phase 7: Polish & Manual Testing

#### 7.1 Error Handling

- Frontend: Display user-friendly error messages
- Backend: Proper error types and logging
- Handle API failures gracefully
- Network error handling
- File system error handling

#### 7.2 Loading States

- Skeletons for data loading
- Loading indicators for async operations
- Disable buttons during operations
- Optimistic UI updates where appropriate

#### 7.3 Data Validation

- Frontend form validation (already done in Phase 5.4)
- Backend input validation in commands
- Prevent invalid intervals/queries
- Sanitize user input

#### 7.4 End-to-End Manual Testing

- Create/edit/delete topics
- Trigger manual searches
- Verify scheduled execution works correctly
- Check JSON file structure and persistence
- Test error scenarios:
  - Invalid API key
  - Network errors
  - Missing .env file
  - Corrupted JSON files
- Test app restart and state persistence
- Test with multiple topics running
- Test scheduler start/stop

### Phase 8: Build & Distribution

#### 8.1 Production Build

- Build Next.js: `npm run build`
- Verify static export works
- Build Tauri: `npm run tauri build`
- Test production binary on macOS
- Check app size and performance

#### 8.2 Documentation

- Update README with:
  - Setup instructions
  - Prerequisites (Rust, Node.js)
  - .env configuration
  - Development guide
  - Build instructions
- Add usage examples with screenshots
- Document testing procedures
- Add troubleshooting section

---

## Key Files Structure

```
project-root/
├── src-tauri/                      # BACKEND AGENT FOCUS
│   ├── src/
│   │   ├── lib.rs                  # Main entry, setup
│   │   ├── commands.rs             # Tauri commands
│   │   ├── models.rs               # Data structures
│   │   ├── state.rs                # App state management
│   │   ├── storage.rs              # File I/O operations
│   │   ├── perplexity.rs           # API client
│   │   ├── scheduler.rs            # Background scheduler
│   │   └── tests/                  # Unit & integration tests
│   │       ├── mod.rs
│   │       ├── storage_tests.rs
│   │       ├── scheduler_tests.rs
│   │       └── models_tests.rs
│   ├── capabilities/
│   │   └── default.json            # Permissions config
│   ├── Cargo.toml                  # Rust dependencies
│   ├── tauri.conf.json             # Tauri configuration
│   └── build.rs                    # Build script
├── app/                            # FRONTEND AGENT FOCUS
│   ├── layout.tsx
│   ├── page.tsx
│   ├── topics/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── edit/page.tsx
│   ├── history/
│   │   └── page.tsx
│   └── results/
│       └── [id]/page.tsx
├── components/                     # FRONTEND AGENT FOCUS
│   ├── ui/                         # shadcn components
│   ├── nav.tsx
│   ├── header.tsx
│   ├── topic-card.tsx
│   ├── result-card.tsx
│   ├── status-badge.tsx
│   ├── interval-badge.tsx
│   └── scheduler-control.tsx
├── lib/                            # FRONTEND AGENT FOCUS
│   ├── types.ts                    # TypeScript types
│   ├── api.ts                      # Tauri invoke wrappers
│   ├── mock-data.ts                # Mock data (Phase 5 only)
│   └── utils.ts                    # Utility functions
├── INTERFACES.md                   # SHARED - Both agents reference
├── .env.example                    # Environment template
├── .env                            # Local environment (gitignored)
├── next.config.mjs                 # Next.js config
└── package.json                    # Node dependencies
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

## Coordination & Merge Strategy

1. **Phase 0**: Agent 1 completes on `main`, both agents pull
2. **Branching**: Both agents create their feature branches
3. **Development**: Agents work independently referencing `INTERFACES.md`
4. **Communication**: If interface changes are needed, update `INTERFACES.md` and notify other agent
5. **Testing**: Each agent tests their work independently
6. **Merge Order**: 

   - Merge `feat/backend` first (it has no dependencies)
   - Then merge `feat/frontend` (may need minor conflict resolution in package.json)

7. **Integration**: One agent completes Phases 6-8 after successful merge

### To-dos

- [ ] Initialize Tauri + Next.js project with proper configuration for static export
- [ ] Install and configure all frontend and backend dependencies
- [ ] Configure capabilities and file system permissions in Tauri
- [ ] Define Rust data structures for Topics and SearchResults
- [ ] Implement JSON file storage module with read/write operations
- [ ] Create Perplexity API client with error handling
- [ ] Implement background scheduler with interval calculations
- [ ] Create all Tauri commands for CRUD operations and search triggers
- [ ] Build base layout with navigation and routing structure
- [ ] Create topic management UI (list, create, edit, details)
- [ ] Build results viewing UI (history, individual result pages)
- [ ] Connect frontend to backend via invoke() calls and event listeners
- [ ] Implement comprehensive error handling and user feedback
- [ ] Manual testing of all features and edge cases
- [ ] Create production build and verify binary works correctly