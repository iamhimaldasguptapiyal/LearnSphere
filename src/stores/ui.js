import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const THEME_KEY = 'learnsphere:theme'

/**
 * Application-wide interface state: colour theme and transient toasts.
 * Kept separate from domain data so that feature stores stay focused.
 */
export const useUiStore = defineStore('ui', () => {
  const theme = ref(readInitialTheme())
  const toasts = ref([])

  let toastId = 0

  function readInitialTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'light' || saved === 'dark') return saved
    } catch {
      /* storage unavailable — fall through to the system preference */
    }
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  function applyTheme(value) {
    document.documentElement.setAttribute('data-theme', value)
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  /** Push a short-lived message. `type` is 'success' | 'error' | 'info'. */
  function notify(message, type = 'success', timeout = 3500) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    window.setTimeout(() => dismiss(id), timeout)
    return id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  // Persist and apply the theme whenever it changes, including on first run.
  watch(
    theme,
    (value) => {
      applyTheme(value)
      try {
        localStorage.setItem(THEME_KEY, value)
      } catch {
        /* ignore quota or private-mode failures */
      }
    },
    { immediate: true },
  )

  return { theme, toasts, toggleTheme, notify, dismiss }
})
