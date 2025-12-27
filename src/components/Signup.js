import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessTooltip, setShowSuccessTooltip] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  // Auto-close success tooltip after 5 seconds
  useEffect(() => {
    let timer;
    if (showSuccessTooltip) {
      timer = setTimeout(() => {
        setShowSuccessTooltip(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessTooltip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setShowSuccessTooltip(false);
    
    try {
      // Prepare data for API
      const signupData = {
        username: formData.username.trim(),
        password: formData.password,
        contactnumber: formData.contactNumber.trim()
      };

      console.log('Sending signup data:', signupData);

      // Make API call
      const response = await axios.post('http://localhost:8080/auth/signup', signupData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Signup response:', response.data);
      
      // Handle success
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;
        let message = 'Successfully Signed Up!';
        
        // Check the response message
        if (typeof responseData === 'string' && responseData.includes('Successfully')) {
          message = responseData;
        } else if (responseData && responseData.message) {
          message = responseData.message;
        }
        
        setSuccessMessage(message);
        setShowSuccessTooltip(true);
        
        // Clear form
        setFormData({
          username: '',
          contactNumber: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        throw new Error('Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific error messages
      if (err.response) {
        if (err.response.status === 400) {
          setError('Invalid input. Please check your details.');
        } else if (err.response.status === 409) {
          setError('Username or contact number already exists.');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Signup failed. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to manually close the tooltip
  const handleCloseTooltip = () => {
    setShowSuccessTooltip(false);
  };

  return (
    <>
      {/* Success Tooltip/Toast at Top Right Corner */}
      {showSuccessTooltip && (
        <div className="success-tooltip" onClick={handleCloseTooltip}>
          <div className="tooltip-content">
            <div className="tooltip-header">
              <div className="tooltip-icon">✅</div>
              <span className="tooltip-title">Success!</span>
              <button className="tooltip-close" onClick={handleCloseTooltip}>
                &times;
              </button>
            </div>
            <div className="tooltip-message">{successMessage}</div>
            <div className="tooltip-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message (remains in form) */}
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
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            placeholder="Choose a username"
            required
            disabled={loading}
          />
          <p className="input-hint">
            Username must contain one uppercase letter and one lowercase letter and one number
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="signupContactNumber" className="form-label">
            Contact Number
          </label>
          <div className="input-with-prefix fixed">
            <span className="input-prefix">+91</span>
            <input
              type="tel"
              id="signupContactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="form-input with-prefix"
              placeholder="Enter your 10-digit contact number"
              maxLength="10"
              pattern="[0-9]{10}"
              required
              disabled={loading}
            />
          </div>
          <p className="input-hint">
            Enter 10-digit mobile number without country code
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="signupPassword" className="form-label">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="signupPassword"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input password-input"
              placeholder="Create a password (min 6 characters)"
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
              {showPassword ? (
                <svg 
                  className="eye-icon" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg 
                  className="eye-icon" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input password-input"
              placeholder="Confirm your password"
              minLength="6"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={toggleConfirmPasswordVisibility}
              disabled={loading}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg 
                  className="eye-icon" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg 
                  className="eye-icon" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="checkbox"
              required
              disabled={loading}
            />
            <label htmlFor="terms" className="checkbox-label">
              I agree to the{' '}
              <a href="#" className="terms-link">Terms and Conditions</a>
            </label>
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </>
  );
};

export default Signup;