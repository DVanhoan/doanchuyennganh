import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import RegisterEmployee from "./pages/RegisterEmployee";
import CheckIn from "./pages/CheckIn";

function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 56,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#111827",
          letterSpacing: "-0.3px",
        }}
      >
        FaceID Attendance
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        <NavLink to="/" active={isActive("/")} label="Chấm công" />
        <NavLink
          to="/register"
          active={isActive("/register")}
          label="Đăng ký"
        />
      </div>
    </nav>
  );
}

function NavLink({ to, active, label }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: "6px 16px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        color: active ? "#111827" : "#6b7280",
        background: active ? "#f3f4f6" : "transparent",
        transition: "all 0.15s",
      }}
    >
      {label}
    </Link>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<CheckIn />} />
        <Route path="/register" element={<RegisterEmployee />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
