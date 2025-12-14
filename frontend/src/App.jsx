import { BrowserRouter as Router, Routes, Route, Navigate,useLocation} from 'react-router-dom';
import PageLayout from './components/PageLayout/PageLayout';
import { ToastContainer } from 'react-toastify';
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
import StaffManagement from './pages/StaffManagement';
import MenuManagement from './pages/MenuManagement';
import ViewProfile from './components/ProfileDropdown/ViewProfile';
import EditProfile from './components/ProfileDropdown/EditProfile';
import StaffViewProfile from './components/ProfileDropdown/StaffViewProfile';
import { HomePage } from './pages/home';
import { PageTransition } from './components/shared';
import { RootLayout } from './layouts/RootLayout';
import CashierReport from './pages/CashierReport';
import FoodOrderPage from './pages/FoodOrderPage';
import FoodPaymentReport from './pages/FoodPaymentReport';
import { AboutPage } from './pages/about';
import { FeaturesPage } from './pages/features';
import { PricingPage } from './pages/pricing';
import { ContactPage } from './pages/contact';
import { NotFoundPage } from './pages/not-found/index';
import {LoginPage} from './pages/auth/login';


import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';


 function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes with RootLayout */}
        <Route element={<RootLayout />}>
          <Route
            path="/"
            element={
              <PageTransition>
                <HomePage />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <AboutPage />
              </PageTransition>
            }
          />
          <Route
            path="/features"
            element={
              <PageTransition>
                <FeaturesPage />
              </PageTransition>
            }
          />
          <Route
            path="/pricing"
            element={
              <PageTransition>
                <PricingPage />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <ContactPage />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage/>
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <div>Register Page - Coming Soon</div>
              </PageTransition>
            }
          />
        </Route>

        {/* Super Admin routes */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route
          path="/super-admin/dashboard"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />

        {/* Protected Staff routes */}
        <Route path="/view-profile" element={<ProtectedRoute staffRestricted={true}><ViewProfile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute staffRestricted={true}><EditProfile /></ProtectedRoute>} />
        <Route path="/staff-profile" element={<ProtectedRoute staffOnly={true}><StaffViewProfile /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute permKey="Bookings"><BookingManagement /></ProtectedRoute>} />
        <Route path="/edit-booking/:bookingId" element={<ProtectedRoute permKey="Add Bookings"><EditBooking /></ProtectedRoute>} />
        <Route path="/bookings/new" element={<ProtectedRoute permKey="Add Bookings"><BookingForm /></ProtectedRoute>} />
        <Route path="/booking/view/:bookingId" element={<ProtectedRoute permKey="Bookings"><ViewBooking /></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute permKey="Rooms"><RoomManagement /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute permKey="Customers"><CustomerManagement /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute permKey="Users"><StaffManagement /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute permKey="FoodMenu"><MenuManagement /></ProtectedRoute>} />
        <Route path="/bookings/:bookingId/invoice" element={<ProtectedRoute permKey="Bookings"><Invoice /></ProtectedRoute>} />
        <Route path="/booking/:bookingId/order-food" element={<ProtectedRoute permKey="FoodMenu"><FoodOrderPage /></ProtectedRoute>} />
        <Route path="/food-payment-report" element={<ProtectedRoute permKey="FoodPaymentReport"><FoodPaymentReport /></ProtectedRoute>} />
        <Route path="/cashier-report" element={<ProtectedRoute permKey="CashierReport"><CashierReport /></ProtectedRoute>} />

        {/* Catch all unmatched routes - 404 page */}
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFoundPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );

 }

// In your Routes:

// Protected route for hotel staff with permission checking
const ProtectedRoute = ({ children, permKey, staffRestricted = false, staffOnly = false }) => {
  const token = localStorage.getItem('token');
  const isStaff = localStorage.getItem('isStaff') === 'true';
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If route is staff only and user is not staff, redirect to dashboard
  if (staffOnly && !isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  // If route is staff restricted and user is staff, redirect to staff profile
  if (staffRestricted && isStaff) {
    return <Navigate to="/staff-profile" replace />;
  }

  // Check permissions if permKey is provided
  if (permKey) {
    const permissionsRaw = localStorage.getItem('permissions');
    
    // If no permissions stored, assume admin/owner - allow access to everything
    if (permissionsRaw) {
      try {
        const permissions = JSON.parse(permissionsRaw);
        
        let hasPermission = false;
        
        // Check if permissions is an array
        if (Array.isArray(permissions)) {
          hasPermission = permissions.includes(permKey);
        } 
        // Check if permissions is an object
        else if (typeof permissions === 'object' && permissions !== null) {
          hasPermission = !!permissions[permKey];
        }
        
        // User doesn't have required permission - redirect to dashboard
        if (!hasPermission) {
          return <Navigate to="/dashboard" replace />;
        }
      } catch (error) {
        console.error('Error parsing permissions:', error);
        // If error parsing, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
      }
    }
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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

   <AnimatedRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />







    </Router>
  );
}

export default App;
