import { useEffect, useMemo, useRef, useState } from 'react'
import { getPosts, getUsers } from '../api/users.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import LikeButton from '../components/LikeButton.jsx'
import CommentBox from '../components/CommentBox.jsx'
import Modal from '../components/Modal.jsx'
import '../styles/Reels.css'

function isVideo(url = '') {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
}

export default function Reels() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [idx, setIdx] = useState(0)
  const [commentOpen, setCommentOpen] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const startY = useRef(null)

  useEffect(() => {
    (async () => {
      const [p, u] = await Promise.all([getPosts(), getUsers()])
      setPosts((p || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)))
      setUsers(u || [])
    })()
  }, [])

  const author = useMemo(() => {
    const p = posts[idx]
    return p ? users.find(u => String(u.id) === String(p.authorId)) : null
  }, [posts, users, idx])

  const currentPost = posts[idx]

  const onWheel = (e) => {
    e.preventDefault()
    if (e.deltaY > 0) {
      setIdx(i => Math.min(i + 1, posts.length - 1))
    } else {
      setIdx(i => Math.max(i - 1, 0))
    }
  }

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e) => {
    if (startY.current == null) return
    const dy = e.changedTouches[0].clientY - startY.current
    if (Math.abs(dy) > 40) {
      if (dy < 0) {
        setIdx(i => Math.min(i + 1, posts.length - 1))
      } else {
        setIdx(i => Math.max(i - 1, 0))
      }
    }
    startY.current = null
  }

  const handleShare = () => {
    const url = `${window.location.origin}/?post=${currentPost.id}`
    navigator.clipboard.writeText(url)
    setShareMessage('Link copied to clipboard!')
    setTimeout(() => setShareMessage(''), 2000)
  }

  const handleAuthorClick = () => {
    if (author) {
      navigate(`/profile?user=${author.id}`)
    }
  }

  return (
    <div className="reels-page" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="reels-viewer">
        {posts[idx] ? (
          <div className="reel-item">
            {isVideo(posts[idx].mediaUrl) ? (
              <video
                className="reel-video"
                src={posts[idx].mediaUrl}
                muted
                autoPlay
                loop
                playsInline
                controls
                controlsList="nodownload noplaybackrate noremoteplayback"
                preload="metadata"
                onContextMenu={(e)=>e.preventDefault()}
                onDragStart={(e)=>e.preventDefault()}
              />
            ) : (
              <img
                className="reel-image"
                src={posts[idx].mediaUrl}
                alt={posts[idx].title || 'Post'}
                loading="lazy"
                decoding="async"
                draggable={false}
                onDragStart={(e)=>e.preventDefault()}
                onContextMenu={(e)=>e.preventDefault()}
              />
            )}
            <div className="reel-overlay">
              <div className="reel-meta">
                <div 
                  className="reel-author-clickable" 
                  onClick={handleAuthorClick}
                  role="button"
                  tabIndex={0}
                >
                  {author?.nickname || posts[idx].authorNickname || 'Unknown'}
                </div>
                <div className="reel-caption">{posts[idx].description || posts[idx].title || ''}</div>
              </div>
              <div className="reel-actions">
                <LikeButton 
                  post={posts[idx]} 
                  currentUser={user}
                  onChange={(p2) => setPosts(prev => prev.map(x => x.id === p2.id ? p2 : x))}
                />
                <button 
                  className="circle-btn" 
                  aria-label="Comment"
                  onClick={() => setCommentOpen(true)}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a4 4 0 01-4 4H7l-4 4V5a4 4 0 014-4h10a4 4 0 014 4z"/>
                  </svg>
                </button>
                <button 
                  className="circle-btn" 
                  aria-label="Share"
                  onClick={handleShare}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"/>
                    <path d="M16 6l-4-4-4 4"/>
                    <path d="M12 2v14"/>
                  </svg>
                </button>
              </div>
            </div>
            {shareMessage && <div className="share-toast">{shareMessage}</div>}
          </div>
        ) : (
          <div className="reel-empty">No reels available</div>
        )}
      </div>

      <div className="reels-grid">
        {posts.map((p, i) => (
          <button 
            key={p.id} 
            className={`reels-thumb ${i === idx ? 'active' : ''}`} 
            onClick={() => setIdx(i)}
            aria-label={`Reel ${i + 1}`}
          >
            {isVideo(p.mediaUrl) ? (
              <video src={p.mediaUrl} muted playsInline preload="metadata" onContextMenu={(e)=>e.preventDefault()} />
            ) : (
              <img src={p.mediaUrl} alt={`Reel ${i + 1}`} loading="lazy" decoding="async" draggable={false} onContextMenu={(e)=>e.preventDefault()} />
            )}
          </button>
        ))}
      </div>

      <Modal 
        open={commentOpen} 
        onClose={() => setCommentOpen(false)}
        title="Comments"
      >
        {currentPost && (
          <CommentBox postId={currentPost.id} notifyUserId={currentPost.authorId} />
        )}
      </Modal>
    </div>
  )
}
