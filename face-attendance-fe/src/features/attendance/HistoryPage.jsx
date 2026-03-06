import { useState, useEffect, useCallback } from "react";
import { attendanceApi, employeeApi } from "../../api";
import { formatTimeShort, formatDate, formatWorkedTime } from "../../utils/format";
import PageHeader from "../../components/ui/PageHeader";

export default function HistoryPage() {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [from, setFrom] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7);
        return d.toISOString().slice(0, 10);
    });
    const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
    const [empId, setEmpId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => { employeeApi.getAll().then(setEmployees).catch(() => { }); }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setRecords(await attendanceApi.getRange(from, to, empId || undefined));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [from, to, empId]);

    useEffect(() => { load(); }, [load]);

    const totalShifts = records.length;
    const totalWorked = records.reduce((s, r) => s + (r.workedMinutes || 0), 0);
    const totalLate = records.reduce((s, r) => s + (r.lateMinutes || 0), 0);

    return (
        <div>
            <PageHeader title="Lịch sử chấm công" subtitle="Tra cứu chấm công theo khoảng thời gian và nhân viên" />

            {/* ── Filters ── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
                <label className="admin-label">
                    Từ ngày
                    <input className="admin-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </label>
                <label className="admin-label">
                    Đến ngày
                    <input className="admin-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </label>
                <label className="admin-label">
                    Nhân viên
                    <select className="admin-select" value={empId} onChange={(e) => setEmpId(e.target.value)}>
                        <option value="">— Tất cả —</option>
                        {employees.map((e) => (
                            <option key={e.id} value={e.id}>{e.code} – {e.fullName}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* ── Summary ── */}
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <div className="stat-card">
                    <div className="stat-card-value">{totalShifts}</div>
                    <div className="stat-card-label">Tổng ca</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value">{Math.floor(totalWorked / 60)}h {totalWorked % 60}m</div>
                    <div className="stat-card-label">Tổng giờ làm</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value">{totalLate} phút</div>
                    <div className="stat-card-label">Tổng đi trễ</div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ngày</th><th>Mã NV</th><th>Họ tên</th><th>Ca</th>
                            <th>Check-in</th><th>Check-out</th><th>Trễ</th><th>Về sớm</th><th>Làm việc</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="empty-state">Đang tải…</td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan={9} className="empty-state">Không có dữ liệu</td></tr>
                        ) : (
                            records.map((r) => (
                                <tr key={r.id}>
                                    <td>{formatDate(r.checkInTime)}</td>
                                    <td style={{ fontWeight: 600 }}>{r.employeeCode}</td>
                                    <td>{r.employeeName}</td>
                                    <td>{r.shiftName || "—"}</td>
                                    <td>{formatTimeShort(r.checkInTime)}</td>
                                    <td>{formatTimeShort(r.checkOutTime)}</td>
                                    <td>{r.lateMinutes > 0 ? <span className="badge badge-warning">{r.lateMinutes}p</span> : "—"}</td>
                                    <td>{r.earlyLeaveMinutes > 0 ? <span className="badge badge-warning">{r.earlyLeaveMinutes}p</span> : "—"}</td>
                                    <td>{formatWorkedTime(r.workedMinutes)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
