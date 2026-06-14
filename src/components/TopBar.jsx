import { useLocation } from 'react-router-dom'
import { Bell, HelpCircle, LogOut, Settings } from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'
import { useAuth } from '../context/auth-context'
import { NAV_ITEMS } from '../lib/nav'
import { INK_MUTED, PAGE_BG } from '../lib/theme'

export default function TopBar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const current = NAV_ITEMS.find((item) => item.to === location.pathname)

  return (
    <header
      className="hidden items-center justify-between border-b border-(--border-soft) px-6 py-4 md:flex md:px-8"
      style={{ backgroundColor: PAGE_BG }}
    >
      <span className="text-sm font-medium" style={{ color: INK_MUTED }}>
        {current?.label ?? ''}
      </span>
      <div className="flex items-center gap-1.5">
        <DarkModeToggle />
        {[Bell, HelpCircle, Settings].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="rounded-full p-2 transition hover:bg-(--border-soft) hover:text-(--text-ink)"
            style={{ color: INK_MUTED }}
          >
            <Icon size={18} />
          </button>
        ))}
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-full p-2 transition hover:bg-(--border-soft) hover:text-(--text-ink)"
          style={{ color: INK_MUTED }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
