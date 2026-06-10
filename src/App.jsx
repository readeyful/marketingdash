import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { useWorkspace } from './context/workspace-context'
import WorkspaceSelector from './pages/WorkspaceSelector'
import AppLayout from './layouts/AppLayout'
import Calendar from './pages/Calendar'
import Posts from './pages/Posts'
import Finances from './pages/Finances'
import Strategy from './pages/Strategy'

function RequireWorkspace({ children }) {
  const { activeWorkspace } = useWorkspace()
  if (!activeWorkspace) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WorkspaceSelector />} />
            <Route
              element={
                <RequireWorkspace>
                  <AppLayout />
                </RequireWorkspace>
              }
            >
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/strategy" element={<Strategy />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </ThemeProvider>
  )
}
