import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../../public/logo.png';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state from localStorage token
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Listen for login/logout in other tabs
    const handleStorage = (e) => {
      if (e.key === 'token') {
        setIsAuthenticated(!!e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show/hide header based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false); // Scrolling down & past header
      } else {
        setIsVisible(true); // Scrolling up
      }

      // Add shadow when scrolled
      setIsScrolled(currentScrollY > 0);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorage);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    // Remove token and update UI
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // navigate to login page (replace so back button doesn't return to protected page)
    try {
      navigate('/login', { replace: true });
    } catch (e) {
      // If for some reason router navigation fails (rare), fallback to full reload
      window.location.href = '/login';
    }
    // close mobile menu if open
    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{
        y: isVisible ? 0 : -100,
        boxShadow: isScrolled
          ? '0 10px 30px -10px rgba(0,0,0,0.1)'
          : '0 2px 10px rgba(0,0,0,0.05)',
      }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 right-0 top-0 z-50 bg-white/95 backdrop-blur-sm transition-all ${
        isScrolled ? 'border-b border-gray-100 bg-white/95' : 'bg-white'
      }`}
    >
      <nav className="container py-2 md:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center py-2">
            <img
              src={logo}
              alt="BIREENA अतिथि"
              className="h-10 w-auto object-cover transition-transform hover:scale-105 "
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-lg font-bold transition-colors hover:text-primary ${
                  location.pathname === item.href ? 'text-primary' : 'text-dark'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`text-lg font-bold transition-colors hover:text-primary ${
                  location.pathname === '/dashboard' ? 'text-primary' : 'text-dark'
                }`}
                onClick={() => { /* allow normal navigation */ }}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Button */}
          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="bg-red-100 p-3 px-4 font-bold text-primary transition-colors duration-500 ease-in-out hover:bg-primary hover:text-white"
              >
                Logout
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="bg-red-100 p-3 px-4 font-bold text-primary transition-colors duration-500 ease-in-out hover:bg-primary hover:text-white"
              >
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg p-1 hover:bg-gray-100 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-dark hover:text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full z-20 border-b border-t border-primary/10 bg-white/95 backdrop-blur-md md:hidden"
            >
              <div className="container py-4">
                <div className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        location.pathname === item.href
                          ? 'text-primary'
                          : 'text-dark'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {isAuthenticated ? (
                    <Button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      asChild={false}
                      variant="ghost"
                      className="justify-start"
                    >
                      <span>Logout</span>
                    </Button>
                  ) : (
                    <Button asChild variant="ghost" className="justify-start">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};
