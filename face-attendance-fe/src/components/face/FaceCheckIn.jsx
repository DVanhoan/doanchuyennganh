import Webcam from "react-webcam";
import { useRef, useState, useEffect, useCallback } from "react";
import { faceApi } from "../../api";
import { stopCameraStream } from "../../utils/camera";

const CAPTURE_INTERVAL_MS = 2000;

export default function FaceCheckIn({ onResult }) {
    const webcamRef = useRef(null);
    const intervalRef = useRef(null);
    const processingRef = useRef(false);
    const mountedRef = useRef(true);

    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(null);

    const captureFrame = useCallback(async () => {
        if (processingRef.current || !webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        processingRef.current = true;
        setError(null);

        try {
            const res = await faceApi.checkIn(imageSrc);
            if (!mountedRef.current) return;

            if (res.matched) {
                setResult(res);
                setScanning(false);
                stopCameraStream(webcamRef);
                if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
                if (onResult) onResult(res);
            }
        } catch (err) {
            if (!mountedRef.current) return;
            setError(err.message);
        } finally {
            processingRef.current = false;
        }
    }, [onResult]);

    useEffect(() => {
        mountedRef.current = true;
        if (!scanning) return;
        intervalRef.current = setInterval(captureFrame, CAPTURE_INTERVAL_MS);
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            stopCameraStream(webcamRef);
        };
    }, [captureFrame, scanning]);

    const handleReset = () => setCountdown(5);

    useEffect(() => {
        if (countdown === null) return;
        if (countdown <= 0) {
            setCountdown(null);
            setResult(null);
            setScanning(true);
            setError(null);
            return;
        }
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    if (result && !scanning) {
        const isCheckIn = result.action === "CHECK_IN";
        const isCheckOut = result.action === "CHECK_OUT";

        const accent = isCheckIn ? "#059669" : isCheckOut ? "#d97706" : "#3b82f6";
        const accentBg = isCheckIn ? "#ecfdf5" : isCheckOut ? "#fffbeb" : "#eff6ff";
        const statusLabel = isCheckIn ? "CHECK IN" : isCheckOut ? "CHECK OUT" : "DONE";

        const fmtT = (t) => {
            if (!t) return "—";
            return new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        };

        return (
            <div style={{ animation: "fade-in 0.3s ease", maxWidth: 400, margin: "0 auto" }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ background: accentBg, borderBottom: `2px solid ${accent}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.8px" }}>{statusLabel}</span>
                        <span style={{ fontSize: 12, color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>{new Date().toLocaleDateString("vi-VN")}</span>
                    </div>

                    <div style={{ padding: 20 }}>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>{result.employeeName}</div>
                            <div style={{ fontSize: 13, color: "#6b7280" }}>{result.employeeCode} · {result.position}</div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: result.checkOutTime ? "1fr 1fr" : "1fr", gap: 12 }}>
                            <TimeBlock label="Vào" time={fmtT(result.checkInTime)} />
                            {result.checkOutTime && <TimeBlock label="Ra" time={fmtT(result.checkOutTime)} />}
                        </div>

                        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 16, marginBottom: 0, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                            {result.message}
                        </p>
                    </div>
                </div>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                    {countdown !== null ? (
                        <span style={{ fontSize: 13, color: "#9ca3af" }}>Tiếp tục sau {countdown}s...</span>
                    ) : (
                        <button onClick={handleReset} className="btn-primary" style={{ fontSize: 13 }}>
                            Quét tiếp
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 440, borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", background: "#000" }}>
                <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={440}
                    videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
                    style={{ display: "block", width: "100%" }}
                    mirrored
                />

                {/* Vignette */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)", pointerEvents: "none", zIndex: 2 }} />

                {/* Scanning badge */}
                <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 500, zIndex: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "pulse-ring 1.5s ease-in-out infinite" }} />
                    Đang quét
                </div>

                {/* Oval guide */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 180, height: 240, border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: "50%", pointerEvents: "none", zIndex: 3 }} />
            </div>

            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                Đưa mặt vào khung hình — tự động quét mỗi {CAPTURE_INTERVAL_MS / 1000}s
            </p>

            {error && (
                <div style={{ color: "#dc2626", fontSize: 12, background: "#fef2f2", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: 4 }}>
                    {error}
                </div>
            )}
        </div>
    );
}


function TimeBlock({ label, time }) {
    return (
        <div style={{ background: "#f9fafb", borderRadius: 6, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{time}</div>
        </div>
    );
}
