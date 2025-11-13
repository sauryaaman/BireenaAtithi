// import { useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { Menu, X } from 'lucide-react';
// import { Button } from '../../components/ui';
// import { motion, AnimatePresence } from 'framer-motion';
// import logo from '../../../public/logo.png';

// const navigation = [
//   { name: 'Home', href: '/' },
//   { name: 'About', href: '/about' },
//   { name: 'Features', href: '/features' },
//   { name: 'Pricing', href: '/pricing' },
//   { name: 'Contact', href: '/contact' },
// ];

// export const Header = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [lastScrollY, setLastScrollY] = useState(0);
//   const [isVisible, setIsVisible] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Initialize auth state from localStorage token
//     const token = localStorage.getItem('token');
//     setIsAuthenticated(!!token);

//     // Listen for login/logout in other tabs
//     const handleStorage = (e) => {
//       if (e.key === 'token') {
//         setIsAuthenticated(!!e.newValue);
//       }
//     };
//     window.addEventListener('storage', handleStorage);

//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;

//       // Show/hide header based on scroll direction
//       if (currentScrollY > lastScrollY && currentScrollY > 80) {
//         setIsVisible(false); // Scrolling down & past header
//       } else {
//         setIsVisible(true); // Scrolling up
//       }

//       // Add shadow when scrolled
//       setIsScrolled(currentScrollY > 0);
//       setLastScrollY(currentScrollY);
//     };
//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//       window.removeEventListener('storage', handleStorage);
//     };
//   }, [lastScrollY]);

//   const handleLogout = () => {
//     // Remove token and update UI
//     localStorage.removeItem('token');
//     setIsAuthenticated(false);
//     // navigate to login page (replace so back button doesn't return to protected page)
//     try {
//       navigate('/login', { replace: true });
//     } catch (e) {
//       // If for some reason router navigation fails (rare), fallback to full reload
//       window.location.href = '/login';
//     }
//     // close mobile menu if open
//     setIsOpen(false);
//   };

//   return (
//     <motion.header
//       initial={{ y: 0 }}
//       animate={{
//         y: isVisible ? 0 : -100,
//         boxShadow: isScrolled
//           ? '0 10px 30px -10px rgba(0,0,0,0.1)'
//           : '0 2px 10px rgba(0,0,0,0.05)',
//       }}
//       transition={{ duration: 0.3 }}
//       className={`fixed left-0 right-0 top-0 z-50 bg-white/95 backdrop-blur-sm transition-all ${
//         isScrolled ? 'border-b border-gray-100 bg-white/95' : 'bg-white'
//       }`}
//     >
//       <nav className="container py-2 md:py-3">
//         <div className="flex items-center justify-between">
//           {/* Logo */}
//           <Link to="/" className="flex items-center py-2">
//             <img
//               src={logo}
//               alt="BIREENA अतिथि"
//               className="h-10 w-auto object-cover transition-transform hover:scale-105 "
//             />
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden items-center gap-8 md:flex">
//             {navigation.map((item) => (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={`text-lg font-bold transition-colors hover:text-primary ${
//                   location.pathname === item.href ? 'text-primary' : 'text-dark'
//                 }`}
//               >
//                 {item.name}
//               </Link>
//             ))}
//             {isAuthenticated && (
//               <Link
//                 to="/dashboard"
//                 className={`text-lg font-bold transition-colors hover:text-primary ${
//                   location.pathname === '/dashboard' ? 'text-primary' : 'text-dark'
//                 }`}
//                 onClick={() => { /* allow normal navigation */ }}
//               >
//                 Dashboard
//               </Link>
//             )}
//           </div>

//           {/* Auth Button */}
//           <div className="hidden items-center gap-4 md:flex">
//             {isAuthenticated ? (
//               <Button
//                 onClick={handleLogout}
//                 variant="ghost"
//                 className="bg-red-100 p-3 px-4 font-bold text-primary transition-colors duration-500 ease-in-out hover:bg-primary hover:text-white"
//               >
//                 Logout
//               </Button>
//             ) : (
//               <Button
//                 asChild
//                 variant="ghost"
//                 className="bg-red-100 p-3 px-4 font-bold text-primary transition-colors duration-500 ease-in-out hover:bg-primary hover:text-white"
//               >
//                 <Link to="/login">Login</Link>
//               </Button>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="rounded-lg p-1 hover:bg-gray-100 md:hidden"
//             onClick={() => setIsOpen(!isOpen)}
//             aria-label="Toggle menu"
//           >
//             {isOpen ? (
//               <X className="h-6 w-6 text-primary" />
//             ) : (
//               <Menu className="h-6 w-6 text-dark hover:text-primary" />
//             )}
//           </button>
//         </div>

//         {/* Mobile Navigation */}
//         <AnimatePresence>
//           {isOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.2 }}
//               className="absolute left-0 right-0 top-full z-20 border-b border-t border-primary/10 bg-white/95 backdrop-blur-md md:hidden"
//             >
//               <div className="container py-4">
//                 <div className="flex flex-col gap-4">
//                   {navigation.map((item) => (
//                     <Link
//                       key={item.name}
//                       to={item.href}
//                       className={`text-sm font-medium transition-colors hover:text-primary ${
//                         location.pathname === item.href
//                           ? 'text-primary'
//                           : 'text-dark'
//                       }`}
//                       onClick={() => setIsOpen(false)}
//                     >
//                       {item.name}
//                     </Link>
//                   ))}

//                   {isAuthenticated ? (
//                     <Button
//                       onClick={() => { handleLogout(); setIsOpen(false); }}
//                       asChild={false}
//                       variant="ghost"
//                       className="justify-start"
//                     >
//                       <span>Logout</span>
//                     </Button>
//                   ) : (
//                     <Button asChild variant="ghost" className="justify-start">
//                       <Link to="/login" onClick={() => setIsOpen(false)}>
//                         Login
//                       </Link>
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </nav>
//     </motion.header>
//   );
// };


import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact', href: '/contact' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setIsScrolled(currentScrollY > 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize auth state and listen for auth changes in other tabs
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const handleStorage = (e) => {
      if (e.key === 'token') {
        setIsAuthenticated(!!e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorage);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    // Clear auth tokens and navigate to login
    try {
      localStorage.removeItem('token');
      // optionally clear user info
      localStorage.removeItem('user');
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
    // close mobile menu
    setIsOpen(false);
    // navigate to login page
    try {
      navigate('/login', { replace: true });
    } catch (e) {
      window.location.href = '/login';
    }
  };

  return (
    <header
      // style={{
      //   transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      //   transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      // }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/5 border-b border-cyan-500/10'
          : 'bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-transparent backdrop-blur-md'
      }`}
    >
      {/* Animated gradient line at top */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      
      {/* Glow effect */}
      {isScrolled && (
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
      )}

      <nav className="container mx-auto px-4 py-2 md:py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo with glow effect */}
          <Link to="/" className="group relative flex items-center gap-2 py-1">
            <div className="flex">
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-300 font-devanagari">
                BIREENAअतिथि
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            {navigation.map((item, idx) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group relative px-5 py-2.5 transition-all duration-300 font-devanagari"
                >
                  {/* Hover background */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : ''
                  }`} />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                  )}
                  
                  <span className={`relative text-sm font-bold tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'
                      : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.name}
                  </span>
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                </Link>
              );
            })}
            {/* Insert Dashboard link after Contact if authenticated */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="group relative px-5 py-2.5 transition-all duration-300 font-devanagari"
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${location.pathname === '/dashboard' ? 'opacity-100' : ''}`} />
                {location.pathname === '/dashboard' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                )}
                <span className={`relative text-sm font-bold tracking-wide transition-all duration-300 ${location.pathname === '/dashboard' ? 'bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent' : 'text-gray-300 group-hover:text-white'}`}>
                  Dashboard
                </span>
                <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              </Link>
            )}
          </div>

          {/* Auth Button */}
          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="group relative overflow-hidden rounded-xl px-4 py-2.5 font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-white">Logout</span>
              </button>
            ) : (
              <Link to="/login" className="group relative overflow-hidden rounded-xl px-6 py-2.5 font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                
                {/* Shine effect */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out" />
                
                {/* Glow */}
                <div className="absolute inset-0 rounded-xl bg-cyan-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                
                <span className="relative text-white flex items-center gap-2">
                  Login
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="relative rounded-xl p-2 md:hidden group overflow-hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isOpen ? (
              <X className="relative h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors group-hover:rotate-90 duration-300" />
            ) : (
              <Menu className="relative h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          style={{
            maxHeight: isOpen ? '500px' : '0',
            opacity: isOpen ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="overflow-hidden md:hidden"
        >
          <div className="relative mt-4 rounded-2xl bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-cyan-500/20 p-6 shadow-2xl shadow-cyan-500/10">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent)] rounded-2xl" />
            
              <div className="relative flex flex-col gap-3">
                   {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                    onClick={() => setIsOpen(false)}
                    className={`group relative rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
                        : 'text-gray-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-r-full" />
                    )}
                    {item.name}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-red-400 to-red-600 px-4 py-3 font-bold text-white text-center shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  <span className="relative">Logout</span>
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-bold text-white text-center shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                  <div className="absolute inset-0 translate-x-[-100%] hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700" />
                  <span className="relative">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};