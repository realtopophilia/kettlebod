import type { Duration, Difficulty, Focus, Location, Exercise, WorkoutSection, GeneratedWorkout } from './types'
import { v4 as uuidv4 } from 'uuid'

// ── Exercise library ──────────────────────────────────────────────────────────

interface ExerciseDef {
  name: string
  role: 'hip-hinge' | 'single-leg' | 'squat' | 'push' | 'pull' | 'core' | 'plyometric' | 'carry' | 'warmup' | 'mobility'
  gymSafe: boolean           // false = backyard only (jumping, overhead, loud)
  requiresSlantBoard?: boolean
  requiresBands?: boolean
  prescriptions: Record<Difficulty, string>
  rests: Record<Difficulty, string>
  cue: string
  alternatives: { name: string; prescription?: string; cue: string }[]
}

const LIBRARY: ExerciseDef[] = [

  // ── Warm-up ─────────────────────────────────────────────────────────────────

  {
    name: 'Hip hinge to wall',
    role: 'warmup', gymSafe: true,
    prescriptions: { easy: '10 reps', medium: '10 reps', hard: '12 reps' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Stand 6 inches from a wall. Hinge back until your glutes touch it. Feel the hamstring load before you add weight.',
    alternatives: [{ name: 'Glute bridge', cue: 'Drive hips up by squeezing glutes, not arching your lower back.' }],
  },
  {
    name: 'Goblet squat (warm-up)',
    role: 'warmup', gymSafe: true,
    prescriptions: { easy: '10 reps, light', medium: '10 reps, light', hard: '12 reps, light' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Use this to open your hips and find your squat pattern before loading. Elbows inside knees at the bottom.',
    alternatives: [{ name: 'Bodyweight squat', cue: 'Move slowly and feel your feet, knees, and hips align.' }],
  },
  {
    name: 'Dead bug (warm-up)',
    role: 'warmup', gymSafe: true,
    prescriptions: { easy: '6 each side', medium: '8 each side', hard: '8 each side' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Lower back stays glued to the floor. Breathe out as you extend. This is the bracing pattern for the whole workout.',
    alternatives: [{ name: 'Glute bridge march', cue: 'Hold the bridge, alternate lifting one foot an inch. Hips stay level.' }],
  },
  {
    name: 'Arm circle + leg swing',
    role: 'warmup', gymSafe: true,
    prescriptions: { easy: '10 each direction', medium: '10 each direction', hard: '10 each direction' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Move with intention — open the joints actively before loading them.',
    alternatives: [{ name: "World's greatest stretch", cue: 'Step into a lunge, rotate your torso, reach up. One fluid movement.' }],
  },

  // ── Hip hinge ────────────────────────────────────────────────────────────────

  {
    name: 'KB Swing (Russian)',
    role: 'hip-hinge', gymSafe: true,
    prescriptions: { easy: '3 × 12', medium: '4 × 15', hard: '5 × 20' },
    rests: { easy: '90s', medium: '75s', hard: '60s' },
    cue: 'Hinge hard at the hip — the bell floats from hip power, not arm strength. Snap your glutes at the top.',
    alternatives: [
      { name: 'KB Deadlift', cue: 'Push the floor away. Keep the bell close to your legs throughout.' },
      { name: 'Romanian Deadlift', cue: 'Hinge until you feel a strong hamstring pull, then drive hips forward to stand.' },
    ],
  },
  {
    name: 'KB Deadlift',
    role: 'hip-hinge', gymSafe: true,
    prescriptions: { easy: '3 × 8', medium: '4 × 8', hard: '4 × 10' },
    rests: { easy: '90s', medium: '90s', hard: '75s' },
    cue: 'Push the floor away — think "leg press" not "lift." Keep the bell close to your legs the whole way.',
    alternatives: [
      { name: 'KB Swing (Russian)', cue: 'Hinge and snap. The bell floats from hip power.' },
      { name: 'Romanian Deadlift', cue: 'Slow the eccentric. Feel the hamstrings load.' },
    ],
  },
  {
    name: 'Romanian Deadlift',
    role: 'hip-hinge', gymSafe: true,
    prescriptions: { easy: '3 × 10', medium: '4 × 10', hard: '4 × 12' },
    rests: { easy: '90s', medium: '90s', hard: '75s' },
    cue: 'Hinge until you feel a strong hamstring pull (usually mid-shin), then drive your hips forward to stand.',
    alternatives: [
      { name: 'KB Swing (Russian)', cue: 'Same hip hinge pattern, made ballistic. Snap at the top.' },
      { name: 'KB Deadlift', cue: 'Full range, both hands. Push the floor away on the way up.' },
    ],
  },
  {
    name: 'KB Clean',
    role: 'hip-hinge', gymSafe: true,
    prescriptions: { easy: '3 × 5 each side', medium: '4 × 6 each side', hard: '4 × 8 each side' },
    rests: { easy: '90s', medium: '90s', hard: '75s' },
    cue: 'The clean is a swing that ends in the rack. The bell should float up, not crash onto your forearm.',
    alternatives: [
      { name: 'KB Swing (Russian)', cue: 'Same hip snap. Stop at hip height.' },
      { name: 'KB Deadlift', cue: 'Slow it down. Groove the hinge pattern.' },
    ],
  },

  // ── Single-leg ───────────────────────────────────────────────────────────────

  {
    name: 'Bulgarian Split Squat',
    role: 'single-leg', gymSafe: true,
    prescriptions: { easy: '3 × 8 each side', medium: '3 × 10 each side', hard: '4 × 10 each side' },
    rests: { easy: '90s', medium: '90s', hard: '75s' },
    cue: 'Front shin stays vertical. Drop straight down, don\'t lean into the front leg. Use the bell as a counterbalance if needed.',
    alternatives: [
      { name: 'Goblet Squat Reverse Lunge', cue: 'Step back, not out. Front knee tracks over your second toe.' },
      { name: 'Weighted Step-up', cue: 'Drive through the heel of the working leg. Don\'t push off the back foot.' },
    ],
  },
  {
    name: 'Single-leg RDL',
    role: 'single-leg', gymSafe: true,
    prescriptions: { easy: '3 × 8 each side', medium: '3 × 10 each side', hard: '4 × 10 each side' },
    rests: { easy: '90s', medium: '90s', hard: '75s' },
    cue: 'Send the free leg back as you hinge — it counterbalances and keeps your hips square. Slight knee bend on the standing leg.',
    alternatives: [
      { name: 'Romanian Deadlift', cue: 'Bilateral version. Same hip hinge, more load.' },
      { name: 'Bulgarian Split Squat', cue: 'Rear foot elevated. Front shin vertical.' },
    ],
  },
  {
    name: 'Goblet Squat Reverse Lunge',
    role: 'single-leg', gymSafe: true,
    prescriptions: { easy: '3 × 8 each side', medium: '3 × 10 each side', hard: '4 × 12 each side' },
    rests: { easy: '90s', medium: '90s', hard: '60s' },
    cue: 'Step back, not out. Keep the front knee tracking over your second toe. Drive through the front heel to return.',
    alternatives: [
      { name: 'Bulgarian Split Squat', cue: 'Rear foot elevated. Drop straight down.' },
      { name: 'Weighted Step-up', cue: 'Drive through the heel of the working leg.' },
    ],
  },
  {
    name: 'Weighted Step-up',
    role: 'single-leg', gymSafe: true,
    prescriptions: { easy: '3 × 8 each side', medium: '3 × 10 each side', hard: '4 × 10 each side' },
    rests: { easy: '90s', medium: '90s', hard: '75s' },
    cue: 'Drive through the heel of the working leg. Don\'t push off the back foot — make the working leg do all the work.',
    alternatives: [
      { name: 'Bulgarian Split Squat', cue: 'Rear foot elevated. Drop straight down.' },
      { name: 'Goblet Squat Reverse Lunge', cue: 'Step back, front knee tracks forward.' },
    ],
  },
  {
    name: 'Box Pistol Progression',
    role: 'single-leg', gymSafe: true,
    prescriptions: { easy: '3 × 5 each side (to box)', medium: '3 × 6 each side', hard: '3 × 8 each side' },
    rests: { easy: '90s', medium: '90s', hard: '90s' },
    cue: 'Sit back and down, keeping the heel planted. Use a higher box if you lose balance or your heel lifts.',
    alternatives: [
      { name: 'Bulgarian Split Squat', cue: 'Easier single-leg variation. Rear foot elevated.' },
      { name: 'Weighted Step-up', cue: 'Use a high step to increase range of motion.' },
    ],
  },

  // ── Squat ────────────────────────────────────────────────────────────────────

  {
    name: 'Goblet Squat',
    role: 'squat', gymSafe: true,
    prescriptions: { easy: '3 × 10', medium: '4 × 10', hard: '4 × 12' },
    rests: { easy: '90s', medium: '75s', hard: '60s' },
    cue: 'Elbows inside your knees at the bottom. Drive the floor apart with your feet on the way up.',
    alternatives: [
      { name: 'Double KB Front Squat', cue: 'Bells in the rack — elbows high, forearms vertical.' },
      { name: 'Bulgarian Split Squat', cue: 'Unilateral version. More posterior chain.' },
    ],
  },
  {
    name: 'Goblet Squat (slow eccentric)',
    role: 'squat', gymSafe: true,
    prescriptions: { easy: '3 × 8 (3s down)', medium: '4 × 8 (3s down)', hard: '4 × 10 (4s down)' },
    rests: { easy: '90s', medium: '75s', hard: '60s' },
    cue: 'Control the descent for 3–4 seconds. The slow eccentric builds strength in the same range as a jump landing.',
    alternatives: [
      { name: 'Goblet Squat', cue: 'Standard tempo. Drive the floor apart on the way up.' },
      { name: 'Bulgarian Split Squat', cue: 'Unilateral. Drop straight down.' },
    ],
  },

  // ── Push ─────────────────────────────────────────────────────────────────────

  {
    name: 'Half-kneeling KB Press',
    role: 'push', gymSafe: true,
    prescriptions: { easy: '3 × 8 each side', medium: '3 × 10 each side', hard: '4 × 10 each side' },
    rests: { easy: '90s', medium: '75s', hard: '75s' },
    cue: 'Brace hard before pressing. The half-kneeling position exposes any lateral instability — don\'t let your torso shift.',
    alternatives: [
      { name: 'KB Floor Press', cue: 'Tuck elbows 45 degrees. Drive upper back into the floor.' },
      { name: 'Push-up', cue: 'Squeeze glutes and abs — your body is a plank from head to heels.' },
    ],
  },
  {
    name: 'KB Floor Press',
    role: 'push', gymSafe: true,
    prescriptions: { easy: '3 × 10', medium: '4 × 10', hard: '4 × 12' },
    rests: { easy: '90s', medium: '75s', hard: '60s' },
    cue: 'Tuck your elbows 45 degrees from your torso. Drive your upper back into the floor as you press.',
    alternatives: [
      { name: 'Push-up', cue: 'Body is a plank. Squeeze everything.' },
      { name: 'Half-kneeling KB Press', cue: 'More shoulder stability demand. Brace hard first.' },
    ],
  },
  {
    name: 'Push-up',
    role: 'push', gymSafe: true,
    prescriptions: { easy: '3 × 10', medium: '3 × 15', hard: '4 × 20' },
    rests: { easy: '60s', medium: '60s', hard: '45s' },
    cue: 'Squeeze your glutes and abs — your body is a plank from head to heels. Lower all the way, press all the way.',
    alternatives: [
      { name: 'KB Floor Press', cue: 'Loaded version. Elbows 45 degrees.' },
      { name: 'Half-kneeling KB Press', cue: 'Vertical pressing pattern.' },
    ],
  },
  {
    name: 'KB Standing Press',
    role: 'push', gymSafe: false,   // overhead — backyard only
    prescriptions: { easy: '3 × 8 each side', medium: '3 × 10 each side', hard: '4 × 10 each side' },
    rests: { easy: '90s', medium: '90s', hard: '75s' },
    cue: 'Brace your core like you\'re about to take a punch. Press straight up, lock out fully, then lower under control.',
    alternatives: [
      { name: 'Half-kneeling KB Press', cue: 'Gym-safe version. Same shoulder pattern.' },
      { name: 'KB Floor Press', cue: 'Horizontal variation. Good shoulder health exercise.' },
    ],
  },

  // ── Pull ─────────────────────────────────────────────────────────────────────

  {
    name: 'KB Bent-over Row',
    role: 'pull', gymSafe: true,
    prescriptions: { easy: '3 × 10 each side', medium: '4 × 10 each side', hard: '4 × 12 each side' },
    rests: { easy: '90s', medium: '75s', hard: '60s' },
    cue: 'Hinge at the hip, keep your back flat. Row the bell to your hip, not your shoulder.',
    alternatives: [
      { name: 'Double KB Row', cue: 'Both bells simultaneously. Hinge until back is nearly parallel.' },
      { name: 'Band Pull-apart', cue: 'Arms straight. Pull to shoulder height — shoulder health work.' },
    ],
  },
  {
    name: 'Double KB Row',
    role: 'pull', gymSafe: true,
    prescriptions: { easy: '3 × 8', medium: '4 × 8', hard: '4 × 10' },
    rests: { easy: '90s', medium: '90s', hard: '75s' },
    cue: 'Hinge forward until your back is nearly parallel. Row both bells simultaneously, elbows close.',
    alternatives: [
      { name: 'KB Bent-over Row', cue: 'Single-arm version. More rotation control.' },
      { name: 'Band Pull-apart', cue: 'Lighter. Good shoulder health.' },
    ],
  },
  {
    name: 'Band Pull-apart',
    role: 'pull', gymSafe: true, requiresBands: true,
    prescriptions: { easy: '3 × 15', medium: '3 × 20', hard: '4 × 20' },
    rests: { easy: '45s', medium: '45s', hard: '30s' },
    cue: 'Keep your arms straight. Pull to just below shoulder height. This is shoulder health and posture work.',
    alternatives: [
      { name: 'KB Bent-over Row', cue: 'More load. Hinge and row.' },
      { name: 'Face pull (band)', cue: 'Pull to your face, elbows high. External rotation.' },
    ],
  },

  // ── Core ──────────────────────────────────────────────────────────────────────

  {
    name: 'Dead Bug',
    role: 'core', gymSafe: true,
    prescriptions: { easy: '3 × 8 each side', medium: '3 × 10 each side', hard: '4 × 10 each side' },
    rests: { easy: '60s', medium: '60s', hard: '45s' },
    cue: 'Lower back stays glued to the floor the entire time. Breathe out as you extend. Go slowly.',
    alternatives: [
      { name: 'Plank', cue: 'Squeeze everything. Hips level.' },
      { name: 'Hollow body hold', cue: 'Lower back pressed to floor. Arms and legs extended low.' },
    ],
  },
  {
    name: 'Plank',
    role: 'core', gymSafe: true,
    prescriptions: { easy: '3 × 30s', medium: '3 × 45s', hard: '3 × 60s' },
    rests: { easy: '60s', medium: '45s', hard: '30s' },
    cue: 'Squeeze your glutes, abs, and quads. Hips should be level — not sagging, not piked.',
    alternatives: [
      { name: 'Dead Bug', cue: 'More dynamic. Lower back on the floor.' },
      { name: 'KB Suitcase Hold', cue: 'Standing anti-lateral-flexion. Don\'t tilt toward the bell.' },
    ],
  },
  {
    name: 'KB Suitcase Hold',
    role: 'core', gymSafe: true,
    prescriptions: { easy: '3 × 30s each side', medium: '3 × 40s each side', hard: '3 × 45s each side' },
    rests: { easy: '60s', medium: '60s', hard: '45s' },
    cue: 'Stand tall with one bell. Don\'t let your torso tilt toward the bell. This is a lateral core exercise.',
    alternatives: [
      { name: 'Plank', cue: 'Horizontal anti-extension. Squeeze everything.' },
      { name: 'Dead Bug', cue: 'On your back. Lower back glued to the floor.' },
    ],
  },
  {
    name: 'Pallof Press',
    role: 'core', gymSafe: true, requiresBands: true,
    prescriptions: { easy: '3 × 10 each side', medium: '3 × 12 each side', hard: '4 × 12 each side' },
    rests: { easy: '60s', medium: '60s', hard: '45s' },
    cue: 'Press out and hold for a count. The rotation resistance is the workout — don\'t let the band pull you.',
    alternatives: [
      { name: 'Dead Bug', cue: 'Anti-extension instead of anti-rotation.' },
      { name: 'Plank', cue: 'Squeeze everything. Hips level.' },
    ],
  },

  // ── Plyometric (backyard only) ─────────────────────────────────────────────

  {
    name: 'Jump Squat',
    role: 'plyometric', gymSafe: false,
    prescriptions: { easy: '3 × 8', medium: '4 × 8', hard: '4 × 10' },
    rests: { easy: '120s', medium: '120s', hard: '90s' },
    cue: 'Land softly — absorb with your hips and knees. Reset fully between reps. This is power, not conditioning.',
    alternatives: [
      { name: 'Broad Jump', cue: 'Same explosive hip extension, forward instead of up.' },
      { name: 'Box Jump', cue: 'Jump to a surface. Absorb the landing and hold.' },
    ],
  },
  {
    name: 'Box Jump',
    role: 'plyometric', gymSafe: false,
    prescriptions: { easy: '3 × 5', medium: '4 × 5', hard: '4 × 6' },
    rests: { easy: '120s', medium: '120s', hard: '90s' },
    cue: 'Step off, don\'t jump off. Land in an athletic position and hold for a count before stepping down.',
    alternatives: [
      { name: 'Jump Squat', cue: 'Vertical jump without a box. Land soft.' },
      { name: 'Broad Jump', cue: 'Horizontal power. Land and hold.' },
    ],
  },
  {
    name: 'Broad Jump',
    role: 'plyometric', gymSafe: false,
    prescriptions: { easy: '3 × 5', medium: '4 × 5', hard: '4 × 6' },
    rests: { easy: '120s', medium: '120s', hard: '90s' },
    cue: 'Swing your arms, hinge your hips, drive forward. Land soft and hold the landing position.',
    alternatives: [
      { name: 'Jump Squat', cue: 'Vertical version. Same explosive hip drive.' },
      { name: 'Box Jump', cue: 'Jump to a surface. Land and hold.' },
    ],
  },

  // ── Mobility / cool-down ──────────────────────────────────────────────────────

  {
    name: 'Kneeling Hip Flexor Stretch',
    role: 'mobility', gymSafe: true,
    prescriptions: { easy: '60s each side', medium: '60s each side', hard: '60s each side' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Tuck your pelvis under (posterior tilt) before leaning forward. You should feel it in the front of the back hip, not the knee.',
    alternatives: [{ name: '90/90 Hip Stretch', cue: 'Sit tall, both knees at 90 degrees. Lean toward your front shin.' }],
  },
  {
    name: 'Standing Hamstring Stretch',
    role: 'mobility', gymSafe: true,
    prescriptions: { easy: '60s each side', medium: '60s each side', hard: '60s each side' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Keep your knee as straight as possible. Breathe into the stretch — don\'t force it.',
    alternatives: [{ name: 'Lying hamstring stretch', cue: 'On your back, pull one leg toward you with a band or towel.' }],
  },
  {
    name: 'Slant Board Calf Stretch',
    role: 'mobility', gymSafe: true, requiresSlantBoard: true,
    prescriptions: { easy: '90s each side', medium: '90s each side', hard: '90s each side' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Keep your heel planted, knee slightly bent. This loads the Achilles and posterior chain — important for jump height.',
    alternatives: [{ name: 'Kneeling Hip Flexor Stretch', cue: 'Posterior tilt first, then lean.' }],
  },
  {
    name: '90/90 Hip Stretch',
    role: 'mobility', gymSafe: true,
    prescriptions: { easy: '60s each side', medium: '60s each side', hard: '60s each side' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Sit tall, both knees at 90 degrees. Lean gently toward your front shin. Use a pillow under the hip if needed.',
    alternatives: [{ name: 'Kneeling Hip Flexor Stretch', cue: 'Posterior tilt first. Feel it in the front hip.' }],
  },
  {
    name: 'Pigeon Pose',
    role: 'mobility', gymSafe: true,
    prescriptions: { easy: '90s each side', medium: '90s each side', hard: '90s each side' },
    rests: { easy: '–', medium: '–', hard: '–' },
    cue: 'Square your hips toward the floor. Use a folded towel under the hip if needed. Breathe and relax into it.',
    alternatives: [{ name: '90/90 Hip Stretch', cue: 'Seated version. Easier to modify.' }],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function byRole(role: ExerciseDef['role']) {
  return LIBRARY.filter(e => e.role === role)
}

function available(e: ExerciseDef, location: Location, profile: { hasSlantBoard: boolean; hasBands: boolean }): boolean {
  if (!e.gymSafe && location === 'gym') return false
  if (e.requiresSlantBoard && !profile.hasSlantBoard) return false
  if (e.requiresBands && !profile.hasBands) return false
  return true
}

// Bell weight recommendations per exercise name
const BELL_WEIGHTS: Record<string, 'light' | 'medium' | 'heavy' | 'bodyweight'> = {
  'Hip hinge to wall':            'bodyweight',
  'Goblet squat (warm-up)':       'light',
  'Dead bug (warm-up)':           'bodyweight',
  'Arm circle + leg swing':       'bodyweight',
  'KB Swing (Russian)':           'heavy',
  'KB Deadlift':                  'heavy',
  'Romanian Deadlift':            'heavy',
  'KB Clean':                     'medium',
  'Bulgarian Split Squat':        'medium',
  'Single-leg RDL':               'medium',
  'Goblet Squat Reverse Lunge':   'medium',
  'Weighted Step-up':             'medium',
  'Box Pistol Progression':       'bodyweight',
  'Goblet Squat':                 'medium',
  'Goblet Squat (slow eccentric)':'medium',
  'Half-kneeling KB Press':       'medium',
  'KB Floor Press':               'medium',
  'Push-up':                      'bodyweight',
  'KB Standing Press':            'medium',
  'KB Bent-over Row':             'medium',
  'Double KB Row':                'medium',
  'Band Pull-apart':              'bodyweight',
  'Dead Bug':                     'bodyweight',
  'Plank':                        'bodyweight',
  'KB Suitcase Hold':             'medium',
  'Pallof Press':                 'bodyweight',
  'Jump Squat':                   'bodyweight',
  'Box Jump':                     'bodyweight',
  'Broad Jump':                   'bodyweight',
  'Kneeling Hip Flexor Stretch':  'bodyweight',
  'Standing Hamstring Stretch':   'bodyweight',
  'Slant Board Calf Stretch':     'bodyweight',
  '90/90 Hip Stretch':            'bodyweight',
  'Pigeon Pose':                  'bodyweight',
}

function toExercise(def: ExerciseDef, difficulty: Difficulty): Exercise {
  return {
    name: def.name,
    prescription: def.prescriptions[difficulty],
    rest: def.rests[difficulty] !== '–' ? def.rests[difficulty] : undefined,
    cue: def.cue,
    role: def.role,
    recommendedBell: BELL_WEIGHTS[def.name],
    alternatives: def.alternatives.map(alt => ({
      name: alt.name,
      prescription: alt.prescription || def.prescriptions[difficulty],
      rest: def.rests[difficulty] !== '–' ? def.rests[difficulty] : undefined,
      cue: alt.cue,
    })),
  }
}

/** Shuffle array, optionally seeded by a string for light variety */
function shuffle<T>(arr: T[], seed: string = ''): T[] {
  const copy = [...arr]
  // Simple deterministic shuffle using seed hash
  let h = seed.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0)
  for (let i = copy.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0
    const j = h % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Pick N unique exercises from a list, avoiding recently used names */
function pick(
  pool: ExerciseDef[],
  n: number,
  recentNames: Set<string>,
  difficulty: Difficulty,
  seed: string,
): Exercise[] {
  const shuffled = shuffle(pool, seed)
  // Prefer exercises not seen recently
  const fresh = shuffled.filter(e => !recentNames.has(e.name))
  const stale = shuffled.filter(e => recentNames.has(e.name))
  const ordered = [...fresh, ...stale]
  return ordered.slice(0, n).map(e => toExercise(e, difficulty))
}

/** Parse recent history string to extract exercise names that were used */
function recentExerciseNames(history: string): Set<string> {
  const names = new Set<string>()
  LIBRARY.forEach(e => {
    if (history.includes(e.name)) names.add(e.name)
  })
  return names
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateWorkout(
  duration: Duration,
  difficulty: Difficulty,
  focus: Focus,
  location: Location,
  profile: { hasSlantBoard: boolean; hasBands: boolean },
  recentHistory: string,
): GeneratedWorkout {

  const seed = `${new Date().toDateString()}-${duration}-${difficulty}-${focus}-${location}`
  const recent = recentExerciseNames(recentHistory)
  const avail = (e: ExerciseDef) => available(e, location, profile)

  // Main block size — scales with duration (10–60 min)
  const mainCount = duration <= 10 ? 2
    : duration <= 15 ? 3
    : duration <= 20 ? 4
    : duration <= 25 ? 5
    : duration <= 35 ? 6
    : duration <= 45 ? 8
    : duration <= 55 ? 9
    : 10

  // ── Warm-up (2–3 exercises) ─────────────────────────────────────────────────
  const warmupPool = byRole('warmup').filter(avail)
  const warmupExercises = pick(warmupPool, 3, recent, difficulty, seed + 'wu')

  // ── Main block ──────────────────────────────────────────────────────────────
  const hingePool    = byRole('hip-hinge').filter(avail)
  const singlePool   = byRole('single-leg').filter(avail)
  const squatPool    = byRole('squat').filter(avail)
  const pushPool     = byRole('push').filter(avail)
  const pullPool     = byRole('pull').filter(avail)
  const corePool     = byRole('core').filter(avail)
  const plyoPool     = byRole('plyometric').filter(avail)

  let mainExercises: Exercise[] = []

  if (focus === 'goal') {
    // Vertical jump focus: hip hinges + single-leg + plyometric (backyard) first
    const hinge1 = pick(hingePool, 1, recent, difficulty, seed + 'h1')
    const plyo   = plyoPool.length > 0 ? pick(plyoPool, 1, recent, difficulty, seed + 'pl') : []
    const single = pick(singlePool, 2, new Set([...recent, ...hinge1.map(e => e.name)]), difficulty, seed + 's1')

    // Remaining slots: mix of more hinge, squat, core
    const remaining = mainCount - hinge1.length - plyo.length - single.length
    const usedNames = new Set([...hinge1, ...plyo, ...single].map(e => e.name))
    const fillPool  = [...hingePool, ...squatPool, ...corePool].filter(e => !usedNames.has(e.name))
    const fill      = pick(fillPool, remaining, recent, difficulty, seed + 'f1')

    // Order: explosive first, then strength, then core
    mainExercises = [...plyo, ...hinge1, ...single, ...fill]

  } else {
    // General/mix: balanced push/pull/hinge/squat/core
    const hinge  = pick(hingePool, 1, recent, difficulty, seed + 'h2')
    const single = pick(singlePool, 1, recent, difficulty, seed + 's2')
    const push   = pick(pushPool,   1, recent, difficulty, seed + 'p2')
    const pull   = pick(pullPool,   1, recent, difficulty, seed + 'r2')
    const remaining = mainCount - 4
    const usedNames = new Set([...hinge, ...single, ...push, ...pull].map(e => e.name))
    const fillPool  = [...squatPool, ...corePool, ...hingePool].filter(e => !usedNames.has(e.name))
    const fill      = pick(fillPool, remaining, recent, difficulty, seed + 'f2')

    mainExercises = [...hinge, ...single, ...push, ...pull, ...fill]
  }

  // ── Cool-down (always hip flexor + hamstring + optional) ────────────────────
  const mobilityPool = byRole('mobility').filter(avail)
  const hipFlexor    = mobilityPool.find(e => e.name.includes('Hip Flexor'))
  const hamstring    = mobilityPool.find(e => e.name.includes('Hamstring'))
  const optMobility  = mobilityPool.filter(e => e !== hipFlexor && e !== hamstring)
  const cooldown: Exercise[] = [
    hipFlexor  ? toExercise(hipFlexor,  difficulty) : toExercise(mobilityPool[0], difficulty),
    hamstring  ? toExercise(hamstring,  difficulty) : toExercise(mobilityPool[1], difficulty),
    optMobility.length > 0 ? toExercise(shuffle(optMobility, seed + 'cd')[0], difficulty) : undefined,
  ].filter(Boolean) as Exercise[]

  // ── Sections ────────────────────────────────────────────────────────────────
  const sections: WorkoutSection[] = [
    { label: 'warm-up',   exercises: warmupExercises },
    { label: 'main',      exercises: mainExercises },
    { label: 'cool-down', exercises: cooldown },
  ]

  // ── Title ───────────────────────────────────────────────────────────────────
  const focusLabel    = focus === 'goal' ? 'Posterior chain power' : 'Full body'
  const locationLabel = location === 'gym' ? 'gym' : 'backyard'
  const title         = `${focusLabel} — ${duration} min, ${difficulty} (${locationLabel})`

  return {
    id: uuidv4(),
    title,
    generatedAt: new Date().toISOString(),
    inputs: { duration, difficulty, focus, location },
    sections,
  }
}
