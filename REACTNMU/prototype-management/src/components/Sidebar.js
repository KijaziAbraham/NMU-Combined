import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdScience, MdReviews, MdPerson } from 'react-icons/md';
import '../components/assets/css/Sidebar.css'; // Keep your custom styles
import { FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    // Check screen width on initial load
    const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
    return localStorage.getItem('sidebarOpen') === 'false' ? false : !isMobile;
  });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    localStorage.setItem('sidebarOpen', !isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768; // Same breakpoint
      if (isMobile && isOpen) {
        setIsOpen(false);
        localStorage.setItem('sidebarOpen', false);
      } else if (!isMobile && !isOpen) {
        setIsOpen(true);
        localStorage.setItem('sidebarOpen', true);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  return (
    <div className="app">
      <div className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header p-3">

          <h5><span style={{backgroundColor:'#64A293',paddingLeft:'7px',paddingRight:'7px' , margin:'5px', color :'white' , borderRadius:'5px'}} >P</span>{isOpen ? 'PrototypeHub' : ''}</h5>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <ul className="sidebar-menu nav flex-column p-0">
          <li className="nav-item">
            <button
              className={`nav-link menu-item ${location.pathname === '/dashboard' ? 'active-link' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <div className="menu-item-content"> {/* New container for icon and text/tooltip */}
                <i className="icon"><MdDashboard /></i>
                {isOpen && <span className="menu-text">Dashboard</span>}
                {!isOpen && (
                  <span className="tooltip">
                    <span className="tooltip-icon"><MdDashboard /></span>
                    Dashboard
                  </span>
                )}
              </div>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link menu-item ${location.pathname === '/prototypes' ? 'active-link' : ''}`}
              onClick={() => navigate('/prototypes')}
            >
              <div className="menu-item-content"> {/* New container */}
                <i className="icon"><MdScience className="me-2" /></i>
                {isOpen && <span className="menu-text">My Prototypes</span>}
                {!isOpen && (
                  <span className="tooltip">
                    <span className="tooltip-icon"><MdScience /></span>
                    My Prototypes
                  </span>
                )}
              </div>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link menu-item ${location.pathname === '/reviews' ? 'active-link' : ''}`}
              onClick={() => navigate('/reviews')}
            >
              <div className="menu-item-content"> {/* New container */}
                <i className="icon"><MdReviews className="me-2" /></i>
                {isOpen && <span className="menu-text">Reviews</span>}
                {!isOpen && (
                  <span className="tooltip">
                    <span className="tooltip-icon"><MdReviews /></span>
                    Reviews
                  </span>
                )}
              </div>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link menu-item ${location.pathname === '/profile' ? 'active-link' : ''}`}
              onClick={() => navigate('/profile')}
            >
              <div className="menu-item-content"> {/* New container */}
                <i className="icon"><MdPerson className="me-2" /></i>
                {isOpen && <span className="menu-text">Profile</span>}
                {!isOpen && (
                  <span className="tooltip">
                    <span className="tooltip-icon"><MdPerson /></span>
                    Profile
                  </span>
                )}
              </div>
            </button>
          </li>
          {/* Add more sidebar items as needed */}
        </ul>
        <div className="sidebar-footer p-3">
          <button className="btn btn-outline-success w-100" onClick={() => navigate('/')}>
            <div className="menu-item-content"> {/* Consistent container for logout */}
              {isOpen ? 'LOGOUT' : (
                <span className="tooltip">
                 <MdPerson/>
                  <span className="tooltip-icon">Logout</span>
                  Logout
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;