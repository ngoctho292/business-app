import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState('');

  const validate = (): boolean => {
    setClientError('');
    if (!name.trim()) { setClientError('Vui lòng nhập họ và tên'); return false; }
    if (!email.includes('@')) { setClientError('Email không hợp lệ'); return false; }
    if (password.length < 8) { setClientError('Mật khẩu phải có ít nhất 8 ký tự'); return false; }
    if (password !== confirmPassword) { setClientError('Xác nhận mật khẩu không khớp'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register(email, name, password);
    } catch {
      // error đã được set trong store
    }
  };

  const displayError = clientError || error;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>T</div>
          <h1 style={styles.logoText}>T-Business CMS</h1>
          <p style={styles.tagline}>Đăng ký và bắt đầu xây dựng website của bạn</p>
        </div>

        <h2 style={styles.heading}>Tạo tài khoản mới</h2>

        {/* Error Banner */}
        {displayError && (
          <div style={styles.errorBanner}>
            <span>⚠️</span>
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Họ và tên</label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              style={styles.input}
              autoFocus
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <div style={styles.passwordWrap}>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                required
                style={{ ...styles.input, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div style={styles.strengthBar}>
                <div style={{
                  ...styles.strengthFill,
                  width: password.length < 8 ? '33%' : password.length < 12 ? '66%' : '100%',
                  background: password.length < 8 ? '#ef4444' : password.length < 12 ? '#f59e0b' : '#22c55e',
                }} />
                <span style={{ ...styles.strengthText, color: password.length < 8 ? '#ef4444' : password.length < 12 ? '#f59e0b' : '#22c55e' }}>
                  {password.length < 8 ? 'Yếu' : password.length < 12 ? 'Trung bình' : 'Mạnh'}
                </span>
              </div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Xác nhận mật khẩu</label>
            <input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              style={{
                ...styles.input,
                borderColor: confirmPassword && confirmPassword !== password
                  ? 'rgba(239,68,68,0.5)'
                  : undefined,
              }}
            />
            {confirmPassword && confirmPassword !== password && (
              <span style={{ color: '#f87171', fontSize: '12px' }}>Mật khẩu không khớp</span>
            )}
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={isLoading}
            style={isLoading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
          >
            {isLoading ? (
              <span style={styles.spinnerWrap}>
                <span style={styles.spinner} /> Đang tạo tài khoản...
              </span>
            ) : (
              'Tạo tài khoản'
            )}
          </button>
        </form>

        <p style={styles.loginText}>
          Đã có tài khoản?{' '}
          <button
            id="goto-login"
            onClick={onNavigateToLogin}
            style={styles.linkBtn}
          >
            Đăng nhập
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
    padding: '36px 44px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
    animation: 'fadeInUp 0.5s ease',
  },
  logoWrap: { textAlign: 'center', marginBottom: '24px' },
  logoIcon: {
    width: '52px', height: '52px', borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white', fontSize: '26px', fontWeight: '800',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
  },
  logoText: { color: 'white', fontSize: '20px', fontWeight: '700', margin: 0 },
  tagline: { color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '4px' },
  heading: { color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 20px', textAlign: 'center' },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: '10px', color: '#fca5a5', padding: '12px 16px', fontSize: '14px',
    marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500' },
  input: {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', color: 'white', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  },
  passwordWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0', lineHeight: 1,
  },
  strengthBar: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
  strengthFill: {
    height: '3px', borderRadius: '2px', flex: 1, maxWidth: '120px',
    background: '#ef4444', transition: 'width 0.3s, background 0.3s',
  },
  strengthText: { fontSize: '11px', fontWeight: '500' },
  submitBtn: {
    marginTop: '6px', padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: '10px', color: 'white',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)', width: '100%',
  },
  spinnerWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  spinner: {
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
  },
  loginText: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '16px 0 0' },
  linkBtn: {
    background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600', textDecoration: 'underline', padding: 0,
  },
};
