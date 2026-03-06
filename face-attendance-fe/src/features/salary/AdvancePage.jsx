import { useState, useEffect, useCallback } from "react";
import { salaryAdvanceApi, employeeApi } from "../../api";
import { formatDate, formatMoney } from "../../utils/format";
import { ADVANCE_STATUS } from "../../utils/constants";
import useToast from "../../hooks/useToast";
import Toast from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";

export default function AdvancePage() {
    const [list, setList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ employeeId: "", amount: "", reason: "" });
    const { toast, showSuccess, showError, dismiss } = useToast();

    // Action modal state
    const [actionModal, setActionModal] = useState(null);
    const [actionForm, setActionForm] = useState({ approvedBy: "", responseNote: "" });

    const load = useCallback(async () => {
        try {
            const [data, emps] = await Promise.all([salaryAdvanceApi.getAll(), employeeApi.getAll()]);
            setList(data);
            setEmployees(emps);
        } catch (e) { showError(e.message); }
    }, [showError]);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await salaryAdvanceApi.create({
                employeeId: Number(form.employeeId),
                amount: Number(form.amount),
                reason: form.reason,
            });
            showSuccess("Tạo đề nghị tạm ứng thành công!");
            setForm({ employeeId: "", amount: "", reason: "" });
            setShowForm(false);
            load();
        } catch (err) { showError(err.message); }
    };

    const handleAction = async () => {
        try {
            await salaryAdvanceApi.processAction(actionModal.id, {
                action: actionModal.action,
                approvedBy: actionForm.approvedBy,
                responseNote: actionForm.responseNote,
            });
            showSuccess(actionModal.action === "APPROVED" ? "Đã duyệt tạm ứng!" : "Đã từ chối tạm ứng!");
            setActionModal(null);
            setActionForm({ approvedBy: "", responseNote: "" });
            load();
        } catch (err) { showError(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa yêu cầu tạm ứng này?")) return;
        try { await salaryAdvanceApi.remove(id); showSuccess("Đã xóa!"); load(); }
        catch (err) { showError(err.message); }
    };

    const pendingCount = list.filter((a) => a.status === "PENDING").length;

    return (
        <div>
            <PageHeader title="Tạm ứng lương" subtitle="Quản lý yêu cầu tạm ứng lương nhân viên – duyệt / từ chối" />
            <Toast toast={toast} onDismiss={dismiss} />

            {/* ── Action Modal ── */}
            <Modal
                open={!!actionModal}
                onClose={() => setActionModal(null)}
                title={actionModal?.action === "APPROVED" ? "Duyệt tạm ứng" : "Từ chối tạm ứng"}
            >
                <label className="admin-label" style={{ marginBottom: 12 }}>
                    Người duyệt
                    <input className="admin-input" value={actionForm.approvedBy} onChange={(e) => setActionForm((f) => ({ ...f, approvedBy: e.target.value }))} />
                </label>
                <label className="admin-label" style={{ marginBottom: 16 }}>
                    Ghi chú
                    <input className="admin-input" value={actionForm.responseNote} onChange={(e) => setActionForm((f) => ({ ...f, responseNote: e.target.value }))} />
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" onClick={handleAction}>Xác nhận</button>
                    <button className="btn-secondary" onClick={() => setActionModal(null)}>Hủy</button>
                </div>
            </Modal>

            {/* ── Toolbar ── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                {pendingCount > 0 && <span className="badge badge-warning">{pendingCount} chờ duyệt</span>}
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Đóng" : "+ Tạo yêu cầu"}
                </button>
            </div>

            {/* ── Form ── */}
            {showForm && (
                <div className="admin-card" style={{ marginBottom: 20 }}>
                    <div className="card-header"><span className="card-title">Tạo yêu cầu tạm ứng</span></div>
                    <form className="card-body" onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
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
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button type="submit" className="btn-primary">Gửi yêu cầu</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Table ── */}
            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ngày</th><th>Mã NV</th><th>Họ tên</th><th>Số tiền</th><th>Lý do</th>
                            <th>Trạng thái</th><th>Người duyệt</th><th>Ghi chú</th><th style={{ width: 120 }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr><td colSpan={9} className="empty-state">Chưa có yêu cầu tạm ứng</td></tr>
                        ) : (
                            list.map((a) => {
                                const st = ADVANCE_STATUS[a.status] || { text: a.status, cls: "badge-gray" };
                                return (
                                    <tr key={a.id}>
                                        <td>{formatDate(a.requestDate)}</td>
                                        <td style={{ fontWeight: 600 }}>{a.employeeCode}</td>
                                        <td>{a.employeeName}</td>
                                        <td>{formatMoney(a.amount)}</td>
                                        <td>{a.reason || "—"}</td>
                                        <td><span className={`badge ${st.cls}`}>{st.text}</span></td>
                                        <td>{a.approvedBy || "—"}</td>
                                        <td>{a.responseNote || "—"}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: 4 }}>
                                                {a.status === "PENDING" && (
                                                    <>
                                                        <button className="btn-icon" title="Duyệt" onClick={() => setActionModal({ id: a.id, action: "APPROVED" })}>✅</button>
                                                        <button className="btn-icon" title="Từ chối" onClick={() => setActionModal({ id: a.id, action: "REJECTED" })}>❌</button>
                                                    </>
                                                )}
                                                <button className="btn-icon" title="Xóa" onClick={() => handleDelete(a.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
