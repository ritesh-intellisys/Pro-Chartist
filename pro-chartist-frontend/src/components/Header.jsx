import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSettings, FiSun, FiMoon, FiUser, FiLock, FiMenu, FiX } from 'react-icons/fi';
import clsx from 'clsx';
import './Header.css';
import Logo from '../assets/Logo22.png'; 

function Header({ theme, toggleTheme, isAdminAuthenticated, setIsAdminAuthenticated }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState(() => localStorage.getItem('userType') || 'user');
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserTypeSwitch = (type) => {
    setUserType(type);
    localStorage.setItem('userType', type);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);

    if (type === 'admin') {
      if (isAdminAuthenticated) {
        navigate('/admin');
      } else {
        navigate('/admin/login');
      }
    } else {
      if (isAdminAuthenticated) {
        navigate('/');
      } else {
        navigate('/login');
      }
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      // Clear admin authentication
      setIsAdminAuthenticated(false);
      localStorage.removeItem('isAdminAuthenticated');
      
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate(userType === 'admin' ? '/admin/login' : '/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link 
        to="/" 
        className={clsx('nav-link', { active: isActive('/') })}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Bot
      </Link>
      <Link 
        to="/learning" 
        className={clsx('nav-link', { active: isActive('/learning') })}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Learning
      </Link>
      <Link 
        to="/pro-traders" 
        className={clsx('nav-link', { active: isActive('/pro-traders') })}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Pro Trader's
      </Link>
      <Link 
        to="/upgrade" 
        className="upgrade-link"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Upgrade
      </Link>
    </>
  );

  return (
    <header className="header">
      <div className="logo">
        <img src={Logo} alt="Logo" />
        {/* <Link to="/">Pro Chartist</Link> */}
      </div>

      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Desktop navigation */}
      <nav className="nav-menu desktop">
        <NavLinks />
        <div className="settings-dropdown" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="settings-btn"
          >
            <FiSettings />
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="user-type-switch">
                <button
                  className={clsx('switch-btn', { active: userType === 'user' })}
                  onClick={() => handleUserTypeSwitch('user')}
                >
                  <FiUser />
                  <span>User</span>
                </button>
                <button
                  className={clsx('switch-btn', { active: userType === 'admin' })}
                  onClick={() => handleUserTypeSwitch('admin')}
                >
                  <FiLock />
                  <span>Admin</span>
                </button>
              </div>
              <button onClick={toggleTheme} className="theme-toggle">
                {theme === 'light' ? (
                  <>
                    <FiMoon className="theme-icon" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <FiSun className="theme-icon" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
              {isAdminAuthenticated ? (
                <button onClick={handleLogout} className="dropdown-item">
                  <FiUser className="theme-icon" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link 
                  to={userType === 'admin' ? '/admin/login' : '/login'} 
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiUser className="theme-icon" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <nav className="nav-menu mobile">
          <NavLinks />
          <div className="mobile-settings">
            <div className="user-type-switch">
              <button
                className={clsx('switch-btn', { active: userType === 'user' })}
                onClick={() => handleUserTypeSwitch('user')}
              >
                <FiUser />
                <span>User</span>
              </button>
              <button
                className={clsx('switch-btn', { active: userType === 'admin' })}
                onClick={() => handleUserTypeSwitch('admin')}
              >
                <FiLock />
                <span>Admin</span>
              </button>
            </div>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'light' ? (
                <>
                  <FiMoon className="theme-icon" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <FiSun className="theme-icon" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
            {isAdminAuthenticated ? (
              <button onClick={handleLogout} className="dropdown-item">
                <FiUser className="theme-icon" />
                <span>Logout</span>
              </button>
            ) : (
              <Link 
                to={userType === 'admin' ? '/admin/login' : '/login'} 
                className="dropdown-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUser className="theme-icon" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;