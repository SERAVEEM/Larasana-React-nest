import { useState } from 'react';
import { Link } from 'react-router-dom';
import registerImg from '../assets/images/Login Regsiter/33d7e2776de4144419b5c6d0a2dc6544-Photoroom.png';
import '../style/auth.css';

export default function RegisterPage() {
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

          <h1 className="auth-heading auth-heading--join">Join the Circle</h1>
          <p className="auth-subheading">Create an account for a more personalized shopping experience</p>

        
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-name">Name</label>
              <input
                id="register-name"
                type="text"
                className="auth-input"
                placeholder="Enter your name"
                autoComplete="name"
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

            <button type="submit" className="auth-btn" id="register-submit">
              Sign Up
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch__link">Login</Link>
          </p>

       
          <div className="auth-divider">
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
