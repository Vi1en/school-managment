import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MobileFirstLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    { 
      name: 'Add Student', 
      href: '/add-student', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    { 
      name: 'Students', 
      href: '/marks', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      name: 'Generate Marksheet', 
      href: '/generate-marksheet', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'Marksheets', 
      href: '/marksheets', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80' : 'relative flex flex-col w-80'}
          ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          transition-transform duration-300 ease-in-out
          bg-gray-900 shadow-xl
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3">
              <span className="text-black text-xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">School Management</h1>
              <p className="text-gray-400 text-xs">Admin Dashboard</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700 touch-manipulation"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={`
                group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation
                ${isActive(item.href) 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              <span className="mr-3 flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
              {isActive(item.href) && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="px-4 py-6 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-semibold">
                {admin?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {admin?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 touch-manipulation"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 touch-manipulation mr-3"
                  aria-label="Open sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Welcome back, <span className="font-medium">{admin?.name || 'Admin'}</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MobileFirstLayout;
