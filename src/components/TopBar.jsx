import { useLocation } from 'react-router-dom'
import { Bell, HelpCircle, Settings } from 'lucide-react'
import { NAV_ITEMS } from '../lib/nav'

export default function TopBar() {
  const location = useLocation()
  const current = NAV_ITEMS.find((item) => item.to === location.pathname)

  return (
    <header className="hidden items-center justify-between border-b border-black/5 px-6 py-4 md:flex md:px-8">
      <span className="text-sm font-medium text-gray-400">
        {current?.label ?? ''}
      </span>
      <div className="flex items-center gap-1.5">
        {[Bell, HelpCircle, Settings].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="rounded-full p-2 text-gray-400 transition hover:bg-black/5 hover:text-[#1A1A1A]"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </header>
  )
}
