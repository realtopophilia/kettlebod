'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentWorkout, addJournalEntry, clearCurrentWorkout, computeAlignment } from '@/lib/storage'
import type { GeneratedWorkout, JournalEntry } from '@/lib/types'

function LogForm() {
  const router = useRouter()
  const params = useSearchParams()
  const elapsedStr = params.get('elapsed') || '0'

  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [completed, setCompleted] = useState(true)
  const [exerciseLog, setExerciseLog] = useState<{ name: string; modified: boolean; skipped: boolean; note: string }[]>([])

  useEffect(() => {
    const w = getCurrentWorkout()
    if (!w) { router.push('/'); return }
    setWorkout(w)
    setExerciseLog(
      w.sections.flatMap(s => s.exercises).map(ex => ({
        name: ex.name,
        modified: false,
        skipped: false,
        note: '',
      }))
    )
  }, [router])

  function toggle(i: number, field: 'modified' | 'skipped') {
    setExerciseLog(prev => prev.map((e, idx) =>
      idx === i ? { ...e, [field]: !e[field], ...(field === 'skipped' && !e.skipped ? { modified: false } : {}) } : e
    ))
  }

  function setNote(i: number, note: string) {
    setExerciseLog(prev => prev.map((e, idx) => idx === i ? { ...e, note } : e))
  }

  function handleSave() {
    if (!workout) return
    const exercises = exerciseLog.map(e => ({
      name: e.name,
      modified: e.modified,
      skipped: e.skipped,
      note: e.note || undefined,
    }))
    const score = computeAlignment(exercises, completed)
    const entry: JournalEntry = {
      id: uuidv4(),
      workoutId: workout.id,
      date: new Date().toISOString().slice(0, 10),
      workoutTitle: workout.title,
      prescribed: workout,
      completed,
      durationMinutes: parseInt(elapsedStr),
      alignmentScore: score,
      exercises,
    }
    addJournalEntry(entry)
    clearCurrentWorkout()
    router.push('/journal')
  }

  if (!workout) return null

  return (
    <div className="pt-10 pb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Log it</h1>
        <p className="text-zinc-500 text-sm">Mark anything you changed or skipped. Should take under a minute.</p>
      </div>

      {/* Completed toggle */}
      <div className="bg-zinc-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <span className="text-zinc-200 text-sm font-medium">Finished the whole workout?</span>
        <button
          onClick={() => setCompleted(c => !c)}
          className={`w-12 h-6 rounded-full transition-colors ${completed ? 'bg-amber-400' : 'bg-zinc-600'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${completed ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Exercises */}
      <div className="flex flex-col gap-3 mb-8">
        {exerciseLog.map((ex, i) => (
          <div key={i} className={`bg-zinc-800 rounded-xl p-4 ${ex.skipped ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-zinc-200 text-sm">{ex.name}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(i, 'modified')}
                  disabled={ex.skipped}
                  className={`text-xs px-2 py-1 rounded-lg ${ex.modified ? 'bg-amber-400/20 text-amber-400' : 'bg-zinc-700 text-zinc-400'}`}
                >
                  Changed
                </button>
                <button
                  onClick={() => toggle(i, 'skipped')}
                  className={`text-xs px-2 py-1 rounded-lg ${ex.skipped ? 'bg-red-400/20 text-red-400' : 'bg-zinc-700 text-zinc-400'}`}
                >
                  Skipped
                </button>
              </div>
            </div>
            {ex.modified && !ex.skipped && (
              <input
                type="text"
                placeholder="What did you change? (e.g. 2×8 instead of 3×10)"
                value={ex.note}
                onChange={e => setNote(i, e.target.value)}
                className="w-full bg-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 placeholder-zinc-500 outline-none"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-amber-400 text-zinc-950 font-bold text-lg py-5 rounded-2xl active:scale-[0.98] transition-transform"
      >
        Save to journal
      </button>
    </div>
  )
}

export default function LogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-zinc-500">Loading…</p></div>}>
      <LogForm />
    </Suspense>
  )
}
