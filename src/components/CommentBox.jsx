import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getComments, createComment, updateComment, deleteComment } from '../api/comments.js'
import { createNotification } from '../api/notifications.js'
import RequireAuthModal from './RequireAuthModal.jsx'
import Modal from './Modal.jsx'
import '../styles/CommentBox.css'

export default function CommentBox({ postId, notifyUserId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [askAuth, setAskAuth] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  useEffect(() => {
    let mounted = true
    getComments().then((data) => {
      if (!mounted) return
      setComments((data || []).filter((c) => String(c.postId) === String(postId)))
      setLoading(false)
    })
    return () => { mounted = false }
  }, [postId])

  const submit = async (e) => {
    e.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent) return
    if (!user) { setAskAuth(true); return }
    try {
      const payload = {
        postId,
        userId: String(user.id),
        authorNickname: user.nickname,
        content: trimmedContent,
        createdAt: new Date().toISOString(),
      }
      const saved = await createComment(payload)
      if (notifyUserId && String(notifyUserId) !== String(user.id)) {
        await createNotification({ userId: String(notifyUserId), type: 'comment', actorId: String(user.id), postId: String(postId), read: false, timestamp: Date.now() })
      }
      setComments((prev) => [...prev, saved])
      setContent('')
    } catch (err) {
      console.error('Failed to submit comment:', err)
    }
  }

  return (
    <section className="comment-section">
      <h4 className="comment-title">Comments</h4>
      {loading ? (
        <div className="comment-loading">Loading...</div>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment-item">
              <span className="comment-author">{c.authorNickname}</span>
              {editingId === c.id ? (
                <form className="comment-edit-row" onSubmit={async (e)=>{e.preventDefault(); await updateComment(c.id, { ...c, content }); setEditingId(null) }}>
                  <input className="comment-input" value={content} onChange={(e)=>setContent(e.target.value)} />
                  <button className="primary-btn" type="submit">Save</button>
                  <button className="outline-btn" type="button" onClick={()=>{ setEditingId(null); setContent('') }}>Cancel</button>
                </form>
              ) : (
                <span className="comment-content">{c.content}</span>
              )}
              {user && String(c.userId||'') === String(user.id) && editingId !== c.id && (
                <div className="comment-actions">
                  <button className="comment-edit-btn" onClick={()=>{ setEditingId(c.id); setContent(c.content) }} aria-label="Edit comment">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  </button>
                  <button className="comment-delete-btn" onClick={()=>setConfirmDel(c)} aria-label="Delete comment">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <form className="comment-form" onSubmit={submit}>
        <input
          className="comment-input"
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="primary-btn" type="submit">Post</button>
      </form>
      <RequireAuthModal open={askAuth} onClose={()=>setAskAuth(false)} />
      <Modal open={!!confirmDel} onClose={()=>setConfirmDel(null)} title="Delete comment" actions={(
        <>
          <button className="outline-btn" onClick={()=>setConfirmDel(null)}>Cancel</button>
          <button className="danger-btn" onClick={async ()=>{ if (confirmDel) { await deleteComment(confirmDel.id); setComments(prev=>prev.filter(x=>x.id!==confirmDel.id)); setConfirmDel(null) } }}>Delete</button>
        </>
      )}>
        <p>Are you sure you want to delete this comment?</p>
      </Modal>
    </section>
  )
}
