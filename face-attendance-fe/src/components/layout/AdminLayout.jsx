import { Link, useLocation } from "react-router-dom";
import {
    IconGrid, IconScan, IconClock, IconCalendar,
    IconUsers, IconHistory, IconWallet, IconMinus, IconDollar,
} from "./Icons";


const navSections = [
    {
        label: "Tổng quan",
        items: [
            { path: "/dashboard", label: "Dashboard", icon: <IconGrid /> },
            { path: "/", label: "Chấm công", icon: <IconScan /> },
        ],
    },
    {
        label: "Ca làm việc",
        items: [
            { path: "/shifts", label: "Quản lý ca", icon: <IconClock /> },
            { path: "/assignments", label: "Phân ca", icon: <IconCalendar /> },
            { path: "/attendance-history", label: "Lịch sử chấm công", icon: <IconHistory /> },
        ],
    },
    {
        label: "Nhân sự",
        items: [
            { path: "/employees", label: "Quản lý NV", icon: <IconUsers /> },
        ],
    },
    {
        label: "Lương & Phụ cấp",
        items: [
            { path: "/salary-advances", label: "Tạm ứng", icon: <IconWallet /> },
            { path: "/salary-deductions", label: "Khoản trừ", icon: <IconMinus /> },
            { path: "/payroll", label: "Bảng lương", icon: <IconDollar /> },
        ],
    },
];

const pageTitles = {
    "/dashboard": "Tổng quan",
    "/": "Chấm công",
    "/shifts": "Ca làm việc",
    "/assignments": "Phân ca",
    "/employees": "Quản lý nhân viên",
    "/attendance-history": "Lịch sử chấm công",
    "/salary-advances": "Tạm ứng lương",
    "/salary-deductions": "Khoản trừ lương",
    "/payroll": "Bảng lương",
};


export default function AdminLayout({ children }) {
    const location = useLocation();
    const currentTitle = pageTitles[location.pathname] || "FaceID Attendance";

    const today = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <div className="admin-sidebar-brand-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                        </svg>
                    </div>
                    <div className="admin-sidebar-brand-text">
                        <span className="admin-sidebar-brand-name">FaceID</span>
                        <span className="admin-sidebar-brand-sub">Attendance System</span>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <div className="admin-sidebar-section">{section.label}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`admin-nav-item${location.pathname === item.path ? " active" : ""}`}
                                >
                                    <span className="admin-nav-icon">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            <div className="admin-main">
                <header className="admin-header">
                    <span className="admin-header-title">{currentTitle}</span>
                    <span className="admin-header-right">{today}</span>
                </header>
                <main className="admin-content">{children}</main>
            </div>
        </div>
    );
}
