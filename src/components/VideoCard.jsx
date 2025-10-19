import { useMemo, useRef, useState } from 'react'
import '../styles/VideoCard.css'

function isVideo(url = '') {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
}

export default function VideoCard({ post, channel, canDelete = false, onDelete = null }) {
  const mediaRef = useRef(null)
  const verified = useMemo(() => (channel?.subscribers || 0) > 10 || post?.verified, [channel, post])
  const [copied, setCopied] = useState(false)

  const onMouseEnter = () => {
    const el = mediaRef.current
    if (el && el.tagName === 'VIDEO') el.play().catch(() => {})
  }
  const onMouseLeave = () => {
    const el = mediaRef.current
    if (el && el.tagName === 'VIDEO') el.pause()
  }

  const preventDownload = (e) => { e.preventDefault() }
  const preventDrag = (e) => { e.preventDefault() }
  const share = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      // Silently ignore clipboard errors
      void e
    }
  }

  return (
    <article className="card video-item" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="media-box" onContextMenu={preventDownload}>
        {isVideo(post.mediaUrl) ? (
          <video
            ref={mediaRef}
            src={post.mediaUrl}
            muted
            loop
            playsInline
            controls
            controlsList="nodownload noplaybackrate noremoteplayback"
            preload="metadata"
            onDragStart={preventDrag}
          />
        ) : (
          <img
            ref={mediaRef}
            src={post.mediaUrl}
            alt={post.title || 'post'}
            loading="lazy"
            decoding="async"
            draggable={false}
            onDragStart={preventDrag}
          />
        )}
      </div>
      <div className="meta">
        <div className="title-row">
          <h3 className="media-title">{post.title || 'Untitled'}</h3>
          <div className="title-actions">
            <button className="outline-btn" onClick={share} aria-label="Share post">
              {copied ? 'Copied' : 'Share'}
            </button>
            {canDelete && (
              <button className="danger-btn" onClick={onDelete} aria-label="Delete post">
                Delete
              </button>
            )}
          </div>
        </div>
        <div className="channel-row">
          <span className="channel-name">{post.authorNickname || 'Unknown'}</span>
          {verified && (
            <span className="verified-mark" title="Verified" aria-label="Verified">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1l3 4 5 .5-3.5 3 1 5L12 12l-5.5 1.5 1-5L4 5.5 9 5l3-4z"/><path d="M9 12l2 2 4-4"/></svg>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
