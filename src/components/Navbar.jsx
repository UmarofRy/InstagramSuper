import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import NotificationPanel from './NotificationPanel.jsx'
import { useNotifications } from '../contexts/NotificationContext.jsx'
import '../styles/Navbar.css'

function Bell({ user }) {
  const [open, setOpen] = useState(false)
  const { unread, markAllRead } = useNotifications()
  useEffect(() => { if (open) markAllRead() }, [open, markAllRead])
  
  return (
    <div className="bell-wrap">
      <button className="theme-btn" onClick={() => setOpen(o => !o)} aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && <span className="dot"/>}
      </button>
      <NotificationPanel user={user} open={open} />
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const doLogout = () => { 
    logout()
    navigate('/')
  }

  return (
    <header className="topbar">
      <div className="brand">
        <span>InstaTok</span>
        <img className='logo' src="/logo.png" alt="InstaTok Logo" />
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/reels">Reels</Link>
        <Link to="/upload">Upload</Link>
        {user && <Link to="/profile">Profile</Link>}
        {user && <Link to="/messages">Messages</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </nav>
      <div className="nav-actions">
        {user && <Bell user={user} />}
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
        </button>
        {user ? (
          <div className="user-box">
            <span className="user-name">{user.nickname}</span>
            <button className="outline-btn" onClick={doLogout}>Logout</button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="outline-btn">Login</Link>
          </div>
        )}
      </div>
    </header>
  )
}
