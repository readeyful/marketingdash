import { AuthContext } from './auth-context'

// Auth is disabled — app runs fully locally without Supabase.
const noop = async () => ({})

export function AuthProvider({ children }) {
  const value = {
    session: null,
    loading: false,
    signIn: noop,
    signUp: noop,
    signOut: noop,
    resetPassword: noop,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
