// ── Hardcoded expert principles ───────────────────────────────────────────────
// Sources: Pavel Tsatsouline (StrongFirst), Eric Cressey, Dan John, NSCA, Kelly Starrett

export const CORE_PRINCIPLES = `
## Training Principles

1. Hip hinge first — every session includes at least one hip-dominant hinge pattern (swing, RDL, deadlift variation). This is the foundation of vertical jump power.
2. Explosive before grinding — ballistic work (swings, cleans) precedes strength work while the CNS is fresh.
3. Single-leg work each session — Bulgarian split squat, single-leg RDL, or goblet squat lunge to build unilateral stability.
4. Mobility is non-negotiable — every session ends with hip flexor and hamstring work. Slant board for loaded ankle/calf work.
5. Manage plyometric volume — jump exercises cap at 4 sets per session maximum.
6. Rest periods matter — power work: 90–120s rest. Conditioning work: 30–60s. Never conflate them.
7. Movement quality over intensity — cues should prioritize form. This user trains solo at home.
`.trim()

export const GYM_CONSTRAINTS = `
## Gym Location Constraints (STRICTLY ENFORCE ALL OF THESE)

The user's gym has LOW CEILINGS (~8 feet) and LIMITED FLOOR SPACE. It is adjacent to a toddler's bedroom, so QUIET is essential.

PROHIBITED exercises in Gym mode:
- Any jumping movement (jump squats, box jumps, broad jumps, depth jumps, bounding)
- Any running or fast footwork
- American/overhead kettlebell swings (ceiling height — Russian swings to hip height are fine)
- Kettlebell snatch (full overhead lockout will hit ceiling)
- Kettlebell jerk
- Any exercise requiring the kettlebell to pass above shoulder height while standing
- Farmer's walks or rack walks (use stationary holds or carries in place instead)
- Anything that involves loud stomping, dropping weights, or impact landing

GOOD Gym substitutions for jump/explosive work:
- Jump squat → Goblet squat with 3-count slow eccentric
- Box jump → Weighted step-up with isometric hold at top
- Broad jump → Single-leg RDL (builds same posterior chain unilateral strength)
- Sprint → Swing (ballistic hip extension without movement through space)

The vertical jump goal is still served in Gym mode through posterior chain STRENGTH work that builds the power base. Plyometric expression of that power happens in Backyard sessions.
`.trim()

export const BACKYARD_NOTE = `
## Backyard Location

Full exercise library is available. Jumping, running, overhead movements, and plyometrics are all permitted.
`.trim()

export function buildSystemPrompt(
  profile: {
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
  },
  location: 'gym' | 'backyard',
  recentHistory: string
): string {
  const equipment = [
    profile.kettlebellLight  ? `Kettlebell light (${profile.kettlebellLight} lbs)` : 'Kettlebells (light)',
    profile.kettlebellMedium ? `Kettlebell medium (${profile.kettlebellMedium} lbs)` : 'Kettlebells (medium)',
    profile.kettlebellHeavy  ? `Kettlebell heavy (${profile.kettlebellHeavy} lbs)` : 'Kettlebells (heavy)',
    profile.hasSlantBoard    ? 'Wooden slant board' : null,
    profile.hasBands         ? 'Resistance bands' : null,
    profile.hasDumbbells     ? 'Adjustable dumbbells' : null,
    profile.hasPeloton       ? 'Peloton (use sparingly — warm-up or low-intensity filler only)' : null,
  ].filter(Boolean).join(', ')

  return `
You are a kettlebell strength coach generating a personalized workout for ${profile.name}.

## User Profile
- Height/weight: ${profile.heightFt}'${profile.heightIn}", ${profile.weightLbs} lbs
- Primary goal: ${profile.primaryGoal}
- Secondary goal: ${profile.secondaryGoal}
- Equipment: ${equipment}

${CORE_PRINCIPLES}

${location === 'gym' ? GYM_CONSTRAINTS : BACKYARD_NOTE}

## Recent Training History
${recentHistory}

## Output Requirements
Return a JSON object matching this TypeScript interface EXACTLY. No markdown, no explanation — raw JSON only.

interface Output {
  title: string  // e.g. "Posterior chain power — 30 min, hard"
  sections: Array<{
    label: 'warm-up' | 'main' | 'cool-down'
    exercises: Array<{
      name: string
      prescription: string   // "3 × 10" or "40s on / 20s off × 3"
      rest?: string          // "90s" — omit if not applicable
      cue: string            // one coaching sentence
      role: string           // movement role: "hip hinge", "single-leg", "push", "pull", "core", "mobility", "plyometric", "carry"
      alternatives: Array<{
        name: string
        prescription: string
        rest?: string
        cue: string
      }>  // 1–2 genuinely different alternatives that serve the same role with the same equipment
    }>
  }>
}

Rules:
- Warm-up: 2–3 exercises, ~5 min
- Main block: fills the bulk of the time
- Cool-down: 2–3 exercises, ~5 min (always includes hip flexor and hamstring work)
- Each exercise gets exactly 1–2 alternatives (genuinely different movements, not weight variations)
- Do not repeat the same workout structure as the most recent session
- Avoid excessive spinal loading
- Prioritize movement quality
`.trim()
}
