import { NavLink } from 'react-router-dom'
import '../styles/BottomNav.css'

function IconHome(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSearch(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconAdd(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="6" ry="6" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7v10M7 12h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconReels(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 3l4 6M16 3l4 6M9 14l6 3-6 3v-6z" fill="currentColor"/>
    </svg>
  )
}

function IconMessage(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconProfile(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 21a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconSettings(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function BottomNav(){
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom Navigation">
      <NavLink to="/" end className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Home"><IconHome/></NavLink>
      <NavLink to="/explore" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Search"><IconSearch/></NavLink>
      <NavLink to="/reels" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Reels"><IconReels/></NavLink>
      <NavLink to="/upload" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Add"><IconAdd/></NavLink>
      <NavLink to="/messages" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Messages"><IconMessage/></NavLink>
      <NavLink to="/profile" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Profile"><IconProfile/></NavLink>
      <NavLink to="/admin" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Settings"><IconSettings/></NavLink>
    </nav>
  )
}
