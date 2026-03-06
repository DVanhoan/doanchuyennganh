import Webcam from "react-webcam";
import { useRef, useState, useEffect, useCallback } from "react";
import FaceCircle from "./FaceCircle";
import { faceApi } from "../../api";
import { stopCameraStream } from "../../utils/camera";
import { DIRECTIONS, DIRECTION_LABELS } from "../../utils/constants";

const CAPTURE_INTERVAL_MS = 1500;

export default function FaceEnroll({ employeeId }) {
    const webcamRef = useRef(null);
    const intervalRef = useRef(null);
    const processingRef = useRef(false);
    const mountedRef = useRef(true);

    const [state, setState] = useState({
        front: false, left: false, right: false, up: false, down: false,
    });
    const [detectedDir, setDetectedDir] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState(null);
    const [duplicateMsg, setDuplicateMsg] = useState(null);

    const nextDirection = DIRECTIONS.find((d) => !state[d]) || null;
    const isAllDone = (s) => DIRECTIONS.every((d) => s[d]);

    const captureFrame = useCallback(async () => {
        if (processingRef.current || !webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        processingRef.current = true;
        setError(null);

        try {
            const res = await faceApi.autoEnroll({ employeeId, imageBase64: imageSrc });
            if (!mountedRef.current) return;

            setDetectedDir(res.detectedDirection);

            if (res.duplicateMessage) {
                setDuplicateMsg(res.duplicateMessage);
                stopCameraStream(webcamRef);
                if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
                return;
            }

            if (res.status) {
                const newState = {
                    front: res.status.front, left: res.status.left, right: res.status.right,
                    up: res.status.up, down: res.status.down,
                };
                setState(newState);
                if (isAllDone(newState)) {
                    setCompleted(true);
                    stopCameraStream(webcamRef);
                }
            }
        } catch (err) {
            if (!mountedRef.current) return;
            if (!err.message?.includes("No face")) setError(err.message);
        } finally {
            processingRef.current = false;
        }
    }, [employeeId]);

    useEffect(() => {
        mountedRef.current = true;
        if (completed) {
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            return;
        }
        intervalRef.current = setInterval(captureFrame, CAPTURE_INTERVAL_MS);
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            stopCameraStream(webcamRef);
        };
    }, [captureFrame, completed]);

    /* ─── Duplicate face ─── */
    if (duplicateMsg) {
        return (
            <div style={{ maxWidth: 400, margin: "0 auto", animation: "fade-in 0.3s ease" }}>
                <div style={{ background: "#fff", border: "1px solid #fecaca", borderRadius: 10, padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", letterSpacing: "0.8px", marginBottom: 8 }}>
                        TRÙNG KHUÔN MẶT
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>
                        {duplicateMsg}
                    </p>
                </div>
            </div>
        );
    }

    /* ─── Completed ─── */
    if (completed) {
        return (
            <div style={{ maxWidth: 400, margin: "0 auto", animation: "fade-in 0.3s ease" }}>
                <div style={{ background: "#fff", border: "1px solid #a7f3d0", borderRadius: 10, padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", letterSpacing: "0.8px", marginBottom: 8 }}>
                        HOÀN TẤT
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>
                        Đã quét thành công 5 góc khuôn mặt.
                    </p>
                </div>
            </div>
        );
    }

    /* ─── Scanning ─── */
    const completedCount = DIRECTIONS.filter((d) => state[d]).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {/* Progress bar */}
            <div style={{ width: 440, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#e5e7eb", overflow: "hidden" }}>
                    <div
                        style={{
                            width: `${(completedCount / 5) * 100}%`,
                            height: "100%",
                            background: "#6366f1",
                            borderRadius: 2,
                            transition: "width 0.3s ease",
                        }}
                    />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", minWidth: 32 }}>
                    {completedCount}/5
                </span>
            </div>

            {/* Webcam viewport */}
            <div style={{ position: "relative", width: 440, borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", background: "#000" }}>
                <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={440}
                    videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
                    style={{ display: "block", width: "100%" }}
                    mirrored
                />

                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)", pointerEvents: "none", zIndex: 2 }} />

                <FaceCircle state={state} detectedDir={detectedDir} />

                {detectedDir && (
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, zIndex: 4, letterSpacing: "0.3px" }}>
                        {detectedDir.toUpperCase()}
                    </div>
                )}
            </div>

            {/* Direction prompt */}
            {nextDirection && (
                <div style={{ padding: "8px 16px", background: "#f3f4f6", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#374151" }}>
                    {DIRECTION_LABELS[nextDirection]}
                </div>
            )}

            {error && (
                <div style={{ color: "#dc2626", fontSize: 12, background: "#fef2f2", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: 4 }}>
                    {error}
                </div>
            )}

            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                Tự động quét mỗi {CAPTURE_INTERVAL_MS / 1000}s
            </p>
        </div>
    );
}
