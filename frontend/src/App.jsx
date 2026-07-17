import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeDetail from './pages/ResumeDetail';
import Analysis from './pages/Analysis';
import AnalysisHistory from './pages/AnalysisHistory';
import AnalysisDetail from './pages/AnalysisDetail';
import ResumeOptimizer from './pages/ResumeOptimizer';
import JobMatch from './pages/JobMatch';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLogs from './pages/admin/AdminLogs';

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/resume-upload"
              element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>}
            />
            <Route
              path="/resume/:id"
              element={<ProtectedRoute><ResumeDetail /></ProtectedRoute>}
            />
            <Route
              path="/analysis"
              element={<ProtectedRoute><Analysis /></ProtectedRoute>}
            />
            <Route
              path="/analysis-history"
              element={<ProtectedRoute><AnalysisHistory /></ProtectedRoute>}
            />
            <Route
              path="/analysis/:id"
              element={<ProtectedRoute><AnalysisDetail /></ProtectedRoute>}
            />
            <Route
              path="/resume-optimizer"
              element={<ProtectedRoute><ResumeOptimizer /></ProtectedRoute>}
            />
            <Route
              path="/job-match"
              element={<ProtectedRoute><JobMatch /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/users"
              element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>}
            />
            <Route
              path="/admin/analytics"
              element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>}
            />
            <Route
              path="/admin/logs"
              element={<ProtectedRoute adminOnly><AdminLogs /></ProtectedRoute>}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
