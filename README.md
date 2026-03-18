# GS Report Analytics

A Tauri v2 desktop application for retail store employee performance tracking and analytics, backed by a SQLite archive database.

## Features

- **GS Report Extractor** — Import Excel (.xlsx) daily sales reports and extract employee metrics
- **Overview Dashboard** — Store-wide summary with trend charts for SP %, Cust #, SP $, SP #
- **Employee Analytics** — Individual performance views: bar charts, line charts, radar charts
- **Compare All** — Side-by-side comparison of all employees across 5 metrics
- **Goals Management** — Set and track performance goals with monthly notes and coaching ideas
- **Points Leaderboard** — Gamified point system with weekly breakdowns and rankings
- **Trifecta Rewards** — Track gift card rewards when employees hit all 3 goals on the same shift
- **Archive Browser** — Browse historical data by day, week, month, quarter, or year with export

## Architecture

```
┌─────────────────────────────────────────────┐
│  Tauri Desktop Window                       │
│  ┌───────────┬────────────────────────────┐ │
│  │  Sidebar   │  Page Content             │ │
│  │  (nav)     │  (SPA router)             │ │
│  │            │                            │ │
│  │ Extractor  │  index.html shell          │ │
│  │ Analytics  │  + page JS modules         │ │
│  │ Points     │  + Tauri invoke() bridge   │ │
│  │ Compare    │                            │ │
│  │ Trifecta   │                            │ │
│  │ Archive    │                            │ │
│  └───────────┴────────────────────────────┘ │
│                     │                        │
│              Tauri invoke()                  │
│                     │                        │
│  ┌──────────────────▼───────────────────┐   │
│  │  Rust Backend (src-tauri/)           │   │
│  │  ├─ commands/ (store, employees,     │   │
│  │  │   metrics, goals, notes, points,  │   │
│  │  │   trifecta, import, archive)      │   │
│  │  ├─ db.rs (SQLite connection)        │   │
│  │  └─ models.rs (serde structs)        │   │
│  └──────────────────┬───────────────────┘   │
│                     │                        │
│  ┌──────────────────▼───────────────────┐   │
│  │  SQLite Database                     │   │
│  │  archive/gs_archive.db              │   │
│  │  (13 tables, temporal indexes)       │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Prerequisites

- **Rust** (1.70+) — [Install](https://rustup.rs)
- **Node.js** (18+) — [Install](https://nodejs.org)
- **System dependencies** for Tauri: see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Setup

```bash
# Install npm dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Database

The SQLite database is automatically created on first launch at the archive path. See [DATABASE.md](DATABASE.md) for:
- Complete schema documentation
- Query patterns for day/month/year indexing
- Data flow diagrams
- Backup instructions

### Key Tables

| Table | Description |
|-------|-------------|
| `store` | Store locations |
| `employee` | Employee roster |
| `daily_metric` | Core fact table — one row per employee per day |
| `goal` | Performance targets per metric |
| `note` | Monthly coaching notes |
| `trifecta` | Achievement records |
| `gift_card` | Reward tracking |
| `audit_log` | Change history |

### Temporal Indexing

The database supports efficient queries by any time period:
- **Day**: exact date match
- **Week**: 7-day rolling window
- **Month**: `substr(date,1,7)` index on `YYYY-MM`
- **Year**: `substr(date,1,4)` index on `YYYY`

## Project Structure

```
├── src/                    # Frontend
│   ├── index.html          # SPA shell with sidebar navigation
│   ├── css/app.css         # Shared CSS design system
│   ├── js/
│   │   ├── app.js          # Hash-based router
│   │   ├── pages/          # Page modules (one per view)
│   │   └── lib/            # Shared utilities
│   └── vendor/             # Third-party libraries
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── lib.rs          # App builder + command registration
│   │   ├── db.rs           # SQLite init + migrations
│   │   ├── models.rs       # Data structures
│   │   └── commands/       # Tauri commands (9 modules)
│   ├── migrations/         # SQL schema files
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── DATABASE.md             # Database documentation
└── package.json            # npm configuration
```

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `#/extractor` | GS Report Extractor | Import Excel files |
| `#/overview` | Overview Dashboard | Store summary + trends |
| `#/compare` | Compare All | Multi-employee comparison |
| `#/employee/bar` | Employee Bar | Individual bar charts |
| `#/employee/line` | Employee Line | Individual trend lines |
| `#/employee/radar` | Employee Radar | Multi-metric radar |
| `#/goals` | Goals | Goal management + notes |
| `#/points` | Points | Leaderboard rankings |
| `#/trifecta` | Trifecta | Reward program |
| `#/archive` | Archive | Historical data browser |

## Core Metrics

| Metric | Key | Format | Description |
|--------|-----|--------|-------------|
| SP % | `sp_pct` | Percentage | Service plan attachment rate |
| Cust # | `cust` | Integer | Daily customer count |
| SP $ | `sp_d` | Dollar | Service plan dollar amount |
| SP # | `sp_n` | Decimal | Service plan count |
| Pts/wk | `pts_wk` | Decimal | Weekly points earned |
