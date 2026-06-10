// Shared neutral theme used across all workspaces. Per-workspace
// brandColor/accentColor still live on the workspace object (used only
// for the small workspace identifier dot) but no longer drive the
// app's surface colors or fonts.
//
// Color values are CSS custom properties (defined in index.css for both
// light and dark mode) so a single set of inline styles works in both.

export const PAGE_BG = 'var(--surface-page)'
export const CARD_BG = 'var(--surface-card)'
export const SIDEBAR_COLOR = 'var(--surface-sidebar)'
export const INK = 'var(--text-ink)'
export const INK_MUTED = 'var(--text-muted)'
export const ACCENT_COLOR = INK

// A solid, high-contrast color pair for "primary" buttons/badges that
// stays readable against either surface in light or dark mode.
export const ACCENT_SOLID_BG = 'var(--accent-solid-bg)'
export const ACCENT_SOLID_TEXT = 'var(--accent-solid-text)'

export const STAT_ACCENTS = [ACCENT_SOLID_BG, '#D7E654', '#86B6D8', '#E8884A']

// Shared form control styling for inputs, selects, and textareas.
export const INPUT_CLASS =
  'w-full rounded-lg border border-(--border-strong) bg-(--surface-page) px-3 py-2 text-sm text-(--text-ink) focus:border-(--text-muted) focus:outline-none'

export const LABEL_CLASS = 'mb-1 block text-xs font-medium'
