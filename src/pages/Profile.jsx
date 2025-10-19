import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import ChannelCard from '../components/ChannelCard.jsx'
import VideoCard from '../components/VideoCard.jsx'
import FollowButton from '../components/FollowButton.jsx'
import { getPosts, updateRecord } from '../api/users.js'
import { listFollows } from '../api/follows.js'
import '../styles/Profile.css'

export default function Profile() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [follows, setFollows] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    nickname: '',
    bio: '',
    email: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([getPosts(), listFollows()]).then(([all, rels]) => {
      setPosts((all || []).filter(p => String(p.authorId) === String(user.id)))
      setFollows(rels || [])
    })
  }, [user])

  useEffect(() => {
    if (user && editMode) {
      setEditData({
        nickname: user.nickname || '',
        bio: user.bio || '',
        email: user.email || ''
      })
    }
  }, [editMode, user])

  const saveProfile = async (e) => {
    e.preventDefault()

    if (!editData.nickname?.trim()) {
      setMessage('Nickname is required')
      return
    }

    if (!editData.email?.trim()) {
      setMessage('Email is required')
      return
    }

    setSaving(true)
    try {
      const updated = { ...user, ...editData }
      const saved = await updateRecord(user.id, updated)
      setUser(saved)
      setMessage('Profile updated successfully!')
      setEditMode(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setMessage(err.response?.data?.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const media = useMemo(() => posts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [posts])

  if (!user) return (
    <div className="profile-page">
      <p className="profile-empty">Please <a href="/login" onClick={() => navigate('/login')}>log in</a> to view your profile.</p>
    </div>
  )

  const followers = follows.filter(f => String(f.followingId) === String(user.id))
  const following = follows.filter(f => String(f.followerId) === String(user.id))

  return (
    <div className="profile-page">
      <ChannelCard user={user} />
      
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-number">{media.length}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{followers.length}</div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{following.length}</div>
          <div className="stat-label">Following</div>
        </div>
      </div>

      <div className="profile-actions">
        <button 
          className="primary-btn" 
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {editMode && (
        <div className="profile-edit-form">
          <h3>Profile Settings</h3>
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label>Nickname</label>
              <input
                type="text"
                value={editData.nickname}
                onChange={(e) => setEditData({...editData, nickname: e.target.value})}
                className="field-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
                className="field-input"
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                className="field-textarea"
                rows="4"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="outline-btn" 
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
            {message && <div className={`form-message ${message.includes('Failed') ? 'error' : 'success'}`}>{message}</div>}
          </form>
        </div>
      )}

      <div className="profile-grid">
        {media.length === 0 ? (
          <div className="profile-no-posts">You haven't posted anything yet.</div>
        ) : (
          media.map((post) => (
            <VideoCard key={post.id} post={post} channel={user} />
          ))
        )}
      </div>
    </div>
  )
}
