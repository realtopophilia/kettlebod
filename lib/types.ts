export type Duration = 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Focus = 'goal' | 'mix'
export type Location = 'gym' | 'backyard'

export interface Exercise {
  name: string
  prescription: string   // "3 × 10" or "40s on / 20s off"
  rest?: string          // "90s"
  cue: string
  role: string           // "hip hinge", "single-leg", "plyometric", etc.
  recommendedBell?: 'light' | 'medium' | 'heavy' | 'bodyweight'
  alternatives: {
    name: string
    prescription: string
    rest?: string
    cue: string
  }[]
}

export interface WorkoutSection {
  label: 'warm-up' | 'main' | 'cool-down'
  exercises: Exercise[]
}

export interface GeneratedWorkout {
  id: string
  title: string
  generatedAt: string
  inputs: {
    duration: Duration
    difficulty: Difficulty
    focus: Focus
    location: Location
  }
  sections: WorkoutSection[]
}

export interface JournalEntry {
  id: string
  workoutId: string
  date: string
  workoutTitle: string
  prescribed: GeneratedWorkout
  completed: boolean
  durationMinutes: number
  alignmentScore: number
  exercises: {
    name: string
    modified: boolean
    skipped: boolean
    note?: string
  }[]
}

export interface UserProfile {
  name: string
  heightFt: number
  heightIn: number
  weightLbs: number
  primaryGoal: string
  secondaryGoal: string
  kettlebellLight: string
  kettlebellMedium: string
  kettlebellHeavy: string
  hasSlantBoard: boolean
  hasBands: boolean
  hasDumbbells: boolean
  hasPeloton: boolean
  onboardingComplete: boolean
}
