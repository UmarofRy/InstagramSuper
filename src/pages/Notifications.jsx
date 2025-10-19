import { useEffect, useMemo, useState } from 'react'
import { useNotifications } from '../contexts/NotificationContext.jsx'
import { getUsers } from '../api/users.js'
import '../styles/Notifications.css'

export default function Notifications(){
  const { items, markAllRead } = useNotifications()
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(()=>{ (async ()=>{ const u = await getUsers(); setUsers(u||[]) })() },[])
  useEffect(()=>{ markAllRead() },[])

  const total = items.length
  const maxPage = Math.max(1, Math.ceil(total/limit))
  const start = (page-1)*limit
  const end = Math.min(start+limit, total)
  const pageRows = useMemo(()=> items.slice(start, end), [items, start, end])
  const byId = useMemo(()=> Object.fromEntries(users.map(u=>[String(u.id), u])), [users])

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
    <div className="notif-page">
      <h2 className="page-title">Notifications</h2>
      <ul className="notif-list-full">
        {pageRows.map(n => {
          const to = n.type === 'message' ? '/messages' : n.type === 'follow' ? '/profile' : n.type === 'comment' ? '/' : '/'
          return (
            <li key={n.id} className={`notif-row ${n.read ? 'read' : ''}`}>
              <a className="notif-text" href={to}>{readable(n)}</a>
              <div className="notif-time">{new Date(n.timestamp||Date.now()).toLocaleString()}</div>
            </li>
          )
        })}
      </ul>
      <div className="notif-footer">
        <div className="range">{`Showing ${total===0?0:start+1}–${end} of ${total}`}</div>
        <div className="pager">
          <button className="outline-btn" onClick={()=>setPage(1)} disabled={page===1}>First</button>
          <button className="outline-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Previous</button>
          <span className="page-indicator">Page {page} / {maxPage}</span>
          <button className="outline-btn" onClick={()=>setPage(p=>Math.min(maxPage,p+1))} disabled={page===maxPage}>Next</button>
          <button className="outline-btn" onClick={()=>setPage(maxPage)} disabled={page===maxPage}>Last</button>
          <label className="page-size">Rows
            <select value={limit} onChange={(e)=>{ setPage(1); setLimit(parseInt(e.target.value,10)) }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}
