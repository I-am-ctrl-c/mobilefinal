/*
 * WorkoutMetricsService
 * ---------------------
 *  High-level helper focused on workout-related analytics.
 *  - Aggregates & normalises data from Firestore `users/<uid>/dailyStats/…`
 *  - Provides convenient getters for daily / weekly / monthly data
 *  - Transparently caches results in-memory for the lifetime of the tab to
 *    reduce the number of Firestore reads.
 */

import FirebaseService from './firebaseService.js'

export default class WorkoutMetricsService {
  /** @type {WorkoutMetricsService|null} */
  static _instance = null

  /** Singleton accessor */
  static getInstance() {
    if (!WorkoutMetricsService._instance) {
      WorkoutMetricsService._instance = new WorkoutMetricsService()
    }
    return WorkoutMetricsService._instance
  }

  constructor() {
    /** @private */ this._fb = FirebaseService.getInstance()
    /** @private */ this._dailyCache  = new Map()   // key: `${uid}_${yyyy-mm-dd}` → normalized daily obj
    /** @private */ this._rangeCache  = new Map()   // key: `${uid}_${fromId}_${toId}` → raw map from fetchDailyStatsRange
  }

  /* ─────────────────────────── Helpers ─────────────────────────── */

  /** Format Date → `YYYY-MM-DD` string */
  _dateId(d) {
    // Convert to local YYYY-MM-DD, compensating timezone offset
    const tzOffsetMs = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - tzOffsetMs).toISOString().split('T')[0]
  }

  _rangeKey(uid, from, to) {
    return `${uid}_${this._dateId(from)}_${this._dateId(to)}`
  }

  /** Convert raw dailyStats doc → normalised object with safe defaults */
  _normalizeDaily(raw) {
    return {
      caloriesCurrent: raw?.caloriesCurrent ?? 0,
      caloriesGoal:    raw?.caloriesGoal    ?? 0,
      bmi:             raw?.bmi             ?? null,
      activities:      raw?.activities      ?? []
    }
  }

  /* ─────────────────────────── Public API ─────────────────────────── */

  /**
   * Get normalised stats for a single date. Uses in-memory cache.
   * @param {string} uid
   * @param {Date}   date
   */
  async getDaily(uid, date) {
    const key = `${uid}_${this._dateId(date)}`
    if (this._dailyCache.has(key)) return this._dailyCache.get(key)

    const raw = await this._fb.fetchDailyStats(uid, date)
    const norm = this._normalizeDaily(raw)
    this._dailyCache.set(key, norm)
    return norm
  }

  /**
   * Get a map of daily stats within [start, end] (inclusive).
   * Returned value is the same shape as FirebaseService.fetchDailyStatsRange.
   * Uses cache internally.
   */
  async getRangeMap(uid, start, end) {
    const rk = this._rangeKey(uid, start, end)
    if (this._rangeCache.has(rk)) return this._rangeCache.get(rk)

    const map = await this._fb.fetchDailyStatsRange(uid, start, end)
    this._rangeCache.set(rk, map)

    // Also hydrate dailyCache for individual days to speed up later accesses
    Object.entries(map).forEach(([id, raw]) => {
      this._dailyCache.set(`${uid}_${id}`, this._normalizeDaily(raw))
    })

    return map
  }

  /**
   * Convenience: get an ARRAY (Mon..Sun) for the given week (start → Sun).
   * Each element: { caloriesCurrent, caloriesGoal, bmi }
   */
  async getWeekArray(uid, weekStart) {
    const end = new Date(weekStart); end.setDate(end.getDate() + 6)
    const map = await this.getRangeMap(uid, weekStart, end)

    const arr = []
    const cur = new Date(weekStart)
    for (let i = 0; i < 7; i++) {
      const norm = this._normalizeDaily(map[this._dateId(cur)])
      arr.push(norm)
      cur.setDate(cur.getDate() + 1)
    }
    return arr
  }

  /**
   * Get a map for an entire calendar month (1st → last day).
   * Keyed by `YYYY-MM-DD`.
   */
  async getMonthMap(uid, monthDate) {
    const y = monthDate.getFullYear()
    const m = monthDate.getMonth()
    const first = new Date(y, m, 1)
    const last  = new Date(y, m + 1, 0)
    return this.getRangeMap(uid, first, last)
  }

  /**
   * Aggregate total caloriesCurrent / caloriesGoal for a period.
   * @returns {{current:number, goal:number}}
   */
  async getCalorieTotals(uid, from, to) {
    const map = await this.getRangeMap(uid, from, to)
    let cur = 0, goal = 0
    Object.values(map).forEach(raw => {
      cur  += raw?.caloriesCurrent ?? 0
      goal += raw?.caloriesGoal    ?? 0
    })
    return { current: cur, goal }
  }

  /** Wipe in-memory caches – useful when user logs out */
  clearCache() {
    this._dailyCache.clear()
    this._rangeCache.clear()
  }
}
