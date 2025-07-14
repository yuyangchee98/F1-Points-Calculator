# F1 Points Calculator - Architecture Documentation

A React-based Formula 1 championship calculator with drag-and-drop functionality, real-time points calculation, and comprehensive data visualization for the 2025 F1 season.

## Project Overview

The F1 Points Calculator allows users to predict and visualize Formula 1 championship outcomes by dragging drivers into race positions. It calculates points in real-time, tracks both driver and constructor championships, and provides interactive charts showing championship progression throughout the season.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Drag-and-Drop**: react-dnd with HTML5 backend
- **Charts**: Chart.js with react-chartjs-2
- **Analytics**: Google Analytics 4
- **API Integration**: Ergast F1 API (via proxy) and custom Cloudflare Workers API

## Project Structure

```
src/
├── components/          # UI components organized by feature
│   ├── charts/         # Points progression visualizations
│   ├── common/         # Shared UI components
│   ├── drivers/        # Driver selection and cards
│   ├── grid/           # Race grid and drag-drop interface
│   ├── layout/         # App layout components
│   ├── navigation/     # Mobile navigation
│   └── standings/      # Championship tables
├── store/              # Redux state management
│   ├── slices/         # Redux slices for each domain
│   └── selectors/      # Memoized selectors for performance
├── hooks/              # Custom React hooks
├── utils/              # Helper functions and utilities
│   └── api/            # API integration layer
├── data/               # Static data files
├── types/              # TypeScript type definitions
└── styles/             # CSS files
```

## Core Architecture

### State Management

The application uses Redux Toolkit with five main slices:

#### 1. **driversSlice** (`src/store/slices/driversSlice.ts`)
- **State**: List of drivers and driver-team mappings
- **Key Actions**: `updateDriverTeam`
- **Purpose**: Manages driver data including mid-season team changes (e.g., Tsunoda/Lawson swaps)

#### 2. **racesSlice** (`src/store/slices/racesSlice.ts`)
- **State**: Race calendar and past results
- **Key Actions**: `updatePastResults`, `markRaceAsCompleted`, `fetchPastRaceResults`
- **Purpose**: Manages race schedule and integrates official results from F1 API

#### 3. **gridSlice** (`src/store/slices/gridSlice.ts`)
- **State**: Grid positions (driver placements)
- **Key Actions**: `moveDriver`, `placeDriver`, `clearPosition`, `swapPositions`, `resetGrid`, `toggleOfficialResults`, `loadPredictions`
- **Purpose**: Core drag-and-drop state management
- **Key Features**:
  - Unified `moveDriver` action handles all position changes
  - Preserves official results when toggling views
  - Supports loading shared predictions from URLs

#### 4. **uiSlice** (`src/store/slices/uiSlice.ts`)
- **State**: UI preferences (active tab, mobile view, selected driver/race, points system)
- **Key Actions**: `setActiveTab`, `setMobileView`, `selectDriver`, `selectPointsSystem`, `initializeUiState`
- **Purpose**: Manages UI state with localStorage persistence
- **Features**: Automatically saves and restores user preferences

#### 5. **resultsSlice** (`src/store/slices/resultsSlice.ts`)
- **State**: Calculated standings and points history
- **Key Actions**: `calculateResults` (async thunk)
- **Purpose**: Calculates championship standings based on grid positions
- **Algorithm**: Processes all race results, applies selected points system, generates standings

### Component Architecture

#### Layout Components

**App.tsx** (`src/App.tsx`)
- Root component managing drag-and-drop context
- Initializes UI state from localStorage/URL parameters
- Handles responsive layout switching
- Integrates analytics tracking

**Layout.tsx** (`src/components/layout/Layout.tsx`)
- Main layout wrapper with collapsible sidebar
- Responsive design with mobile/tablet/desktop breakpoints
- Manages sidebar visibility state

#### Grid Components

**RaceGrid.tsx** (`src/components/grid/RaceGrid.tsx`)
- Main grid displaying all races and positions
- CSS Grid layout with sticky position column
- Responsive column sizing based on device
- Alternating row colors for readability

**RaceColumn.tsx** (`src/components/grid/RaceColumn.tsx`)
- Individual race column with 20 position slots
- Handles drag-and-drop for each position
- Visual indicators for completed races and sprints
- Integrates with `useDriverDrop` hook

**DriverCard.tsx** (`src/components/drivers/DriverCard.tsx`)
- Draggable driver element with team colors
- Shows driver name, number, and team
- Visual feedback during drag operations
- Disabled state for already-placed drivers

#### Standings Components

**StandingsSidebar.tsx** (`src/components/standings/StandingsSidebar.tsx`)
- Container for standings tables and charts
- Tab navigation between tables and visualizations
- Responsive behavior (full sidebar on desktop, tabs on mobile)

**DriverStandingsTable.tsx** (`src/components/standings/DriverStandingsTable.tsx`)
- Championship leaderboard with position changes
- Clickable rows for driver selection
- Points breakdown by race
- Visual indicators for position changes

**Charts** (`src/components/charts/`)
- **DriverPointsChart.tsx**: Line chart for driver championship progression
- **TeamPointsChart.tsx**: Line chart for constructor championship
- **LazyCharts.tsx**: Code-splitting for performance
- Responsive design with touch support

### Custom Hooks

**useDriverDragDrop.ts** (`src/hooks/useDriverDragDrop.ts`)
- Core drag-and-drop functionality using react-dnd
- Handles driver placement, swapping, and movement
- Toast notifications for user feedback
- Analytics tracking for user interactions
- Prevents duplicate drop events

**useWindowSize.ts** (`src/hooks/useWindowSize.ts`)
- Responsive design helper
- Returns device type (mobile/tablet/desktop)
- Uses Tailwind breakpoints for consistency

**useRaceResults.ts** (`src/hooks/useRaceResults.ts`)
- Fetches and initializes official race results
- Runs once on app load
- Handles API errors gracefully

**useStandingsAnimation.ts** (`src/hooks/useStandingsAnimation.ts`)
- Smooth animations for standings changes
- Highlights position changes
- Configurable animation duration

### Data Layer

#### Static Data Files (`src/data/`)

**drivers.ts**
- Complete driver roster with IDs, names, teams, and numbers
- Helper functions for driver lookups
- Special handling for reserve drivers

**teams.ts**
- Team data with colors for UI theming
- Normalized team names for consistency
- Helper functions for team lookups

**races.ts**
- Full 2025 calendar with 23 races
- Sprint race indicators
- Country codes for flag display
- Race order for proper sorting

**pointsSystems.ts**
- 20+ different points scoring systems
- Historical F1 systems (1950s-present)
- Other motorsports (MotoGP, IndyCar, Formula E)
- Mathematical variations (linear, exponential, Fibonacci)
- Creative scoring systems (winner-takes-all, underdog, etc.)

**pastResults.ts**
- Hardcoded results for completed races
- Fallback when API is unavailable
- Format matches API response structure

