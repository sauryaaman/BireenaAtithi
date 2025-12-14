import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Mail, Phone } from 'lucide-react';
import { Button } from '../../components/ui';
const BASE_URL = import.meta.env.VITE_API_URL;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });
  const [loginType, setLoginType] = useState('user'); // 'user' or 'staff'
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email or Phone validation depending on login type
    if (loginType === 'user') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = 'Phone is required';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone must be 10 digits';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordForm = () => {
    const newErrors = {};
    if (!forgotEmail) {
      newErrors.forgotEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      newErrors.forgotEmail = 'Enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      // choose endpoint based on login type
      const endpoint = loginType === 'staff' ? `${BASE_URL}/api/staff/login` : `${BASE_URL}/api/users/login`;
      const body = loginType === 'staff'
        ? { phone: formData.phone, password: formData.password }
        : { email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and permissions (if returned), then navigate to dashboard
      localStorage.setItem('token', data.token);
      
      // Set isStaff flag
      if (loginType === 'staff') {
        localStorage.setItem('isStaff', 'true');
      } else {
        localStorage.removeItem('isStaff');
      }
      
      // If login returned a staff or user object with permissions, persist them for frontend-only checks
      try {
        const perms = data?.staff?.permissions || data?.user?.permissions || data?.permissions;
        if (perms) {
          localStorage.setItem('permissions', JSON.stringify(perms));
          // If staff object already contains owner info, save it
          if (data?.staff?.created_by) {
            localStorage.setItem('owner_id', String(data.staff.created_by));
          }
        } else {
          // If this was a staff login and no permissions were returned, try fetching staff profile as a fallback
          if (loginType === 'staff') {
            try {
              const resp = await fetch(`${BASE_URL}/api/staff/profile`, {
                headers: { Authorization: `Bearer ${data.token}` }
              });
              if (resp.ok) {
                const staffProfile = await resp.json();
                const fallbackPerms = staffProfile?.permissions;
                if (fallbackPerms) {
                  localStorage.setItem('permissions', JSON.stringify(fallbackPerms));
                  // persist owner id from staff profile
                  if (staffProfile?.created_by) {
                    localStorage.setItem('owner_id', String(staffProfile.created_by));
                  }
                }
                // also persist owner id even if no perms
                if (staffProfile?.created_by && !localStorage.getItem('owner_id')) {
                  localStorage.setItem('owner_id', String(staffProfile.created_by));
                }
              }
            } catch (e) {
              // ignore fallback errors — leave permissions unset
            }
          } else {
            // clear any leftover permissions for admin logins
            localStorage.removeItem('permissions');
            // persist admin owner id if returned by response
            if (data?.user?.user_id) {
              localStorage.setItem('owner_id', String(data.user.user_id));
            } else {
              localStorage.removeItem('owner_id');
            }
          }
        }
      } catch (e) {
        // ignore
      }
      navigate('/dashboard');
    } catch (err) {
      setErrors({ auth: err.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!validateForgotPasswordForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual password reset API call here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      // Show success message
      setErrors({
        success: 'Password reset link sent! Please check your email.',
      });
      // Reset form
      setForgotEmail('');
    } catch (error) {
      setErrors({
        forgotEmail: 'Failed to send reset link. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 px-4 py-12">
     <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">

      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15),transparent)]" />
      {/* Decorative gradients */}
      <div className="absolute right-0 top-1/4 h-96 w-96 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-[100px] rounded-full" />
      <div className="absolute left-0 bottom-1/4 h-96 w-96 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-[100px] rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl"
        className="relative w-full max-w-md space-y-8 rounded-2xl bg-slate-900/50 p-8 shadow-xl backdrop-blur-xl ring-1 ring-slate-700/50"
      >
        {/* <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-dark">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-dark/60">
            Sign in to your account to continue
          </p>
        </div> */}

         <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">
            Welcome <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Back</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your account to continue
          </p>
        </div>





        {/* <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.auth && (
            // <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
            //   {errors.auth}
            // </div>
             <div className="rounded-lg bg-red-900/20 border border-red-500/50 p-4 text-sm text-red-400 backdrop-blur-sm">
              {errors.auth}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dark/70"
              >
                Email Address
              </label>
              <div className="relative mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border ${
                    errors.email
                      ? 'border-red-500 bg-red-50'
                      : 'border-dark/10 bg-white/50'
                  } px-4 py-3 pl-11 text-dark placeholder-dark/50 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                />
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark/40" />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-dark/70"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border ${
                    errors.password
                      ? 'border-red-500 bg-red-50'
                      : 'border-dark/10 bg-white/50'
                  } px-4 py-3 pr-12 text-dark placeholder-dark/50 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/50 hover:text-dark"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Forgot your password?
            </button>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            <LogIn className="h-5 w-5" />
            <span className='font-bold'>{isLoading ? 'Logging in...' : 'Log In'}</span>
          </Button>
        </form> */}


          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Admin / Staff toggle (keeps visual design minimal and consistent) */}
            <div className="flex gap-8 mb-4 items-end">
              <button
                type="button"
                onClick={() => {
                  setLoginType('user');
                  setErrors({});
                  setFormData((p) => ({ ...p, phone: '', password: '' }));
                }}
                aria-pressed={loginType === 'user'}
                className={
                  loginType === 'user'
                    ? 'text-lg font-semibold text-slate-100 border-b-2 border-cyan-500 pb-2 px-1'
                    : 'text-lg text-slate-400 px-1'
                }
              >
                Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginType('staff');
                  setErrors({});
                  setFormData((p) => ({ ...p, email: '', password: '' }));
                }}
                aria-pressed={loginType === 'staff'}
                className={
                  loginType === 'staff'
                    ? 'text-lg font-semibold text-slate-100 border-b-2 border-cyan-500 pb-2 px-1'
                    : 'text-lg text-slate-400 px-1'
                }
              >
                Staff
              </button>
            </div>
          {errors.auth && (
            <div className="rounded-lg bg-red-900/20 border border-red-500/50 p-4 text-sm text-red-400 backdrop-blur-sm">
              {errors.auth}
            </div>
          )}

          <div className="space-y-4">
            <div>
              {loginType === 'user' ? (
                <>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full rounded-lg border ${
                        errors.email
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-slate-700 bg-slate-800/50'
                      } px-4 py-3 pl-11 text-slate-200 placeholder-slate-400 shadow-sm transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-sm`}
                    />
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>
                </>
              ) : (
                <>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
                    Phone Number
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your 10-digit phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full rounded-lg border ${
                        errors.phone
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-slate-700 bg-slate-800/50'
                      } px-4 py-3 pl-11 text-slate-200 placeholder-slate-400 shadow-sm transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-sm`}
                    />
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                  </div>
                </>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border ${
                    errors.password
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-slate-700 bg-slate-800/50'
                  } px-4 py-3 pr-12 text-slate-200 placeholder-slate-400 shadow-sm transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Forgot your password?
            </button>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            <LogIn className="h-5 w-5" />
            <span className='font-bold'>{isLoading ? 'Logging in...' : 'Log In'}</span>
          </Button>
        </form>





      </motion.div>

      {/* Forgot Password Modal
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-dark">Reset Password</h3>
            <p className="mt-2 text-sm text-dark/60">
              Enter your email address and we'll send you a link to reset your
              password
            </p>

            {errors.success && (
              <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">
                {errors.success}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="mt-6 space-y-6">
              <div>
                <label
                  htmlFor="forgotEmail"
                  className="block text-sm font-medium text-dark/70"
                >
                  Email Address
                </label>
                <div className="relative mt-1">
                  <input
                    id="forgotEmail"
                    name="forgotEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={`block w-full rounded-lg border ${
                      errors.forgotEmail
                        ? 'border-red-500 bg-red-50'
                        : 'border-dark/10 bg-white/50'
                    } px-4 py-3 pl-11 text-dark placeholder-dark/50 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                  />
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark/40" />
                  {errors.forgotEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.forgotEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="bg-dark/5 text-dark hover:bg-dark/10"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}; */}

 {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl bg-slate-900/50 p-8 shadow-xl backdrop-blur-xl ring-1 ring-slate-700/50"
          >
            <h3 className="text-2xl font-bold text-slate-100">Reset Password</h3>
            <p className="mt-2 text-sm text-slate-400">
              Enter your email address and we'll send you a link to reset your
              password
            </p>

            {errors.success && (
              <div className="mt-4 rounded-lg bg-green-900/20 border border-green-500/50 p-4 text-sm text-green-400 backdrop-blur-sm">
                {errors.success}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="mt-6 space-y-6">
              <div>
                <label
                  htmlFor="forgotEmail"
                  className="block text-sm font-medium text-slate-300"
                >
                  Email Address
                </label>
                <div className="relative mt-1">
                  <input
                    id="forgotEmail"
                    name="forgotEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={`block w-full rounded-lg border ${
                      errors.forgotEmail
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-slate-700 bg-slate-800/50'
                    } px-4 py-3 pl-11 text-slate-200 placeholder-slate-400 shadow-sm transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-sm`}
                  />
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  {errors.forgotEmail && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.forgotEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-slate-950 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="bg-slate-800 text-slate-200 hover:bg-slate-700 ring-1 ring-slate-700/50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
