import '../styles/LoadingSpinner.css'

export default function LoadingSpinner({ size = 'md', fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`spinner spinner-${size}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    )
  }

  return (
    <div className={`spinner spinner-${size}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
  )
}
