import { useState, useEffect, useCallback } from "react";
import { attendanceApi } from "../../api";
import { formatTime } from "../../utils/format";
import FaceCheckIn from "../../components/face/FaceCheckIn";
import PageHeader from "../../components/ui/PageHeader";

export default function CheckInPage() {
    const [records, setRecords] = useState([]);

    const load = useCallback(async () => {
        try {
            setRecords(await attendanceApi.getToday());
        } catch (e) {
            console.error("Failed to load attendance:", e);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div>
            <PageHeader title="Chấm công" subtitle="Nhìn vào camera để check-in hoặc check-out" />

            <FaceCheckIn onResult={load} />

            {records.length > 0 && (
                <div style={{ marginTop: 32 }}>
                    <div className="section-header">
                        <h2 className="section-title">Hôm nay</h2>
                        <span className="badge badge-gray">{records.length} bản ghi</span>
                    </div>

                    <div className="admin-card">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Mã NV</th><th>Họ tên</th><th>Ca</th>
                                    <th>Vào</th><th>Ra</th><th>Trễ</th><th>Về sớm</th><th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r) => (
                                    <tr key={r.id}>
                                        <td><code style={{ fontSize: 12, color: "#64748b" }}>{r.employeeCode}</code></td>
                                        <td style={{ fontWeight: 500, color: "#1e293b" }}>{r.employeeName}</td>
                                        <td>{r.shiftName || "—"}</td>
                                        <td style={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(r.checkInTime)}</td>
                                        <td style={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(r.checkOutTime)}</td>
                                        <td>
                                            {r.lateMinutes > 0
                                                ? <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 500 }}>{r.lateMinutes}p</span>
                                                : "—"}
                                        </td>
                                        <td>
                                            {r.earlyLeaveMinutes > 0
                                                ? <span style={{ color: "#d97706", fontSize: 12, fontWeight: 500 }}>{r.earlyLeaveMinutes}p</span>
                                                : "—"}
                                        </td>
                                        <td>
                                            {r.checkOutTime
                                                ? <span className="badge badge-success">Hoàn tất</span>
                                                : <span className="badge badge-warning">Đang làm</span>}
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
