import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

export default function Meta() {
  const location = useLocation()
  const params = useParams()

  useEffect(() => {
    const path = location.pathname
    let title = 'InstaTok'
    let desc = 'Share, discover, and connect with creators worldwide.'
    if (path === '/') { title = 'Home - InstaTok'; desc = 'Latest posts and community updates.' }
    else if (path.startsWith('/explore')) { title = 'Explore - InstaTok'; desc = 'Discover trending posts and tags.' }
    else if (path.startsWith('/reels')) { title = 'Reels - InstaTok'; desc = 'Watch immersive short videos.' }
    else if (path.startsWith('/upload')) { title = 'Upload - InstaTok'; desc = 'Post images and videos easily.' }
    else if (path.startsWith('/profile')) { title = 'Profile - InstaTok'; desc = 'View user profile, posts, and stats.' }
    else if (path.startsWith('/messages')) { title = 'Messages - InstaTok'; desc = 'Real-time chat with other users.' }
    else if (path.startsWith('/notifications')) { title = 'Notifications - InstaTok'; desc = 'Your latest activity and alerts.' }
    else if (path.startsWith('/admin')) { title = 'Admin - InstaTok'; desc = 'Manage users, posts, and system.' }
    else if (path.startsWith('/post/')) { title = `Post ${params.id || ''} - InstaTok`; desc = 'View this post on InstaTok.' }

    document.title = title
    setMeta('description', desc)
    setOG('og:title', title)
    setOG('og:description', desc)
    setOG('og:image', `${window.location.origin}/logo.png`)
    setMeta('twitter:title', title)
    setMeta('twitter:description', desc)
  }, [location, params])

  return null
}
