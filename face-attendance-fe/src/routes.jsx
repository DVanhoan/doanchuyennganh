import DashboardPage from "./features/dashboard/DashboardPage";
import CheckInPage from "./features/attendance/CheckInPage";
import HistoryPage from "./features/attendance/HistoryPage";
import EmployeeListPage from "./features/employees/EmployeeListPage";
import ShiftManagementPage from "./features/shifts/ShiftManagementPage";
import ShiftAssignmentPage from "./features/shifts/ShiftAssignmentPage";
import AdvancePage from "./features/salary/AdvancePage";
import DeductionPage from "./features/salary/DeductionPage";
import PayrollPage from "./features/salary/PayrollPage";

const routes = [
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/", element: <CheckInPage /> },
    { path: "/shifts", element: <ShiftManagementPage /> },
    { path: "/assignments", element: <ShiftAssignmentPage /> },
    { path: "/employees", element: <EmployeeListPage /> },
    { path: "/attendance-history", element: <HistoryPage /> },
    { path: "/salary-advances", element: <AdvancePage /> },
    { path: "/salary-deductions", element: <DeductionPage /> },
    { path: "/payroll", element: <PayrollPage /> },
];

export default routes;
