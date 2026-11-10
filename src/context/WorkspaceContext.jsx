import { useEffect, useMemo, useState } from 'react'
import {
  getActiveWorkspaceId,
  getWorkspaces,
  setActiveWorkspaceId,
  updateWorkspace,
} from '../lib/storage'
import { WorkspaceContext } from './workspace-context'

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(() =>
    getActiveWorkspaceId(),
  )

  useEffect(() => {
    let active = true
    getWorkspaces().then((data) => {
      if (active) {
        setWorkspaces(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId],
  )

  function selectWorkspace(workspaceId) {
    setActiveWorkspaceId(workspaceId)
    setActiveWorkspaceIdState(workspaceId)
  }

  async function updateActiveWorkspace(updates) {
    if (!activeWorkspaceId) return
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === activeWorkspaceId ? { ...w, ...updates } : w)),
    )
    await updateWorkspace(activeWorkspaceId, updates)
  }

  const value = {
    workspaces,
    loading,
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
