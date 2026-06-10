import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
import { useWorkspace } from '../context/workspace-context'
import { SIDEBAR_COLOR, INK, INK_MUTED, CARD_BG } from '../lib/theme'
import { NAV_ITEMS } from '../lib/nav'

export default function Sidebar() {
  const { activeWorkspace } = useWorkspace()
  const navigate = useNavigate()

  if (!activeWorkspace) return null

  const { accentColor } = activeWorkspace

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-(--border-soft) p-4 md:flex"
        style={{ backgroundColor: SIDEBAR_COLOR }}
      >
        <div>
          <div className="mb-8 flex items-center justify-between gap-2 px-2 pt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <span
                className="truncate text-lg font-medium"
                style={{ color: INK }}
              >
                {activeWorkspace.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              title="Switch workspace"
              aria-label="Switch workspace"
              className="shrink-0 rounded-md p-1.5 transition hover:bg-(--border-soft)"
              style={{ color: INK_MUTED }}
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? '' : 'hover:bg-(--border-soft)'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? CARD_BG : 'transparent',
                  color: isActive ? INK : INK_MUTED,
                })}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-(--border-strong) p-2 md:hidden"
        style={{ backgroundColor: SIDEBAR_COLOR }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition"
            style={({ isActive }) => ({
              backgroundColor: isActive ? CARD_BG : 'transparent',
              color: isActive ? INK : INK_MUTED,
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
