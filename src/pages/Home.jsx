import { useCallback, useEffect, useMemo, useState } from 'react'
import VideoCard from '../components/VideoCard.jsx'
import CommentBox from '../components/CommentBox.jsx'
import LikeButton from '../components/LikeButton.jsx'
import Modal from '../components/Modal.jsx'
import { getPosts, getUsers, deleteRecord } from '../api/users.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import '../styles/Home.css'

const CACHE_KEY_POSTS = 'svapp_posts_cache'
const CACHE_KEY_USERS = 'svapp_users_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [visible, setVisible] = useState(6)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async (useCache = true) => {
    let mounted = true
    setLoading(true)
    try {
      let postsData = null, usersData = null

      // Check cache
      if (useCache) {
        const postsCache = localStorage.getItem(CACHE_KEY_POSTS)
        const usersCache = localStorage.getItem(CACHE_KEY_USERS)
        if (postsCache && usersCache) {
          try {
            const { data: pData, timestamp: pTime } = JSON.parse(postsCache)
            const { data: uData, timestamp: uTime } = JSON.parse(usersCache)
            if (Date.now() - pTime < CACHE_DURATION && Date.now() - uTime < CACHE_DURATION) {
              postsData = pData
              usersData = uData
            }
          } catch (e) {
            console.warn('Cache parse failed:', e)
          }
        }
      }

      // Fetch if no cache
      if (!postsData || !usersData) {
        const [p, u] = await Promise.all([getPosts(), getUsers()])
        postsData = p || []
        usersData = u || []

        // Save to cache
        try {
          localStorage.setItem(CACHE_KEY_POSTS, JSON.stringify({ data: postsData, timestamp: Date.now() }))
          localStorage.setItem(CACHE_KEY_USERS, JSON.stringify({ data: usersData, timestamp: Date.now() }))
        } catch (e) {
          console.warn('Cache save failed:', e)
        }
      }

      if (!mounted) return
      setPosts((postsData || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)))
      setUsers(usersData || [])
      setLoading(false)
    } catch (err) {
      console.error('Failed to load posts:', err)
      if (mounted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(true)
  }, [loadData])

  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])
  const feed = posts.slice(0, visible)

  useEffect(() => {
    const onScroll = () => {
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
        setVisible((v) => v + 6)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleDeletePost = useCallback(async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await deleteRecord(deleteConfirm.id)
      setPosts(prev => prev.filter(p => p.id !== deleteConfirm.id))
      // Clear cache to force refresh on next load
      try {
        localStorage.removeItem(CACHE_KEY_POSTS)
      } catch (e) {
        console.warn('Failed to clear cache:', e)
      }
      setToast('Post deleted successfully')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      console.error('Failed to delete post:', err)
      setToast('Failed to delete post')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }, [deleteConfirm])

  return (
    <div className="feed-container">
      {loading && <div className="feed-loading">Loading posts...</div>}
      {!loading && feed.length === 0 && <div className="feed-empty">No posts yet. Be the first to share!</div>}
      {feed.map((post) => (
        <div key={post.id} className="feed-item">
          <VideoCard
            post={post}
            channel={userMap[post.authorId]}
            canDelete={user && String(user.id) === String(post.authorId)}
            onDelete={() => setDeleteConfirm(post)}
          />
          <div className="feed-actions">
            <LikeButton
              post={post}
              currentUser={user}
              onChange={(p2) => setPosts(prev => prev.map(x => x.id === p2.id ? p2 : x))}
            />
          </div>
          <CommentBox postId={post.id} notifyUserId={post.authorId} />
        </div>
      ))}

      {toast && <div className="feed-toast">{toast}</div>}

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Post"
        actions={
          <>
            <button className="outline-btn" onClick={() => setDeleteConfirm(null)} disabled={deleting}>Cancel</button>
            <button className="danger-btn" onClick={handleDeletePost} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
