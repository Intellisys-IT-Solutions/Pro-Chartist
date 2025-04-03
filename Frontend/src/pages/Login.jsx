import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loginSchema, resetPasswordSchema } from '../validation/schemas';
import './Login.css';

const API_URL = "http://localhost:5002/api/users";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // ✅ Detect reset password token in URL
  useEffect(() => {
    const token = window.location.pathname.split('/reset-password/')[1];
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      const response = await axios.post(`${API_URL}/login`, formData);

      localStorage.setItem('authToken', response.data.token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || 'Login failed');
        setErrors({
          email: 'Invalid email or password',
          password: 'Invalid email or password'
        });
      } else {
        toast.error('Server error. Try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Forgot Password – send reset link
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setIsLoading(true);
  
    try {
      if (!resetEmail) throw new Error('Please enter your email');
  
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send reset email');
  
      toast.success('OTP sent to your email!');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      setResetError(error.message);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };
  // ✅ Reset password with token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/reset-password`, {
        token: resetToken,
        newPassword
      });

      toast.success('Password reset successful! Please log in.');
      setShowResetPassword(false);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="login-container">
      {showResetPassword ? (
        <div className="login-card">
          <h2>Set New Password</h2>
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      ) : showForgotPassword ? (
        <div className="login-card">
          <h2>Reset Password</h2>
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setResetError('');
                }}
                className={resetError ? 'error' : ''}
              />
              {resetError && <span className="error-message">{resetError}</span>}
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" className="back-btn" onClick={() => setShowForgotPassword(false)}>
              Back to Login
            </button>
          </form>
        </div>
      ) : (
        <div className="login-card">
          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="auth-links">
            <button onClick={() => setShowForgotPassword(true)} className="forgot-password-link">
              Forgot Password?
            </button>
            <p className="signup-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
