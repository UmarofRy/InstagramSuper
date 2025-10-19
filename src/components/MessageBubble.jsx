import '../styles/MessageBubble.css'

export default function MessageBubble({ me, peer, msg }) {
  const mine = String(msg.senderId) === String(me.id)
  const time = new Date(msg.timestamp)
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const meInitial = (me?.nickname || '?').slice(0,1).toUpperCase()
  const peerInitial = (peer?.nickname || '?').slice(0,1).toUpperCase()

  return (
    <div className={`bubble-row ${mine ? 'mine' : 'theirs'}`}>
      {!mine && (
        <div className="bubble-avatar" aria-hidden="true">
          {peer?.avatarUrl ? (
            <img src={peer.avatarUrl} alt="" />
          ) : (
            <span className="avatar-fallback">{peerInitial}</span>
          )}
        </div>
      )}
      <div className="bubble">
        <div className="bubble-text">{msg.content}</div>
        <div className="bubble-time">{timeStr}</div>
      </div>
      {mine && (
        <div className="bubble-avatar" aria-hidden="true">
          {me?.avatarUrl ? (
            <img src={me.avatarUrl} alt="" />
          ) : (
            <span className="avatar-fallback">{meInitial}</span>
          )}
        </div>
      )}
    </div>
  )
}
