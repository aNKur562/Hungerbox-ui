import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CSS/FoodCourt.css';

const FoodCourt = () => {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Food Court API endpoint
  const FOOD_COURT_API = 'http://localhost:8080/hungerbox/counter3food';
  const ORDER_API = 'http://localhost:8080/order/orderFood';

  // Fetch food items from API
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(FOOD_COURT_API);
        setFoodItems(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching food items:', err);
        setError('Failed to load food items. Please try again.');
        
        // Updated fallback mock data with exact items from database
        setFoodItems([
          { fid: "F201", fname: "Mango Cake", price: 35.00 },
          { fid: "F202", fname: "Strawberry Cake", price: 40.00 },
          { fid: "F203", fname: "Eggless Cake", price: 45.00 },
          { fid: "F204", fname: "Chocolate Cake", price: 40.00 },
          { fid: "F205", fname: "Vanilla Cake", price: 30.00 },
          { fid: "F206", fname: "Black Forest Cake", price: 45.00 },
          { fid: "F207", fname: "Red Velvet Cake", price: 50.00 },
          { fid: "F208", fname: "Butterscotch Slice", price: 35.00 },
          { fid: "F209", fname: "Pineapple Pastry", price: 30.00 },
          { fid: "F210", fname: "Chocolate Mousse Cup", price: 50.00 },
          { fid: "F211", fname: "Brownie", price: 35.00 },
          { fid: "F212", fname: "Ice Cream Cup Vanilla", price: 25.00 },
          { fid: "F213", fname: "Ice Cream Cup Chocolate", price: 25.00 },
          { fid: "F214", fname: "Gulab Jamun (2pc)", price: 20.00 },
          { fid: "F215", fname: "Rasgulla (2pc)", price: 20.00 }
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
    console.log('🔍 FoodCourt - Current user from localStorage:', user);
    if (user) {
      console.log('👤 Parsed user data:', JSON.parse(user));
    }
  }, []);

  // Categories for Food Court
  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'cakes', name: 'Cakes', icon: '🎂' },
    { id: 'pastries', name: 'Pastries', icon: '🥮' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'icecream', name: 'Ice Cream', icon: '🍦' },
    { id: 'indian', name: 'Indian Sweets', icon: '🥠' }
  ];

  // Filter food items based on category and search
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.fname.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    if (selectedCategory === 'cakes') {
      return matchesSearch && item.fname.toLowerCase().includes('cake');
    }
    
    if (selectedCategory === 'pastries') {
      return matchesSearch && (
        item.fname.toLowerCase().includes('pastry') ||
        item.fname.toLowerCase().includes('slice')
      );
    }
    
    if (selectedCategory === 'desserts') {
      return matchesSearch && (
        item.fname.toLowerCase().includes('mousse') ||
        item.fname.toLowerCase().includes('brownie')
      );
    }
    
    if (selectedCategory === 'icecream') {
      return matchesSearch && item.fname.toLowerCase().includes('ice cream');
    }
    
    if (selectedCategory === 'indian') {
      return matchesSearch && (
        item.fname.toLowerCase().includes('gulab') ||
        item.fname.toLowerCase().includes('rasgulla')
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
      // Prepare order data
      const now = new Date();
      const foodItemsString = cart.map(item => item.fname).join(',');
      const subtotalAmount = calculateTotalWithGST(); // WITH GST

      // ✅ Get logged-in user from localStorage
      const storedUserData = localStorage.getItem('user');
      if (!storedUserData) {
        alert('Please log in to place an order.');
        navigate('/login');
        return;
      }

      const userData = JSON.parse(storedUserData);
      console.log('📦 User data from localStorage:', userData);
      
      // ✅ Use the ACTUAL user data from localStorage
      // Check if userId exists, if not use a fallback
      const userId = userData.userId || userData.id || '1';
      const username = userData.username || 'Customer';
      
      console.log('👤 Using for order - userId:', userId, 'username:', username);
      
      const orderData = {
        userid: userId.toString(), // Convert to string
        username: username,
        fooditems: foodItemsString,
        price: subtotalAmount.toString(), // WITHOUT GST
        billid: generateBillId(),
        date: formatDate(now),
        time: formatTime(now)
      };
      
      console.log('📤 Order data being sent:', orderData);
      
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
      <div className="foodcourt-loading">
        <div className="loading-spinner"></div>
        <p>Loading Food Court menu...</p>
      </div>
    );
  }

  return (
    <div className="foodcourt-container">
      {/* Header */}
      <header className="foodcourt-header">
        <button className="back-button" onClick={handleBackToHome}>
          ← Back to Home
        </button>
        <h1 className="foodcourt-title">🏪 Food Court - Dessert Paradise</h1>
        <div className="cart-summary">
          <span className="cart-icon">🛒</span>
          <span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          <span className="cart-total">₹{calculateSubtotal()}</span>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search desserts and sweets..."
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
      <main className="foodcourt-main">
        {/* Food Items Grid */}
        <section className="food-items-section">
          <h2 className="section-title">
            Delicious Desserts ({filteredItems.length})
            <span className="section-subtitle">Sweet treats for every craving</span>
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
                  </div>
                  <div className="food-item-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                    <div className="food-tags">
                      {getFoodTags(item.fname)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">
                <div className="no-items-icon">🍰</div>
                <p>No desserts found. Try a different search.</p>
              </div>
            )}
          </div>
        </section>

        {/* Cart Sidebar */}
        <aside className="cart-sidebar">
          <h2 className="cart-title">Your Dessert Order</h2>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🍰</div>
              <p>Your cart is empty</p>
              <p className="empty-cart-hint">Add sweet treats from the menu</p>
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
                Order Now (₹{calculateTotalWithGST().toFixed(2)})
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
          <span className="banner-icon">⏱️</span>
          <span>Freshly prepared daily</span>
        </div>
        <div className="banner-item">
          <span className="banner-icon">🥇</span>
          <span>Best quality ingredients</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="foodcourt-footer">
        <p>🏪 Food Court - A variety of cuisines from different restaurants all in one place</p>
        <p>Open 10 AM - 10 PM • Dine-in and Takeaway available</p>
      </footer>
    </div>
  );
};

// Helper function to get appropriate icon for food item
const getFoodIcon = (foodName) => {
  const name = foodName.toLowerCase();
  if (name.includes('cake')) return '🎂';
  if (name.includes('pastry') || name.includes('slice')) return '🥮';
  if (name.includes('mousse') || name.includes('brownie')) return '🍫';
  if (name.includes('ice cream')) return '🍦';
  if (name.includes('gulab') || name.includes('rasgulla')) return '🥠';
  return '🍰';
};

// Helper function to get food tags
const getFoodTags = (foodName) => {
  const name = foodName.toLowerCase();
  const tags = [];
  
  if (name.includes('eggless')) tags.push('🥚 Eggless');
  if (name.includes('chocolate')) tags.push('🍫 Chocolate');
  if (name.includes('vanilla')) tags.push('🌿 Vanilla');
  if (name.includes('mango') || name.includes('strawberry') || name.includes('pineapple')) {
    tags.push('🍓 Fruity');
  }
  if (name.includes('ice cream')) tags.push('❄️ Cold');
  if (name.includes('gulab') || name.includes('rasgulla')) tags.push('🇮🇳 Indian');
  if (name.includes('black forest')) tags.push('🌲 Forest');
  if (name.includes('red velvet')) tags.push('❤️ Velvet');
  
  return tags.map((tag, index) => (
    <span key={index} className="food-tag">{tag}</span>
  ));
};

export default FoodCourt;