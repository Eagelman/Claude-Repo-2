//! Data models shared between the Rust backend and the JavaScript frontend.
//! All structs derive Serialize/Deserialize for seamless JSON transport via Tauri commands.

use serde::{Deserialize, Serialize};

// ============================================================================
// Core Entities
// ============================================================================

/// A retail store location.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Store {
    pub id: i64,
    pub name: String,
    pub created_at: String,
}

/// An employee in the store roster.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Employee {
    pub id: i64,
    pub store_id: i64,
    pub name: String,
    pub initials: String,
    pub status: String,
    pub weeks_on_record: i64,
    pub created_at: String,
    pub updated_at: String,
}

// ============================================================================
// Metrics & Analytics
// ============================================================================

/// A single day's performance metrics for one employee.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyMetric {
    pub id: i64,
    pub employee_id: i64,
    pub store_id: i64,
    pub date: String,
    pub sp_pct: Option<f64>,
    pub sp_n: Option<f64>,
    pub sp_d: Option<f64>,
    pub cust: Option<i64>,
    pub pts: Option<f64>,
}

/// Aggregated store-level summary for a date range.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreSummary {
    pub period: Period,
    pub mean_sp_pct: f64,
    pub mean_sp_n: f64,
    pub mean_sp_d: f64,
    pub mean_cust: f64,
    pub mean_pts: f64,
    pub median_sp_pct: f64,
    pub median_sp_n: f64,
    pub median_sp_d: f64,
    pub median_cust: f64,
    pub median_pts: f64,
}

/// A time period descriptor used across all pages.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Period {
    pub label: String,
    pub from: String,
    pub to: String,
    pub days: i64,
}

/// Per-employee aggregated data for the Compare All page.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmployeeCompare {
    pub id: i64,
    pub name: String,
    pub initials: String,
    pub sp_pct: f64,
    pub sp_n: f64,
    pub sp_d: f64,
    pub cust: f64,
    pub pts_wk: f64,
}

/// Full compare page data payload.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompareData {
    pub store: Store,
    pub period: Period,
    pub goals: MetricGoals,
    pub store_mean: MetricValues,
    pub store_median: MetricValues,
    pub employees: Vec<EmployeeCompare>,
}

/// Goal values for the five core metrics.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricGoals {
    pub sp_pct: f64,
    pub sp_n: f64,
    pub sp_d: f64,
    pub cust: f64,
    pub pts_wk: f64,
}

/// Metric values (means or medians).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricValues {
    pub sp_pct: f64,
    pub sp_n: f64,
    pub sp_d: f64,
    pub cust: f64,
    pub pts_wk: f64,
}

/// Overview page chart data for a single metric.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartSeries {
    pub label: String,
    pub values: Vec<f64>,
    pub dates: Vec<String>,
    pub y_min: f64,
    pub y_max: f64,
    pub goal_val: f64,
    pub mean_val: f64,
    pub median_val: f64,
    pub y_fmt: String,
}

/// Overview page summary card.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SummaryCard {
    pub label: String,
    pub value: f64,
    pub median_value: f64,
    pub trend: f64,
    pub trend_dir: String,
    pub goal: f64,
    pub goal_met: bool,
}

/// Full overview page payload.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverviewData {
    pub store: Store,
    pub period: Period,
    pub summary: Vec<SummaryCard>,
    pub charts: ChartCollection,
}

/// Collection of chart series keyed by metric.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartCollection {
    pub sp_pct: ChartSeries,
    pub cust: ChartSeries,
    pub sp_d: ChartSeries,
    pub sp_n: ChartSeries,
}

// ============================================================================
// Employee Detail (Bar/Line/Radar pages)
// ============================================================================

/// Single metric detail for the employee detail pages.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmployeeMetricDetail {
    pub key: String,
    pub label: String,
    pub emp_val: f64,
    pub store_avg: f64,
    pub store_median: f64,
    pub goal: f64,
    pub above_mean: bool,
    pub goal_met: bool,
    pub gap: f64,
}

/// Radar axis data point.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RadarAxis {
    pub key: String,
    pub label: String,
    pub emp_norm: f64,
    pub avg_norm: f64,
    pub median_norm: f64,
    pub personal_norm: f64,
}

/// Full employee detail payload.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmployeeDetail {
    pub employee: Employee,
    pub period: Period,
    pub metrics: Vec<EmployeeMetricDetail>,
    pub radar: Vec<RadarAxis>,
    pub charts: ChartCollection,
}

// ============================================================================
// Goals
// ============================================================================

/// A single goal configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Goal {
    pub id: Option<i64>,
    pub store_id: i64,
    pub metric_key: String,
    pub label: String,
    pub fmt: String,
    pub value: f64,
    pub unit: Option<String>,
    pub locked: bool,
    pub note: Option<String>,
}

/// Point system configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointSystem {
    pub id: Option<i64>,
    pub store_id: i64,
    pub sp_pct_pts: f64,
    pub cust_pts: f64,
    pub sp_d_pts: f64,
    pub sp_n_pts: f64,
    pub pts_wk_bonus: f64,
    pub note: Option<String>,
}

/// Point exception override for an employee.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointException {
    pub id: Option<i64>,
    pub store_id: i64,
    pub employee_id: i64,
    pub name: Option<String>,
    pub status: Option<String>,
    pub goal: Option<String>,
    pub locked: bool,
}

// ============================================================================
// Notes
// ============================================================================

/// A note attached to a specific month.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: Option<i64>,
    pub store_id: i64,
    pub month: String,
    pub title: String,
    pub body: Option<String>,
    pub locked: bool,
    pub author: Option<String>,
    pub category: String,
    pub censored: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

// ============================================================================
// Points Leaderboard
// ============================================================================

/// Employee entry in the points leaderboard.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointsEmployee {
    pub id: i64,
    pub name: String,
    pub initials: String,
    pub total_pts: f64,
    pub rank: i64,
    pub weekly_pts: Vec<f64>,
    pub current_week_pts: f64,
    pub cust_pts: f64,
    pub metric_hit_rates: MetricValues,
}

/// Full points page payload.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointsData {
    pub store: Store,
    pub period: Period,
    pub point_system: PointSystem,
    pub store_summary: PointsStoreSummary,
    pub employees: Vec<PointsEmployee>,
}

/// Store-level points summary.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointsStoreSummary {
    pub avg_pts_per_day: f64,
    pub weekly_pts_goal: f64,
    pub weekly_pts_earned: f64,
    pub associates_over_goal: i64,
    pub total_associates: i64,
}

// ============================================================================
// Trifecta
// ============================================================================

/// A single trifecta achievement record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrifectaRecord {
    pub id: Option<i64>,
    pub employee_id: i64,
    pub date: String,
    pub tier: i64,
    pub sp_d: f64,
    pub cust: i64,
    pub sp_n: f64,
    pub archived: bool,
}

/// Trifecta scoring formula configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrifectaFormula {
    pub id: Option<i64>,
    pub store_id: i64,
    pub spd_mult: f64,
    pub spd_weight: f64,
    pub cust_mult: f64,
    pub cust_weight: f64,
    pub spn_weight: f64,
}

/// Gift card record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GiftCard {
    pub id: Option<i64>,
    pub employee_id: i64,
    pub store_id: i64,
    pub amount: f64,
    pub status: String,
    pub fulfilled_date: Option<String>,
    pub notes: Option<String>,
    pub created_at: Option<String>,
}

/// Employee with trifecta records for the trifecta page.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrifectaEmployee {
    pub id: i64,
    pub name: String,
    pub initials: String,
    pub trifectas: Vec<TrifectaRecord>,
}

/// Full trifecta page payload.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrifectaData {
    pub store: Store,
    pub period: Period,
    pub goals: TrifectaGoals,
    pub formula: TrifectaFormula,
    pub employees: Vec<TrifectaEmployee>,
    pub gift_cards: Vec<GiftCard>,
    pub audit_log: Vec<AuditEntry>,
}

/// Trifecta-specific goal thresholds.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrifectaGoals {
    pub sp_d: f64,
    pub cust: i64,
    pub sp_n: f64,
}

// ============================================================================
// Audit & Import
// ============================================================================

/// An entry in the audit log.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEntry {
    pub id: i64,
    pub store_id: i64,
    pub action: String,
    pub user_name: Option<String>,
    pub details: Option<String>,
    pub created_at: String,
}

/// An entry in the import history log.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportLog {
    pub id: i64,
    pub store_id: i64,
    pub filename: String,
    pub records: i64,
    pub imported_at: String,
}

/// A single record from an Excel import (used by the Extractor page).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportRecord {
    pub employee_name: String,
    pub employee_initials: String,
    pub date: String,
    pub sp_pct: Option<f64>,
    pub sp_n: Option<f64>,
    pub sp_d: Option<f64>,
    pub cust: Option<i64>,
}

// ============================================================================
// Archive
// ============================================================================

/// Available date periods that have data.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvailablePeriod {
    pub label: String,
    pub from: String,
    pub to: String,
    pub record_count: i64,
}

/// Archive query result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchiveData {
    pub period: Period,
    pub records: Vec<DailyMetric>,
    pub summary: StoreSummary,
}

/// Heatmap day entry (used in Goals page).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeatmapDay {
    pub date: String,
    pub day: String,
    pub sp_pct_hit: bool,
    pub cust_hit: bool,
    pub sp_d_hit: bool,
    pub sp_n_hit: bool,
    pub pts_wk_hit: bool,
}

// ============================================================================
// Goals Page Full Payload
// ============================================================================

/// Performer entry for the goals page.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Performer {
    pub initials: String,
    pub name: String,
    pub sp_pct: f64,
    pub cust: f64,
    pub sp_d: f64,
    pub sp_n: f64,
    pub pts_wk: f64,
    pub total_pts: f64,
    pub weekly_pts: Vec<f64>,
    pub reason: String,
}

/// Full goals page payload.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoalsData {
    pub store: Store,
    pub manager: String,
    pub period: Period,
    pub last_updated: String,
    pub goals: Vec<Goal>,
    pub actuals: MetricValues,
    pub prior_actuals: MetricValues,
    pub point_system: PointSystem,
    pub pts_exceptions: Vec<PointException>,
    pub performers: Performers,
    pub notes: std::collections::HashMap<String, Vec<Note>>,
    pub heatmap: Vec<HeatmapDay>,
}

/// Performer categories for the goals page.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Performers {
    pub improvement: Vec<Performer>,
    pub best: Vec<Performer>,
}
