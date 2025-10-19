import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} })

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { theme: action.payload }
    default:
      return state
  }
}

export function ThemeProvider({ children }) {
  let initial = 'light'
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('svapp_theme')
    if (saved) initial = saved
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) initial = 'dark'
  }
  const [state, dispatch] = useReducer(reducer, { theme: initial })

  useEffect(() => {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(state.theme)
    localStorage.setItem('svapp_theme', state.theme)
  }, [state.theme])

  const value = useMemo(() => ({
    theme: state.theme,
    setTheme: (t) => dispatch({ type: 'SET', payload: t }),
  }), [state.theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext) }
