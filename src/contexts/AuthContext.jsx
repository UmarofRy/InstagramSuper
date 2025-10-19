import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const AuthContext = createContext({ user: null, login: () => {}, logout: () => {}, setUser: () => {} })

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload }
    case 'LOGOUT':
      return { user: null }
    case 'SET_USER':
      return { user: action.payload }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { user: null })

  // load from localStorage once
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('svapp_user') || 'null')
      if (saved) dispatch({ type: 'SET_USER', payload: saved })
    } catch (e) {
      // Silently ignore localStorage parse errors
      void e
    }
  }, [])

  const value = useMemo(() => ({
    user: state.user,
    login: (u) => { localStorage.setItem('svapp_user', JSON.stringify(u)); dispatch({ type: 'LOGIN', payload: u }) },
    logout: () => { localStorage.removeItem('svapp_user'); dispatch({ type: 'LOGOUT' }) },
    setUser: (u) => { localStorage.setItem('svapp_user', JSON.stringify(u)); dispatch({ type: 'SET_USER', payload: u }) },
  }), [state.user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
