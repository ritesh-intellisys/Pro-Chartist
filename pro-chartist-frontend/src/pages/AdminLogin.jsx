import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../validation/schemas';
import toast from 'react-hot-toast';
import './AdminLogin.css';

function AdminLogin({ setIsAdminAuthenticated }) {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminReset, setShowAdminReset] = useState(false);
  // Reset admin stepper state
  const [resetStep, setResetStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtpVerified, setResetOtpVerified] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL + '/api/admin';

  // ✅ Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await loginSchema.validate(credentials, { abortEarly: false });

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      setIsAdminAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminRole', data.role);
      toast.success(`Logged in as ${data.role === 'master-admin' ? 'master ' : ''}admin successfully!`);
      navigate('/admin');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({
          email: 'Invalid email or password',
          password: 'Invalid email or password'
        });
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Send OTP to existing admin email
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setIsLoading(true);
    try {
      if (!resetEmail) throw new Error('Email is required');
      // Use correct admin endpoint
      const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
      setResetOtpSent(true);
      setResetStep('otp');
      toast.success('OTP sent to your email!');
    } catch (error) {
      setResetError(error.message);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setIsLoading(true);
    try {
      if (!resetOtp) throw new Error('OTP is required');
      // Use correct admin endpoint
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid OTP');
      setResetOtpVerified(true);
      setResetStep('reset');
      toast.success('OTP verified! You can now reset admin credentials.');
    } catch (error) {
      setResetError(error.message);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset admin credentials with OTP
  const handleAdminReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setIsLoading(true);
    try {
      if (!newAdminEmail || !newAdminPassword) throw new Error('Email and password are required');
      if (newAdminPassword.length < 8) throw new Error('Password must be at least 8 characters');
      // Use correct admin endpoint and include OTP
      const response = await fetch(`${API_URL}/reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword: newAdminPassword, newEmail: newAdminEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed');
      toast.success('Admin credentials reset successfully!');
      setShowAdminReset(false);
      setResetStep('email');
      setResetEmail('');
      setResetOtp('');
      setResetOtpSent(false);
      setResetOtpVerified(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
    } catch (error) {
      setResetError(error.message);
      toast.error(error.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <div className="login-card">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, email: e.target.value }))
            }
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, password: e.target.value }))
            }
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="reset-options">
          <button type="button" onClick={() => setShowAdminReset(true)} className="reset-btn">
            Reset Admin
          </button>
          <button type="button" onClick={() => navigate('/admin/reset-password')} className="forgot-btn">
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );

  // New: Render reset admin stepper
  const renderAdminResetStepper = () => (
    <div className="login-card">
      <h2>Reset Admin Credentials</h2>
      {resetStep === 'email' && (
        <form onSubmit={handleSendResetOtp}>
          <div className="form-group">
            <label>Existing Admin Email</label>
            <input
              type="email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
            />
          </div>
          {resetError && <div className="error-message">{resetError}</div>}
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setShowAdminReset(false);
              setResetStep('email');
              setResetEmail('');
              setResetOtp('');
              setResetOtpSent(false);
              setResetOtpVerified(false);
              setNewAdminEmail('');
              setNewAdminPassword('');
              setResetError('');
            }}
          >
            Back to Login
          </button>
        </form>
      )}
      {resetStep === 'otp' && (
        <form onSubmit={handleVerifyResetOtp}>
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              value={resetOtp}
              onChange={e => setResetOtp(e.target.value)}
              required
            />
          </div>
          {resetError && <div className="error-message">{resetError}</div>}
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setResetStep('email');
              setResetOtp('');
              setResetOtpSent(false);
              setResetOtpVerified(false);
              setResetError('');
            }}
          >
            Back
          </button>
        </form>
      )}
      {resetStep === 'reset' && (
      <form onSubmit={handleAdminReset}>
        <div className="form-group">
            <label>New Admin Email</label>
          <input
            type="email"
            value={newAdminEmail}
              onChange={e => setNewAdminEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newAdminPassword}
              onChange={e => setNewAdminPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {resetError && <div className="error-message">{resetError}</div>}
        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Admin Credentials'}
        </button>
        <button
          type="button"
          className="back-btn"
          onClick={() => {
              setResetStep('email');
              setResetEmail('');
              setResetOtp('');
              setResetOtpSent(false);
              setResetOtpVerified(false);
            setNewAdminEmail('');
            setNewAdminPassword('');
            setResetError('');
          }}
        >
            Back
        </button>
      </form>
      )}
    </div>
  );

  return (
    <div className="admin-login">
      {showAdminReset ? renderAdminResetStepper() : renderLoginForm()}
    </div>
  );
}

export default AdminLogin;
