import { Link } from 'react-router-dom'
import Modal from './Modal.jsx'

export default function RequireAuthModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Authentication required" actions={(
      <div className="auth-actions">
        <Link to="/login" className="outline-btn" onClick={onClose}>Login</Link>
        <Link to="/register" className="primary-btn" onClick={onClose}>Register</Link>
      </div>
    )}>
      <p>Please log in or register to continue.</p>
    </Modal>
  )
}
