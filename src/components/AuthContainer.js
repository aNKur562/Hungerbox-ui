import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './CSS/AuthContainer.css'; // You'll need to create this CSS file

function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Side - Branding */}
        <div className="brand-section">
          <div className="brand-content">
            <div className="logo-container">
              <div className="logo">
                <span className="logo-text">HB</span>
              </div>
              <h1 className="brand-title">Hunger Box</h1>
            </div>
            <h2 className="brand-subtitle">
              {isLogin ? 'Welcome Back!' : 'Join Hunger Box'}
            </h2>
            <p className="brand-description">
              {isLogin 
                ? 'Sign in to your account and satisfy your cravings.' 
                : 'Create your account and discover delicious food options near you.'
              }
            </p>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">🍔</div>
                <span>Wide variety of Food</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🚚</div>
                <span>Take All You Can Eat, But Eat All You Take</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <span>Exclusive deals and discounts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="form-section">
          {/* Toggle Switch */}
          <div className="toggle-container">
            <button
              onClick={() => setIsLogin(true)}
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? <Login /> : <Signup />}
          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;