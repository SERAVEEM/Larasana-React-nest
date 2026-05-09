// src/pages/auth/AuthPage.tsx
// Komponen Login & Register untuk frontend TypeScript (React/Next.js)
// Sesuaikan BASE_URL dengan URL backend NestJS kamu

import React, { useState } from 'react';
import { window } from 'rxjs/internal/operators/window';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  isEmailVerified: boolean;
}

interface AuthApiResponse {
  user: UserData;
  tokens: AuthTokens;
}
interface ApiError {
  message?: string;
}

type AuthMode = 'login' | 'register';

// ----------------------------------------------------------------
// API helpers
// ----------------------------------------------------------------
const BASE_URL = 'http://localhost:3000/api/v1';

async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<AuthApiResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json() as AuthApiResponse & ApiError;

if (!res.ok) throw new Error(data.message ?? 'Registrasi gagal');
  return data as AuthApiResponse;
}

async function apiLogin(
  email: string,
  password: string,
): Promise<AuthApiResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json() as AuthApiResponse & ApiError;
  if (!res.ok) throw new Error(data.message ?? 'Login    gagal');
  return data as AuthApiResponse;
}

// ----------------------------------------------------------------
// Simpan token ke localStorage
// ----------------------------------------------------------------
function saveSession(tokens: AuthTokens, user: UserData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// ----------------------------------------------------------------
// AuthPage Component
// ----------------------------------------------------------------
const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('register');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Login form state
  const [logEmail, setLogEmail] = useState('');
  const [logPassword, setLogPassword] = useState('');
  const [logErrors, setLogErrors] = useState<Record<string, string>>({});

  // Loading & API error
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ---- Validation ----
  const validateRegister = (): boolean => {
    const errs: Record<string, string> = {};
    if (!regName.trim()) errs.name = 'Nama tidak boleh kosong';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errs.email = 'Email tidak valid';
    if (regPassword.length < 8) errs.password = 'Password minimal 8 karakter';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(regPassword))
      errs.password = 'Password harus mengandung huruf besar, huruf kecil, dan angka';
    if (regPassword !== regConfirm) errs.confirm = 'Password tidak cocok';
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateLogin = (): boolean => {
    const errs: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(logEmail)) errs.email = 'Email tidak valid';
    if (!logPassword) errs.password = 'Password tidak boleh kosong';
    setLogErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---- Handlers ----
  const handleRegister = async () => {
    if (!validateRegister()) return;
    setLoading(true);
    setApiError('');
    try {
      const data = await apiRegister(regName, regEmail, regPassword);
      saveSession(data.tokens, data.user);
      // TODO: redirect ke dashboard atau halaman utama
      alert(`Selamat datang, ${data.user.name}! Akun berhasil dibuat.`);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    setApiError('');
    try {
      const data = await apiLogin(logEmail, logPassword);
      saveSession(data.tokens, data.user);
      // TODO: redirect ke dashboard
      alert(`Selamat datang kembali, ${data.user.name}!`);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyImage = () => {
    if (imageUrl.trim()) setImagePreview(imageUrl.trim());
  };

  // ---- Styles (inline untuk portabilitas) ----
  const s = styles;

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navLogoIcon}>L</div>
          <span style={s.navLogoText}>LARASANA</span>
        </div>
        <div style={s.navLinks}>
          <a href="/" style={s.navLink}>About Us</a>
          <a href="#" style={{ ...s.navLink, color: '#e8d5a0' }}>
            {mode === 'login' ? 'Login' : 'Register'}
          </a>
          <a href="/products" style={s.navLink}>Product</a>
        </div>
      </nav>

      {/* TAB SWITCHER */}
      <div style={s.tabBar}>
        <button
          style={{ ...s.tabBtn, ...(mode === 'register' ? s.tabBtnActive : {}) }}
          onClick={() => { setMode('register'); setApiError(''); }}
        >
          Register
        </button>
        <button
          style={{ ...s.tabBtn, ...(mode === 'login' ? s.tabBtnActive : {}) }}
          onClick={() => { setMode('login'); setApiError(''); }}
        >
          Login
        </button>
      </div>

      {/* CARD */}
      <div style={s.wrapper}>
        <div style={s.card}>

          {/* FORM SIDE */}
          <div style={s.formSide}>
            {apiError && <div style={s.apiError}>{apiError}</div>}

            {mode === 'register' ? (
              <>
                <div style={s.formTitle}>Bergabung</div>
                <div style={s.formSubtitle}>Daftarkan akun Anda</div>

                <FormField
                  label="Nama Lengkap"
                  type="text"
                  value={regName}
                  onChange={setRegName}
                  placeholder="Masukkan nama lengkap"
                  error={regErrors.name}
                />
                <FormField
                  label="Email"
                  type="email"
                  value={regEmail}
                  onChange={setRegEmail}
                  placeholder="Masukkan email"
                  error={regErrors.email}
                />
                <FormField
                  label="Password"
                  type="password"
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="Minimal 8 karakter"
                  error={regErrors.password}
                />
                <FormField
                  label="Konfirmasi Password"
                  type="password"
                  value={regConfirm}
                  onChange={setRegConfirm}
                  placeholder="Ulangi password"
                  error={regErrors.confirm}
                />

                <button style={s.btnPrimary} onClick={handleRegister} disabled={loading}>
                  {loading ? 'Memproses...' : 'Daftar Sekarang'}
                </button>
                <div style={s.formFooter}>
                  Sudah punya akun?{' '}
                  <span style={s.link} onClick={() => setMode('login')}>Login</span>
                </div>
              </>
            ) : (
              <>
                <div style={s.formTitle}>Selamat Datang</div>
                <div style={s.formSubtitle}>Masuk ke akun Anda</div>

                <FormField
                  label="Email"
                  type="email"
                  value={logEmail}
                  onChange={setLogEmail}
                  placeholder="Masukkan email"
                  error={logErrors.email}
                />
                <FormField
                  label="Password"
                  type="password"
                  value={logPassword}
                  onChange={setLogPassword}
                  placeholder="Masukkan password"
                  error={logErrors.password}
                />

                <div style={{ textAlign: 'right', marginBottom: 20 }}>
                  <span style={{ ...s.link, fontSize: 11 }}>Lupa password?</span>
                </div>

                <button style={s.btnPrimary} onClick={handleLogin} disabled={loading}>
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
                <div style={s.formFooter}>
                  Belum punya akun?{' '}
                  <span style={s.link} onClick={() => setMode('register')}>Daftar</span>
                </div>
              </>
            )}
          </div>

          {/* IMAGE SIDE */}
          <div style={s.imageSide}>
            <div style={s.patternBg} />
            <div style={s.cornerTR} />
            <div style={s.cornerBL} />

            {imagePreview ? (
              <img src={imagePreview} alt="Penenun Lombok" style={s.heroImg} />
            ) : (
              <div style={s.urlWrapper}>
                <input
                  style={s.urlInput}
                  type="text"
                  placeholder="Paste URL gambar di sini..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <button style={s.urlBtn} onClick={applyImage}>
                  Terapkan Gambar
                </button>
              </div>
            )}

            <div style={s.overlayText}>
              <div style={s.overlayTitle}>Tenun Lombok,{'\n'}Warisan yang Hidup</div>
              <div style={s.overlaySubtitle}>Platform digital pemberdayaan penenun</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------
// FormField sub-component
// ----------------------------------------------------------------
interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label, type, value, onChange, placeholder, error,
}) => (
  <div style={{ marginBottom: 22 }}>
    <label style={{
      display: 'block', fontSize: 11, letterSpacing: 2,
      textTransform: 'uppercase', color: '#666', marginBottom: 8,
    }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', background: 'transparent', border: 'none',
        borderBottom: `0.5px solid ${error ? '#e24b4a' : 'rgba(196,160,80,0.25)'}`,
        padding: '10px 0', fontSize: 14, color: '#ccc',
        fontFamily: 'inherit', outline: 'none',
      }}
    />
    {error && (
      <div style={{ fontSize: 11, color: '#e24b4a', marginTop: 5 }}>{error}</div>
    )}
  </div>
);

// ----------------------------------------------------------------
// Styles object
// ----------------------------------------------------------------
const styles: Record<string, React.CSSProperties> = {
  page: {
    background: '#0a0a0a', minHeight: '100vh',
    fontFamily: "'Jost', 'Helvetica Neue', sans-serif",
    display: 'flex', flexDirection: 'column',
  },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 40px', position: 'fixed', top: 0, left: 0, right: 0,
    zIndex: 100, background: 'rgba(10,10,10,0.9)',
    borderBottom: '0.5px solid rgba(196,160,80,0.15)',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  navLogoIcon: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg,#c4a050,#8a6520)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 600, color: '#0a0a0a',
  },
  navLogoText: {
    fontSize: 20, fontWeight: 600, color: '#c4a050',
    letterSpacing: 2,
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: 32 },
  navLink: {
    fontSize: 13, fontWeight: 300, color: '#888',
    letterSpacing: 1, textDecoration: 'none', textTransform: 'uppercase',
  },
  tabBar: {
    display: 'flex', justifyContent: 'center',
    margin: '96px auto 0',
    border: '0.5px solid rgba(196,160,80,0.3)',
    borderRadius: 4, overflow: 'hidden', width: 'fit-content',
  },
  tabBtn: {
    padding: '10px 48px', fontSize: 12, letterSpacing: 2,
    textTransform: 'uppercase', fontFamily: 'inherit', fontWeight: 400,
    cursor: 'pointer', border: 'none', background: 'transparent', color: '#666',
  },
  tabBtnActive: { background: '#c4a050', color: '#0a0a0a', fontWeight: 500 },
  wrapper: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '20px 40px 60px',
  },
  card: {
    width: '100%', maxWidth: 900,
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    background: '#111', border: '0.5px solid rgba(196,160,80,0.2)',
    borderRadius: 2, overflow: 'hidden',
  },
  formSide: {
    padding: '56px 52px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  formTitle: {
    fontFamily: 'Georgia, serif', fontSize: 38, fontWeight: 300,
    color: '#e8d5a0', letterSpacing: 1, marginBottom: 8, fontStyle: 'italic',
  },
  formSubtitle: {
    fontSize: 12, color: '#555', letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 40,
  },
  btnPrimary: {
    width: '100%', padding: 15, background: '#c4a050', border: 'none',
    color: '#0a0a0a', fontFamily: 'inherit', fontSize: 12, letterSpacing: 3,
    textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', marginTop: 8,
  },
  formFooter: { marginTop: 24, fontSize: 12, color: '#444', textAlign: 'center' },
  link: { color: '#c4a050', cursor: 'pointer' },
  apiError: {
    background: 'rgba(226,75,74,0.1)', border: '0.5px solid #e24b4a',
    padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#e24b4a',
    borderRadius: 2,
  },
  imageSide: {
    position: 'relative', overflow: 'hidden', minHeight: 500,
    background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  patternBg: {
    position: 'absolute', inset: 0,
    backgroundImage: [
      'repeating-linear-gradient(45deg,rgba(196,160,80,0.03) 0px,rgba(196,160,80,0.03) 1px,transparent 1px,transparent 8px)',
      'repeating-linear-gradient(-45deg,rgba(196,160,80,0.03) 0px,rgba(196,160,80,0.03) 1px,transparent 1px,transparent 8px)',
    ].join(','),
  },
  cornerTR: {
    position: 'absolute', top: 24, right: 24, width: 40, height: 40,
    borderTop: '0.5px solid rgba(196,160,80,0.3)',
    borderRight: '0.5px solid rgba(196,160,80,0.3)',
  },
  cornerBL: {
    position: 'absolute', bottom: 24, left: 24, width: 40, height: 40,
    borderBottom: '0.5px solid rgba(196,160,80,0.3)',
    borderLeft: '0.5px solid rgba(196,160,80,0.3)',
  },
  heroImg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
  },
  urlWrapper: { zIndex: 10, width: '80%' },
  urlInput: {
    width: '100%', background: 'rgba(196,160,80,0.05)',
    border: '0.5px solid rgba(196,160,80,0.2)', padding: '10px 16px',
    color: '#888', fontSize: 12, fontFamily: 'inherit', outline: 'none', textAlign: 'center',
  },
  urlBtn: {
    width: '100%', marginTop: 8, padding: 10,
    background: 'rgba(196,160,80,0.1)', border: '0.5px solid rgba(196,160,80,0.3)',
    color: '#c4a050', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  overlayText: {
    position: 'absolute', bottom: 32, left: 32, right: 32, zIndex: 10,
  },
  overlayTitle: {
    fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300,
    fontStyle: 'italic', color: 'rgba(196,160,80,0.6)',
    lineHeight: 1.5, letterSpacing: 1, whiteSpace: 'pre-line',
  },
  overlaySubtitle: { fontSize: 11, color: '#333', letterSpacing: 1.5, marginTop: 8 },
};

export default AuthPage;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}

