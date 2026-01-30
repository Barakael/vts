import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area - offset by sidebar width on desktop */}
      <div style={{ marginLeft: '256px' }}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main style={{ padding: '24px 32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
