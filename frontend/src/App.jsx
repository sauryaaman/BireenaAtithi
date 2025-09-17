import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PageLayout from './components/PageLayout/PageLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import BookingForm from './pages/BookingForm';
import BookingManagement from './pages/BookingManagement';
import CustomerManagement from './pages/CustomerManagement';
import ViewBooking from './pages/ViewBooking';
import EditBooking from './pages/EditBooking';
import RoomManagement from './pages/RoomManagement';
import Invoice from './pages/Invoicenew';
import ViewProfile from './components/ProfileDropdown/ViewProfile';
import EditProfile from './components/ProfileDropdown/EditProfile';



// In your Routes:

// Protected route for hotel staff
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <PageLayout>{children}</PageLayout>;
};

// Protected route for super admin
const SuperAdminRoute = ({ children }) => {
  const token = localStorage.getItem('superAdminToken');
  
  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        
        {/* Super Admin routes */}
        <Route
          path="/super-admin/dashboard"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />
            
        
        {/* Protected routes with MainLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/view-profile" 
          element={
         <ProtectedRoute>
         <ViewProfile />
         </ProtectedRoute>}
          />
          <Route 
          path="/edit-profile" 
          element={
         <ProtectedRoute>
         <EditProfile />
         </ProtectedRoute>}
          />
  {/* <Route path="/edit-profile" element={<EditProfile />} /> */}
  {/* ... other routes ... */}

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-booking/:bookingId"
          element={
            <ProtectedRoute>
              <EditBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/new"
          element={
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/view/:bookingId"
          element={
            <ProtectedRoute>
              <ViewBooking />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/booking/edit/:bookingId"
          element={
            <ProtectedRoute>
              <EditBooking/>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomerManagement />
            </ProtectedRoute>
          }
        />
            
       
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomerManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/:bookingId/invoice"
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          }
        />
        
        {/* Redirect root to dashboard */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        
        {/* Catch all route - redirect to dashboard */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
