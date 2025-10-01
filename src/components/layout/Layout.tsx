import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUIStore } from '@/store/ui';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from '@/components/ErrorBoundary';

const Layout: React.FC = () => {
  const { isMobile, setIsMobile } = useUIStore();

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
