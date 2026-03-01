import { useState, useEffect, useCallback } from "react";
import FaceCheckIn from "../components/FaceCheckIn";
import { getTodayAttendance } from "../services/api";

export default function CheckIn() {
    const [records, setRecords] = useState([]);

    const loadRecords = useCallback(async () => {
        try {
            const data = await getTodayAttendance();
            setRecords(data);
        } catch (e) {
            console.error("Failed to load attendance:", e);
        }
    }, []);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const handleResult = () => {
        loadRecords();
    };

    const formatTime = (t) => {
        if (!t) return "—";
        const d = new Date(t);
        return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    };

    return (
        <div style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "40px 24px",
        }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 4,
                }}>
                    Chấm công
                </h1>
                <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                    Nhìn vào camera để check-in hoặc check-out
                </p>
            </div>

            <FaceCheckIn onResult={handleResult} />

            {records.length > 0 && (
                <div style={{ marginTop: 40 }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                    }}>
                        <h2 style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#111827",
                            margin: 0,
                        }}>
                            Hôm nay
                        </h2>
                        <span style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#6b7280",
                            background: "#f3f4f6",
                            padding: "2px 10px",
                            borderRadius: 10,
                        }}>
                            {records.length} bản ghi
                        </span>
                    </div>

                    <div style={{
                        background: "#fff",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                    }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 13,
                        }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Mã NV</th>
                                    <th style={thStyle}>Họ tên</th>
                                    <th style={thStyle}>Chức vụ</th>
                                    <th style={thStyle}>Vào</th>
                                    <th style={thStyle}>Ra</th>
                                    <th style={thStyle}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r) => (
                                    <tr key={r.id}>
                                        <td style={tdStyle}>
                                            <code style={{ fontSize: 12, color: "#6b7280" }}>{r.employeeCode}</code>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 500, color: "#111827" }}>
                                            {r.employeeName}
                                        </td>
                                        <td style={tdStyle}>{r.position}</td>
                                        <td style={{ ...tdStyle, fontVariantNumeric: "tabular-nums" }}>
                                            {formatTime(r.checkInTime)}
                                        </td>
                                        <td style={{ ...tdStyle, fontVariantNumeric: "tabular-nums" }}>
                                            {formatTime(r.checkOutTime)}
                                        </td>
                                        <td style={tdStyle}>
                                            {r.checkOutTime ? (
                                                <span style={badge("#ecfdf5", "#059669")}>Hoàn tất</span>
                                            ) : (
                                                <span style={badge("#fffbeb", "#d97706")}>Đang làm</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle = {
    padding: "10px 16px",
    textAlign: "left",
    fontWeight: 500,
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    background: "#f9fafb",
};

const tdStyle = {
    padding: "10px 16px",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    fontSize: 13,
};

const badge = (bg, color) => ({
    display: "inline-block",
    background: bg,
    color: color,
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2px",
});
