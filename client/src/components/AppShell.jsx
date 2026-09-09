import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Utensils,
  PlusCircle,
  Building2,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Wrench,
} from 'lucide-react';

export default function AppShell({ children, title, subtitle, actions }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role-based navigation configs
  const getNavItems = () => {
    if (user?.role === 'WARDEN') {
      return [
        { label: 'Dashboard', path: '/warden/dashboard', icon: LayoutDashboard },
        { label: 'All Complaints', path: '/warden/complaints', icon: ClipboardList },
        { label: 'Mess Admin', path: '/warden/mess', icon: Utensils },
      ];
    }
    if (user?.role === 'STAFF') {
      return [
        { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'My Work Tasks', path: '/staff/complaints', icon: Wrench },
      ];
    }
    // Default: STUDENT
    return [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Complaints', path: '/student/complaints', icon: ClipboardList },
      { label: 'New Complaint', path: '/student/complaints/new', icon: PlusCircle },
      { label: 'Mess Menu', path: '/student/mess', icon: Utensils },
    ];
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    if (user?.role === 'WARDEN') {
      return { label: 'Warden Admin', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
    }
    if (user?.role === 'STAFF') {
      return { label: `Staff • ${user?.staffCategory || 'Maintenance'}`, bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    }
    return {
      label: `Resident • ${user?.roomNumber ? `Rm ${user.roomNumber}` : 'Student'}`,
      bg: '#eff6ff',
      color: '#1d4ed8',
      border: '#bfdbfe',
    };
  };

  const roleBadge = getRoleBadge();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* ── Desktop Left Sidebar ────────────────────────────────────────── */}
      <aside
        style={{
          width: '260px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 30,
        }}
        className="app-sidebar-desktop"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)',
              flexShrink: 0,
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              HostelFix
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Smart Hostel Platform
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ padding: '1.25rem 0.85rem', flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 0.65rem 0.65rem',
            }}
          >
            Navigation
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === location.pathname ||
                (item.path !== '/' && location.pathname.startsWith(item.path) && item.path !== '/student/complaints');
              const isExactActive = location.pathname === item.path;
              const active = item.path === '/student/complaints' ? isExactActive : isActive;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#4f46e5' : '#475569',
                    backgroundColor: active ? '#eef2ff' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  <Icon
                    size={18}
                    color={active ? '#4f46e5' : '#64748b'}
                    strokeWidth={active ? 2.25 : 2}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.85rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
            </div>

            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'User'}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  display: 'inline-block',
                  color: roleBadge.color,
                  backgroundColor: roleBadge.bg,
                  border: `1px solid ${roleBadge.border}`,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                  marginTop: '0.15rem',
                }}
              >
                {roleBadge.label}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.55rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.borderColor = '#fca5a5';
              e.currentTarget.style.color = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header & Drawer ──────────────────────────────────── */}
      <div
        className="app-mobile-topbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            HostelFix
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            padding: '0.45rem',
            background: '#f1f5f9',
            borderRadius: '6px',
            color: '#475569',
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 45,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              bottom: 0,
              width: '260px',
              background: '#ffffff',
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#4f46e5' : '#475569',
                      backgroundColor: active ? '#eef2ff' : 'transparent',
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                borderRadius: '6px',
                background: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginTop: 'auto',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <main
        className="app-main-content"
        style={{
          flex: 1,
          marginLeft: '260px',
          padding: '2rem 2.5rem',
          maxWidth: '1380px',
          width: '100%',
        }}
      >
        {/* Page Header Bar */}
        {(title || subtitle || actions) && (
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div>
              {title && (
                <h1
                  style={{
                    fontSize: '1.65rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.25,
                    margin: 0,
                  }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: '0.35rem 0 0',
                    lineHeight: 1.4,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {actions}
              </div>
            )}
          </header>
        )}

        {/* Page Content */}
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* Responsive Media Queries Style Tag */}
      <style>{`
        @media (max-width: 900px) {
          .app-sidebar-desktop {
            display: none !important;
          }
          .app-mobile-topbar {
            display: flex !important;
          }
          .app-main-content {
            margin-left: 0 !important;
            padding: 5rem 1rem 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
