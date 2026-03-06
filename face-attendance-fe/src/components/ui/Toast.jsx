export default function Toast({ toast, onDismiss }) {
    if (!toast) return null;
    return (
        <div className={`toast toast-${toast.type}`}>
            {toast.msg}
            <button className="toast-close" onClick={onDismiss}>
                &times;
            </button>
        </div>
    );
}
