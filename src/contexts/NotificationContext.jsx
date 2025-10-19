import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { listNotifications, markRead } from '../api/notifications.js'
import { listMessages } from '../api/messages.js'
import { getComments, } from '../api/comments.js'
import { getPosts } from '../api/users.js'
import { useAuth } from './AuthContext.jsx'

const Ctx = createContext({ items: [], unread: 0, markAllRead: ()=>{}, markRead: ()=>{} })

function reducer(state, action){
  switch(action.type){
    case 'SET': return { ...state, items: action.payload, unread: action.payload.filter(i=>!i.read).length }
    case 'ADD': {
      const existing = new Map(state.items.map(i=>[String(i.id), i]))
      action.payload.forEach(i=> existing.set(String(i.id), i))
      const items = Array.from(existing.values()).sort((a,b)=> b.timestamp - a.timestamp)
      return { ...state, items, unread: items.filter(i=>!i.read).length }
    }
    case 'MARK_ALL': {
      const items = state.items.map(i=> ({...i, read:true}))
      return { ...state, items, unread: 0 }
    }
    case 'MARK_ONE': {
      const items = state.items.map(i=> String(i.id)===String(action.id) ? { ...i, read:true } : i)
      return { ...state, items, unread: items.filter(i=>!i.read).length }
    }
    default: return state
  }
}

const PING = typeof window !== 'undefined' ? new Audio('data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQAA') : null

export function NotificationProvider({ children }){
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, { items: [], unread: 0 })
  const lastRef = useRef(0)
  const timerRef = useRef(null)

  // restore
  useEffect(()=>{
    try{ const saved = JSON.parse(localStorage.getItem('svapp_notifs')||'null'); if(saved?.items){ dispatch({ type:'SET', payload: saved.items }); lastRef.current = saved.items[0]?.timestamp || 0 } }catch(e){ void e }
  },[])

  // persist
  useEffect(()=>{ localStorage.setItem('svapp_notifs', JSON.stringify({ items: state.items })) },[state.items])

  // polling
  useEffect(()=>{
    if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null }
    if(!user) return
    const tick = async () => {
      const [base, msgs] = await Promise.all([listNotifications(), listMessages()])
      const mine = (base||[]).filter(i=> String(i.userId)===String(user.id))
      const newBase = mine.filter(i => (i.timestamp||0) > lastRef.current)

      // local DM notifications for new messages to me
      const newMsgs = (msgs||[]).filter(m => String(m.receiverId)===String(user.id) && (m.timestamp||0) > lastRef.current).map(m => ({ id: `msg-${m.id}`, userId: String(user.id), type: 'message', actorId: m.senderId, timestamp: m.timestamp, read: false }))

      let newComments = []
      try {
        const posts = await getPosts()
        const myPostIds = new Set((posts||[]).filter(p=> String(p.authorId)===String(user.id)).map(p=> String(p.id)))
        const comments = await getComments()
        newComments = (comments||[]).filter(c => myPostIds.has(String(c.postId)) && (new Date(c.createdAt).getTime() || 0) > lastRef.current).map(c => ({ id: `comm-${c.id}`, userId: String(user.id), type: 'comment', actorId: c.userId, postId: c.postId, timestamp: new Date(c.createdAt).getTime(), read: false }))
      } catch (e) { void e }

      const additions = [...newBase, ...newMsgs, ...newComments]
      if(additions.length){
        dispatch({ type:'ADD', payload: additions })
        lastRef.current = Math.max(lastRef.current, ...additions.map(a=>a.timestamp||0))
        try{ PING && PING.play().catch(()=>{}) }catch(e){ void e }
      }
    }
    tick()
    timerRef.current = setInterval(tick, 5000)
    return ()=>{ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null } }
  },[user])

  const markAllReadFn = async () => {
    const toPersist = state.items.filter(i=> typeof i.id === 'string' && !i.id.startsWith('msg-') && !i.id.startsWith('comm-') && !i.read)
    await Promise.all(toPersist.map(i => markRead(i.id, { ...i, read: true })))
    dispatch({ type:'MARK_ALL' })
  }

  const value = useMemo(()=>({
    items: state.items,
    unread: state.unread,
    markAllRead: markAllReadFn,
    markRead: (id)=> dispatch({ type:'MARK_ONE', id }),
  }),[state, markAllReadFn])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useNotifications(){ return useContext(Ctx) }
