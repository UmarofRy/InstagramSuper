import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPosts, getUsers, deleteRecord } from '../api/users.js'
import VideoCard from '../components/VideoCard.jsx'
import LikeButton from '../components/LikeButton.jsx'
import CommentBox from '../components/CommentBox.jsx'
import Modal from '../components/Modal.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import '../styles/Home.css'

export default function Post(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    Promise.all([getPosts(), getUsers()]).then(([p,u])=>{
      if(!mounted) return
      setPosts(p||[])
      setUsers(u||[])
      setLoading(false)
    }).catch(()=> setLoading(false))
    return ()=>{ mounted=false }
  },[])

  const post = useMemo(()=> (posts||[]).find(p=> String(p.id)===String(id)), [posts, id])
  const userMap = useMemo(()=> Object.fromEntries(users.map(u=>[u.id, u])), [users])

  const handleDeletePost = async () => {
    if (!post) return
    setDeleting(true)
    try {
      await deleteRecord(post.id)
      navigate('/')
    } catch (err) {
      console.error('Failed to delete post:', err)
      setDeleting(false)
    }
  }

  if(loading) return <div className="feed-loading">Loading post...</div>
  if(!post) return <div className="feed-empty">Post not found.</div>

  const canDelete = user && String(user.id) === String(post.authorId)

  return (
    <div className="feed-container" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="feed-item">
        <VideoCard
          post={post}
          channel={userMap[post.authorId]}
          canDelete={canDelete}
          onDelete={() => setDeleteConfirm(true)}
        />
        <div className="feed-actions">
          <LikeButton post={post} currentUser={user} onChange={()=>{}} />
        </div>
        <CommentBox postId={post.id} notifyUserId={post.authorId} />
      </div>

      <Modal
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Delete Post"
        actions={
          <>
            <button className="outline-btn" onClick={() => setDeleteConfirm(false)} disabled={deleting}>Cancel</button>
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
