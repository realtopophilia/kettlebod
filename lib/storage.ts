import type { GeneratedWorkout, JournalEntry, UserProfile } from './types'

const KEYS = {
  profile:        'kb-profile',
  currentWorkout: 'kb-current-workout',
  journal:        'kb-journal',
}

// ── Profile ───────────────────────────────────────────────────────────────────

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Jason',
  heightFt: 6,
  heightIn: 3,
  weightLbs: 260,
  primaryGoal: 'Increase vertical jump from ~12" to 22" to dunk a tennis ball by February 1, 2027.',
  secondaryGoal: 'Increase mobility and low-back strength.',
  kettlebellLight: '',
  kettlebellMedium: '',
  kettlebellHeavy: '',
  hasSlantBoard: true,
  hasBands: true,
  hasDumbbells: true,
  hasPeloton: true,
  onboardingComplete: false,
}

export function getProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(KEYS.profile)
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE
  } catch { return DEFAULT_PROFILE }
}

export function saveProfile(p: UserProfile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(p))
}

// ── Current workout (in-progress) ─────────────────────────────────────────────

export function getCurrentWorkout(): GeneratedWorkout | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEYS.currentWorkout)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveCurrentWorkout(w: GeneratedWorkout) {
  localStorage.setItem(KEYS.currentWorkout, JSON.stringify(w))
}

export function clearCurrentWorkout() {
  localStorage.removeItem(KEYS.currentWorkout)
}

// ── Journal ───────────────────────────────────────────────────────────────────

export function getJournal(): JournalEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEYS.journal)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addJournalEntry(entry: JournalEntry) {
  const journal = getJournal()
  // Most recent first
  journal.unshift(entry)
  localStorage.setItem(KEYS.journal, JSON.stringify(journal))
}

export function getRecentJournalSummary(n = 5): string {
  const entries = getJournal().slice(0, n)
  if (entries.length === 0) return 'No previous sessions yet.'
  return entries.map(e => {
    const modified = e.exercises.filter(x => x.modified).map(x => x.name)
    const skipped  = e.exercises.filter(x => x.skipped).map(x => x.name)
    let line = `- ${e.date}: ${e.workoutTitle}. Alignment: ${e.alignmentScore}/100.`
    if (modified.length) line += ` Modified: ${modified.join(', ')}.`
    if (skipped.length)  line += ` Skipped: ${skipped.join(', ')}.`
    return line
  }).join('\n')
}

// ── Alignment score ───────────────────────────────────────────────────────────

export function computeAlignment(exercises: JournalEntry['exercises'], completed: boolean): number {
  let score = 100
  for (const ex of exercises) {
    if (ex.skipped)  score -= 20
    else if (ex.modified) score -= 10
  }
  if (!completed) score -= 10
  return Math.max(0, score)
}
