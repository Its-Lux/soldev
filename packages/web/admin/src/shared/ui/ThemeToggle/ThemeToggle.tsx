import { FaMoon, FaSun } from 'react-icons/fa'
import { useTheme } from '@/shared/lib'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`rounded-full p-2 transition-colors hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      {isDark ? (
        <FaSun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <FaMoon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
