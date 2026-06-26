import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem('larasana_auth_token');
  const userStr = localStorage.getItem('larasana_user');
  
  if (!token || !userStr) {
    // Redirect to login if not authenticated at all
    return <Navigate to="/login" replace />;
  }

  let user: { role?: string };
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    // If parsing fails, treat as not authenticated
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    // Return a styled Unauthorized / 403 Access Denied page
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
        color: '#1e293b',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '4rem', margin: '0 0 1rem', color: '#dc2626', fontWeight: 800 }}>403</h1>
        <h2 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem', fontWeight: 700 }}>Access Denied / Unauthorized</h2>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '500px', margin: '0 0 2rem', lineHeight: 1.6 }}>
          You do not have administrative privileges to access this area. If you believe this is an error, please contact your administrator.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#fff',
            backgroundColor: '#0f172a',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
