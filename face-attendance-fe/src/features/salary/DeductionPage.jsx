import { useState, useEffect, useCallback } from "react";
import { salaryDeductionApi, employeeApi } from "../../api";
import { formatDate, formatMoney } from "../../utils/format";
import useToast from "../../hooks/useToast";
import Toast from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";

export default function DeductionPage() {
    const [list, setList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ employeeId: "", amount: "", reason: "", createdBy: "" });
    const { toast, showSuccess, showError, dismiss } = useToast();

    const load = useCallback(async () => {
        try {
            const [data, emps] = await Promise.all([salaryDeductionApi.getAll(), employeeApi.getAll()]);
            setList(data);
            setEmployees(emps);
        } catch (e) { showError(e.message); }
    }, [showError]);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await salaryDeductionApi.create({
                employeeId: Number(form.employeeId),
                amount: Number(form.amount),
                reason: form.reason,
                createdBy: form.createdBy,
            });
            showSuccess("Thêm khoản trừ thành công!");
            setForm({ employeeId: "", amount: "", reason: "", createdBy: "" });
            setShowForm(false);
            load();
        } catch (err) { showError(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa khoản trừ này?")) return;
        try { await salaryDeductionApi.remove(id); showSuccess("Đã xóa!"); load(); }
        catch (err) { showError(err.message); }
    };

    const totalDeductions = list.reduce((s, d) => s + (Number(d.amount) || 0), 0);

    return (
        <div>
            <PageHeader title="Khoản trừ lương" subtitle="Quản lý các khoản trừ: phạt, bảo hiểm, hoàn ứng, v.v." />
            <Toast toast={toast} onDismiss={dismiss} />

            {/* ── Toolbar ── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                    Tổng trừ: <strong>{formatMoney(totalDeductions)}</strong>
                </span>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Đóng" : "+ Thêm khoản trừ"}
                </button>
            </div>

            {/* ── Form ── */}
            {showForm && (
                <div className="admin-card" style={{ marginBottom: 20 }}>
                    <div className="card-header"><span className="card-title">Thêm khoản trừ lương</span></div>
                    <form className="card-body" onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <label className="admin-label">
                            Nhân viên
                            <select className="admin-select" value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} required>
                                <option value="">— Chọn —</option>
                                {employees.filter((e) => e.isActive !== false).map((e) => (
                                    <option key={e.id} value={e.id}>{e.code} – {e.fullName}</option>
                                ))}
                            </select>
                        </label>
                        <label className="admin-label">
                            Số tiền (VNĐ)
                            <input className="admin-input" type="number" min="1" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
                        </label>
                        <label className="admin-label">
                            Lý do
                            <input className="admin-input" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
                        </label>
                        <label className="admin-label">
                            Người tạo
                            <input className="admin-input" value={form.createdBy} onChange={(e) => setForm((f) => ({ ...f, createdBy: e.target.value }))} />
                        </label>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button type="submit" className="btn-primary">Thêm</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Table ── */}
            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ngày</th><th>Mã NV</th><th>Họ tên</th><th>Số tiền</th>
                            <th>Lý do</th><th>Người tạo</th><th style={{ width: 80 }}>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr><td colSpan={7} className="empty-state">Chưa có khoản trừ nào</td></tr>
                        ) : (
                            list.map((d) => (
                                <tr key={d.id}>
                                    <td>{formatDate(d.deductionDate)}</td>
                                    <td style={{ fontWeight: 600 }}>{d.employeeCode}</td>
                                    <td>{d.employeeName}</td>
                                    <td>{formatMoney(d.amount)}</td>
                                    <td>{d.reason || "—"}</td>
                                    <td>{d.createdBy || "—"}</td>
                                    <td>
                                        <button className="btn-icon" title="Xóa" onClick={() => handleDelete(d.id)}>🗑️</button>
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
