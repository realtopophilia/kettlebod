'use client'

import { useState, useEffect } from 'react'
import { getJournal, deleteJournalEntry } from '@/lib/storage'
import type { JournalEntry } from '@/lib/types'

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-green-400/10 border-green-400/20'
  if (score >= 50) return 'bg-amber-400/10 border-amber-400/20'
  return 'bg-red-400/10 border-red-400/20'
}

function ConsistencyCalendar({ entries }: { entries: JournalEntry[] }) {
  const today = new Date()
  const weeks = 16
  const days: { date: string; score: number | null }[] = []

  // Build 16 weeks of days, Sunday–Saturday
  const start = new Date(today)
  start.setDate(start.getDate() - (weeks * 7) + 1)
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay())

  const entryMap: Record<string, number> = {}
  for (const e of entries) {
    entryMap[e.date] = e.alignmentScore
  }

  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    days.push({ date: iso, score: entryMap[iso] ?? null })
  }

  function cellColor(score: number | null) {
    if (score === null) return 'bg-zinc-800'
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-green-700'
    return 'bg-amber-600'
  }

  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
        {days.map((d, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm ${cellColor(d.score)}`}
            title={d.score !== null ? `${d.date}: ${d.score}/100` : d.date}
          />
        ))}
      </div>
    </div>
  )
}

function InsightCard({ entries }: { entries: JournalEntry[] }) {
  if (entries.length < 2) return null

  const recent = entries.slice(0, 6)

  // Pattern: alignment drop
  const last3 = entries.slice(0, 3).map(e => e.alignmentScore)
  if (last3.length === 3 && last3[0] < last3[1] && last3[1] < last3[2]) {
    return (
      <div className="border-l-2 border-amber-500 pl-4 py-2 mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">This week</p>
        <p className="text-zinc-300 text-sm">Your last 3 sessions have trended down in alignment. An easy 20-minute session might be better than pushing through today.</p>
      </div>
    )
  }

  // Pattern: high alignment streak
  const last4 = entries.slice(0, 4).map(e => e.alignmentScore)
  if (last4.length === 4 && last4.every(s => s >= 80)) {
    return (
      <div className="border-l-2 border-green-500 pl-4 py-2 mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">This week</p>
        <p className="text-zinc-300 text-sm">You&apos;ve completed the last 4 workouts as written. If they&apos;re feeling easy, try stepping up the difficulty.</p>
      </div>
    )
  }

  // Pattern: repeated skip
  const skipCounts: Record<string, number> = {}
  for (const e of recent) {
    for (const ex of e.exercises) {
      if (ex.skipped) skipCounts[ex.name] = (skipCounts[ex.name] || 0) + 1
    }
  }
  const chronic = Object.entries(skipCounts).find(([, n]) => n >= 3)
  if (chronic) {
    return (
      <div className="border-l-2 border-amber-500 pl-4 py-2 mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">This week</p>
        <p className="text-zinc-300 text-sm">You&apos;ve skipped <strong className="text-zinc-100">{chronic[0]}</strong> in {chronic[1]} of your last 6 sessions. The prescription might need adjusting.</p>
      </div>
    )
  }

  return null
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setEntries(getJournal())
  }, [])

  function handleDelete(id: string) {
    deleteJournalEntry(id)
    setEntries(getJournal())
    setConfirmId(null)
  }

  const thisMonth = entries.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7)))
  const avgAlignment = thisMonth.length
    ? Math.round(thisMonth.reduce((s, e) => s + e.alignmentScore, 0) / thisMonth.length)
    : null

  return (
    <div className="pt-10 pb-6">
      <h1 className="text-2xl font-bold text-zinc-100 mb-8">Journal</h1>

      {entries.length === 0 ? (
        <p className="text-zinc-500 text-center py-16">Complete your first workout to start your journal.</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{thisMonth.length}</p>
              <p className="text-xs text-zinc-500 mt-1">This month</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{entries.length}</p>
              <p className="text-xs text-zinc-500 mt-1">Total sessions</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${avgAlignment !== null ? scoreColor(avgAlignment) : 'text-zinc-500'}`}>
                {avgAlignment !== null ? avgAlignment : '–'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Avg alignment</p>
            </div>
          </div>

          {/* Insight */}
          <InsightCard entries={entries} />

          {/* Calendar */}
          <div className="mb-8">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">16-week consistency</p>
            <ConsistencyCalendar entries={entries} />
          </div>

          {/* Session list */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Sessions</p>
            <div className="flex flex-col gap-3">
              {entries.map(e => {
                const modified = e.exercises.filter(x => x.modified)
                const skipped  = e.exercises.filter(x => x.skipped)
                const isConfirming = confirmId === e.id
                return (
                  <div key={e.id} className={`rounded-xl p-4 border ${scoreBg(e.alignmentScore)}`}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-200 text-sm leading-snug">{e.workoutTitle}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{e.date} · {e.durationMinutes} min</p>
                      </div>
                      <div className="flex items-start gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${scoreColor(e.alignmentScore)}`}>{e.alignmentScore}</p>
                          <p className="text-zinc-600 text-xs">/ 100</p>
                        </div>
                        {!isConfirming && (
                          <button
                            onClick={() => setConfirmId(e.id)}
                            className="text-zinc-700 hover:text-red-400 transition-colors mt-0.5"
                            title="Delete entry"
                          >
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {(modified.length > 0 || skipped.length > 0) && (
                      <div className="mt-2 text-xs text-zinc-500 space-y-0.5">
                        {modified.length > 0 && <p>Modified: {modified.map(x => x.name).join(', ')}</p>}
                        {skipped.length > 0  && <p>Skipped: {skipped.map(x => x.name).join(', ')}</p>}
                      </div>
                    )}
                    {isConfirming && (
                      <div className="mt-3 flex items-center gap-2">
                        <p className="text-xs text-zinc-400 flex-1">Delete this entry?</p>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs text-zinc-500 px-3 py-1.5 rounded-lg border border-zinc-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
