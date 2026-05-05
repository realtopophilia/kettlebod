'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProfile, saveProfile, DEFAULT_PROFILE } from '@/lib/storage'
import type { UserProfile } from '@/lib/types'

function SettingsForm() {
  const router = useRouter()
  const params = useSearchParams()
  const isOnboarding = params.get('onboarding') === '1'

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    setProfile(getProfile())
  }, [])

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    saveProfile({ ...profile, onboardingComplete: true })
    router.push('/')
  }

  return (
    <div className="pt-10 pb-6">
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">
        {isOnboarding ? 'Set up your profile' : 'Settings'}
      </h1>
      {isOnboarding && (
        <p className="text-zinc-400 text-sm mb-8">This takes 60 seconds and you&apos;ll never have to explain yourself to the app again.</p>
      )}
      {!isOnboarding && <div className="mb-8" />}

      <div className="flex flex-col gap-6">

        {/* Kettlebell weights */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Kettlebell weights</p>
          <div className="grid grid-cols-3 gap-2">
            {(['Light', 'Medium', 'Heavy'] as const).map(level => {
              const key = `kettlebell${level}` as 'kettlebellLight' | 'kettlebellMedium' | 'kettlebellHeavy'
              return (
                <div key={level} className="bg-zinc-800 rounded-xl p-3">
                  <p className="text-xs text-zinc-500 mb-2">{level}</p>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="—"
                      value={profile[key]}
                      onChange={e => set(key, e.target.value)}
                      className="w-full bg-transparent text-zinc-100 text-lg font-bold outline-none placeholder-zinc-600"
                    />
                    <span className="text-zinc-500 text-xs">lbs</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Additional equipment</p>
          <div className="flex flex-col gap-2">
            {([
              { key: 'hasSlantBoard', label: 'Wooden slant board' },
              { key: 'hasBands',      label: 'Resistance bands' },
              { key: 'hasDumbbells',  label: 'Adjustable dumbbells' },
              { key: 'hasPeloton',    label: 'Peloton' },
            ] as { key: keyof UserProfile; label: string }[]).map(item => (
              <div key={item.key} className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-zinc-200 text-sm">{item.label}</span>
                <button
                  onClick={() => set(item.key, !profile[item.key] as UserProfile[typeof item.key])}
                  className={`w-12 h-6 rounded-full transition-colors ${profile[item.key] ? 'bg-amber-400' : 'bg-zinc-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${profile[item.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Profile */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Profile</p>
          <div className="flex flex-col gap-2">
            {([
              { key: 'name' as const,       label: 'Name',         type: 'text',   placeholder: 'Jason' },
              { key: 'weightLbs' as const,  label: 'Weight (lbs)', type: 'number', placeholder: '260' },
            ]).map(field => (
              <div key={field.key} className="bg-zinc-800 rounded-xl px-4 py-3">
                <p className="text-xs text-zinc-500 mb-1">{field.label}</p>
                <input
                  type={field.type}
                  value={String(profile[field.key])}
                  onChange={e => set(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value as UserProfile[typeof field.key])}
                  placeholder={field.placeholder}
                  className="w-full bg-transparent text-zinc-100 outline-none placeholder-zinc-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Goals</p>
          <div className="flex flex-col gap-2">
            <div className="bg-zinc-800 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1">Primary goal</p>
              <textarea
                value={profile.primaryGoal}
                onChange={e => set('primaryGoal', e.target.value)}
                rows={3}
                className="w-full bg-transparent text-zinc-100 text-sm outline-none resize-none placeholder-zinc-600"
              />
            </div>
            <div className="bg-zinc-800 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1">Secondary goal</p>
              <textarea
                value={profile.secondaryGoal}
                onChange={e => set('secondaryGoal', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-zinc-100 text-sm outline-none resize-none placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="mt-10">
        <button
          onClick={handleSave}
          className="w-full bg-amber-400 text-zinc-950 font-bold text-lg py-5 rounded-2xl active:scale-[0.98] transition-transform"
        >
          {isOnboarding ? 'Start training →' : 'Save'}
        </button>
        {!isOnboarding && (
          <button onClick={() => router.back()} className="w-full text-zinc-500 text-sm py-3 mt-1">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-zinc-500">Loading…</p></div>}>
      <SettingsForm />
    </Suspense>
  )
}
