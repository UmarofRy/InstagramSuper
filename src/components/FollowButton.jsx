import { useEffect, useMemo, useState } from 'react'
import { follow as apiFollow, listFollows, unfollow } from '../api/follows.js'
import { updateRecord } from '../api/users.js'
import { createNotification } from '../api/notifications.js'
import '../styles/FollowButton.css'

export default function FollowButton({ viewer, target, onCounts }) {
  const [rels, setRels] = useState([])
  const loading = useMemo(() => !viewer || !target, [viewer, target])

  const load = async () => {
    const all = await listFollows()
    setRels((all || []).filter(r => String(r.followerId) === String(viewer.id) && String(r.followingId) === String(target.id)))
  }

  useEffect(() => { if (viewer && target) load() }, [viewer, target])

  const isFollowing = rels.length > 0

  const toggle = async () => {
    if (loading || String(viewer.id) === String(target.id)) return
    if (isFollowing) {
      await unfollow(rels[0].id)
      onCounts?.(-1)
    } else {
      await apiFollow(String(viewer.id), String(target.id))
      onCounts?.(1)
      if ((target.subscribers || 0) + 1 >= 10 && !target.verified) {
        await updateRecord(target.id, { ...target, subscribers: (target.subscribers || 0) + 1, verified: true })
      } else {
        await updateRecord(target.id, { ...target, subscribers: (target.subscribers || 0) + 1 })
      }
      await createNotification({ userId: String(target.id), type: 'follow', actorId: String(viewer.id), timestamp: Date.now(), read: false })
    }
    load()
  }

  return (
    <button className={`follow-btn ${isFollowing ? 'following' : ''}`} onClick={toggle} disabled={loading}>
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
