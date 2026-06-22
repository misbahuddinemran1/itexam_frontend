import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Admin
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRoute from './components/AdminRoute'

// User
import Login from './pages/user/Login'
import Dashboard from './pages/user/Dashboard'
import Leaderboard from './pages/user/Leaderboard'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Exam
import ExamHome from './pages/user/exam/ExamHome'
import ExamPlay from './pages/user/exam/ExamPlay'
import ExamResult from './pages/user/exam/ExamResult'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ===== ADMIN ===== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />

        {/* ===== USER ===== */}
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Navbar />
            <Leaderboard />
          </ProtectedRoute>
        } />

        {/* ===== EXAM ===== */}
        <Route path="/exam" element={
          <ProtectedRoute>
            <Navbar />
            <ExamHome />
          </ProtectedRoute>
        } />

        <Route path="/exam/play" element={
          <ProtectedRoute>
            <Navbar />
            <ExamPlay />
          </ProtectedRoute>
        } />

        <Route path="/exam/result/:sessionId" element={
          <ProtectedRoute>
            <Navbar />
            <ExamResult />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}