import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        padding: '0 16px'
      }}>
        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onMenuClick}
            className="lg:hidden"
            style={{
              padding: '8px',
            color: '#94a3b8',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="hidden sm:block">
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
              Vehicle Tracking System
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications */}
          <button style={{
            position: 'relative',
            padding: '8px',
            color: '#94a3b8',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%'
            }}></span>
          </button>

          {/* User menu */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '12px',
            borderLeft: '1px solid #1e293b'
          }}>
            <div className="hidden sm:block" style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{user?.email || 'user@example.com'}</p>
            </div>
            <div style={{ position: 'relative' }} className="group">
              <button style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(to bottom right, #65a30d, #84cc16)',
                color: 'white',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
              
              {/* Dropdown */}
              <div 
                className="opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '192px',
                  padding: '8px 0',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 200ms'
                }}
              >
                <a
                  href="/profile"
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#374151',
                    textDecoration: 'none'
                  }}
                >
                  Your Profile
                </a>
                <a
                  href="/settings"
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#374151',
                    textDecoration: 'none'
                  }}
                >
                  Settings
                </a>
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                <button
                  onClick={logout}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#dc2626',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
