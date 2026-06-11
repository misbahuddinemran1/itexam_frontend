import { BrowserRouter, Routes, Route } from "react-router-dom"
import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import SubjectManage from "./pages/admin/SubjectManage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/subjects" element={<SubjectManage />} />
        <Route path="*" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
