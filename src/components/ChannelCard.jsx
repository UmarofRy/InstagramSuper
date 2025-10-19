import '../styles/ChannelCard.css'

export default function ChannelCard({ user }) {
  if (!user) return null
  const verified = (user.subscribers || 0) > 10 || user.verified

  return (
    <div className="channel-card">
      <div className="avatar-circle">
        {(user.nickname || '?').slice(0, 1).toUpperCase()}
      </div>

      <div className="channel-meta">
        <div className="name-row">
          <h3 className="channel-title">{user.nickname}</h3>

          {verified && (
            <svg className="verified-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Zm5.707 7.293a1 1 0 010 1.414L10 17.414l-3.707-3.707a1 1 0 111.414-1.414L10 14.586l6.293-6.293a1 1 0 011.414 0Z" />
            </svg>
          )}
        </div>

        <div className="channel-sub">
          {user.subscribers || 0} subscribers
        </div>
        {user.email && <div className="channel-email">{user.email}</div>}
      </div>
    </div>
  )
}
