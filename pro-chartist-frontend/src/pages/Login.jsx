import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loginSchema } from '../validation/schemas';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL + '/api/users';

function Login({ setIsUserAuthenticated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      const response = await axios.post(`${API_URL}/login`, formData);
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('isUserAuthenticated', 'true');
      if (setIsUserAuthenticated) setIsUserAuthenticated(true); // <-- Ensure Header updates
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

  // Optionally, add a logout function for user
  // const handleLogout = () => {
  //   localStorage.removeItem('isUserAuthenticated');
  //   localStorage.removeItem('authToken');
  //   if (setIsUserAuthenticated) setIsUserAuthenticated(false);
  //   navigate('/login');
  // };

  return (
    <div className="login-container">
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
          <Link to="/reset-password" className="forgot-password-link">
            Forgot Password?
          </Link>
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
