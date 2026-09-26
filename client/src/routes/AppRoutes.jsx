import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleRoute from '../components/RoleRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import StaffRegisterPage from '../pages/auth/StaffRegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Student pages
import StudentDashboard from '../pages/student/DashboardPage';
import StudentComplaints from '../pages/student/ComplaintsPage';
import NewComplaintPage from '../pages/student/NewComplaintPage';
import StudentComplaintDetail from '../pages/student/ComplaintDetailPage';
import StudentMessPage from '../pages/student/MessPage';
import StudentProfilePage from '../pages/student/ProfilePage';

// Warden pages
import WardenDashboard from '../pages/warden/DashboardPage';
import WardenComplaints from '../pages/warden/ComplaintsPage';
import WardenComplaintDetail from '../pages/warden/ComplaintDetailPage';
import WardenMessPage from '../pages/warden/MessPage';
import WardenProfilePage from '../pages/warden/ProfilePage';
import WardenUsersPage from '../pages/warden/UserManagementPage';

// Staff pages
import StaffDashboard from '../pages/staff/DashboardPage';
import StaffComplaints from '../pages/staff/ComplaintsPage';
import StaffComplaintDetail from '../pages/staff/ComplaintDetailPage';
import StaffProfilePage from '../pages/staff/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Secure administrative onboarding for wardens and staff/workers */}
      <Route path="/admin/staff-register" element={<StaffRegisterPage />} />
      <Route path="/staff-portal/register" element={<StaffRegisterPage />} />

      {/* Student routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT"><StudentDashboard /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/complaints"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT"><StudentComplaints /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/complaints/new"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT"><NewComplaintPage /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/complaints/:id"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT"><StudentComplaintDetail /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/mess"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT"><StudentMessPage /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT"><StudentProfilePage /></RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Warden routes */}
      <Route
        path="/warden/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute role="WARDEN"><WardenDashboard /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/complaints"
        element={
          <ProtectedRoute>
            <RoleRoute role="WARDEN"><WardenComplaints /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/complaints/:id"
        element={
          <ProtectedRoute>
            <RoleRoute role="WARDEN"><WardenComplaintDetail /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/mess"
        element={
          <ProtectedRoute>
            <RoleRoute role="WARDEN"><WardenMessPage /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/users"
        element={
          <ProtectedRoute>
            <RoleRoute role="WARDEN"><WardenUsersPage /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/profile"
        element={
          <ProtectedRoute>
            <RoleRoute role="WARDEN"><WardenProfilePage /></RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Staff routes */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute role="STAFF"><StaffDashboard /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/complaints"
        element={
          <ProtectedRoute>
            <RoleRoute role="STAFF"><StaffComplaints /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/complaints/:id"
        element={
          <ProtectedRoute>
            <RoleRoute role="STAFF"><StaffComplaintDetail /></RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/profile"
        element={
          <ProtectedRoute>
            <RoleRoute role="STAFF"><StaffProfilePage /></RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
