import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import registerImg from '../assets/images/login-register/33d7e2776de4144419b5c6d0a2dc6544-Photoroom.png';
import '../style/auth.css';
import { client } from '../api/client';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    setError('');

    try {
      const res = await client.post('/auth/register', { name, email, password });
      localStorage.setItem('larasana_auth_token', res.data.tokens.accessToken);
      localStorage.setItem('larasana_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
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
      navigate('/');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Google Register gagal. Silakan coba lagi.';
      setError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel--form">
        <Link to="/" className="auth-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="auth-form-container">
          <h1 className="auth-heading auth-heading--join">Join the Circle</h1>
          <p className="auth-subheading">Create an account for a more personalized shopping experience</p>

          {error && (
            <div
              className="auth-error-banner"
              style={{ color: '#ff6b6b', marginBottom: '1.5rem', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}
            >
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="register-name">Name</label>
              <input
                id="register-name"
                type="text"
                className="auth-input"
                placeholder="Enter your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-email">Email</label>
              <input
                id="register-email"
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
              <label className="auth-label" htmlFor="register-password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  autoComplete="new-password"
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
                      <path strokeLinecap="round" d="M3 3l18 18M10.477 10.477A3 3 0 0013.523 13.523M7.366 7.366A7.966 7.966 0 004 12c1.756 3.352 5.147 5.5 8 5.5a7.93 7.93 0 003.497-.804M9.5 4.78A7.97 7.97 0 0112 4.5c4 0 7.5 3.5 8 7.5a8.05 8.05 0 01-1.635 3.865"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                      <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn" id="register-submit" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch__link">Login</Link>
          </p>

          <div className="auth-divider">
            <span className="auth-divider__line" />
            <span className="auth-divider__text">or continue with</span>
            <span className="auth-divider__line" />
          </div>

          <div className="auth-social">
            <GoogleLoginButton onSuccess={handleGoogleCallback} />
            <button className="auth-social__btn" id="register-apple">
              <svg viewBox="0 0 24 24" className="auth-social__icon" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>
          </div>
        </div>
      </div>

      <div className="auth-panel auth-panel--image">
        <img src={registerImg} alt="Larasana fashion" className="auth-image" />
        <div className="auth-image-overlay">
          <span className="auth-brand">LARASANA</span>
          <div className="auth-image-caption">
            <h2 className="auth-image-caption__title">Ancronic Vest</h2>
            <p className="auth-image-caption__sub">Art of andrian Kimori</p>
          </div>
        </div>
      </div>
    </div>
  );
}
