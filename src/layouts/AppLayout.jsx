import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useWorkspace } from '../context/workspace-context'
import { SIDEBAR_COLOR, INK, INK_MUTED, PAGE_BG } from '../lib/theme'

export default function AppLayout() {
  const { activeWorkspace } = useWorkspace()
  const navigate = useNavigate()

  return (
    <div
      className="flex min-h-screen flex-col md:flex-row"
      style={{ backgroundColor: PAGE_BG }}
    >
      <Sidebar />

      {/* Mobile header */}
      <header
        className="flex items-center justify-between border-b border-black/5 p-4 md:hidden"
        style={{ backgroundColor: SIDEBAR_COLOR }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: activeWorkspace?.accentColor }}
          />
          <span className="text-lg font-medium" style={{ color: INK }}>
            {activeWorkspace?.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          title="Switch workspace"
          aria-label="Switch workspace"
          className="rounded-md p-1.5 transition hover:bg-black/5"
          style={{ color: INK_MUTED }}
        >
          <ArrowLeftRight size={16} />
        </button>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-6 pb-20 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
