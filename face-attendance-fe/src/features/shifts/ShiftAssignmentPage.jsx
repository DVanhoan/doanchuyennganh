import { useState, useEffect, useCallback } from "react";
import { assignmentApi, shiftApi, employeeApi } from "../../api";
import { formatTimeShort } from "../../utils/format";
import { ASSIGNMENT_STATUS } from "../../utils/constants";
import useToast from "../../hooks/useToast";
import Toast from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";
import { IconTrash } from "../../components/layout/Icons";

export default function ShiftAssignmentPage() {
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedShift, setSelectedShift] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast, showSuccess, showError, dismiss } = useToast();

    const loadBase = useCallback(async () => {
        try {
            const [emps, sh] = await Promise.all([employeeApi.getAll(), shiftApi.getActive()]);
            setEmployees(emps);
            setShifts(sh);
        } catch (e) { console.error(e); }
    }, []);

    const loadAssignments = useCallback(async () => {
        try { setAssignments(await assignmentApi.getByDate(date)); }
        catch (e) { console.error(e); }
    }, [date]);

    useEffect(() => { loadBase(); }, [loadBase]);
    useEffect(() => { loadAssignments(); }, [loadAssignments]);

    const handleAssign = async () => {
        if (!selectedEmployee || !selectedShift) return;
        setLoading(true);
        try {
            await assignmentApi.create({
                employeeId: parseInt(selectedEmployee),
                shiftId: parseInt(selectedShift),
                workDate: date,
            });
            setSelectedEmployee("");
            setSelectedShift("");
            showSuccess("Phân ca thành công!");
            await loadAssignments();
        } catch (err) { showError(err.message); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa phân ca này?")) return;
        try { await assignmentApi.remove(id); showSuccess("Đã xóa phân ca."); await loadAssignments(); }
        catch (err) { showError(err.message); }
    };

    const renderStatus = (status) => {
        const s = ASSIGNMENT_STATUS[status] || { text: status, cls: "badge-gray" };
        return <span className={`badge ${s.cls}`}>{s.text}</span>;
    };

    const assignedIds = new Set(assignments.map((a) => a.employeeId));
    const availableEmployees = employees.filter((e) => !assignedIds.has(e.id));

    return (
        <div>
            <PageHeader title="Phân ca làm việc" subtitle="Gán nhân viên vào ca theo ngày" />
            <Toast toast={toast} onDismiss={dismiss} />

            {/* ── Assignment form ── */}
            <div className="admin-card" style={{ marginBottom: 24 }}>
                <div className="card-body">
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <label className="admin-label">
                            Ngày
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="admin-input" style={{ width: 160 }} />
                        </label>
                        <label className="admin-label">
                            Nhân viên
                            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="admin-input" style={{ width: 220 }}>
                                <option value="">-- Chọn --</option>
                                {availableEmployees.map((e) => (
                                    <option key={e.id} value={e.id}>{e.code} - {e.fullName}</option>
                                ))}
                            </select>
                        </label>
                        <label className="admin-label">
                            Ca làm
                            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="admin-input" style={{ width: 220 }}>
                                <option value="">-- Chọn --</option>
                                {shifts.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                                ))}
                            </select>
                        </label>
                        <button
                            onClick={handleAssign}
                            disabled={loading || !selectedEmployee || !selectedShift}
                            className="btn-primary"
                            style={{ height: "fit-content", opacity: loading || !selectedEmployee || !selectedShift ? 0.5 : 1 }}
                        >
                            Phân ca
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Assignments table ── */}
            {assignments.length > 0 ? (
                <div className="admin-card">
                    <div className="card-header">
                        <span className="card-title">Phân ca ngày {date}</span>
                        <span className="badge badge-gray">{assignments.length} nhân viên</span>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã NV</th><th>Họ tên</th><th>Ca</th><th>Giờ</th>
                                <th>Trạng thái</th><th>Vào</th><th>Ra</th><th>Trễ</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((a) => (
                                <tr key={a.id}>
                                    <td><code style={{ fontSize: 12, color: "#64748b" }}>{a.employeeCode}</code></td>
                                    <td style={{ fontWeight: 500, color: "#1e293b" }}>{a.employeeName}</td>
                                    <td>{a.shiftName}</td>
                                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{a.shiftStartTime} - {a.shiftEndTime}</td>
                                    <td>{renderStatus(a.status)}</td>
                                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{formatTimeShort(a.checkInTime)}</td>
                                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{formatTimeShort(a.checkOutTime)}</td>
                                    <td>
                                        {a.lateMinutes > 0
                                            ? <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 500 }}>{a.lateMinutes}p</span>
                                            : "—"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        {a.status === "SCHEDULED" && (
                                            <button onClick={() => handleDelete(a.id)} className="btn-icon" style={{ color: "#dc2626" }} title="Xóa">
                                                <IconTrash />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">Chưa có phân ca cho ngày {date}</div>
            )}
        </div>
    );
}
