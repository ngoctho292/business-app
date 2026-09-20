import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
    } catch {
      // error đã được set trong store
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Logo & Title */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>T</div>
          <h1 style={styles.logoText}>T-Business CMS</h1>
          <p style={styles.tagline}>Nền tảng tạo website thông minh cho doanh nghiệp Việt</p>
        </div>

        <h2 style={styles.heading}>Đăng nhập</h2>

        {/* Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <div style={styles.passwordWrap}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ ...styles.input, paddingRight: '44px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            style={isLoading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
          >
            {isLoading ? (
              <span style={styles.spinnerWrap}>
                <span style={styles.spinner} /> Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>hoặc</span>
          <span style={styles.dividerLine} />
        </div>

        <p style={styles.registerText}>
          Chưa có tài khoản?{' '}
          <button
            id="goto-register"
            onClick={onNavigateToRegister}
            style={styles.linkBtn}
          >
            Đăng ký ngay
          </button>
        </p>
      </div>

      <style>{spinnerCss}</style>
    </div>
  );
};

const spinnerCss = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
`;

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: '24px',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px 44px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
    animation: 'fadeInUp 0.5s ease',
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    fontSize: '26px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
  },
  logoText: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  tagline: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '12px',
    marginTop: '4px',
  },
  heading: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 20px',
    textAlign: 'center',
  },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: '10px',
    color: '#fca5a5',
    padding: '12px 16px',
    fontSize: '14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0',
    lineHeight: 1,
  },
  submitBtn: {
    marginTop: '8px',
    padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    width: '100%',
  },
  spinnerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    display: 'block',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  registerText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    margin: 0,
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'underline',
    padding: 0,
  },
};
