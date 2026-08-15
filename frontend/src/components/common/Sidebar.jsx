import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Store,
  BarChart3,
  Settings,
  Scroll,
  KeyRound,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`;

  return (
    <aside className="sidebar">
      {/* ================= SYSTEM ADMIN ================= */}
      {user.role === 'SYSTEM_ADMIN' && (
        <>
          <div className="sidebar-header-branding">
            <h2 className="brand-name">RateStore</h2>
            <h3 className="brand-title">Admin Dashboard</h3>
            <p className="brand-subtitle">Overview of your store rating platform</p>
          </div>

          <div className="sidebar-section-title">MAIN</div>
          <NavLink to="/admin/dashboard" className={linkClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/stores" className={linkClass}>
            <Store size={18} />
            <span>Stores</span>
          </NavLink>

          <div className="sidebar-section-title">USERS</div>
          <NavLink to="/admin/users" className={linkClass}>
            <Users size={18} />
            <span>Users</span>
          </NavLink>

          <div className="sidebar-section-title">REPORTS</div>
          <NavLink to="/admin/reports" className={linkClass}>
            <BarChart3 size={18} />
            <span>Reports</span>
          </NavLink>

          <div className="sidebar-section-title">ADMIN</div>
          <NavLink to="/admin/settings" className={linkClass}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
          <NavLink to="/admin/logs" className={linkClass}>
            <Scroll size={18} />
            <span>Logs</span>
          </NavLink>
        </>
      )}

      {/* ================= STORE OWNER ================= */}
      {user.role === 'STORE_OWNER' && (
        <>
          <div className="sidebar-header-branding">
            <h2 className="brand-name">RateStore</h2>
            <h3 className="brand-title">Store Owner</h3>
            <p className="brand-subtitle">Manage store & customer feedback</p>
          </div>

          <div className="sidebar-section-title">MAIN</div>
          <NavLink to="/owner/dashboard" className={linkClass}>
            <LayoutDashboard size={18} />
            <span>Owner Dashboard</span>
          </NavLink>

          <div className="sidebar-section-title">ACCOUNT</div>
          <NavLink to="/owner/change-password" className={linkClass}>
            <KeyRound size={18} />
            <span>Change Password</span>
          </NavLink>
        </>
      )}

      {/* ================= NORMAL USER ================= */}
      {user.role === 'NORMAL_USER' && (
        <>
          <div className="sidebar-header-branding">
            <h2 className="brand-name">RateStore</h2>
            <h3 className="brand-title">User Portal</h3>
            <p className="brand-subtitle">Discover & rate local stores</p>
          </div>

          <div className="sidebar-section-title">MAIN</div>
          <NavLink to="/user/stores" className={linkClass}>
            <Store size={18} />
            <span>Registered Stores</span>
          </NavLink>

          <div className="sidebar-section-title">ACCOUNT</div>
          <NavLink to="/user/change-password" className={linkClass}>
            <KeyRound size={18} />
            <span>Change Password</span>
          </NavLink>
        </>
      )}

      <style>{`
        /* ================================
           SIDEBAR
        ================================= */
        .sidebar {
          width: 250px;
          min-width: 250px;
          min-height: calc(100vh - 64px);
          background: #1f2937;
          border-right: 1px solid #374151;
          padding: 20px 16px 32px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-sizing: border-box;
        }

        /* ================================
           SIDEBAR BRANDING HEADER
        ================================= */
        .sidebar-header-branding {
          padding: 4px 8px 16px 8px;
          border-bottom: 1px solid #374151;
          margin-bottom: 12px;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          margin: 0;
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-title {
          font-size: 14px;
          font-weight: 700;
          color: #f3f4f6;
          margin: 4px 0 2px 0;
        }

        .brand-subtitle {
          font-size: 11px;
          color: #9ca3af;
          margin: 0;
          line-height: 1.3;
        }

        /* ================================
           SECTION TITLES
        ================================= */
        .sidebar-section-title {
          padding: 12px 12px 6px 12px;
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }

        /* ================================
           SIDEBAR LINKS
        ================================= */
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          color: #d1d5db;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid transparent;
          transition: background 0.2s ease, color 0.2s ease, border 0.2s ease;
        }

        .sidebar-link svg {
          color: #9ca3af;
          flex-shrink: 0;
          transition: color 0.2s ease;
        }

        /* HOVER */
        .sidebar-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .sidebar-link:hover svg {
          color: #ffffff;
        }

        /* ACTIVE */
        .sidebar-link.active {
          color: #ffffff;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.45),
            rgba(139, 92, 246, 0.35)
          );
          border: 1px solid rgba(129, 140, 248, 0.5);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .sidebar-link.active svg {
          color: #ffffff;
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .sidebar {
            width: 210px;
            min-width: 210px;
            padding: 16px 10px;
          }
          .sidebar-link {
            padding: 10px;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;