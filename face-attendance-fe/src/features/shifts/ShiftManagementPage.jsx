import { useState, useEffect, useCallback } from "react";
import { shiftApi } from "../../api";
import useToast from "../../hooks/useToast";
import Toast from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";
import { IconEdit, IconTrash } from "../../components/layout/Icons";

const emptyForm = {
    name: "", startTime: "08:00", endTime: "17:00",
    breakMinutes: 60, lateToleranceMinutes: 15, earlyLeaveToleranceMinutes: 15,
    isActive: true,
};

export default function ShiftManagementPage() {
    const [shifts, setShifts] = useState([]);
    const [form, setForm] = useState({ ...emptyForm });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { toast, showSuccess, showError, dismiss } = useToast();

    const load = useCallback(async () => {
        try { setShifts(await shiftApi.getAll()); }
        catch (e) { console.error(e); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.startTime || !form.endTime) return;
        setLoading(true);
        try {
            if (editingId) {
                await shiftApi.update(editingId, form);
                showSuccess("Cập nhật ca làm thành công!");
            } else {
                await shiftApi.create(form);
                showSuccess("Tạo ca làm thành công!");
            }
            cancelEdit();
            await load();
        } catch (err) { showError(err.message); }
        finally { setLoading(false); }
    };

    const handleEdit = (s) => {
        setEditingId(s.id);
        setForm({
            name: s.name, startTime: s.startTime, endTime: s.endTime,
            breakMinutes: s.breakMinutes ?? 0, lateToleranceMinutes: s.lateToleranceMinutes ?? 0,
            earlyLeaveToleranceMinutes: s.earlyLeaveToleranceMinutes ?? 0, isActive: s.active ?? true,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa ca làm việc này?")) return;
        try { await shiftApi.remove(id); showSuccess("Đã xóa ca làm việc."); await load(); }
        catch (err) { showError(err.message); }
    };

    const cancelEdit = () => { setEditingId(null); setForm({ ...emptyForm }); };

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
        <div>
            <PageHeader title="Quản lý ca làm" subtitle="Tạo và quản lý các ca làm việc" />
            <Toast toast={toast} onDismiss={dismiss} />

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="admin-card" style={{ marginBottom: 24 }}>
                <div className="card-body">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <label className="admin-label" style={{ gridColumn: "1 / -1" }}>
                            Tên ca
                            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: Ca sáng" className="admin-input" required />
                        </label>
                        <label className="admin-label">Giờ bắt đầu<input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="admin-input" required /></label>
                        <label className="admin-label">Giờ kết thúc<input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className="admin-input" required /></label>
                        <label className="admin-label">Nghỉ trưa (phút)<input type="number" min="0" value={form.breakMinutes} onChange={(e) => set("breakMinutes", parseInt(e.target.value) || 0)} className="admin-input" /></label>
                        <label className="admin-label">Dung sai đi trễ (phút)<input type="number" min="0" value={form.lateToleranceMinutes} onChange={(e) => set("lateToleranceMinutes", parseInt(e.target.value) || 0)} className="admin-input" /></label>
                        <label className="admin-label">Dung sai về sớm (phút)<input type="number" min="0" value={form.earlyLeaveToleranceMinutes} onChange={(e) => set("earlyLeaveToleranceMinutes", parseInt(e.target.value) || 0)} className="admin-input" /></label>
                        <label className="admin-label" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                            Đang hoạt động
                        </label>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                        <button type="submit" disabled={loading} className="btn-primary">{editingId ? "Cập nhật" : "Tạo ca"}</button>
                        {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Hủy</button>}
                    </div>
                </div>
            </form>

            {/* ── Table ── */}
            {shifts.length > 0 ? (
                <div className="admin-card">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Tên ca</th><th>Bắt đầu</th><th>Kết thúc</th><th>Nghỉ</th><th>Dung sai trễ</th><th>Dung sai sớm</th><th>Trạng thái</th><th></th></tr>
                        </thead>
                        <tbody>
                            {shifts.map((s) => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 500, color: "#1e293b" }}>{s.name}</td>
                                    <td>{s.startTime}</td>
                                    <td>{s.endTime}</td>
                                    <td>{s.breakMinutes}p</td>
                                    <td>{s.lateToleranceMinutes}p</td>
                                    <td>{s.earlyLeaveToleranceMinutes}p</td>
                                    <td>{s.active ? <span className="badge badge-success">Hoạt động</span> : <span className="badge badge-gray">Tắt</span>}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <button onClick={() => handleEdit(s)} className="btn-icon" title="Sửa"><IconEdit /></button>
                                        <button onClick={() => handleDelete(s.id)} className="btn-icon" style={{ color: "#dc2626" }} title="Xóa"><IconTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">Chưa có ca làm việc nào</div>
            )}
        </div>
    );
}
