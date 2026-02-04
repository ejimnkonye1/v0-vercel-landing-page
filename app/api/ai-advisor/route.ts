import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Subscription, AIAdvisorAnalysis } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple in-memory rate limiter (1 request per 60 seconds per user)
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 60 seconds

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const lastRequest = rateLimitMap.get(userId)

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - (now - lastRequest)) / 1000)
    return { allowed: false, retryAfter }
  }

  rateLimitMap.set(userId, now)
  return { allowed: true }
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [userId, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW * 2) {
      rateLimitMap.delete(userId)
    }
  }
}, 5 * 60 * 1000)

interface RequestBody {
  subscriptions: Subscription[]
  totalMonthlySpend: number
  totalYearlyProjection: number
  healthData: {
    score: number
    status: string
    healthyCount: number
    warningCount: number
    unhealthyCount: number
    totalSavingsPotential: number
  }
  currency: string
}

export async function POST(request: Request) {
  try {
    // Authenticate user via Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: `Please wait ${rateLimit.retryAfter} seconds before requesting new insights`,
        retryAfter: rateLimit.retryAfter
      }, { status: 429 })
    }

    // Parse request body
    const body: RequestBody = await request.json()
    const { subscriptions, totalMonthlySpend, totalYearlyProjection, healthData, currency } = body

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No subscriptions provided'
      }, { status: 400 })
    }

    // Build the prompt for Gemini
    const systemInstruction = `You are a subscription advisor. Respond with ONLY valid JSON, no markdown.
Keep responses concise. Limit to 3 insights, 3 recommendations max, and 2 tips.
JSON structure:
{"summary":"brief overview","totalPotentialSavings":number,"insights":[{"type":"success|warning|error|info","message":"text"}],"recommendations":[{"subscriptionName":"name","action":"keep|cancel|downgrade|review","reason":"why","potentialSavings":number,"alternative":"optional"}],"tips":["tip1","tip2"]}`

    // Format subscription data for the prompt
    const subscriptionDetails = subscriptions
      .filter(s => s.status === 'active')
      .map(s => {
        const monthlyCost = s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost
        const lastUsedInfo = s.last_used
          ? `Last used: ${new Date(s.last_used).toLocaleDateString()}`
          : 'Usage: Unknown'
        return `- ${s.name} (${s.category}): ${currency}${monthlyCost.toFixed(2)}/mo, ${s.billing_cycle} billing, ${lastUsedInfo}`
      })
      .join('\n')

    const userPrompt = `Subscriptions:
${subscriptionDetails}

Monthly: ${currency}${totalMonthlySpend.toFixed(2)} | Yearly: ${currency}${totalYearlyProjection.toFixed(2)}
Health: ${healthData.score}/100 | Savings potential: ${currency}${healthData.totalSavingsPotential.toFixed(2)}/mo

Analyze and return COMPLETE valid JSON. No markdown. Keep it concise.`

    // Call Gemini API
    const apiKey = process.env.GOOGLE_GEMINI_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured'
      }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    })

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: userPrompt }
    ])

    const responseText = result.response.text()

    // Parse the JSON response
    let analysis: AIAdvisorAnalysis
    try {
      // Remove any potential markdown code blocks
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      analysis = JSON.parse(cleanedResponse)
    } catch {
      console.error('Failed to parse Gemini response:', responseText)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response'
      }, { status: 500 })
    }

    // Validate the response structure
    if (!analysis.summary || !analysis.insights || !analysis.recommendations || !analysis.tips) {
      return NextResponse.json({
        success: false,
        error: 'Invalid AI response structure'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error: any) {
    console.error('AI Advisor error:', error)

    // Handle Gemini API rate limit errors
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json({
        success: false,
        error: 'AI service is temporarily busy. Please try again in a minute.',
        retryAfter: 60
      }, { status: 429 })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 })
  }
}
