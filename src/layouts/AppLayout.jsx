import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useWorkspace } from '../context/workspace-context'
import { getHeadingFont, getWorkspaceThemeVars } from '../lib/theme'

export default function AppLayout() {
  const { activeWorkspace } = useWorkspace()
  const navigate = useNavigate()

  return (
    <div
      className="flex min-h-screen flex-col bg-[#F9F9F9] md:flex-row"
      style={getWorkspaceThemeVars(activeWorkspace)}
    >
      <Sidebar />

      {/* Mobile header */}
      <header
        className="flex items-center justify-between p-4 text-white md:hidden"
        style={{ backgroundColor: activeWorkspace?.brandColor }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: activeWorkspace?.accentColor }}
          />
          <span
            className="text-lg"
            style={{ fontFamily: getHeadingFont(activeWorkspace?.id) }}
          >
            {activeWorkspace?.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          title="Switch workspace"
          aria-label="Switch workspace"
          className="rounded-md p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeftRight size={16} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 pb-20 md:p-8 md:pb-8">
        <Outlet />
      </main>
    </div>
  )
}
