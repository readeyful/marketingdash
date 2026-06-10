import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/workspace-context'
import { getHeadingFont } from '../lib/theme'

export default function WorkspaceSelector() {
  const { workspaces, selectWorkspace } = useWorkspace()
  const navigate = useNavigate()

  function handleSelect(workspaceId) {
    selectWorkspace(workspaceId)
    navigate('/calendar')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F9F9] px-4 py-12">
      <h1 className="font-display mb-2 text-4xl text-[#1A1A1A]">
        Welcome <span className="italic">back</span>
      </h1>
      <p className="mb-10 text-base text-gray-500">
        Choose a workspace to get started
      </p>

      <div className="flex w-full max-w-3xl flex-col gap-6 sm:flex-row">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => handleSelect(workspace.id)}
            className="group flex flex-1 cursor-pointer flex-col items-start gap-6 rounded-2xl border border-black/5 bg-white p-8 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span
              className="h-10 w-10 rounded-full"
              style={{ backgroundColor: workspace.brandColor }}
            />
            <span
              className="font-display text-2xl text-[#1A1A1A]"
              style={{ fontFamily: getHeadingFont(workspace.id) }}
            >
              {workspace.name}
            </span>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
              style={{
                backgroundColor: workspace.accentColor,
                color: workspace.brandColor,
              }}
            >
              Enter workspace
            </span>
            <span
              className="block h-1 w-full rounded-full"
              style={{ backgroundColor: workspace.brandColor }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
