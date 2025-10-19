import { useEffect, useMemo, useState } from 'react'
import { getUsers } from '../api/users.js'
import { useNotifications } from '../contexts/NotificationContext.jsx'
import { Link } from 'react-router-dom'
import '../styles/NotificationPanel.css'

export default function NotificationPanel({ open }) {
  const { items, markAllRead } = useNotifications()
  const [users, setUsers] = useState([])

  useEffect(() => { if (open) markAllRead() }, [open, markAllRead])
  useEffect(() => { (async ()=>{ const u = await getUsers(); setUsers(u||[]) })() }, [])

  const byId = useMemo(() => Object.fromEntries(users.map(u => [String(u.id), u])), [users])

  const readable = (n) => {
    const actor = byId[String(n.actorId)]?.nickname || 'Someone'
    if (n.type === 'like') return `${actor} liked your post`
    if (n.type === 'follow') return `${actor} followed you`
    if (n.type === 'comment') return `${actor} commented on your post`
    if (n.type === 'message') return `${actor} sent you a message`
    if (n.type === 'admin') return `Admin updated your account`
    return 'New notification'
  }

  return (
    <div className={`notif-panel ${open ? 'open' : ''}`} role="dialog" aria-label="Notifications">
      <div className="notif-panel-header">
        <div className="notif-panel-title">Notifications</div>
        <Link to="/notifications" className="outline-btn">View all</Link>
      </div>
      <ul className="notif-panel-list">
        {items.slice(0,10).map((n) => {
          const to = n.type === 'message' ? '/messages' : n.type === 'follow' ? '/profile' : n.type === 'comment' ? '/' : '/'
          return (
            <li key={n.id}>
              <Link to={to} className={`notif-panel-item ${n.read ? '' : 'unread'}`}>{readable(n)}</Link>
            </li>
          )
        })}
        {items.length === 0 && <li className="notif-panel-empty">You're all caught up</li>}
      </ul>
    </div>
  )
}
