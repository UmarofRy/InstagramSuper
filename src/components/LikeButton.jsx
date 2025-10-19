import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { toggleLike } from '../api/users.js'
import { createNotification } from '../api/notifications.js'
import RequireAuthModal from './RequireAuthModal.jsx'
import '../styles/LikeButton.css'

export default function LikeButton({ post, currentUser, onChange }) {
  const { user } = useAuth()
  const viewer = currentUser || user
  const [busy, setBusy] = useState(false)
  const [askAuth, setAskAuth] = useState(false)
  const liked = Array.isArray(post.likedBy) && viewer ? post.likedBy.map(String).includes(String(viewer.id)) : false
  const count = Array.isArray(post.likedBy) ? post.likedBy.length : 0

  const click = async () => {
    if (!viewer) { setAskAuth(true); return }
    if (busy) return
    setBusy(true)
    const optimistic = { ...post, likedBy: liked ? post.likedBy.filter((id) => String(id) !== String(viewer.id)) : [...post.likedBy, String(viewer.id)] }
    onChange?.(optimistic)
    try {
      const saved = await toggleLike(post, viewer.id)
      onChange?.(saved)
      if (!liked && post.authorId && String(post.authorId) !== String(viewer.id)) {
        try {
          await createNotification({
            userId: String(post.authorId),
            type: 'like',
            actorId: String(viewer.id),
            postId: String(post.id),
            read: false,
            timestamp: Date.now(),
          })
        } catch (notifErr) {
          console.error('Failed to create notification:', notifErr)
        }
      }
      try {
        const likes = JSON.parse(localStorage.getItem('svapp_likes') || '{}')
        likes[String(post.id)] = String(viewer.id)
        localStorage.setItem('svapp_likes', JSON.stringify(likes))
      } catch (storageErr) {
        console.warn('Failed to save like cache:', storageErr)
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
      onChange?.(post)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={click} disabled={busy} aria-label="Like">
        <span className="heart" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
        </span>
        <span className="like-count">{count}</span>
      </button>
      <RequireAuthModal open={askAuth} onClose={()=>setAskAuth(false)} />
    </>
  )
}
