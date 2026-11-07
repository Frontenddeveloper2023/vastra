/**
 * Indian Standard Time (IST / Tamil Nadu) DateTime Formatter Utility
 * Formats timestamps in 12-hour format with AM / PM (no 24-hour military/railway time).
 */

const TIME_ZONE = 'Asia/Kolkata'

/**
 * Format Date only: e.g. "07 Nov 2026"
 */
export const formatIndianDate = (dateValue) => {
  if (!dateValue) return ''
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-IN', {
      timeZone: TIME_ZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Format Time only: e.g. "03:15 PM" (12-hour with AM / PM, never 24-hr)
 */
export const formatIndianTime = (dateValue) => {
  if (!dateValue) return ''
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('en-IN', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ''
  }
}

/**
 * Format Date + Time: e.g. "07 Nov 2026, 03:15 PM"
 */
export const formatIndianDateTime = (dateValue) => {
  if (!dateValue) return ''
  const dateStr = formatIndianDate(dateValue)
  const timeStr = formatIndianTime(dateValue)
  if (!dateStr) return ''
  return timeStr ? `${dateStr}, ${timeStr}` : dateStr
}

export default {
  formatIndianDate,
  formatIndianTime,
  formatIndianDateTime,
}

