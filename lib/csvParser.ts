import Papa from 'papaparse'

export interface ParsedRow {
  [key: string]: string
}

export interface SubscriptionCandidate {
  id: string
  name: string
  category: string
  cost: number
  billing_cycle: 'monthly' | 'yearly'
  renewal_date: string
  selected: boolean
  matched: boolean
}

// Vendor name mappings for auto-detection
const VENDOR_MAPPINGS: Record<string, { name: string; category: string }> = {
  // Entertainment
  'netflix': { name: 'Netflix', category: 'Entertainment' },
  'netflix.com': { name: 'Netflix', category: 'Entertainment' },
  'spotify': { name: 'Spotify', category: 'Entertainment' },
  'spotify.com': { name: 'Spotify', category: 'Entertainment' },
  'hulu': { name: 'Hulu', category: 'Entertainment' },
  'disney+': { name: 'Disney+', category: 'Entertainment' },
  'disneyplus': { name: 'Disney+', category: 'Entertainment' },
  'hbo': { name: 'HBO Max', category: 'Entertainment' },
  'hbo max': { name: 'HBO Max', category: 'Entertainment' },
  'hbomax': { name: 'HBO Max', category: 'Entertainment' },
  'amazon prime': { name: 'Amazon Prime', category: 'Entertainment' },
  'prime video': { name: 'Amazon Prime', category: 'Entertainment' },
  'apple music': { name: 'Apple Music', category: 'Entertainment' },
  'youtube': { name: 'YouTube Premium', category: 'Entertainment' },
  'youtube premium': { name: 'YouTube Premium', category: 'Entertainment' },
  'youtube music': { name: 'YouTube Music', category: 'Entertainment' },
  'peacock': { name: 'Peacock', category: 'Entertainment' },
  'paramount+': { name: 'Paramount+', category: 'Entertainment' },
  'paramount plus': { name: 'Paramount+', category: 'Entertainment' },
  'apple tv': { name: 'Apple TV+', category: 'Entertainment' },
  'apple tv+': { name: 'Apple TV+', category: 'Entertainment' },
  'crunchyroll': { name: 'Crunchyroll', category: 'Entertainment' },
  'twitch': { name: 'Twitch', category: 'Entertainment' },
  'discord nitro': { name: 'Discord Nitro', category: 'Entertainment' },
  'discord': { name: 'Discord Nitro', category: 'Entertainment' },

  // Productivity
  'microsoft': { name: 'Microsoft 365', category: 'Productivity' },
  'microsoft 365': { name: 'Microsoft 365', category: 'Productivity' },
  'office 365': { name: 'Microsoft 365', category: 'Productivity' },
  'notion': { name: 'Notion', category: 'Productivity' },
  'slack': { name: 'Slack', category: 'Productivity' },
  'zoom': { name: 'Zoom', category: 'Productivity' },
  'canva': { name: 'Canva', category: 'Productivity' },
  'grammarly': { name: 'Grammarly', category: 'Productivity' },
  'evernote': { name: 'Evernote', category: 'Productivity' },
  'todoist': { name: 'Todoist', category: 'Productivity' },
  'asana': { name: 'Asana', category: 'Productivity' },
  'trello': { name: 'Trello', category: 'Productivity' },
  'monday': { name: 'Monday.com', category: 'Productivity' },
  'monday.com': { name: 'Monday.com', category: 'Productivity' },
  '1password': { name: '1Password', category: 'Productivity' },
  'lastpass': { name: 'LastPass', category: 'Productivity' },
  'dashlane': { name: 'Dashlane', category: 'Productivity' },

  // Developer Tools
  'github': { name: 'GitHub', category: 'Developer Tools' },
  'github.com': { name: 'GitHub', category: 'Developer Tools' },
  'gitlab': { name: 'GitLab', category: 'Developer Tools' },
  'figma': { name: 'Figma', category: 'Developer Tools' },
  'adobe': { name: 'Adobe Creative Cloud', category: 'Developer Tools' },
  'adobe creative cloud': { name: 'Adobe Creative Cloud', category: 'Developer Tools' },
  'jetbrains': { name: 'JetBrains', category: 'Developer Tools' },
  'linear': { name: 'Linear', category: 'Developer Tools' },
  'vercel': { name: 'Vercel', category: 'Developer Tools' },
  'netlify': { name: 'Netlify', category: 'Developer Tools' },
  'heroku': { name: 'Heroku', category: 'Developer Tools' },
  'aws': { name: 'AWS', category: 'Developer Tools' },
  'digitalocean': { name: 'DigitalOcean', category: 'Developer Tools' },
  'chatgpt': { name: 'ChatGPT Plus', category: 'Developer Tools' },
  'openai': { name: 'OpenAI', category: 'Developer Tools' },
  'anthropic': { name: 'Claude Pro', category: 'Developer Tools' },
  'claude': { name: 'Claude Pro', category: 'Developer Tools' },

  // Storage
  'dropbox': { name: 'Dropbox', category: 'Storage' },
  'google one': { name: 'Google One', category: 'Storage' },
  'google drive': { name: 'Google One', category: 'Storage' },
  'icloud': { name: 'iCloud+', category: 'Storage' },
  'icloud+': { name: 'iCloud+', category: 'Storage' },
  'onedrive': { name: 'OneDrive', category: 'Storage' },
  'box': { name: 'Box', category: 'Storage' },

  // Fitness
  'peloton': { name: 'Peloton', category: 'Fitness' },
  'strava': { name: 'Strava', category: 'Fitness' },
  'myfitnesspal': { name: 'MyFitnessPal', category: 'Fitness' },
  'headspace': { name: 'Headspace', category: 'Fitness' },
  'calm': { name: 'Calm', category: 'Fitness' },
  'fitbit': { name: 'Fitbit Premium', category: 'Fitness' },
  'nike': { name: 'Nike Training', category: 'Fitness' },

  // Social Media
  'x': { name: 'X Premium', category: 'Social Media' },
  'twitter': { name: 'X Premium', category: 'Social Media' },
  'linkedin': { name: 'LinkedIn Premium', category: 'Social Media' },
  'reddit': { name: 'Reddit Premium', category: 'Social Media' },
  'tinder': { name: 'Tinder', category: 'Social Media' },
  'bumble': { name: 'Bumble', category: 'Social Media' },
}

// Common column name mappings
const COLUMN_MAPPINGS = {
  name: ['name', 'vendor', 'merchant', 'description', 'payee', 'company', 'service'],
  cost: ['amount', 'cost', 'price', 'total', 'charge', 'debit', 'payment'],
  date: ['date', 'transaction date', 'posted date', 'trans date', 'payment date'],
  category: ['category', 'type', 'classification'],
}

export function parseCSV(content: string): { headers: string[]; rows: ParsedRow[] } {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  })

  return {
    headers: result.meta.fields || [],
    rows: result.data as ParsedRow[],
  }
}

export function detectColumnMapping(headers: string[]): {
  nameColumn: string | null
  costColumn: string | null
  dateColumn: string | null
  categoryColumn: string | null
} {
  const findColumn = (options: string[]): string | null => {
    for (const option of options) {
      const found = headers.find(h => h.includes(option))
      if (found) return found
    }
    return null
  }

  return {
    nameColumn: findColumn(COLUMN_MAPPINGS.name),
    costColumn: findColumn(COLUMN_MAPPINGS.cost),
    dateColumn: findColumn(COLUMN_MAPPINGS.date),
    categoryColumn: findColumn(COLUMN_MAPPINGS.category),
  }
}

export function matchToKnownService(vendorName: string): { name: string; category: string } | null {
  const normalized = vendorName.toLowerCase().trim()

  // Direct match
  if (VENDOR_MAPPINGS[normalized]) {
    return VENDOR_MAPPINGS[normalized]
  }

  // Partial match - check if any known vendor is contained in the name
  for (const [key, value] of Object.entries(VENDOR_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  return null
}

export function processRows(
  rows: ParsedRow[],
  mapping: {
    nameColumn: string | null
    costColumn: string | null
    dateColumn: string | null
  }
): SubscriptionCandidate[] {
  if (!mapping.nameColumn || !mapping.costColumn) {
    return []
  }

  const candidates: SubscriptionCandidate[] = []
  let idCounter = 1

  for (const row of rows) {
    const rawName = row[mapping.nameColumn] || ''
    const rawCost = row[mapping.costColumn] || ''
    const rawDate = mapping.dateColumn ? row[mapping.dateColumn] : ''

    // Parse cost - handle various formats like "$15.99", "15.99", "(15.99)", "-15.99"
    const costMatch = rawCost.replace(/[()$,]/g, '').trim()
    const cost = Math.abs(parseFloat(costMatch))

    if (!rawName || isNaN(cost) || cost === 0) {
      continue
    }

    // Try to match to known service
    const matched = matchToKnownService(rawName)
    const name = matched?.name || rawName.trim()
    const category = matched?.category || 'Other'

    // Parse date or use current date + 30 days
    let renewalDate: string
    if (rawDate) {
      const parsed = new Date(rawDate)
      if (!isNaN(parsed.getTime())) {
        // Add 30 days to the transaction date as estimated renewal
        parsed.setDate(parsed.getDate() + 30)
        renewalDate = parsed.toISOString().split('T')[0]
      } else {
        const future = new Date()
        future.setDate(future.getDate() + 30)
        renewalDate = future.toISOString().split('T')[0]
      }
    } else {
      const future = new Date()
      future.setDate(future.getDate() + 30)
      renewalDate = future.toISOString().split('T')[0]
    }

    candidates.push({
      id: `import-${idCounter++}`,
      name,
      category,
      cost,
      billing_cycle: 'monthly', // Default to monthly
      renewal_date: renewalDate,
      selected: matched !== null, // Pre-select known services
      matched: matched !== null,
    })
  }

  // Deduplicate by name (keep first occurrence)
  const seen = new Set<string>()
  return candidates.filter((c) => {
    const key = c.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function parseJSON(content: string): SubscriptionCandidate[] {
  try {
    const data = JSON.parse(content)
    const items = Array.isArray(data) ? data : [data]
    let idCounter = 1

    return items.map((item) => ({
      id: `import-${idCounter++}`,
      name: item.name || 'Unknown',
      category: item.category || 'Other',
      cost: parseFloat(item.cost) || 0,
      billing_cycle: item.billing_cycle === 'yearly' ? 'yearly' : 'monthly',
      renewal_date: item.renewal_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      selected: true,
      matched: true,
    }))
  } catch {
    return []
  }
}
