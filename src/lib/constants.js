import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'

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

// Static brand book HTML documents, served from /public, keyed by workspace id.
export const BRAND_BOOKS = {
  'ride-home-re': {
    label: 'Brand Book',
    src: '/brand-books/ride-home-re.html',
  },
}
