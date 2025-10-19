import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getUsers } from '../api/users.js'
import { listMessages, sendMessage } from '../api/messages.js'
import MessageBubble from '../components/MessageBubble.jsx'
import '../styles/Messages.css'

export default function Messages() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [active, setActive] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [searchText, setSearchText] = useState('')
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    (async () => {
      const u = await getUsers()
      setUsers(u || [])
    })()
  }, [])

  // Simulate online status (in production, would use real-time events)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomOnline = new Set()
      users.forEach(u => {
        if (Math.random() > 0.3) {
          randomOnline.add(String(u.id))
        }
      })
      setOnlineUsers(randomOnline)
    }, 3000)
    return () => clearInterval(interval)
  }, [users])

  const loadMsgs = async () => {
    const all = await listMessages()
    if (!user || !active) return
    const conv = (all || []).filter(m => 
      (String(m.senderId) === String(user.id) && String(m.receiverId) === String(active.id)) || 
      (String(m.senderId) === String(active.id) && String(m.receiverId) === String(user.id))
    )
    setMsgs(conv.sort((a, b) => a.timestamp - b.timestamp))
  }

  useEffect(() => {
    if (user && active) {
      loadMsgs()
      const id = setInterval(loadMsgs, 2000)
      return () => clearInterval(id)
    }
  }, [user, active])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const contacts = useMemo(() => {
    if (!user) return []
    const umarov = users.find(u => String(u.nickname).toLowerCase() === 'umarov')
    const others = users.filter(u => String(u.id) !== String(user.id) && String(u.id) !== String(umarov?.id))
    const filtered = searchText.trim() 
      ? others.filter(u => u.nickname?.toLowerCase().includes(searchText.toLowerCase()) || u.email?.toLowerCase().includes(searchText.toLowerCase())) 
      : others
    return umarov ? [umarov, ...filtered] : filtered
  }, [users, user, searchText])

  const send = async (e) => {
    e.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText || !active || !user) return

    try {
      await sendMessage(String(user.id), String(active.id), trimmedText)
      setText('')
      setIsTyping(false)
      await loadMsgs()
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    setIsTyping(true)
    
    // Clear typing indicator after 1 second of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  if (!user) {
    return <div className="messages-page"><div className="messages-empty">Please log in to use messages.</div></div>
  }

  return (
    <div className="messages-page">
      <div className="chat-sidebar">
        <div className="chat-title">Messages</div>
        <div className="chat-search">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>
        <ul className="chat-list">
          {contacts.map((c) => {
            const isAdmin = String(c.nickname).toLowerCase() === 'umarov'
            const isOnline = onlineUsers.has(String(c.id))
            return (
              <li
                key={c.id}
                className={`chat-item ${active && String(active.id) === String(c.id) ? 'active' : ''} ${isAdmin ? 'admin-contact' : ''}`}
                onClick={() => setActive(c)}
              >
                <div className="chat-avatar-wrap">
                  <div className="chat-avatar">{(c.nickname || '?')[0].toUpperCase()}</div>
                  <div className={`online-indicator ${isOnline ? 'online' : 'offline'}`} title={isOnline ? 'Online' : 'Offline'} />
                </div>
                <div className="chat-item-info">
                  <div className="chat-item-name">
                    {c.nickname}
                    {isAdmin && <span className="admin-badge">Admin</span>}
                  </div>
                  <div className="chat-item-preview">{c.email}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="chat-window">
        {active ? (
          <div className="chat-content">
            <div className="chat-header">
              <div className="chat-header-title">{active.nickname}</div>
              <div className={`chat-status ${onlineUsers.has(String(active.id)) ? 'online' : 'offline'}`}>
                {onlineUsers.has(String(active.id)) ? 'Online' : 'Offline'}
              </div>
            </div>
            <div className="chat-scroll">
              {msgs.length === 0 && <div className="chat-no-messages">No messages yet. Start a conversation!</div>}
              {msgs.map(m => (<MessageBubble key={m.id} me={user} peer={active} msg={m} />))}
              {isTyping && <div className="typing-indicator"><span></span><span></span><span></span></div>}
              <div ref={endRef} />
            </div>
            <form className="chat-input" onSubmit={send}>
              <input 
                className="field-input" 
                placeholder="Type a message..." 
                value={text} 
                onChange={handleTyping}
              />
              <button className="primary-btn" type="submit" disabled={!text.trim()}>Send</button>
            </form>
          </div>
        ) : (
          <div className="chat-empty">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  )
}
