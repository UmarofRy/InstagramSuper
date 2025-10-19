import '../styles/Modal.css'

export default function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        {title && <div className="modal-header">{title}</div>}
        <div className="modal-body">{children}</div>
        <div className="modal-actions">{actions}</div>
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
      </div>
    </div>
  )
}
