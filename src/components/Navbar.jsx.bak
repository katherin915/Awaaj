import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Switch from '../DarkModeToggle';
import { jwtDecode } from 'jwt-decode';
import awaazLogo from '../assets/awaaz-logo.svg';
import { title } from 'process';
import { Info, Phone, Users, User, LogOut, Shield, LayoutDashboard, BookOpen, Menu, X, AlertTriangle,Vote,Map } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const rightDropdownRef = useRef(null);

  const handleNav = (cb) => {
    setMobileMenuOpen(false);
    if (cb) cb();
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    window.dispatchEvent(new Event("storage")); // Trigger storage event for other tabs/components
    setRightDropdownOpen(false);
    navigate("/");
  };

  const handleSOSClick = () => {
    navigate('/sos');
  };

  // Listen for storage changes to update token state
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates if needed
    window.addEventListener('storage-update', handleStorageChange); 
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-update', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rightDropdownRef.current && !rightDropdownRef.current.contains(event.target)) {
        setRightDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onClick = (e) => {
      if (e.target.closest('#mobile-nav-panel') || e.target.closest('#mobile-nav-toggle')) return;
      setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobileMenuOpen]);

  let isAdmin = false;
  let isOfficer = false;

  try {
    if (token) {
      const decoded = jwtDecode(token);
      isAdmin = decoded.role === 'admin';
      isOfficer = decoded.role === 'officer';
    }
  } catch (err) {
    console.error('Invalid token');
    // If token is invalid, maybe clear it?
    // localStorage.removeItem('token'); 
  }

  const navLinks = [
    {
      title: "About",
      href: "/about",
      icon: Info,
    },
    {
      title: "Contact Us",
      href: "/contact",
      icon: Phone,
    },
    {
      title: "Our contributors",
      href: "/contributors",
      icon: Users,
    },
    {
      title: "Voting System",
      href: "/voting-system",
      icon: Vote,
    },
     {
    title: "Issue Map",          // 👈 New link
    href: "/user-map",
    icon: Map,        // You can use MessageSquare or another better icon
  },
    {
    title: "Feedback",          // 👈 New link
    href: "/feedback",
    icon: AlertTriangle,        // You can use MessageSquare or another better icon
  },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-awaaj-primary/10 dark:border-awaaj-accent/20 shadow-awaaj">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-20 items-center justify-between">
          
          <div className="flex items-center">
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/'); }} 
              className="flex items-center gap-3 group"
            >
              <div className="relative flex items-center gap-3 voice-wave">
                <img 
                  src={awaazLogo} 
                  alt="Awaaz logo" 
                  className="h-14 w-14 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg" 
                />
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold text-gradient-awaaj">Awaaj</span>
                  <span className="text-xs font-medium text-awaaj-muted dark:text-gray-400">आवाज़ - Voice of People</span>
                </div>
              </div>
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((navItem) => {
              const Icon = navItem.icon;
              const isActive = location.pathname === navItem.href;
              return (
                <Link
                  key={navItem.title}
                  to={navItem.href}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'text-white bg-gradient-awaaj shadow-awaaj'
                      : 'text-gray-700 dark:text-gray-300 hover:text-awaaj-primary dark:hover:text-awaaj-accent hover:bg-awaaj-primary/5 dark:hover:bg-awaaj-accent/10'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-awaaj rounded-full animate-glow" />
                  )}
                  <Icon className={`w-4 h-4 transition-transform duration-300 relative z-10 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'
                  }`} />
                  <span className="relative z-10">{navItem.title}</span>
                </Link>
              );
            })}
          </nav>

          <button
            id="mobile-nav-toggle"
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-full bg-gradient-awaaj hover:shadow-awaaj transition-all duration-300 group"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>

          <div className="hidden lg:flex items-center gap-4">
            
            <button
              onClick={handleSOSClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 rounded-full shadow-lg hover:shadow-xl hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300 group animate-pulse-slow"
              title="Emergency SOS"
              aria-label="Emergency SOS Button"
            >
              <AlertTriangle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span>SOS</span>
            </button>

            <div className="flex items-center justify-center w-11 h-11 rounded-full glass-awaaj hover:bg-awaaj-primary/10 transition-all duration-300">
              <Switch />
            </div>

            <div className="relative" ref={rightDropdownRef}>
              <button
                onClick={() => setRightDropdownOpen(!rightDropdownOpen)}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-awaaj hover:shadow-awaaj-lg text-white transform hover:scale-105 transition-all duration-300 hover:rotate-12"
                aria-label="Open user menu"
              >
                <User className="h-5 w-5" />
              </button>

              {rightDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-3xl bg-white dark:bg-slate-900 shadow-awaaj-lg border border-awaaj-primary/20 dark:border-awaaj-accent/20 z-50 overflow-hidden animate-scale-in">
                  <div className="p-3">
                    
                    <button
                      onClick={() => { setRightDropdownOpen(false); navigate('/civic-education'); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-awaaj-primary dark:hover:text-awaaj-accent hover:bg-awaaj-primary/5 dark:hover:bg-awaaj-accent/10 rounded-2xl transition-all duration-200 group"
                    >
                      <BookOpen className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
                      <span>Civic Education & Rights</span>
                    </button>
                    
                    {!token ? (
                      <button
                        onClick={() => { setRightDropdownOpen(false); navigate('/login'); }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-bold text-white bg-gradient-awaaj hover:shadow-awaaj rounded-2xl transition-all duration-200 group mt-2"
                      >
                        <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span>Login</span>
                      </button>
                    ) : (
                      <>
                        <div className="border-t border-awaaj-primary/10 dark:border-awaaj-accent/20 my-2"></div>
                        
                        <button
                          onClick={() => { setRightDropdownOpen(false); navigate('/profile'); }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-awaaj-primary dark:hover:text-awaaj-accent hover:bg-awaaj-primary/5 dark:hover:bg-awaaj-accent/10 rounded-2xl transition-all duration-200 group"
                        >
                          <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span>Profile</span>
                        </button>
                        
                        <button
                          onClick={() => { 
                            setRightDropdownOpen(false); 
                            if (isAdmin) navigate('/admin');
                            else if (isOfficer) navigate('/officer/dashboard');
                            else navigate('/user/dashboard');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-awaaj-primary dark:hover:text-awaaj-accent hover:bg-awaaj-primary/5 dark:hover:bg-awaaj-accent/10 rounded-2xl transition-all duration-200 group"
                        >
                          {isAdmin ? (
                            <Shield className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
                          ) : (
                            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          )}
                          <span>Dashboard</span>
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-2xl transition-all duration-200 group mt-2"
                        >
                          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          <div className="lg:hidden fixed inset-x-0 top-0 z-50">
            <nav 
              id="mobile-nav-panel" 
              className="flex flex-col w-full min-h-screen bg-gradient-to-br from-white via-awaaj-light to-awaaj-primary/5 dark:from-slate-950 dark:via-slate-900 dark:to-awaaj-dark pt-24 px-6 pb-6 animate-slide-down"
            >
              <button
                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-awaaj text-white shadow-awaaj hover:shadow-awaaj-lg transition-all duration-300 hover:rotate-90"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Awaaj Logo in Mobile Menu */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-awaaj-primary/20">
                <img src={awaazLogo} alt="Awaaz logo" className="h-16 w-16 animate-float" />
                <div>
                  <h2 className="text-2xl font-display font-bold text-gradient-awaaj">Awaaj</h2>
                  <p className="text-sm text-awaaj-muted font-hindi">आवाज़ - Voice of People</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {navLinks.map((navItem) => {
                  const Icon = navItem.icon;
                  const isActive = location.pathname === navItem.href;
                  return (
                    <Link 
                      key={navItem.title}
                      to={navItem.href}
                      onClick={() => handleNav()}
                      className={`flex items-center gap-4 px-5 py-4 text-base font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                        isActive
                          ? 'text-white bg-gradient-awaaj shadow-awaaj'
                          : 'text-gray-700 dark:text-gray-300 hover:text-awaaj-primary dark:hover:text-awaaj-accent hover:bg-awaaj-primary/10 dark:hover:bg-awaaj-accent/10'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-awaaj rounded-2xl animate-glow" />
                      )}
                      <Icon className={`w-6 h-6 transition-transform duration-300 relative z-10 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'
                      }`} />
                      <span className="relative z-10">{navItem.title}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-3 flex-1">
                {token && (
                  <>
                    <button
                      onClick={() => handleNav(() => navigate('/profile'))}
                      className="w-full flex items-center gap-4 px-5 py-4 text-base font-bold text-gray-700 dark:text-gray-300 glass-awaaj hover:bg-awaaj-primary/10 dark:hover:bg-awaaj-accent/10 rounded-2xl transition-all duration-300 group"
                    >
                      <User className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => handleNav(() => {
                        if (isAdmin) navigate('/admin');
                        else if (isOfficer) navigate('/officer/dashboard');
                        else navigate('/user/dashboard');
                      })}
                      className="w-full flex items-center gap-4 px-5 py-4 text-base font-bold text-gray-700 dark:text-gray-300 glass-awaaj hover:bg-awaaj-primary/10 dark:hover:bg-awaaj-accent/10 rounded-2xl transition-all duration-300 group"
                    >
                      {isAdmin ? (
                        <Shield className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                      ) : (
                        <LayoutDashboard className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      )}
                      <span>Dashboard</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleNav(handleSOSClick)}
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 text-base font-bold text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300 group animate-pulse-slow"
                >
                  <AlertTriangle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Emergency SOS</span>
                </button>

                {token ? (
                  <button
                    onClick={() => handleNav(handleLogout)}
                    className="w-full flex items-center justify-center gap-4 px-5 py-4 text-base font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNav(() => navigate('/login'))}
                      className="w-full flex items-center justify-center gap-4 px-5 py-4 text-base font-bold text-awaaj-primary dark:text-awaaj-accent border-2 border-awaaj-primary dark:border-awaaj-accent hover:bg-awaaj-primary/10 dark:hover:bg-awaaj-accent/10 rounded-2xl transition-all duration-300 group"
                    >
                      <User className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Login</span>
                    </button>
                    
                    <button
                      onClick={() => handleNav(() => navigate('/signup'))}
                      className="w-full flex items-center justify-center gap-4 px-5 py-4 text-base font-bold text-white bg-gradient-awaaj hover:shadow-awaaj-lg rounded-2xl shadow-awaaj transform hover:scale-105 transition-all duration-300 group"
                    >
                      <User className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Get Started</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 pt-6 mt-auto border-t border-awaaj-primary/20">
                <div className="flex items-center justify-center w-14 h-14 rounded-full glass-awaaj">
                  <Switch />
                </div>
                <p className="text-xs text-awaaj-muted">© 2025 Awaaj Platform</p>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
