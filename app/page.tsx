'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProfile, getRecentJournalSummary, saveCurrentWorkout } from '@/lib/storage'
import type { Duration, Difficulty, Focus, Location } from '@/lib/types'

const DURATIONS: { label: string; value: Duration }[] = [
  { label: 'Quick', value: 20 },
  { label: 'Standard', value: 30 },
  { label: 'Long', value: 45 },
]

export default function Home() {
  const router = useRouter()
  const [duration, setDuration]     = useState<Duration>(30)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [focus, setFocus]           = useState<Focus>('goal')
  const [location, setLocation]     = useState<Location>('gym')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    const p = getProfile()
    if (!p.onboardingComplete) setNeedsOnboarding(true)
  }, [])

  async function handleGenerate() {
    setError('')
    setLoading(true)
    try {
      const profile = getProfile()
      const recentHistory = getRecentJournalSummary(5)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, difficulty, focus, location, profile, recentHistory }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const { workout } = await res.json()
      saveCurrentWorkout(workout)
      router.push('/workout')
    } catch {
      setError('Something went wrong. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (needsOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Kettlebod</h1>
          <p className="text-zinc-400 text-sm">Let&apos;s set up your profile first.</p>
        </div>
        <Link
          href="/settings?onboarding=1"
          className="bg-amber-400 text-zinc-950 font-bold px-8 py-4 rounded-2xl text-lg w-full max-w-xs text-center"
        >
          Get started →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pt-12 pb-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold text-amber-400">Kettlebod</h1>
        <Link href="/settings" className="text-zinc-500 hover:text-zinc-300">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/>
          </svg>
        </Link>
      </div>

      <div className="flex flex-col gap-8">

        {/* Duration */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">Time</label>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  duration === d.value
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {d.label}
                <span className="block text-xs font-normal opacity-70">{d.value} min</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">Intensity</label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-3 rounded-xl text-sm font-semibold capitalize transition-all ${
                  difficulty === d
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Focus */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">Focus</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'goal' as Focus, label: 'Vertical',  sub: 'Jump-focused' },
              { value: 'mix'  as Focus, label: 'General',   sub: 'Broader variety' },
            ]).map(f => (
              <button
                key={f.value}
                onClick={() => setFocus(f.value)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  focus === f.value
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {f.label}
                <span className="block text-xs font-normal opacity-70">{f.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-3 block">Location</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'gym'      as Location, label: '🏠 Gym',      sub: 'No jumps · quiet' },
              { value: 'backyard' as Location, label: '☀️ Backyard', sub: 'Full workout' },
            ]).map(l => (
              <button
                key={l.value}
                onClick={() => setLocation(l.value)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  location === l.value
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {l.label}
                <span className="block text-xs font-normal opacity-70">{l.sub}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Generate */}
      <div className="mt-auto pt-10">
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-amber-400 text-zinc-950 font-bold text-xl py-5 rounded-2xl disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {loading ? 'Building your workout…' : 'Go'}
        </button>
      </div>

    </div>
  )
}
