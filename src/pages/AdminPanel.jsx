import { useEffect, useMemo, useState } from 'react'
import AdminTable from '../components/AdminTable.jsx'
import { deleteRecord, getPosts, getUsers, updateRecord } from '../api/users.js'
import { getComments, deleteComment, updateComment } from '../api/comments.js'
import { listFollows } from '../api/follows.js'
import { listLogs, createLog, deleteLog } from '../api/logs.js'
import { listMessages } from '../api/messages.js'
import { listNotifications, createNotification } from '../api/notifications.js'
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../api/Admin_API.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import '../styles/AdminPanel.css'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [follows, setFollows] = useState([])
  const [logs, setLogs] = useState([])
  const [messages, setMessages] = useState([])
  const [notifs, setNotifs] = useState([])
  const [admins, setAdmins] = useState([])
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [toast, setToast] = useState('')

  const load = async () => {
    const [u, p, c, f, l, m, n] = await Promise.all([getUsers(), getPosts(), getComments(), listFollows(), listLogs(), listMessages(), listNotifications()])
    setUsers(u || [])
    setPosts(p || [])
    setComments(c || [])
    setFollows(f || [])
    setLogs((l || []).sort((a,b)=>b.timestamp-a.timestamp))
    setMessages((m || []).sort((a,b)=>a.timestamp-b.timestamp))
    setNotifs((n || []).sort((a,b)=>b.timestamp-a.timestamp))
  }

  useEffect(() => { load() }, [])
  useEffect(() => { (async ()=>{ setAdminsLoading(true); const a = await getAdmins(); setAdmins(a||[]); setAdminsLoading(false) })() }, [])

  const editUser = async (u) => {
    const nickname = prompt('Nickname', u.nickname) ?? u.nickname
    const subscribersStr = prompt('Subscribers', String(u.subscribers || 0)) ?? String(u.subscribers || 0)
    const subscribers = parseInt(subscribersStr, 10) || 0
    const payload = { ...u, nickname, subscribers, verified: subscribers > 10 }
    await updateRecord(u.id, payload)
    await createLog({ action: 'edit_user', targetType: 'user', targetId: String(u.id), timestamp: Date.now() })
    load()
  }

  const delUser = async (u) => { await deleteRecord(u.id); await createLog({ action: 'delete_user', targetType: 'user', targetId: String(u.id), timestamp: Date.now() }); load() }

  const verifyUser = async (u) => { await updateRecord(u.id, { ...u, verified: true }); await createLog({ action: 'verify_user', targetType: 'user', targetId: String(u.id), timestamp: Date.now() }); await createNotification({ userId: String(u.id), type: 'admin', actorId: 'admin', timestamp: Date.now(), read: false }); load() }
  const blockUser = async (u) => { await updateRecord(u.id, { ...u, blocked: !u.blocked }); await createLog({ action: 'toggle_block', targetType: 'user', targetId: String(u.id), timestamp: Date.now() }); await createNotification({ userId: String(u.id), type: 'admin', actorId: 'admin', timestamp: Date.now(), read: false }); load() }

  const editPost = async (p) => {
    const title = prompt('Title', p.title || '') ?? p.title
    const mediaUrl = prompt('Media URL', p.mediaUrl || '') ?? p.mediaUrl
    const description = prompt('Description', p.description || '') ?? p.description
    await updateRecord(p.id, { ...p, title, mediaUrl, description })
    await createLog({ action: 'edit_post', targetType: 'post', targetId: String(p.id), timestamp: Date.now() })
    if(p.authorId) await createNotification({ userId: String(p.authorId), type: 'admin', actorId: 'admin', timestamp: Date.now(), read: false })
    load()
  }

  const editComm = async (c) => {
    const content = prompt('Content', c.content || '') ?? c.content
    await updateComment(c.id, { ...c, content })
    await createLog({ action: 'edit_comment', targetType: 'comment', targetId: String(c.id), timestamp: Date.now() })
    if(c.userId) await createNotification({ userId: String(c.userId), type: 'admin', actorId: 'admin', timestamp: Date.now(), read: false })
    load()
  }

  const delPost = async (p) => { await deleteRecord(p.id); await createLog({ action: 'delete_post', targetType: 'post', targetId: String(p.id), timestamp: Date.now() }); if(p.authorId) await createNotification({ userId: String(p.authorId), type: 'admin', actorId: 'admin', timestamp: Date.now(), read: false }); load() }
  const delComm = async (c) => { await deleteComment(c.id); await createLog({ action: 'delete_comment', targetType: 'comment', targetId: String(c.id), timestamp: Date.now() }); if(c.userId) await createNotification({ userId: String(c.userId), type: 'admin', actorId: 'admin', timestamp: Date.now(), read: false }); load() }

  const stats = useMemo(() => ({ users: users.length, posts: posts.length, comments: comments.length }), [users, posts, comments])

  const showToast = (msg) => { setToast(msg); setTimeout(()=> setToast(''), 1800) }

  const addAdmin = async () => {
    const name = prompt('Admin name')
    if (name == null || !name.trim()) return
    const email = prompt('Admin email') || ''
    const payload = { name: name.trim(), email: email.trim() }
    try { const created = await createAdmin(payload); setAdmins(prev => [...prev, created]); showToast('Admin created') } catch(e){ console.error(e) }
  }
  const editAdmin = async (a) => {
    const name = prompt('Admin name', a.name || a.fullName || a.nickname || '') ?? a.name
    const email = prompt('Admin email', a.email || '') ?? a.email
    try { const updated = await updateAdmin(a.id, { ...a, name, email }); setAdmins(prev => prev.map(x=> String(x.id)===String(a.id) ? updated : x)); showToast('Admin updated') } catch(e){ console.error(e) }
  }
  const delAdmin = async (a) => {
    if(!confirm('Delete this admin?')) return
    try { await deleteAdmin(a.id); setAdmins(prev => prev.filter(x=> String(x.id)!==String(a.id))); showToast('Admin deleted') } catch(e){ console.error(e) }
  }

  return (
    <div className="admin-page">
      <h2 className="page-title">Admin Panel</h2>
      <div className="stats-row">
        <div className="stat-box"><span className="stat-num">{stats.users}</span><span className="stat-label">Users</span></div>
        <div className="stat-box"><span className="stat-num">{stats.posts}</span><span className="stat-label">Posts</span></div>
        <div className="stat-box"><span className="stat-num">{stats.comments}</span><span className="stat-label">Comments</span></div>
      </div>

      <section className="admin-section">
        <h3 className="section-title">Admins</h3>
        <div className="section-controls">
          <button className="primary-btn" onClick={addAdmin}>Add Admin</button>
        </div>
        {adminsLoading ? (
          <div className="table-loading"><span className="table-loader"></span> Loading admins...</div>
        ) : (
          <AdminTable
            storageKey="admin_admins"
            items={admins}
            columns={[
              { key: 'id', title: 'ID' },
              { key: 'name', title: 'Name', render: (v,row)=> v || row.fullName || row.nickname || '' },
              { key: 'email', title: 'Email' },
              { key: 'role', title: 'Role', render: (v)=> v || 'admin' },
            ]}
            searchKeys={[ 'id', 'name', 'email', 'role' ]}
            onEdit={editAdmin}
            onDelete={delAdmin}
          />
        )}
      </section>

      <section className="admin-section">
        <h3 className="section-title">Users</h3>
        <AdminTable
          storageKey="admin_users"
          items={users}
          columns={[
            { key: 'email', title: 'Email' },
            { key: 'nickname', title: 'Nickname' },
            { key: 'subscribers', title: 'Subs' },
            { key: 'verified', title: 'Verified', render: (v) => v ? 'yes' : 'no' },
            { key: 'blocked', title: 'Blocked', render: (v) => v ? 'yes' : 'no' },
          ]}
          searchKeys={[ 'email', 'nickname', 'id' ]}
          onEdit={editUser}
          onDelete={delUser}
          actions={[
            { label: 'Verify', onClick: verifyUser },
            { label: 'Block/Unblock', onClick: blockUser, kind: 'danger' },
          ]}
        />
      </section>

      <section className="admin-section">
        <h3 className="section-title">Posts</h3>
        <AdminTable
          storageKey="admin_posts"
          items={posts}
          columns={[
            { key: 'title', title: 'Title' },
            { key: 'authorNickname', title: 'Author' },
            { key: 'mediaUrl', title: 'Media URL' },
            { key: 'likedBy', title: 'Likes', render: (v) => Array.isArray(v) ? v.length : 0 },
          ]}
          searchKeys={[ 'title', 'authorNickname', 'id' ]}
          onEdit={editPost}
          onDelete={delPost}
        />
      </section>

      <section className="admin-section">
        <h3 className="section-title">Comments</h3>
        <AdminTable
          storageKey="admin_comments"
          items={comments}
          columns={[
            { key: 'postId', title: 'Post ID' },
            { key: 'authorNickname', title: 'Author' },
            { key: 'content', title: 'Content' },
          ]}
          searchKeys={[ 'postId', 'authorNickname', 'content', 'id' ]}
          onEdit={editComm}
          onDelete={delComm}
        />
      </section>

      <section className="admin-section">
        <h3 className="section-title">Follows</h3>
        <AdminTable
          storageKey="admin_follows"
          items={follows}
          columns={[
            { key: 'followerId', title: 'Follower' },
            { key: 'followingId', title: 'Following' },
            { key: 'createdAt', title: 'Date' },
          ]}
          searchKeys={[ 'followerId', 'followingId', 'id' ]}
        />
      </section>

      <section className="admin-section">
        <h3 className="section-title">Messages</h3>
        <AdminTable
          storageKey="admin_messages"
          items={messages}
          columns={[
            { key: 'senderId', title: 'From' },
            { key: 'receiverId', title: 'To' },
            { key: 'content', title: 'Text' },
            { key: 'timestamp', title: 'Time', render: (v) => new Date(v).toLocaleString() },
          ]}
          searchKeys={[ 'senderId', 'receiverId', 'content', 'id' ]}
        />
      </section>

      <section className="admin-section">
        <h3 className="section-title">Notifications</h3>
        <AdminTable
          storageKey="admin_notifications"
          items={notifs}
          columns={[
            { key: 'userId', title: 'User' },
            { key: 'type', title: 'Type' },
            { key: 'actorId', title: 'Actor' },
            { key: 'read', title: 'Read', render: (v)=> v ? 'yes' : 'no' },
            { key: 'timestamp', title: 'Time', render: (v) => new Date(v).toLocaleString() },
          ]}
          searchKeys={[ 'userId', 'type', 'actorId', 'id' ]}
        />
      </section>

      <section className="admin-section">
        <h3 className="section-title">Activity Logs</h3>
        <AdminTable
          storageKey="admin_logs"
          items={logs}
          columns={[
            { key: 'action', title: 'Action' },
            { key: 'targetType', title: 'Target' },
            { key: 'targetId', title: 'Target ID' },
            { key: 'timestamp', title: 'Time', render: (v) => new Date(v).toLocaleString() },
          ]}
          searchKeys={[ 'action', 'targetType', 'targetId', 'id' ]}
          onDelete={async (log) => { await deleteLog(log.id); load() }}
        />
      </section>
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  )
}
