import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/workspace-context'
import { CARD_BG, INK, INK_MUTED, PAGE_BG } from '../lib/theme'

export default function WorkspaceSelector() {
  const { workspaces, selectWorkspace } = useWorkspace()
  const navigate = useNavigate()

  function handleSelect(workspaceId) {
    selectWorkspace(workspaceId)
    navigate('/calendar')
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: PAGE_BG }}
    >
      <h1 className="font-display mb-2 text-4xl" style={{ color: INK }}>
        Welcome <span className="italic">back</span>
      </h1>
      <p className="mb-10 text-base" style={{ color: INK_MUTED }}>
        Choose a workspace to get started
      </p>

      <div className="flex w-full max-w-3xl flex-col gap-6 sm:flex-row">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => handleSelect(workspace.id)}
            className="group flex flex-1 cursor-pointer flex-col items-start gap-6 rounded-2xl p-8 text-left transition hover:-translate-y-0.5"
            style={{ backgroundColor: CARD_BG }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: workspace.accentColor }}
            />
            <span className="font-display text-2xl" style={{ color: INK }}>
              {workspace.name}
            </span>
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: INK }}
            >
              Enter workspace
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
