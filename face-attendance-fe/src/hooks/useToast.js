import { useState, useEffect, useCallback } from "react";

export default function useToast(duration = 3500) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);

  const showSuccess = useCallback(
    (msg) => setToast({ type: "success", msg }),
    [],
  );
  const showError = useCallback((msg) => setToast({ type: "error", msg }), []);
  const dismiss = useCallback(() => setToast(null), []);

  return { toast, showSuccess, showError, dismiss };
}
