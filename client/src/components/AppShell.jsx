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
  Users,
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
        { label: 'User Management', path: '/warden/users', icon: Users },
        { label: 'My Profile', path: '/warden/profile', icon: User },
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
      { label: 'My Profile', path: '/student/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    if (user?.role === 'WARDEN') {
      const hostelSnippet = user?.hostelName ? ` • ${user.hostelName}` : '';
      return { label: `Warden${hostelSnippet}`, bg: '#fdecef', color: '#c8102e', border: '#fecdd3' };
    }
    if (user?.role === 'STAFF') {
      return { label: `Staff • ${user?.staffCategory || 'Maintenance'}`, bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    }
    const locSnippet = user?.hostelName ? ` • ${user.hostelName}` : (user?.roomNumber ? ` • Rm ${user.roomNumber}` : '');
    return {
      label: `Resident${locSnippet}`,
      bg: '#f3f4f6',
      color: '#374151',
      border: '#e5e7eb',
    };
  };

  const roleBadge = getRoleBadge();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f8' }}>
      {/* ── Desktop Left Sidebar ────────────────────────────────────────── */}
      <aside
        style={{
          width: '260px',
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
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
            borderBottom: '1px solid #f3f4f6',
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
              background: '#c8102e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(200, 16, 46, 0.25)',
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
                color: '#171717',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              HostelFix
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
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
              color: '#9ca3af',
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
                    color: active ? '#c8102e' : '#4b5563',
                    backgroundColor: active ? '#fdecef' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = '#f8f8f8';
                      e.currentTarget.style.color = '#171717';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  <Icon
                    size={18}
                    color={active ? '#c8102e' : '#6b7280'}
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
            borderTop: '1px solid #e5e7eb',
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
                background: '#f8f8f8',
                color: '#171717',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1px solid #e5e7eb',
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
                  color: '#171717',
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
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              color: '#6b7280',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fdecef';
              e.currentTarget.style.borderColor = '#fecdd3';
              e.currentTarget.style.color = '#c8102e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#6b7280';
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
          borderBottom: '1px solid #e5e7eb',
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
              background: '#c8102e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#171717' }}>
            HostelFix
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            padding: '0.45rem',
            background: '#f4f4f5',
            borderRadius: '6px',
            color: '#374151',
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
                      color: active ? '#c8102e' : '#4b5563',
                      backgroundColor: active ? '#fdecef' : 'transparent',
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
                background: '#fdecef',
                color: '#c8102e',
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
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div>
              {title && (
                <h1
                  style={{
                    fontSize: '1.65rem',
                    fontWeight: 700,
                    color: '#171717',
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
                    color: '#6b7280',
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
