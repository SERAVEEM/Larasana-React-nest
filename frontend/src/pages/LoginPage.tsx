import { useState } from 'react';
import { Link } from 'react-router-dom';
import loginImg from '../assets/images/Login Regsiter/33d7e2776de4144419b5c6d0a2dc6544-Photoroom.png';
import '../style/auth.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-page">


      <div className="auth-panel auth-panel--form">

        <Link to="/" className="auth-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="auth-form-container">

          {/* Title */}
          <h1 className="auth-heading">Welcome Back</h1>
          <p className="auth-subheading">Sign in to your Larasana account</p>

  
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="auth-input"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
              <a href="#" className="auth-forgot">Forgot password?</a>
            </div>

            <button type="submit" className="auth-btn" id="login-submit">
              Sign In
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch__link">Register</Link>
          </p>

          <div className="auth-divider">
            <span className="auth-divider__line" />
            <span className="auth-divider__text">or continue with</span>
            <span className="auth-divider__line" />
          </div>

          <div className="auth-social">
            <button className="auth-social__btn" id="login-google">
              <svg viewBox="0 0 24 24" className="auth-social__icon">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button className="auth-social__btn" id="login-apple">
              <svg viewBox="0 0 24 24" className="auth-social__icon" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

        </div>
      </div>

 


      <div className="auth-panel auth-panel--image">
        <img src={loginImg} alt="Larasana fashion" className="auth-image" />
        <div className="auth-image-overlay">
          <span className="auth-brand">LARASANA</span>
          <div className="auth-image-caption">
            <h2 className="auth-image-caption__title">Ancronic Vest</h2>
            <p className="auth-image-caption__sub">Art of Korean kimono</p>
          </div>
        </div>
      </div>

    </div>
  );
}
