import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/theme-context'
import { INK_MUTED } from '../lib/theme'

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full p-2 transition hover:bg-(--border-soft) hover:text-(--text-ink)"
      style={{ color: INK_MUTED }}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
