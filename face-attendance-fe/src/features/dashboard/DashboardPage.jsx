import { useState, useEffect, useCallback } from "react";
import { attendanceApi, assignmentApi } from "../../api";
import { formatTime } from "../../utils/format";
import PageHeader from "../../components/ui/PageHeader";

export default function DashboardPage() {
    const [attendance, setAttendance] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const load = useCallback(async () => {
        try {
            const [att, assign] = await Promise.all([
                attendanceApi.getToday(),
                assignmentApi.getToday(),
            ]);
            setAttendance(att);
            setAssignments(assign);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const checkedIn = attendance.length;
    const checkedOut = attendance.filter((a) => a.checkOutTime).length;
    const lateCount = attendance.filter((a) => a.lateMinutes > 0).length;
    const totalAssigned = assignments.length;
    const working = assignments.filter((a) => a.status === "WORKING").length;
    const scheduled = assignments.filter((a) => a.status === "SCHEDULED").length;

    return (
        <div>
            <PageHeader title="Tổng quan hôm nay" subtitle="Thống kê chấm công và phân ca trong ngày" />

            {/* ── Stat cards ── */}
            <div className="stats-grid">
                <StatCard icon={<CalendarIcon />} bg="#eff6ff" value={totalAssigned} label="Phân ca hôm nay" />
                <StatCard icon={<EyeIcon />} bg="#ecfdf5" value={checkedIn} label="Đã check-in" />
                <StatCard icon={<CheckIcon />} bg="#f5f3ff" value={checkedOut} label="Hoàn tất" />
                <StatCard icon={<ClockIcon />} bg="#fef2f2" value={lateCount} label="Đi trễ" />
            </div>

            {/* ── Quick overview ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>Đang chờ check-in</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{scheduled}</div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                        <span className="badge badge-gray">SCHEDULED</span>
                    </div>
                </div>
                <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>Đang làm việc</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{working}</div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                        <span className="badge badge-warning">WORKING</span>
                    </div>
                </div>
            </div>

            {/* ── Recent attendance ── */}
            <div className="admin-card">
                <div className="card-header">
                    <span className="card-title">Chấm công gần đây</span>
                    {attendance.length > 0 && (
                        <span className="badge badge-gray">{attendance.length} bản ghi</span>
                    )}
                </div>

                {attendance.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã NV</th><th>Họ tên</th><th>Ca</th>
                                <th>Vào</th><th>Ra</th><th>Trễ</th><th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.slice(0, 10).map((r) => (
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
                                        {r.checkOutTime
                                            ? <span className="badge badge-success">Hoàn tất</span>
                                            : <span className="badge badge-warning">Đang làm</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">Chưa có dữ liệu chấm công hôm nay</div>
                )}
            </div>
        </div>
    );
}

/* ─── Local sub-components (dashboard-specific icons + stat card) ─── */

function StatCard({ icon, bg, value, label }) {
    return (
        <div className="stat-card">
            <div className="stat-card-icon" style={{ background: bg }}>{icon}</div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
        </div>
    );
}

function CalendarIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function EyeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
        </svg>
    );
}
