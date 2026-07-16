import { Moon, Sun } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => setTheme(currentTheme()), [])

  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    window.localStorage.setItem('ihateregex:theme', next)
    setTheme(next)
  }

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === 'dark' ? <Sun size={17} weight="bold" /> : <Moon size={17} weight="bold" />}
    </button>
  )
}
