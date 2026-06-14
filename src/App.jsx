import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/auth-context'
import { ThemeProvider } from './context/ThemeContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { useWorkspace } from './context/workspace-context'
import LoadingState from './components/LoadingState'
import Login from './pages/Login'
import WorkspaceSelector from './pages/WorkspaceSelector'
import AppLayout from './layouts/AppLayout'
import Calendar from './pages/Calendar'
import Posts from './pages/Posts'
import Vault from './pages/Vault'
import Finances from './pages/Finances'
import Strategy from './pages/Strategy'

function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <LoadingState />
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireWorkspace({ children }) {
  const { activeWorkspace, loading } = useWorkspace()
  if (loading) return <LoadingState />
  if (!activeWorkspace) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <WorkspaceSelector />
                  </RequireAuth>
                }
              />
              <Route
                element={
                  <RequireAuth>
                    <RequireWorkspace>
                      <AppLayout />
                    </RequireWorkspace>
                  </RequireAuth>
                }
              >
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/finances" element={<Finances />} />
                <Route path="/strategy" element={<Strategy />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
