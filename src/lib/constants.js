import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'

export const PLATFORMS = ['Instagram', 'Facebook', 'TikTok']

export const PLATFORM_ICONS = {
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  TikTok: FaTiktok,
}

export const POST_STATUSES = ['Idea', 'Draft', 'Scheduled', 'Posted']

export const STATUS_COLORS = {
  Idea: '#9C958A',
  Draft: '#E8C84A',
  Scheduled: '#86B6D8',
  Posted: '#7FB68A',
}

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

// Static brand book HTML documents, served from /public, keyed by workspace id.
export const BRAND_BOOKS = {
  'ride-home-re': {
    label: 'Brand Book',
    src: '/brand-books/ride-home-re.html',
  },
}
