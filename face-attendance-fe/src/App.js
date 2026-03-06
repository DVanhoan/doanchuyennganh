import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import routes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}

export default App;
