import { useMemo, useState } from 'react'
import {
  getActiveWorkspaceId,
  getWorkspaces,
  setActiveWorkspaceId,
  updateWorkspace,
} from '../lib/storage'
import { WorkspaceContext } from './workspace-context'

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState(() => getWorkspaces())
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(() =>
    getActiveWorkspaceId(),
  )

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId],
  )

  function selectWorkspace(workspaceId) {
    setActiveWorkspaceId(workspaceId)
    setActiveWorkspaceIdState(workspaceId)
  }

  function updateActiveWorkspace(updates) {
    if (!activeWorkspaceId) return
    setWorkspaces(updateWorkspace(activeWorkspaceId, updates))
  }

  const value = {
    workspaces,
    activeWorkspace,
    selectWorkspace,
    updateActiveWorkspace,
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
