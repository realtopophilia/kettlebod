'use client'

import { useState, useEffect } from 'react'
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

function ExerciseRow({ exercise, profile, onSwap }: { exercise: Exercise; profile: UserProfile; onSwap: () => void }) {
  const [swapIndex, setSwapIndex] = useState<number | null>(null)

  const current = swapIndex !== null ? exercise.alternatives[swapIndex] : exercise
  const isSwapped = swapIndex !== null
  const chip = bellChip(exercise.recommendedBell, profile)

  function handleSwap() {
    if (!exercise.alternatives?.length) return
    if (swapIndex === null) {
      setSwapIndex(0)
    } else if (swapIndex < exercise.alternatives.length - 1) {
      setSwapIndex(swapIndex + 1)
    } else {
      setSwapIndex(null) // cycle back to original
    }
    onSwap()
  }

  return (
    <div className={`rounded-xl p-4 ${isSwapped ? 'bg-zinc-800 border-l-2 border-amber-500' : 'bg-zinc-800'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-zinc-100">{current.name}</p>
            {isSwapped && <span className="text-xs text-amber-500">↻ swapped</span>}
          </div>
          <p className="text-amber-400 text-sm font-mono font-medium">{current.prescription}</p>
          {current.rest && <p className="text-zinc-500 text-xs mt-0.5">Rest {current.rest}</p>}
          {chip && <p className="text-zinc-500 text-xs mt-1">{chip}</p>}
          <p className="text-zinc-400 text-xs mt-2 italic">{current.cue}</p>
        </div>
        {exercise.alternatives?.length > 0 && (
          <button
            onClick={handleSwap}
            className="text-zinc-500 hover:text-amber-400 flex-shrink-0 mt-1 p-1"
            title="Swap exercise"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default function WorkoutPage() {
  const router = useRouter()
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [profile, setProfile] = useState(getProfile())

  useEffect(() => {
    const w = getCurrentWorkout()
    if (!w) { router.push('/'); return }
    setWorkout(w)
    setProfile(getProfile())
  }, [router])

  if (!workout) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-zinc-500">Loading…</p>
    </div>
  )

  const allExercises = workout.sections.flatMap(s => s.exercises)

  function handleStart() {
    router.push('/guide')
  }

  const sectionLabels: Record<string, string> = {
    'warm-up': 'Warm-up',
    'main': 'Main',
    'cool-down': 'Cool-down',
  }

  return (
    <div className="pt-10 pb-6">
      {/* Title */}
      <div className="mb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
          {workout.inputs.duration} min · {workout.inputs.difficulty} · {workout.inputs.location}
        </p>
        <h1 className="text-xl font-bold text-zinc-100 leading-snug">{workout.title}</h1>
        <p className="text-zinc-500 text-xs mt-2">
          Tap ↻ on any exercise to swap it for an alternative
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {workout.sections.map((section, si) => (
          <div key={si}>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
              {sectionLabels[section.label] || section.label}
            </p>
            <div className="flex flex-col gap-3">
              {section.exercises.map((ex, ei) => (
                <ExerciseRow key={ei} exercise={ex} profile={profile} onSwap={() => {}} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Start */}
      <div className="mt-10">
        <button
          onClick={handleStart}
          className="w-full bg-amber-400 text-zinc-950 font-bold text-lg py-5 rounded-2xl active:scale-[0.98] transition-transform"
        >
          Start workout →
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full text-zinc-500 text-sm py-3 mt-2"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
