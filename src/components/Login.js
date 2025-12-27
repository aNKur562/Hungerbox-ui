import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CSS/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contactNumber: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!formData.contactNumber.trim()) {
      setError('Contact number is required');
      return false;
    }
    
    if (formData.contactNumber.length !== 10 || !/^\d+$/.test(formData.contactNumber)) {
      setError('Please enter a valid 10-digit contact number');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showToast]);

  // Helper function to clean username from welcome message
  const extractCleanUsername = (welcomeMessage) => {
    if (!welcomeMessage) return '';
    let username = welcomeMessage.trim();
    if (username.toLowerCase().startsWith('welcome ')) {
      username = username.substring(8).trim();
    }
    if (username.endsWith('!')) {
      username = username.substring(0, username.length - 1).trim();
    }
    return username;
  };

  // Function to get user ID from backend
  const fetchUserDetails = async (contactNumber) => {
    try {
      const response = await axios.get(`http://localhost:8080/auth/getUserDetailsForOrder?contactNumber=${contactNumber}`);
      console.log('User details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  // Fallback: Generate user ID from contact number
  const generateUserIdFromContact = (contactNumber) => {
    if (!contactNumber) return '1';
    
    // Create a consistent hash from contact number
    let hash = 0;
    for (let i = 0; i < contactNumber.length; i++) {
      const char = contactNumber.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Generate a number (avoid 1 which is hardcoded for Ankur)
    const userId = Math.abs(hash % 999) + 2; // 2-1000
    return userId.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setShowToast(false);
    
    try {
      const loginData = {
        password: formData.password,
        contactnumber: formData.contactNumber.trim()
      };

      console.log('Sending login data:', loginData);

      // 1. First, login to authenticate
      const loginResponse = await axios.post('http://localhost:8080/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', loginResponse.data);
      
      const responseData = loginResponse.data;
      
      // Check if login was successful
      if (typeof responseData === 'string') {
        // Check for error messages
        if (responseData === "Invalid contact number or password" || 
            responseData === "Failed, Something Went Wrong" ||
            responseData.includes("Failed") ||
            responseData.includes("Invalid")) {
          
          setToastMessage('Invalid Credentials');
          setToastType('error');
          setShowToast(true);
          return;
        }
        
        // Login successful
        const cleanUsername = extractCleanUsername(responseData);
        console.log('Cleaned username:', cleanUsername);
        
        let userId = null;
        let finalUsername = cleanUsername;
        
        // 2. Try to get user details including ID from backend
        try {
          const userDetails = await fetchUserDetails(formData.contactNumber);
          
          if (userDetails && userDetails.userId) {
            userId = userDetails.userId;
            finalUsername = userDetails.username || cleanUsername;
            console.log('✅ Got user ID from backend:', userId);
          } else {
            // If endpoint doesn't exist or returns error, use fallback
            throw new Error('User details endpoint not available');
          }
        } catch (userError) {
          console.log('⚠️ Using fallback user ID generation');
          userId = generateUserIdFromContact(formData.contactNumber);
        }
        
        // 3. Store user data in localStorage
        const userData = {
          userId: userId || '1', // Use fetched ID or fallback
          username: finalUsername,
          contactNumber: formData.contactNumber,
          isLoggedIn: true,
          loginTime: new Date().toISOString()
        };
        
        console.log('📝 Storing user data in localStorage:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // 4. Show success message
        setToastMessage(`Welcome ${finalUsername}!`);
        setToastType('success');
        setShowToast(true);
        
        // 5. Clear form
        setFormData({
          contactNumber: '',
          password: ''
        });
        
        // 6. Redirect to home page
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401) {
          errorMessage = 'Invalid contact number or password';
        } else {
          errorMessage = `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
      
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <>
      {showToast && (
        <div className={`toast-message ${toastType === 'error' ? 'toast-error' : ''}`} onClick={handleCloseToast}>
          <div className="toast-content">
            <div className="toast-header">
              <div className="toast-icon">
                {toastType === 'success' ? '✅' : '❌'}
              </div>
              <span className="toast-title">
                {toastType === 'success' ? 'Success!' : 'Error!'}
              </span>
              <button className="toast-close" onClick={(e) => {
                e.stopPropagation();
                handleCloseToast();
              }}>
                &times;
              </button>
            </div>
            <div className="toast-body">{toastMessage}</div>
            <div className="toast-progress">
              <div className={`toast-progress-bar ${toastType === 'error' ? 'error-bar' : ''}`}></div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <div className="error-details">{error}</div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="contactNumber" className="form-label">
            Contact Number
          </label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your 10-digit contact number"
            maxLength="10"
            pattern="[0-9]{10}"
            required
            disabled={loading}
          />
          <p className="input-hint">
            Enter the contact number used during signup
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input password-input"
              placeholder="Enter your password"
              minLength="6"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>
          <p className="input-hint">
            Enter your password (minimum 6 characters)
          </p>
        </div>
        <div className="form-options">
          <div className="remember-me">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="checkbox"
              disabled={loading}
            />
            <label htmlFor="remember-me" className="checkbox-label">
              Remember me
            </label>
          </div>

          <div className="forgot-password">
            <a href="#" className="forgot-link" onClick={(e) => {
              e.preventDefault();
              alert('Forgot password functionality coming soon!');
            }}>
              Forgot password?
            </a>
          </div>
        </div>

        <button 
          type="submit" 
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </>
  );
};

export default Login;