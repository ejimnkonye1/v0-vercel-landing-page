import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Normalize service name for matching (lowercase, remove spaces, common variations)
function normalizeServiceName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/premium|plus|pro|basic|standard|family|individual|student/gi, '')
    .replace(/[^a-z0-9]/g, '')
}

// GET - Fetch price alerts for user's subscriptions
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Get user's subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, name, cost, billing_cycle')
      .eq('user_id', user.id)
      .in('status', ['active', 'trial'])

    if (subError || !subscriptions) {
      return NextResponse.json({ success: false, error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    // Get crowdsourced prices
    const { data: crowdsourcedPrices, error: priceError } = await supabase
      .from('crowdsourced_prices')
      .select('*')

    if (priceError) {
      return NextResponse.json({ success: false, error: 'Failed to fetch price data' }, { status: 500 })
    }

    // Get user's recent price changes
    const { data: priceHistory, error: historyError } = await supabase
      .from('price_history')
      .select('*, subscription:subscriptions(name)')
      .eq('user_id', user.id)
      .order('changed_at', { ascending: false })
      .limit(10)

    // Build price alerts
    const alerts = []
    const priceMap = new Map(
      (crowdsourcedPrices || []).map(p => [`${p.service_name}_${p.billing_cycle}`, p])
    )

    for (const sub of subscriptions) {
      const normalizedName = normalizeServiceName(sub.name)
      const key = `${normalizedName}_${sub.billing_cycle}`
      const communityPrice = priceMap.get(key)

      if (communityPrice && communityPrice.report_count >= 3) {
        const priceDiff = sub.cost - communityPrice.avg_price
        const percentDiff = (priceDiff / communityPrice.avg_price) * 100

        // Alert if user is paying 15%+ more than average
        if (Math.abs(percentDiff) >= 15) {
          alerts.push({
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            yourPrice: sub.cost,
            communityAvgPrice: Math.round(communityPrice.avg_price * 100) / 100,
            communityMinPrice: communityPrice.min_price,
            communityMaxPrice: communityPrice.max_price,
            priceDifference: Math.round(priceDiff * 100) / 100,
            percentageDiff: Math.round(percentDiff),
            billingCycle: sub.billing_cycle,
            reportCount: communityPrice.report_count,
            alertType: priceDiff > 0 ? 'overpaying' : 'underpaying'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      alerts,
      recentChanges: priceHistory || [],
      totalReports: crowdsourcedPrices?.length || 0
    })

  } catch (error: any) {
    console.error('Price changes error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Report a price (called when subscription is updated)
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { subscriptionId, serviceName, oldPrice, newPrice, billingCycle } = body

    // Record price change in history if price actually changed
    if (oldPrice !== undefined && newPrice !== undefined && oldPrice !== newPrice) {
      await supabase.from('price_history').insert({
        subscription_id: subscriptionId,
        user_id: user.id,
        old_price: oldPrice,
        new_price: newPrice,
        billing_cycle: billingCycle,
        changed_at: new Date().toISOString()
      })
    }

    // Update crowdsourced price data
    const normalizedName = normalizeServiceName(serviceName)
    const price = newPrice ?? oldPrice

    // Check if entry exists
    const { data: existing } = await supabase
      .from('crowdsourced_prices')
      .select('*')
      .eq('service_name', normalizedName)
      .eq('billing_cycle', billingCycle)
      .single()

    if (existing) {
      // Update existing - recalculate average
      const newCount = existing.report_count + 1
      const newAvg = ((existing.avg_price * existing.report_count) + price) / newCount
      const newMin = Math.min(existing.min_price, price)
      const newMax = Math.max(existing.max_price, price)

      await supabase
        .from('crowdsourced_prices')
        .update({
          avg_price: newAvg,
          min_price: newMin,
          max_price: newMax,
          report_count: newCount,
          last_reported: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      // Create new entry
      await supabase.from('crowdsourced_prices').insert({
        service_name: normalizedName,
        billing_cycle: billingCycle,
        avg_price: price,
        min_price: price,
        max_price: price,
        report_count: 1,
        last_reported: new Date().toISOString()
      })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Price report error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
