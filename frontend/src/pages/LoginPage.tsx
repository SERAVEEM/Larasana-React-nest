import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ASSETS } from '../utils/assets';
import '../style/auth.css';
import { client } from '../api/client';
import { Meta } from '../components/Meta';
import { showAlert as _showAlert } from '../utils/alerts'; 
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await client.post('/auth/login', { email, password });
      localStorage.setItem('larasana_auth_token', res.data.tokens.accessToken);
      localStorage.setItem('larasana_user', JSON.stringify(res.data.user));
      if (res.data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Email atau password salah';
      setError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await client.post('/auth/google', { idToken: response.credential });
      localStorage.setItem('larasana_auth_token', res.data.tokens.accessToken);
      localStorage.setItem('larasana_user', JSON.stringify(res.data.user));
      if (res.data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Google login failed, please try again.';
      setError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Meta title="Login Larasana">
      <div className="auth-page">
        <div className="auth-panel auth-panel--form">
          <Link to="/" className="auth-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="auth-form-container">
            <h1 className="auth-heading">Welcome Back</h1>
            <p className="auth-subheading">Sign in to your profile where your curated collection is waiting for you</p>
            {error && (
              <div
                className="auth-error-banner"
                style={{
                  color: '#ff6b6b',
                  marginBottom: '1.5rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem'
                }}
              >
                {error}
              </div>
            )}
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-password">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path
                          strokeLinecap="round"
                          d="M3 3l18 18M10.477 10.477A3 3 0 0013.523 13.523M7.366 7.366A7.966 7.966 0 004 12c1.756 3.352 5.147 5.5 8 5.5a7.93 7.93 0 003.497-.804M9.5 4.78A7.97 7.97 0 0112 4.5c4 0 7.5 3.5 8 7.5a8.05 8.05 0 01-1.635 3.865"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path
                          strokeLinecap="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-btn" id="login-submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register" className="auth-switch__link">
                Register
              </Link>
            </p>
            <div className="auth-divider">
              <span className="auth-divider__line" />
              <span className="auth-divider__text">or continue with</span>
              <span className="auth-divider__line" />
            </div>
            <div className="auth-social">
              <GoogleLoginButton onSuccess={handleGoogleCallback} />
            </div>
          </div>
        </div>
        <div className="auth-panel auth-panel--image">
          <img src={ASSETS.loginRegister.bg} alt="Larasana fashion" className="auth-image" />
          <div className="auth-image-overlay">
            <span className="auth-brand">LARASANA</span>
            <div className="auth-image-caption">
              <h2 className="auth-image-caption__title">Ancronic Vest</h2>
              <p className="auth-image-caption__sub">Art of Korean kimono</p>
            </div>
          </div>
        </div>
      </div>
    </Meta>
  );
}
