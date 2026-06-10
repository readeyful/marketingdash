import { useEffect, useState } from 'react'
import { getTheme, setTheme as persistTheme } from '../lib/storage'
import { ThemeContext } from './theme-context'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getTheme())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      persistTheme(next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
