'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentWorkout, getProfile } from '@/lib/storage'
import type { GeneratedWorkout, Exercise, UserProfile } from '@/lib/types'

function bellChip(bell: Exercise['recommendedBell'], profile: UserProfile): string | null {
  if (!bell || bell === 'bodyweight') return null
  const weights: Record<string, string> = {
    light:  profile.kettlebellLight,
    medium: profile.kettlebellMedium,
    heavy:  profile.kettlebellHeavy,
  }
  const w = weights[bell]
  const label = bell.charAt(0).toUpperCase() + bell.slice(1)
  return w ? `🔔 ${label} · ${w}` : `🔔 ${label}`
}

function RestTimer({ seconds, onSkip }: { seconds: number; onSkip: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(interval); onSkip(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [seconds, onSkip])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <p className="text-zinc-500 uppercase tracking-widest text-sm">Rest</p>
      <div className="text-8xl font-bold text-amber-400 tabular-nums">{remaining}</div>
      <button
        onClick={onSkip}
        className="text-zinc-400 text-sm border border-zinc-700 rounded-xl px-6 py-3"
      >
        Skip rest
      </button>
    </div>
  )
}

export default function GuidePage() {
  const router = useRouter()
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [index, setIndex] = useState(0)
  const [showRest, setShowRest] = useState(false)
  const [startTime] = useState(Date.now())
  const [profile, setProfile] = useState(getProfile())

  useEffect(() => {
    const w = getCurrentWorkout()
    if (!w) { router.push('/'); return }
    setWorkout(w)
    setExercises(w.sections.flatMap(s => s.exercises))
    setProfile(getProfile())
  }, [router])

  function advance() {
    setShowRest(false)
    if (index < exercises.length - 1) {
      setIndex(i => i + 1)
    } else {
      // Workout complete — go to log
      const elapsedMin = Math.round((Date.now() - startTime) / 60000)
      router.push(`/log?elapsed=${elapsedMin}`)
    }
  }

  function handleDone() {
    const ex = exercises[index]
    const restSecs = ex.rest ? parseInt(ex.rest) : 0
    if (restSecs > 10) {
      setShowRest(true)
    } else {
      advance()
    }
  }

  if (!workout || exercises.length === 0) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-zinc-500">Loading…</p>
    </div>
  )

  if (showRest) {
    const restSecs = parseInt(exercises[index].rest || '60')
    return <RestTimer seconds={restSecs} onSkip={advance} />
  }

  const ex = exercises[index]
  const isLast = index === exercises.length - 1

  // Determine which section this exercise belongs to
  let sectionLabel = ''
  let count = 0
  for (const section of workout.sections) {
    for (const e of section.exercises) {
      if (count === index) { sectionLabel = section.label; break }
      count++
    }
    if (sectionLabel) break
  }

  return (
    <div className="flex flex-col min-h-screen pt-10 pb-6">

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest capitalize">{sectionLabel}</p>
          <p className="text-xs text-zinc-500">{index + 1} / {exercises.length}</p>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full">
          <div
            className="h-1 bg-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-3 leading-tight">{ex.name}</h2>
          <p className="text-amber-400 text-2xl font-mono font-semibold">{ex.prescription}</p>
          {ex.rest && <p className="text-zinc-500 text-sm mt-1">Rest {ex.rest} after</p>}
          {bellChip(ex.recommendedBell, profile) && (
            <p className="text-zinc-500 text-sm mt-1">{bellChip(ex.recommendedBell, profile)}</p>
          )}
        </div>

        <div className="bg-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Coaching cue</p>
          <p className="text-zinc-200 text-base leading-relaxed">{ex.cue}</p>
        </div>

        {/* Next preview */}
        {!isLast && (
          <div className="border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Up next</p>
            <p className="text-zinc-400 text-sm">{exercises[index + 1].name}</p>
            <p className="text-zinc-600 text-xs">{exercises[index + 1].prescription}</p>
          </div>
        )}
      </div>

      {/* Done button */}
      <div className="mt-8">
        <button
          onClick={handleDone}
          className="w-full bg-amber-400 text-zinc-950 font-bold text-lg py-5 rounded-2xl active:scale-[0.98] transition-transform"
        >
          {isLast ? 'Finish workout' : 'Done →'}
        </button>
        <button
          onClick={() => router.push('/workout')}
          className="w-full text-zinc-600 text-sm py-3 mt-1"
        >
          ← Back to workout
        </button>
      </div>

    </div>
  )
}
