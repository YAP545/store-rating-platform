import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Toast from '../components/common/Toast';
import { AuthContext } from '../context/AuthContext';

const DashboardLayout = () => {
  const { toast } = useContext(AuthContext);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />

      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
            minWidth: 0,
          }}
        >
          <Outlet />
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}
    </div>
  );
};

export default DashboardLayout;