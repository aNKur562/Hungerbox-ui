import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/TimeOutCounter.css';
import { useNavigate } from 'react-router-dom';

const TimeOutCounter = () => {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // API endpoints
  const TIMEOUT_API = 'http://localhost:8080/hungerbox/counter1food';
  const ORDER_API = 'http://localhost:8080/order/orderFood';

  // Fetch food items from API
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(TIMEOUT_API);
        setFoodItems(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching food items:', err);
        setError('Failed to load food items. Please try again.');
        
        // Fallback mock data for testing
        setFoodItems([
          { fid: "F001", fname: "Veg Patties", price: 20.0 },
          { fid: "F002", fname: "Tomato Ketchup Sachet", price: 5.0 },
          { fid: "F003", fname: "Drinking Water Bottle", price: 9.0 },
          { fid: "F004", fname: "Coke Can", price: 40.0 },
          { fid: "F005", fname: "Maaza", price: 20.0 },
          { fid: "F006", fname: "Burger Chicken", price: 54.0 },
          { fid: "F007", fname: "Fish Fry", price: 55.0 },
          { fid: "F008", fname: "Chicken Fritters", price: 20.0 },
          { fid: "F009", fname: "Chicken Cutlet", price: 50.0 },
          { fid: "F010", fname: "Sweet Corn Roll", price: 23.0 },
          { fid: "F011", fname: "Chicken Hot Dog", price: 42.0 },
          { fid: "F012", fname: "Black Forest Pastry", price: 40.0 },
          { fid: "F013", fname: "Mango Pastry", price: 20.0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  // Debug: Check what user data is stored
  useEffect(() => {
    const user = localStorage.getItem('user');
    console.log('🔍 TimeOutCounter - Current user from localStorage:', user);
    if (user) {
      console.log('👤 Parsed user data:', JSON.parse(user));
    }
  }, []);

  // Get categories from food items
  const categories = ['all', 'snacks', 'drinks', 'burgers', 'desserts'];

  // Filter food items based on category and search
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.fname.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    // Simple category detection based on food name
    if (selectedCategory === 'snacks') {
      return matchesSearch && (
        item.fname.toLowerCase().includes('patties') ||
        item.fname.toLowerCase().includes('fritters') ||
        item.fname.toLowerCase().includes('cutlet') ||
        item.fname.toLowerCase().includes('roll') ||
        item.fname.toLowerCase().includes('fry')
      );
    }
    
    if (selectedCategory === 'drinks') {
      return matchesSearch && (
        item.fname.toLowerCase().includes('water') ||
        item.fname.toLowerCase().includes('coke') ||
        item.fname.toLowerCase().includes('maaza') ||
        item.fname.toLowerCase().includes('drink')
      );
    }
    
    if (selectedCategory === 'burgers') {
      return matchesSearch && item.fname.toLowerCase().includes('burger');
    }
    
    if (selectedCategory === 'desserts') {
      return matchesSearch && (
        item.fname.toLowerCase().includes('pastry') ||
        item.fname.toLowerCase().includes('sweet')
      );
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

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate total with GST
  const calculateTotalWithGST = () => {
    const total = calculateTotal();
    return total + (total * 0.05);
  };

  // Calculate GST amount
  const calculateGST = () => {
    return calculateTotal() * 0.05;
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
      // Prepare order data
      const now = new Date();
      const foodItemsString = cart.map(item => item.fname).join(',');
      const totalAmount = calculateTotal();
      
      // ✅ Get logged-in user from localStorage
      const storedUserData = localStorage.getItem('user');
      if (!storedUserData) {
        alert('Please log in to place an order.');
        navigate('/login');
        return;
      }

      const userData = JSON.parse(storedUserData);
      console.log('📦 TimeOutCounter - User data from localStorage:', userData);
      
      // ✅ Use the ACTUAL user data from localStorage
      // Check if userId exists (could be userId or id)
      const userId = userData.userId || userData.id || '1';
      const username = userData.username || 'Customer';
      
      console.log('👤 Using for order - userId:', userId, 'username:', username);
      
      const orderData = {
        userid: userId.toString(), // ✅ Convert to string
        username: username, // ✅ Use actual username
        fooditems: foodItemsString,
        price: totalAmount.toString(),
        billid: generateBillId(),
        date: formatDate(now),
        time: formatTime(now)
      };
      
      console.log('📤 TimeOutCounter - Order data being sent:', orderData);
      
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
          total: totalAmount,
          gst: calculateGST(),
          grandTotal: calculateTotalWithGST(),
          timestamp: now.toISOString(),
          billId: orderData.billid,
          restaurant: 'Time Out Counter',
          user: {
            userId: userId,
            username: username
          }
        };
        
        localStorage.setItem('currentOrder', JSON.stringify(orderDetails));
        
        // Show success message with order details
        alert(`✅ Order placed successfully!\n📋 Bill ID: ${orderData.billid}\n💳 Subtotal: ₹${totalAmount.toFixed(2)}\n🏷️ GST (5%): ₹${calculateGST().toFixed(2)}\n💰 Grand Total: ₹${calculateTotalWithGST().toFixed(2)}`);
        
        // Clear cart after successful order
        setCart([]);
        
        // Optional: Navigate to order confirmation page
        // navigate('/order-confirmation');
      } else {
        alert('❌ Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('❌ Failed to place order. Please check your connection and try again.');
    }
  };

  if (loading) {
    return (
      <div className="timeout-loading">
        <div className="loading-spinner"></div>
        <p>Loading Time Out menu...</p>
      </div>
    );
  }

  return (
    <div className="timeout-container">
      {/* Header */}
      <header className="timeout-header">
        <button className="back-button" onClick={handleBackToHome}>
          ← Back to Home
        </button>
        <h1 className="timeout-title">⏰ Time Out Counter</h1>
        <div className="cart-summary">
          <span className="cart-icon">🛒</span>
          <span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          <span className="cart-total">₹{calculateTotal().toFixed(2)}</span>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="timeout-main">
        {/* Food Items Grid */}
        <section className="food-items-section">
          <h2 className="section-title">Available Items ({filteredItems.length})</h2>
          
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
                    {item.fname.toLowerCase().includes('burger') ? '🍔' :
                     item.fname.toLowerCase().includes('water') || item.fname.toLowerCase().includes('drink') ? '🥤' :
                     item.fname.toLowerCase().includes('coke') || item.fname.toLowerCase().includes('maaza') ? '🥤' :
                     item.fname.toLowerCase().includes('pastry') ? '🍰' :
                     item.fname.toLowerCase().includes('fry') || item.fname.toLowerCase().includes('fritters') ? '🍗' :
                     '🍽️'}
                  </div>
                  <div className="food-item-details">
                    <h3 className="food-name">{item.fname}</h3>
                    <div className="food-id">ID: {item.fid}</div>
                    <div className="food-price">₹{item.price.toFixed(2)}</div>
                  </div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <div className="no-items">
                <p>No food items found. Try a different search.</p>
              </div>
            )}
          </div>
        </section>

        {/* Cart Sidebar */}
        <aside className="cart-sidebar">
          <h2 className="cart-title">Your Order</h2>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p>Your cart is empty</p>
              <p className="empty-cart-hint">Add items from the menu</p>
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
                  <span>₹{calculateTotal().toFixed(2)}</span>
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
                Proceed to Checkout (₹{calculateTotalWithGST().toFixed(2)})
              </button>
              
              <button className="clear-cart-btn" onClick={() => setCart([])}>
                Clear Cart
              </button>
            </>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="timeout-footer">
        <p>⏰ Time Out Counter - Quick bites for those in a hurry</p>
        <p>Delivery within 15-20 minutes • Minimum order: ₹100</p>
      </footer>
    </div>
  );
};

export default TimeOutCounter;