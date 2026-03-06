import { useState, useEffect, useCallback } from "react";
import { employeeApi, faceApi } from "../../api";
import { formatMoney } from "../../utils/format";
import useToast from "../../hooks/useToast";
import Toast from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";
import FaceEnroll from "../../components/face/FaceEnroll";

const emptyForm = {
    code: "", fullName: "", position: "", phone: "",
    email: "", department: "", hourlyRate: "", hireDate: "",
};

const trueStatuses = {
    "up": "true",
    "down": "true",
    "left": "true",
    "right": "true",
    "front": "true",
}

export default function EmployeeListPage() {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState("");
    const { toast, showSuccess, showError, dismiss } = useToast();

    const [enrollEmployee, setEnrollEmployee] = useState(null);
    const [enrollStatuses, setEnrollStatuses] = useState({});




    const load = useCallback(async () => {
        try {
            const data = await employeeApi.getAll();
            setEmployees(data);

            const statuses = {};
            await Promise.all(
                data.map(async (emp) => {
                    try {
                        const st = await faceApi.getStatus(emp.id);
                        statuses[emp.id] = st.every((dir) => trueStatuses[dir]);
                        console.log(`Employee ${emp.id} (${emp.fullName}) enroll status:`, st, "=>", statuses[emp.id]);
                    } catch {
                        statuses[emp.id] = false;
                    }
                }),
            );
            setEnrollStatuses(statuses);
        } catch (e) {
            showError(e.message);
        }
    }, [showError]);

    useEffect(() => { load(); }, [load]);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
                hireDate: form.hireDate || null,
            };
            if (editId) {
                await employeeApi.update(editId, payload);
                showSuccess("Cập nhật thành công!");
                resetForm();
            } else {
                const created = await employeeApi.create(payload);
                showSuccess("Thêm nhân viên thành công! Tiếp tục quét khuôn mặt.");
                setForm(emptyForm);
                setShowForm(false);
                setEnrollEmployee({ id: created.id, fullName: created.fullName });
            }
            load();
        } catch (err) {
            showError(err.message);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditId(null);
        setShowForm(false);
    };

    const handleEdit = (emp) => {
        setEnrollEmployee(null);
        setForm({
            code: emp.code || "", fullName: emp.fullName || "", position: emp.position || "",
            phone: emp.phone || "", email: emp.email || "", department: emp.department || "",
            hourlyRate: emp.hourlyRate ?? "", hireDate: emp.hireDate || "",
        });
        setEditId(emp.id);
        setShowForm(true);
    };

    const handleToggle = async (id) => {
        try { await employeeApi.toggleActive(id); load(); showSuccess("Đã thay đổi trạng thái!"); }
        catch (err) { showError(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa nhân viên này vĩnh viễn?")) return;
        try { await employeeApi.remove(id); load(); showSuccess("Đã xóa!"); }
        catch (err) { showError(err.message); }
    };

    const handleFaceEnroll = (emp) => {
        resetForm();
        setEnrollEmployee({ id: emp.id, fullName: emp.fullName });
    };

    const filtered = employees.filter(
        (e) =>
            !filter ||
            (e.fullName || "").toLowerCase().includes(filter.toLowerCase()) ||
            (e.code || "").toLowerCase().includes(filter.toLowerCase()) ||
            (e.department || "").toLowerCase().includes(filter.toLowerCase()),
    );

    return (
        <div>
            <PageHeader title="Quản lý nhân viên" subtitle="Danh sách, thêm mới, chỉnh sửa, quét khuôn mặt và quản lý trạng thái" />
            <Toast toast={toast} onDismiss={dismiss} />

            {/* ── Face Enroll panel ── */}
            {enrollEmployee && (
                <div className="admin-card" style={{ marginBottom: 20 }}>
                    <div className="card-header">
                        <span className="card-title">Quét khuôn mặt — {enrollEmployee.fullName}</span>
                        <button className="btn-secondary" style={{ padding: "5px 14px", fontSize: "var(--text-sm)" }} onClick={() => { setEnrollEmployee(null); load(); }}>
                            Đóng
                        </button>
                    </div>
                    <div className="card-body" style={{ display: "flex", justifyContent: "center" }}>
                        <FaceEnroll employeeId={enrollEmployee.id} />
                    </div>
                </div>
            )}

            {/* ── Toolbar ── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                <input className="admin-input" style={{ maxWidth: 300 }} placeholder="Tìm theo tên, mã, phòng ban…" value={filter} onChange={(e) => setFilter(e.target.value)} />
                <button className="btn-primary" onClick={() => { setEnrollEmployee(null); setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}>
                    {showForm ? "Đóng" : "+ Thêm nhân viên"}
                </button>
            </div>

            {/* ── Form ── */}
            {showForm && (
                <div className="admin-card" style={{ marginBottom: 20 }}>
                    <div className="card-header">
                        <span className="card-title">{editId ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</span>
                    </div>
                    <form className="card-body" onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        <label className="admin-label">Mã NV<input className="admin-input" name="code" value={form.code} onChange={handleChange} required /></label>
                        <label className="admin-label">Họ tên<input className="admin-input" name="fullName" value={form.fullName} onChange={handleChange} required /></label>
                        <label className="admin-label">Chức vụ<input className="admin-input" name="position" value={form.position} onChange={handleChange} /></label>
                        <label className="admin-label">Điện thoại<input className="admin-input" name="phone" value={form.phone} onChange={handleChange} /></label>
                        <label className="admin-label">Email<input className="admin-input" name="email" type="email" value={form.email} onChange={handleChange} /></label>
                        <label className="admin-label">Phòng ban<input className="admin-input" name="department" value={form.department} onChange={handleChange} /></label>
                        <label className="admin-label">Lương / giờ (VNĐ)<input className="admin-input" name="hourlyRate" type="number" min="0" value={form.hourlyRate} onChange={handleChange} /></label>
                        <label className="admin-label">Ngày vào làm<input className="admin-input" name="hireDate" type="date" value={form.hireDate} onChange={handleChange} /></label>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                            <button type="submit" className="btn-primary">{editId ? "Cập nhật" : "Thêm"}</button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Table ── */}
            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã</th><th>Họ tên</th><th>Chức vụ</th><th>Phòng ban</th>
                            <th>Điện thoại</th><th>Lương/giờ</th><th>Khuôn mặt</th><th>Trạng thái</th>
                            <th style={{ width: 160 }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={9} className="empty-state">Không tìm thấy nhân viên</td></tr>
                        ) : (
                            filtered.map((emp) => (
                                <tr key={emp.id}>
                                    <td style={{ fontWeight: 600 }}>{emp.code}</td>
                                    <td>{emp.fullName}</td>
                                    <td>{emp.position || "—"}</td>
                                    <td>{emp.department || "—"}</td>
                                    <td>{emp.phone || "—"}</td>
                                    <td>{emp.hourlyRate != null ? formatMoney(emp.hourlyRate) : "—"}</td>
                                    <td>{enrollStatuses[emp.id] ? <span className="badge badge-success">Đã quét</span> : <span className="badge badge-warning">Chưa quét</span>}</td>
                                    <td><span className={`badge ${emp.isActive !== false ? "badge-success" : "badge-gray"}`}>{emp.isActive !== false ? "Hoạt động" : "Nghỉ"}</span></td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="btn-icon" title="Quét khuôn mặt" onClick={() => handleFaceEnroll(emp)}>📷</button>
                                            <button className="btn-icon" title="Sửa" onClick={() => handleEdit(emp)}>✏️</button>
                                            <button className="btn-icon" title={emp.isActive !== false ? "Vô hiệu hóa" : "Kích hoạt"} onClick={() => handleToggle(emp.id)}>{emp.isActive !== false ? "🚫" : "✅"}</button>
                                            <button className="btn-icon" title="Xóa vĩnh viễn" onClick={() => handleDelete(emp.id)}>🗑️</button>
                                        </div>
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
