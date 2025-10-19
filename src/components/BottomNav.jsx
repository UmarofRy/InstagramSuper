import { NavLink } from 'react-router-dom'
import '../styles/BottomNav.css'

function IconHome(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
}
function IconSearch(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  )
}
function IconAdd(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="6" ry="6" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 7v10M7 12h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  )
}
function IconReels(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M8 3l4 6M16 3l4 6M9 14l6 3-6 3v-6z" fill="currentColor"/></svg>
  )
}
function IconProfile(){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M4 21a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  )
}

export default function BottomNav(){
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom Navigation">
      <NavLink to="/" end className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Home"><IconHome/></NavLink>
      <NavLink to="/explore" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Search"><IconSearch/></NavLink>
      <NavLink to="/upload" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Add"><IconAdd/></NavLink>
      <NavLink to="/reels" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Reels"><IconReels/></NavLink>
      <NavLink to="/profile" className={({isActive})=>`bottom-nav-link ${isActive?'active':''}`} aria-label="Profile"><IconProfile/></NavLink>
    </nav>
  )
}
