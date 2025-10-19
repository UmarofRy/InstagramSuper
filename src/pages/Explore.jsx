import { useEffect, useMemo, useState } from 'react'
import VideoCard from '../components/VideoCard.jsx'
import { getPosts, getUsers } from '../api/users.js'
import '../styles/Explore.css'

const CACHE_KEY_EXPLORE = 'svapp_explore_cache'
const CACHE_DURATION = 5 * 60 * 1000

function extractTags(text = '') {
  return (text.match(/#\w+/g) || []).map(t => t.toLowerCase())
}

export default function Explore() {
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const loadData = async () => {
      try {
        let postsData = null, usersData = null

        // Check cache
        const cache = localStorage.getItem(CACHE_KEY_EXPLORE)
        if (cache) {
          try {
            const { data, timestamp } = JSON.parse(cache)
            if (Date.now() - timestamp < CACHE_DURATION) {
              postsData = data.posts
              usersData = data.users
            }
          } catch (e) {
            console.warn('Cache parse failed:', e)
          }
        }

        // Fetch if no cache
        if (!postsData || !usersData) {
          const [p, u] = await Promise.all([getPosts(), getUsers()])
          postsData = p || []
          usersData = u || []

          // Save to cache
          try {
            localStorage.setItem(CACHE_KEY_EXPLORE, JSON.stringify({ data: { posts: postsData, users: usersData }, timestamp: Date.now() }))
          } catch (e) {
            console.warn('Cache save failed:', e)
          }
        }

        if (!mounted) return
        const withLikes = (postsData || []).slice().sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0))
        setPosts(withLikes)
        setUsers(usersData || [])
        setLoading(false)
      } catch (err) {
        console.error('Failed to load explore data:', err)
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [])

  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return posts
    if (term.startsWith('#')) {
      return posts.filter(p => extractTags(`${p.title} ${p.description}`).includes(term))
    }
    return posts.filter(p => `${p.title} ${p.description}`.toLowerCase().includes(term))
  }, [q, posts])

  const tagCounts = useMemo(() => {
    const map = new Map()
    posts.forEach(p => extractTags(`${p.title} ${p.description}`).forEach(t => map.set(t, (map.get(t) || 0) + 1)))
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [posts])

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h2 className="explore-title">Explore</h2>
        <p className="explore-subtitle">Discover posts and trends from the community</p>
      </div>

      <div className="explore-controls">
        <div className="search-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            className="field-input" 
            placeholder="Search posts or #hashtags..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {tagCounts.length > 0 && (
          <div className="tags-row">
            <div className="tags-label">Popular Tags:</div>
            {tagCounts.map(([t, c]) => (
              <button 
                key={t} 
                className="tag-btn" 
                onClick={() => setQ(t)}
                title={`${c} posts`}
              >
                {t} <span className="tag-count">({c})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="explore-loading">Loading posts...</div>}

      {!loading && filtered.length === 0 && (
        <div className="explore-empty">
          {q ? `No posts found for "${q}". Try a different search!` : 'No posts yet.'}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="explore-grid">
          {filtered.map((post) => (
            <VideoCard key={post.id} post={post} channel={userMap[post.authorId]} />
          ))}
        </div>
      )}
    </div>
  )
}
