import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CSS/MainCafe.css';

const MainCafe = () => {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [timeUntilOpen, setTimeUntilOpen] = useState('');

  // API endpoints
  const MAIN_CAFE_API = 'http://localhost:8080/hungerbox/counter2food';
  const ORDER_API = 'http://localhost:8080/order/orderFood';

  // Debug: Check what user data is stored
  useEffect(() => {
    const user = localStorage.getItem('user');
    console.log('🔍 MainCafe - Current user from localStorage:', user);
    if (user) {
      console.log('👤 Parsed user data:', JSON.parse(user));
    }
  }, []);

  // Check if cafe is open (after 12 PM)
  useEffect(() => {
    const checkOpeningTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();
      
      // Format current time
      const formattedTime = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      setCurrentTime(formattedTime);
      
      // Cafe opens at 12:00 PM
      const openHour = 12; // 12 PM
      
      if (currentHour >= openHour) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
        
        // Calculate time until opening
        const hoursUntilOpen = openHour - currentHour - 1;
        const minutesUntilOpen = 60 - currentMinute - 1;
        const secondsUntilOpen = 60 - currentSecond;
        
        setTimeUntilOpen(
          `${hoursUntilOpen}h ${minutesUntilOpen}m ${secondsUntilOpen}s`
        );
      }
    };

    checkOpeningTime();
    
    // Update time every second
    const interval = setInterval(checkOpeningTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch food items from API
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(MAIN_CAFE_API);
        setFoodItems(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching food items:', err);
        setError('Failed to load food items. Please try again.');
        
        // Fallback mock data for testing
        setFoodItems([
          { fid: "F101", fname: "Chicken Rice", price: 60.0 },
          { fid: "F102", fname: "Plain Rice with Dal", price: 30.0 },
          { fid: "F103", fname: "Veg Chowmin", price: 40.0 },
          { fid: "F104", fname: "Egg Chowmin", price: 50.0 },
          { fid: "F105", fname: "Chicken Chowmin", price: 70.0 },
          { fid: "F106", fname: "Egg Fried Rice", price: 55.0 },
          { fid: "F107", fname: "Veg Fried Rice", price: 45.0 },
          { fid: "F108", fname: "Chicken Fried Rice", price: 75.0 },
          { fid: "F109", fname: "Aloo Biriyani", price: 50.0 },
          { fid: "F110", fname: "Egg Biriyani", price: 60.0 },
          { fid: "F111", fname: "Chicken Biriyani", price: 90.0 },
          { fid: "F112", fname: "Mutton Biriyani", price: 130.0 },
          { fid: "F113", fname: "Idli", price: 25.0 },
          { fid: "F114", fname: "Dosa", price: 35.0 },
          { fid: "F115", fname: "Luchi with Aloo Dum", price: 30.0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchFoodItems();
    }
  }, [isOpen]);

  // Categories for Main Cafe
  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'rice', name: 'Rice Dishes', icon: '🍚' },
    { id: 'noodles', name: 'Noodles', icon: '🍜' },
    { id: 'biriyani', name: 'Biriyani', icon: '🍛' },
    { id: 'southindian', name: 'South Indian', icon: '🥘' },
    { id: 'bengali', name: 'Bengali', icon: '🍲' }
  ];

  // Filter food items based on category and search
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.fname.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    if (selectedCategory === 'rice') {
      return matchesSearch && (
        item.fname.toLowerCase().includes('rice') &&
        !item.fname.toLowerCase().includes('fried rice') &&
        !item.fname.toLowerCase().includes('biriyani')
      );
    }
    
    if (selectedCategory === 'noodles') {
      return matchesSearch && item.fname.toLowerCase().includes('chowmin');
    }
    
    if (selectedCategory === 'biriyani') {
      return matchesSearch && item.fname.toLowerCase().includes('biriyani');
    }
    
    if (selectedCategory === 'southindian') {
      return matchesSearch && (
        item.fname.toLowerCase().includes('idli') ||
        item.fname.toLowerCase().includes('dosa')
      );
    }
    
    if (selectedCategory === 'bengali') {
      return matchesSearch && item.fname.toLowerCase().includes('luchi');
    }
    
    return matchesSearch;
  });

  // Add item to cart
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.fid === item.fid);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.fid === item.fid
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (fid) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.fid === fid);
      
      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.fid !== fid);
      } else {
        return prevCart.map(item =>
          item.fid === fid
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
    });
  };

  // Calculate subtotal price (without GST)
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate total price with GST
  const calculateTotalWithGST = () => {
    const subtotal = calculateSubtotal();
    return subtotal + (subtotal * 0.05);
  };

  // Calculate GST amount
  const calculateGST = () => {
    return calculateSubtotal() * 0.05;
  };

  // Generate random 6-digit alphanumeric ID
  const generateBillId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Format date as dd-mm-yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format time as HH:MM
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty! Add some items first.');
      return;
    }
    
    try {
      // ✅ Get logged-in user from localStorage
      const storedUserData = localStorage.getItem('user');
      if (!storedUserData) {
        alert('Please log in to place an order.');
        navigate('/login');
        return;
      }
      
      const userData = JSON.parse(storedUserData);
      console.log('📦 MainCafe - User data from localStorage:', userData);
      
      // ✅ Use the ACTUAL user data from localStorage
      // Check if userId exists (could be userId or id)
      const userId = userData.userId || userData.id || '1';
      const username = userData.username || 'Customer';
      
      console.log('👤 Using for order - userId:', userId, 'username:', username);
      
      // Prepare order data
      const now = new Date();
      const foodItemsString = cart.map(item => item.fname).join(',');
      const subtotalAmount = calculateSubtotal(); // WITHOUT GST
      
      const orderData = {
        userid: userId.toString(), // ✅ Use actual userid, convert to string
        username: username, // ✅ Use actual username
        fooditems: foodItemsString,
        price: subtotalAmount.toString(), // WITHOUT GST
        billid: generateBillId(),
        date: formatDate(now),
        time: formatTime(now)
      };
      
      console.log('📤 MainCafe - Order data being sent:', orderData);
      
      // Call the order API
      const response = await axios.post(ORDER_API, orderData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        // Store order details in localStorage
        const orderDetails = {
          items: cart,
          subtotal: subtotalAmount,
          gst: calculateGST(),
          grandTotal: calculateTotalWithGST(),
          timestamp: now.toISOString(),
          billId: orderData.billid,
          restaurant: 'Main Cafe',
          user: {
            userId: userId,
            username: username
          }
        };
        
        localStorage.setItem('currentOrder', JSON.stringify(orderDetails));
        
        // Show success message with order details
        alert(`✅ Order placed successfully!\n📋 Bill ID: ${orderData.billid}\n💳 Subtotal: ₹${subtotalAmount.toFixed(2)}\n🏷️ GST (5%): ₹${calculateGST().toFixed(2)}\n💰 Grand Total: ₹${calculateTotalWithGST().toFixed(2)}`);
        
        // Clear cart after successful order
        setCart([]);
      } else {
        alert('❌ Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('❌ Failed to place order. Please check your connection and try again.');
    }
  };

  if (loading && isOpen) {
    return (
      <div className="maincafe-loading">
        <div className="loading-spinner"></div>
        <p>Loading Main Cafe menu...</p>
      </div>
    );
  }

  // Closed state view
  if (!isOpen) {
    return (
      <div className="maincafe-closed">
        <header className="closed-header">
          <button className="back-button" onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <h1 className="closed-title">☕ Main Cafe</h1>
        </header>
        
        <main className="closed-content">
          <div className="closed-icon">⏰</div>
          <h2>Main Cafe Opens at 12:00 PM</h2>
          <p className="current-time">Current Time: {currentTime}</p>
          <div className="countdown-timer">
            <div className="countdown-title">Opening in:</div>
            <div className="countdown-display">{timeUntilOpen}</div>
          </div>
          
          <div className="opening-hours">
            <h3>Opening Hours</h3>
            <ul>
              <li>Monday - Friday: 12:00 PM - 10:00 PM</li>
              <li>Saturday - Sunday: 12:00 PM - 11:00 PM</li>
            </ul>
          </div>
          
          <div className="available-now">
            <p>🍽️ <strong>Food Court</strong> and ⏰ <strong>Time Out</strong> are available now!</p>
            <div className="action-buttons">
              <button 
                className="goto-timeout-btn"
                onClick={() => navigate('/timeout')}
              >
                ⏰ Go to Time Out
              </button>
              <button 
                className="goto-foodcourt-btn"
                onClick={() => navigate('/foodcourt')}
              >
                🏪 Go to Food Court
              </button>
            </div>
          </div>
        </main>
        
        <footer className="closed-footer">
          <p>☕ Main Cafe - Main dining area with comfortable seating and full meals</p>
          <p>Opening soon at 12:00 PM</p>
        </footer>
      </div>
    );
  }

  // Open state view
  return (
    <div className="maincafe-container">
      {/* Header */}
      <header className="maincafe-header">
        <button className="back-button" onClick={handleBackToHome}>
          ← Back to Home
        </button>
        <div className="header-title-section">
          <h1 className="maincafe-title">☕ Main Cafe - Now Open!</h1>
          <div className="open-status">
            <span className="status-dot"></span>
            <span className="status-text">Open • Closes at 10:00 PM</span>
          </div>
        </div>
        <div className="cart-summary">
          <span className="cart-icon">🛒</span>
          <span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          <span className="cart-total">₹{calculateSubtotal().toFixed(2)}</span>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search main course items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="maincafe-main">
        {/* Food Items Grid */}
        <section className="food-items-section">
          <h2 className="section-title">
            Main Course Delights ({filteredItems.length})
            <span className="section-subtitle">Full meals for hearty appetites</span>
          </h2>
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="food-items-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div key={item.fid} className="food-item-card">
                  <div className="food-item-icon">
                    {getFoodIcon(item.fname)}
                  </div>
                  <div className="food-item-details">
                    <h3 className="food-name">{item.fname}</h3>
                    <div className="food-id">ID: {item.fid}</div>
                    <div className="food-price">₹{item.price.toFixed(2)}</div>
                    <div className="food-tags">
                      {getFoodTags(item.fname)}
                    </div>
                  </div>
                  <div className="food-item-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">
                <div className="no-items-icon">🍽️</div>
                <p>No items found. Try a different search.</p>
              </div>
            )}
          </div>
        </section>

        {/* Cart Sidebar */}
        <aside className="cart-sidebar">
          <h2 className="cart-title">Your Order</h2>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🍽️</div>
              <p>Your cart is empty</p>
              <p className="empty-cart-hint">Add main course items from the menu</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.fid} className="cart-item">
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.fname}</h4>
                      <div className="cart-item-price">₹{item.price.toFixed(2)} × {item.quantity}</div>
                    </div>
                    <div className="cart-item-actions">
                      <button
                        className="quantity-btn minus"
                        onClick={() => removeFromCart(item.fid)}
                      >
                        −
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn plus"
                        onClick={() => addToCart(item)}
                      >
                        +
                      </button>
                      <div className="cart-item-total">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>GST (5%)</span>
                  <span>₹{calculateGST().toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>₹{calculateTotalWithGST().toFixed(2)}</span>
                </div>
              </div>
              
              <button className="checkout-btn" onClick={handleCheckout}>
                Place Order (₹{calculateTotalWithGST().toFixed(2)})
              </button>
              
              <button className="clear-cart-btn" onClick={() => setCart([])}>
                Clear Cart
              </button>
            </>
          )}
        </aside>
      </main>

      {/* Info Banner */}
      <div className="info-banner">
        <div className="banner-item">
          <span className="banner-icon">🔥</span>
          <span>Freshly cooked meals</span>
        </div>
        <div className="banner-item">
          <span className="banner-icon">🕐</span>
          <span>Open until 10:00 PM</span>
        </div>
        <div className="banner-item">
          <span className="banner-icon">🍚</span>
          <span>Comfort food at its best</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="maincafe-footer">
        <p>☕ Main Cafe - Main dining area with comfortable seating and full meals</p>
        <p>Open 12:00 PM - 10:00 PM • Dine-in and Takeaway available</p>
      </footer>
    </div>
  );
};

// Helper function to get appropriate icon for food item
const getFoodIcon = (foodName) => {
  const name = foodName.toLowerCase();
  if (name.includes('rice') && !name.includes('fried')) return '🍚';
  if (name.includes('fried rice')) return '🍚';
  if (name.includes('chowmin')) return '🍜';
  if (name.includes('biriyani')) return '🍛';
  if (name.includes('idli')) return '🥘';
  if (name.includes('dosa')) return '🥘';
  if (name.includes('luchi')) return '🥯';
  return '🍽️';
};

// Helper function to get food tags
const getFoodTags = (foodName) => {
  const name = foodName.toLowerCase();
  const tags = [];
  
  if (name.includes('chicken')) tags.push('🍗 Chicken');
  if (name.includes('egg')) tags.push('🥚 Egg');
  if (name.includes('veg') || name.includes('aloo') || name.includes('plain')) tags.push('🥦 Veg');
  if (name.includes('mutton')) tags.push('🐑 Mutton');
  if (name.includes('spicy')) tags.push('🌶️ Spicy');
  
  return tags.map((tag, index) => (
    <span key={index} className="food-tag">{tag}</span>
  ));
};

export default MainCafe;