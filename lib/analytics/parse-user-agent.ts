/**
 * Lightweight user-agent parser for analytics.
 * No external deps — just regex checks for major browsers/OS/devices.
 */

export interface ParsedUA {
  browser: string
  os: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export function parseUserAgent(ua: string): ParsedUA {
  const lower = ua.toLowerCase()

  // Browser detection (order matters — check specific before generic)
  let browser = 'Other'
  if (lower.includes('edg/') || lower.includes('edge/')) browser = 'Edge'
  else if (lower.includes('opr/') || lower.includes('opera')) browser = 'Opera'
  else if (lower.includes('firefox/')) browser = 'Firefox'
  else if (lower.includes('chrome/') && lower.includes('safari/')) browser = 'Chrome'
  else if (lower.includes('safari/') && !lower.includes('chrome')) browser = 'Safari'

  // OS detection
  let os = 'Other'
  if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ipod')) os = 'iOS'
  else if (lower.includes('android')) os = 'Android'
  else if (lower.includes('windows')) os = 'Windows'
  else if (lower.includes('mac os') || lower.includes('macintosh')) os = 'macOS'
  else if (lower.includes('linux')) os = 'Linux'

  // Device type
  let deviceType: ParsedUA['deviceType'] = 'desktop'
  if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('ipod')) {
    deviceType = 'mobile'
  } else if (lower.includes('tablet') || lower.includes('ipad')) {
    deviceType = 'tablet'
  } else if (lower.includes('android') && !lower.includes('mobile')) {
    deviceType = 'tablet'
  }

  return { browser, os, deviceType }
}
