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
import ViewProfile from './components/ProfileDropdown/ViewProfile';
import EditProfile from './components/ProfileDropdown/EditProfile';
import { HomePage } from './pages/home';
import { PageTransition } from './components/shared';
import { RootLayout } from './layouts/RootLayout';
import CashierReport from './pages/CashierReport';
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
        <Route path="/view-profile" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
        <Route path="/edit-booking/:bookingId" element={<ProtectedRoute><EditBooking /></ProtectedRoute>} />
        <Route path="/bookings/new" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
        <Route path="/booking/view/:bookingId" element={<ProtectedRoute><ViewBooking /></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
        <Route path="/bookings/:bookingId/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
        <Route path="/cashier-report" element={<ProtectedRoute><CashierReport /></ProtectedRoute>} />

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
