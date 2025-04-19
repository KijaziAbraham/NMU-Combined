import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdScience, MdReviews, MdPerson } from 'react-icons/md';
import '../components/assets/css/Sidebar.css';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return localStorage.getItem('sidebarOpen') === 'false' ? false : !isMobile;
  });
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    localStorage.setItem('sidebarOpen', !isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth <= 768;
      setIsMobileView(mobileCheck);

      if (mobileCheck) {
        setIsOpen(false);
        localStorage.setItem('sidebarOpen', false);
      } else {
        setIsOpen(true);
        localStorage.setItem('sidebarOpen', true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-sidebar ${isOpen ? 'open' : 'collapsed'} ${isMobileView ? 'mobile-view' : ''}`}>
      <div className="sidebar-header">
        <h5>
          <span className="logo-icon">P</span>
          {isOpen && !isMobileView && 'PrototypeHub'}
        </h5>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <ul className="sidebar-menu">
        {[
          { path: '/dashboard', icon: <MdDashboard />, text: 'Dashboard' },
          { path: '/prototypes', icon: <MdScience />, text: 'My Prototypes' },
          { path: '/reviews', icon: <MdReviews />, text: 'Reviews' },
          { path: '/profile', icon: <MdPerson />, text: 'Profile' },
        ].map((item) => (
          <li key={item.path}>
            <button
              className={`menu-item ${location.pathname === item.path ? 'active-link' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className="menu-item-content">
                <span className="icon">{item.icon}</span>
                {isOpen && !isMobileView && <span className="menu-text">{item.text}</span>}
                {!isOpen && <span className="tooltip">{item.text}</span>}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => navigate('/')}>
          <FaSignOutAlt />
          {isOpen && !isMobileView && 'LOGOUT'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;