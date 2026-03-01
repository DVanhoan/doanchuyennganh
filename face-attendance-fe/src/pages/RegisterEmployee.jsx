import { useState } from "react";
import { createEmployee } from "../services/api";
import FaceEnroll from "../components/FaceEnroll";

export default function RegisterEmployee() {
    const [employee, setEmployee] = useState(null);
    const [form, setForm] = useState({
        code: "",
        fullName: "",
        position: ""
    });

    const submit = async () => {
        const res = await createEmployee(form);
        setEmployee(res);
    };

    return (
        <div style={{
            maxWidth: 520,
            margin: "0 auto",
            padding: "40px 24px",
        }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 4,
                }}>
                    Đăng ký nhân viên
                </h1>
                <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                    Tạo hồ sơ và quét khuôn mặt
                </p>
            </div>

            {!employee && (
                <div style={{
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}>
                    <label style={labelStyle}>
                        Mã nhân viên
                        <input
                            placeholder="VD: NV001"
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                            style={inputStyle}
                        />
                    </label>
                    <label style={labelStyle}>
                        Họ và tên
                        <input
                            placeholder="VD: Nguyễn Văn A"
                            value={form.fullName}
                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                            style={inputStyle}
                        />
                    </label>
                    <label style={labelStyle}>
                        Chức vụ
                        <input
                            placeholder="VD: Developer"
                            value={form.position}
                            onChange={e => setForm({ ...form, position: e.target.value })}
                            style={inputStyle}
                        />
                    </label>
                    <button onClick={submit} style={btnStyle}>
                        Tiếp tục
                    </button>
                </div>
            )}

            {employee && (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}>
                    <div style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        padding: "10px 16px",
                        fontSize: 13,
                        color: "#374151",
                    }}>
                        Đang quét khuôn mặt cho <strong style={{ color: "#111827" }}>{employee.fullName}</strong>
                    </div>
                    <FaceEnroll employeeId={employee.id} />
                </div>
            )}
        </div>
    );
}

const labelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
};

const inputStyle = {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    color: "#111827",
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box",
};

const btnStyle = {
    padding: "10px 0",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    marginTop: 4,
    transition: "opacity 0.15s",
};