import { useState, useEffect, useCallback } from "react";
import { payrollApi } from "../../api";
import { formatMoney, formatWorkedTime } from "../../utils/format";
import useToast from "../../hooks/useToast";
import Toast from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";

export default function PayrollPage() {
    const [data, setData] = useState([]);
    const [from, setFrom] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    });
    const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const { toast, showError, dismiss } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try { setData(await payrollApi.get(from, to)); }
        catch (e) { showError(e.message); }
        finally { setLoading(false); }
    }, [from, to, showError]);

    useEffect(() => { load(); }, [load]);

    const totals = data.reduce(
        (acc, r) => ({
            gross: acc.gross + (Number(r.grossPay) || 0),
            advances: acc.advances + (Number(r.totalAdvances) || 0),
            deductions: acc.deductions + (Number(r.totalDeductions) || 0),
            net: acc.net + (Number(r.netPay) || 0),
        }),
        { gross: 0, advances: 0, deductions: 0, net: 0 },
    );

    return (
        <div>
            <PageHeader title="Bảng lương" subtitle="Tổng hợp lương nhân viên theo kỳ — tính tự động từ chấm công, tạm ứng và khoản trừ" />
            <Toast toast={toast} onDismiss={dismiss} />

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
            </div>

            {/* ── Summary cards ── */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-value">{data.length}</div>
                    <div className="stat-card-label">Nhân viên</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value" style={{ fontSize: 18 }}>{formatMoney(totals.gross)}</div>
                    <div className="stat-card-label">Tổng lương gộp</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value" style={{ fontSize: 18 }}>{formatMoney(totals.advances + totals.deductions)}</div>
                    <div className="stat-card-label">Tổng khấu trừ</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value" style={{ fontSize: 18, color: "var(--color-brand)" }}>{formatMoney(totals.net)}</div>
                    <div className="stat-card-label">Tổng thực lãnh</div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã NV</th><th>Họ tên</th><th>Phòng ban</th><th>Số ca</th>
                            <th>Giờ làm</th><th>Lương/giờ</th><th>Lương gộp</th>
                            <th>Tạm ứng</th><th>Khấu trừ</th><th>Thực lãnh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} className="empty-state">Đang tải…</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={10} className="empty-state">Không có dữ liệu</td></tr>
                        ) : (
                            data.map((r) => (
                                <tr key={r.employeeId}>
                                    <td style={{ fontWeight: 600 }}>{r.employeeCode}</td>
                                    <td>{r.employeeName}</td>
                                    <td>{r.department || "—"}</td>
                                    <td>{r.totalShifts}</td>
                                    <td>{formatWorkedTime(r.totalWorkedMinutes)}</td>
                                    <td>{formatMoney(r.hourlyRate)}</td>
                                    <td>{formatMoney(r.grossPay)}</td>
                                    <td>
                                        {Number(r.totalAdvances) > 0
                                            ? <span className="badge badge-warning">{formatMoney(r.totalAdvances)}</span>
                                            : "—"}
                                    </td>
                                    <td>
                                        {Number(r.totalDeductions) > 0
                                            ? <span className="badge badge-danger">{formatMoney(r.totalDeductions)}</span>
                                            : "—"}
                                    </td>
                                    <td style={{ fontWeight: 600, color: "var(--color-brand)" }}>
                                        {formatMoney(r.netPay)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
