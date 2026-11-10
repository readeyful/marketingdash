import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  function signUp(email, password) {
    return supabase.auth.signUp({ email, password })
  }

  function signOut() {
    return supabase.auth.signOut()
  }

  function resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
  }

  const value = { session, loading, signIn, signUp, signOut, resetPassword }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
