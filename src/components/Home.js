import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CSS/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  
  // Order history states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const foodCenters = [
    {
      id: 1,
      name: 'Food Court',
      description: 'A variety of cuisines from different restaurants all in one place',
      icon: '🏪',
      color: '#FF6B6B',
      items: '20+ food stalls',
      route: '/food/foodcourt'
    },
    {
      id: 2,
      name: 'Time Out',
      description: 'Quick bites and snacks for those in a hurry',
      icon: '⏰',
      color: '#4ECDC4',
      items: '15+ quick options',
      route: '/food/timeout'
    },
    {
      id: 3,
      name: 'Main Cafe',
      description: 'Main dining area with comfortable seating and full meals',
      icon: '☕',
      color: '#FFD166',
      items: '30+ dishes',
      route: '/food/maincafe'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Fetch orders when user is loaded
        if (parsedUser && parsedUser.username) {
          fetchUserOrders(parsedUser.username);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, [navigate]);

  // Function to fetch user orders - FIXED to show only current user's orders
  const fetchUserOrders = async (username) => {
  setLoadingOrders(true);
  setOrderError('');
  
  console.log('Fetching orders for username:', username);
  
  try {
    // ✅ FIX: Clean the username before sending to API
    let cleanUsername = username;
    
    // Remove "Welcome " prefix if it exists
    if (cleanUsername && cleanUsername.toLowerCase().startsWith('welcome ')) {
      cleanUsername = cleanUsername.substring(8).trim();
    }
    
    // Remove "!" suffix if it exists
    if (cleanUsername && cleanUsername.endsWith('!')) {
      cleanUsername = cleanUsername.substring(0, cleanUsername.length - 1).trim();
    }
    
    console.log('Cleaned username for API:', cleanUsername);
    
    // ✅ FIX: Call API with CLEANED username
    const response = await axios.get('http://localhost:8080/order/orderDetails', {
      params: {
        username: cleanUsername  // ← This is the FIX!
      }
    });
    
    console.log('API Response:', response.data);
    
    if (response.data && Array.isArray(response.data)) {
      // ✅ FIX: Filter out orders with empty/null usernames
      const validOrders = response.data.filter(order => 
        order.username && order.username.trim() !== ''
      );
      
      console.log('Valid orders (non-empty username):', validOrders.length);
      
      // Remove duplicate orders (same billid)
      const uniqueOrders = [];
      const seenBillIds = new Set();
      
      validOrders.forEach(order => {
        if (order.billid && !seenBillIds.has(order.billid)) {
          seenBillIds.add(order.billid);
          uniqueOrders.push(order);
        }
      });
      
      console.log('Unique orders:', uniqueOrders.length);
      
      // Sort by date and time (newest first)
      const sortedOrders = uniqueOrders.sort((a, b) => {
        try {
          // Parse date in dd-mm-yyyy format
          const parseDateTime = (order) => {
            if (!order.date) return new Date(0);
            
            const [day, month, year] = order.date.split('-');
            const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const timeStr = order.time || '00:00';
            
            return new Date(`${dateStr}T${timeStr}`);
          };
          
          const dateTimeA = parseDateTime(a);
          const dateTimeB = parseDateTime(b);
          
          return dateTimeB - dateTimeA; // Newest first
        } catch (error) {
          console.error('Error parsing dates:', error);
          return 0;
        }
      });
      
      console.log('Sorted orders:', sortedOrders);
      setOrders(sortedOrders);
      
      if (sortedOrders.length === 0) {
        setOrderError('No orders found for your account.');
      } else {
        // Success! Orders found
        console.log(`Found ${sortedOrders.length} orders for user: ${cleanUsername}`);
      }
    } else {
      setOrderError('No order data available from server.');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to load order history. Please try again later.';
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = 'Bad request. Please check your username.';
      } else if (error.response.status === 404) {
        errorMessage = 'No orders found for your account.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    setOrderError(errorMessage);
  } finally {
    setLoadingOrders(false);
  }
};

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('darkMode');
    navigate('/');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(category.route);
  };

  const handleAccountClick = async () => {
    closeSidebar();
    setLoadingAccount(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.contactNumber) {
        alert('User data not found. Please login again.');
        return;
      }

      const response = await axios.get(`http://localhost:8080/auth/getUser?contactnumber=${userData.contactNumber}`);
      
      if (response.data) {
        navigate('/profile', { state: { userData: response.data } });
      } else {
        alert('User not found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to fetch user details. Please try again.');
    } finally {
      setLoadingAccount(false);
    }
  };

  // Handle orders click in sidebar
  const handleOrdersClick = () => {
    closeSidebar();
    setShowOrderHistory(true);
    // Refresh orders
    if (user && user.username) {
      fetchUserOrders(user.username);
    }
  };

  // ✅ FIXED: Remove "Welcome" from username if it exists
  const getDisplayName = () => {
    if (!user) return 'User';
    
    let displayName = '';
    
    if (user.username && user.username.trim() !== '') {
      displayName = user.username.trim();
      
      // Remove "Welcome " prefix if it exists
      if (displayName.toLowerCase().startsWith('welcome ')) {
        displayName = displayName.substring(8).trim(); // Remove first 8 characters "Welcome "
      }
      
      // Remove "!" suffix if it exists
      if (displayName.endsWith('!')) {
        displayName = displayName.substring(0, displayName.length - 1).trim();
      }
      
      return displayName;
    }
    
    if (user.contactNumber) {
      return user.contactNumber;
    }
    
    return 'User';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const [day, month, year] = dateString.split('-');
      if (day && month && year) {
        return `${day}/${month}/${year}`;
      }
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleCloseOrderHistory = () => {
    setShowOrderHistory(false);
    setSelectedOrder(null);
  };

  const handleRetryFetchOrders = () => {
    if (user && user.username) {
      fetchUserOrders(user.username);
    }
  };

  return (
    <div className="home-container">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="sidebar-close" onClick={closeSidebar}>
            &times;
          </button>
        </div>
        
        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {getDisplayName().charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h3>{getDisplayName()}</h3>
            <p>Hunger Box Member</p>
            <p className="order-count">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </p>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="sidebar-menu">
          <button className="menu-item" onClick={handleAccountClick} disabled={loadingAccount}>
            <span className="menu-icon">
              {loadingAccount ? '⏳' : '👤'}
            </span>
            <span>{loadingAccount ? 'Loading...' : 'My Account'}</span>
          </button>
          
          <button className="menu-item" onClick={handleOrdersClick}>
            <span className="menu-icon">📦</span>
            <span>My Orders</span>
            {orders.length > 0 && (
              <span className="order-badge">{orders.length}</span>
            )}
          </button>
          
          <div className="dark-mode-toggle">
            <div className="menu-item" onClick={toggleDarkMode}>
              <span className="menu-icon">🌙</span>
              <span>Dark Mode</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <button className="menu-item" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Header - ✅ FIXED: Only one "Welcome" */}
      <header className="home-header">
        <div className="header-left">
          <h1 className="app-title">Hunger Box</h1>
          <p className="welcome-message">
            Welcome, <span className="user-name">{getDisplayName()}</span>!
          </p>
        </div>
        <div className="header-right">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <span className="menu-icon">☰</span>
          </button>
        </div>
      </header>

      {/* Order History Modal */}
      {showOrderHistory && (
        <div className="order-history-modal-overlay" onClick={handleCloseOrderHistory}>
          <div className="order-history-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-history-header">
              <h2>📦 My Order History</h2>
              <button className="close-order-history" onClick={handleCloseOrderHistory}>
                &times;
              </button>
            </div>
            
            <div className="order-history-body">
              {loadingOrders ? (
                <div className="order-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading your orders...</p>
                </div>
              ) : orderError ? (
                <div className="order-error">
                  <div className="error-icon">⚠️</div>
                  <p>{orderError}</p>
                  {user && user.username && (
                    <button 
                      className="retry-btn"
                      onClick={handleRetryFetchOrders}
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : orders.length === 0 ? (
                <div className="no-orders">
                  <div className="no-orders-icon">📭</div>
                  <p>No orders yet. Start ordering from our food centers!</p>
                  <button 
                    className="explore-food-btn"
                    onClick={handleCloseOrderHistory}
                  >
                    Explore Food Centers
                  </button>
                </div>
              ) : (
                <>
                  <div className="orders-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Orders</span>
                      <span className="summary-value">{orders.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Spent</span>
                      <span className="summary-value">
                        ₹{orders.reduce((total, order) => {
                          const price = parseFloat(order.price) || 0;
                          return total + price;
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="orders-list">
                    {orders.map((order, index) => (
                      <div 
                        key={order.billid ? `${order.billid}-${index}` : `order-${index}`}
                        className="order-item"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        <div className="order-item-header">
                          <span className="order-id">
                            {order.billid ? `Bill ID: ${order.billid}` : `Order ${index + 1}`}
                          </span>
                          <span className="order-date">
                            {formatDate(order.date)} {order.time || ''}
                          </span>
                        </div>
                        <div className="order-item-body">
                          <div className="order-foods">
                            <span className="order-food-list">
                              {order.fooditems ? 
                                (order.fooditems.split(',').slice(0, 2).join(', ') + 
                                 (order.fooditems.split(',').length > 2 ? '...' : '')) : 
                                'No items listed'}
                            </span>
                          </div>
                          <div className="order-price">
                            ₹{(parseFloat(order.price) || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="order-item-footer">
                          <span className="order-restaurant">
                            {order.fooditems && (
                              order.fooditems.toLowerCase().includes('cake') || 
                              order.fooditems.toLowerCase().includes('pastry') || 
                              order.fooditems.toLowerCase().includes('mousse') || 
                              order.fooditems.toLowerCase().includes('brownie') ||
                              order.fooditems.toLowerCase().includes('ice cream') ? 'Food Court' :
                              order.fooditems.toLowerCase().includes('chowmin') || 
                              order.fooditems.toLowerCase().includes('biriyani') || 
                              order.fooditems.toLowerCase().includes('rice') || 
                              order.fooditems.toLowerCase().includes('dosa') || 
                              order.fooditems.toLowerCase().includes('idli') ? 'Main Cafe' :
                              order.fooditems.toLowerCase().includes('burger') || 
                              order.fooditems.toLowerCase().includes('patties') || 
                              order.fooditems.toLowerCase().includes('fritters') ||
                              order.fooditems.toLowerCase().includes('hot dog') ? 'Time Out' :
                              'Unknown Center'
                            )}
                          </span>
                          <button className="view-details-btn">
                            View Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-details-modal-overlay" onClick={handleCloseOrderDetails}>
          <div className="order-details-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-details-header">
              <h3>Order Details</h3>
              <button className="close-order-details" onClick={handleCloseOrderDetails}>
                &times;
              </button>
            </div>
            
            <div className="order-details-body">
              <div className="detail-row">
                <span className="detail-label">Bill ID</span>
                <span className="detail-value">{selectedOrder.billid || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date & Time</span>
                <span className="detail-value">
                  {formatDate(selectedOrder.date)} at {selectedOrder.time || 'N/A'}
                </span>
              </div>
              
              <div className="food-items-section">
                <h4>Food Items:</h4>
                <div className="food-items-list">
                  {selectedOrder.fooditems ? 
                    selectedOrder.fooditems.split(',').map((item, index) => (
                      <div key={index} className="food-item">
                        <span className="food-item-icon">
                          {item.toLowerCase().includes('cake') ? '🎂' :
                           item.toLowerCase().includes('pastry') ? '🥮' :
                           item.toLowerCase().includes('burger') ? '🍔' :
                           item.toLowerCase().includes('rice') ? '🍚' :
                           item.toLowerCase().includes('chowmin') || item.toLowerCase().includes('noodles') ? '🍜' :
                           item.toLowerCase().includes('biriyani') ? '🍛' :
                           item.toLowerCase().includes('dosa') || item.toLowerCase().includes('idli') ? '🥘' :
                           '🍽️'}
                        </span>
                        <span className="food-item-name">{item.trim()}</span>
                      </div>
                    )) : (
                      <p className="no-items">No food items listed</p>
                    )
                  }
                </div>
              </div>
              
              <div className="price-section">
                <div className="price-row">
                  <span className="price-label">Subtotal</span>
                  <span className="price-value">₹{(parseFloat(selectedOrder.price) || 0).toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">GST (5%)</span>
                  <span className="price-value">₹{((parseFloat(selectedOrder.price) || 0) * 0.05).toFixed(2)}</span>
                </div>
                <div className="price-row total">
                  <span className="price-label">Total Amount</span>
                  <span className="price-value">
                    ₹{((parseFloat(selectedOrder.price) || 0) * 1.05).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="order-status">
                <span className="status-label">Status:</span>
                <span className="status-value status-completed">Completed</span>
              </div>
            </div>
            
            <div className="order-details-footer">
              <button className="close-details-btn" onClick={handleCloseOrderDetails}>
                Close
              </button>
              <button 
                className="reorder-btn"
                onClick={() => {
                  alert('Reorder functionality coming soon!');
                  handleCloseOrderDetails();
                }}
              >
                Reorder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Satisfy Your Cravings</h2>
            <p className="hero-subtitle">
              Choose from our premium food centers
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-icon">🍽️</span>
                <div className="stat-details">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Food Centers</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📦</span>
                <div className="stat-details">
                  <span className="stat-number">{orders.length}</span>
                  <span className="stat-label">Your Orders</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🚚</span>
                <div className="stat-details">
                  <span className="stat-number">30</span>
                  <span className="stat-label">Min Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Order Status Card */}
        {orders.length > 0 && (
          <section className="quick-order-status">
            <div className="order-status-card">
              <div className="order-status-icon">📦</div>
              <div className="order-status-content">
                <h3>Your Recent Orders</h3>
                <p>You have {orders.length} order{orders.length !== 1 ? 's' : ''} in total</p>
                <button 
                  className="view-all-orders-btn"
                  onClick={() => setShowOrderHistory(true)}
                >
                  View All Orders →
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="food-centers-section">
          <h2 className="section-title">Our Food Centers</h2>
          <p className="section-subtitle">Select a food center to view its menu</p>
          
          <div className="food-centers-grid">
            {foodCenters.map((center) => (
              <div 
                key={center.id}
                className={`food-center-card ${selectedCategory?.id === center.id ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(center)}
                style={{ '--card-color': center.color }}
              >
                <div className="card-icon" style={{ backgroundColor: center.color }}>
                  <span className="icon-emoji">{center.icon}</span>
                </div>

                <div className="card-content">
                  <h3 className="center-name">{center.name}</h3>
                  <p className="center-description">{center.description}</p>
                  <div className="center-info">
                    <span className="info-item">
                      <span className="info-icon">📊</span>
                      {center.items}
                    </span>
                    {center.name === 'Time Out' && (
                      <span className="info-item">
                        <span className="info-icon">⚡</span>
                        Quick Service
                      </span>
                    )}
                  </div>
                  {center.name === 'Time Out' && (
                    <div className="center-tag">
                      <span className="tag-badge">Available Now</span>
                    </div>
                  )}
                </div>
                <div className="card-arrow">
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="quick-info-section">
          <div className="info-card">
            <div className="info-icon">⏱️</div>
            <div className="info-content">
              <h3>Fast Service</h3>
              <p>Get your food delivered in 30 minutes or less</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">💳</div>
            <div className="info-content">
              <h3>Secure Payment</h3>
              <p>Multiple payment options with 100% secure transactions</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>© 2024 Hunger Box. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
          <a href="#">Help Center</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;