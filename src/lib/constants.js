import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
import {
  Clipboard,
  Home,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Users,
} from 'lucide-react'

export const PLATFORMS = ['Instagram', 'Facebook', 'TikTok']

export const PLATFORM_ICONS = {
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  TikTok: FaTiktok,
}

export const POST_TYPES = ['Carousel', 'Reel', 'Single Image', 'Story', 'Video']

// Brand colors used for the small platform dot on calendar thumbnails.
export const PLATFORM_DOT_COLORS = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  TikTok: '#000000',
}

export const CONTENT_PILLARS = [
  'Education',
  'Listing Feature',
  'Local Guide',
  'Lifestyle',
  'Market Update',
  'Personal',
]

export const AUDIENCES = ['Buyers', 'Sellers', 'Local Community', 'General']

// Vault item source types: badge label + color per type.
export const VAULT_TYPES = {
  template: { label: 'TEMPLATE', color: '#8E5BA6' },
  inspo: { label: 'INSPO', color: '#2D9C8F' },
  candc: { label: 'C&C', color: '#8A8074' },
}

export const VAULT_SORTS = ['Newest', 'Oldest', 'A–Z', 'Most Used']

export const EXPENSE_PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'Other']

export const EXPENSE_CATEGORIES = [
  'Boosted post',
  'Ad campaign',
  'Tools/Software',
  'Other',
]

// Best-effort guess at which platform a pasted link belongs to, so quick-add
// flows can pre-select a sensible platform.
export function detectPlatformFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host.includes('instagram.com')) return 'Instagram'
    if (host.includes('tiktok.com')) return 'TikTok'
    if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook'
  } catch {
    // Not a valid URL — fall through to default.
  }
  return 'Instagram'
}

// Calendar activity types — flat colored blocks distinct from post thumbnails.
export const ACTIVITY_TYPES = {
  'Open House': { icon: Home, bg: '#FFF8E6', border: '#EFD080', text: '#7A5A00' },
  'Door Knocking': { icon: MapPin, bg: '#FFF0EC', border: '#F5B8A0', text: '#8B3A1A' },
  'Cold Calls': { icon: Phone, bg: '#EAF5F0', border: '#7DC9A8', text: '#0F6E56' },
  'Client Meeting': { icon: Users, bg: '#EEF2FF', border: '#B0BFFF', text: '#2D3A9A' },
  'Follow-ups': { icon: Mail, bg: '#F5F0FF', border: '#C4AAEE', text: '#5A2D9A' },
  Admin: { icon: Clipboard, bg: '#F3F4F6', border: '#D1D5DB', text: '#4B5563' },
  Other: { icon: MoreHorizontal, bg: '#F9F9F9', border: '#E0E0E0', text: '#6B7280' },
}

export const ACTIVITY_TYPE_OPTIONS = Object.keys(ACTIVITY_TYPES)

// Formats a 'HH:MM' time string as a compact 12-hour label, e.g. '13:00' -> '1pm'.
export function formatActivityTime(time) {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour12}${period}` : `${hour12}:${String(m).padStart(2, '0')}${period}`
}

// Formats an activity's time range for display, e.g. '1pm – 4pm' or 'from 1pm'.
export function formatActivityTimeRange(startTime, endTime) {
  if (!startTime) return ''
  if (!endTime) return `from ${formatActivityTime(startTime)}`
  return `${formatActivityTime(startTime)} – ${formatActivityTime(endTime)}`
}

// Static brand book HTML documents, served from /public, keyed by workspace id.
export const BRAND_BOOKS = {
  'ride-home-re': {
    label: 'Brand Book',
    src: '/brand-books/ride-home-re.html',
  },
}
