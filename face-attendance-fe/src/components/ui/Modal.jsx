export default function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="admin-card modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {title && <h3 className="modal-title">{title}</h3>}
                {children}
            </div>
        </div>
    );
}
