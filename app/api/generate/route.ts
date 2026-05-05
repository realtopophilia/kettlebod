import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'
import { buildSystemPrompt } from '@/lib/knowledge'
import type { Duration, Difficulty, Focus, Location, GeneratedWorkout } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const {
      duration,
      difficulty,
      focus,
      location,
      profile,
      recentHistory,
    }: {
      duration: Duration
      difficulty: Difficulty
      focus: Focus
      location: Location
      profile: Parameters<typeof buildSystemPrompt>[0]
      recentHistory: string
    } = await req.json()

    const systemPrompt = buildSystemPrompt(profile, location, recentHistory)

    const userMessage = `Generate a ${duration}-minute, ${difficulty} difficulty kettlebell workout.
Focus: ${focus === 'goal' ? 'Goal-oriented — bias heavily toward hip hinges, posterior chain, and single-leg work that builds vertical jump.' : 'Mix it up — still respect the goals but draw from a broader exercise pool including upper body, core, and carries.'}
Location: ${location === 'gym' ? 'Gym (enforce all gym constraints — no jumping, no overhead, quiet)' : 'Backyard (full exercise library available)'}`

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(jsonStr)

    const workout: GeneratedWorkout = {
      id: uuidv4(),
      title: parsed.title,
      generatedAt: new Date().toISOString(),
      inputs: { duration, difficulty, focus, location },
      sections: parsed.sections,
    }

    return Response.json({ workout })
  } catch (err) {
    console.error('Generate error:', err)
    return Response.json({ error: 'Failed to generate workout' }, { status: 500 })
  }
}
