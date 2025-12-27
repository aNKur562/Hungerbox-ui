import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CSS/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Username editing states
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Password editing states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // Delete account states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (location.state && location.state.userData) {
      setUserData(location.state.userData);
      setLoading(false);
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setLoading(false);
    }
  }, [location.state]);

  const handleBack = () => {
    navigate('/home');
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setNewUsername(userData.username || '');
    setUpdateMessage('');
    setMessageType('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUsername('');
    setUpdateMessage('');
    setMessageType('');
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setUpdateMessage('Username cannot be empty');
      setMessageType('error');
      return;
    }

    if (!userData.contactNumber) {
      setUpdateMessage('Contact number not found');
      setMessageType('error');
      return;
    }

    setIsUpdating(true);
    setUpdateMessage('');
    setMessageType('');

    try {
      const updateData = {
        username: newUsername.trim(),
        contactnumber: userData.contactNumber
      };

      console.log('Sending update request:', updateData);

      const response = await axios.put('http://localhost:8080/auth/updateUserData', updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Update response:', response.data);

      // Update local state
      const updatedUserData = {
        ...userData,
        username: newUsername.trim()
      };
      setUserData(updatedUserData);

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.username = newUsername.trim();
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      setUpdateMessage('Username updated successfully!');
      setMessageType('success');
      setIsEditing(false);

      setTimeout(() => {
        setUpdateMessage('');
        setMessageType('');
      }, 3000);

    } catch (error) {
      console.error('Error updating username:', error);
      
      let errorMessage = 'Failed to update username';
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
          errorMessage = 'Bad request. Please check your input.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setUpdateMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setUpdateMessage('');
    setMessageType('');
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setShowPassword({ old: false, new: false, confirm: false });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleUpdatePassword = async () => {
    // Validation
    if (!oldPassword.trim()) {
      setUpdateMessage('Please enter your current password');
      setMessageType('error');
      return;
    }

    if (!newPassword.trim()) {
      setUpdateMessage('Please enter a new password');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setUpdateMessage('New password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setUpdateMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    if (oldPassword === newPassword) {
      setUpdateMessage('New password must be different from the old password');
      setMessageType('error');
      return;
    }

    setIsUpdatingPassword(true);
    setUpdateMessage('');
    setMessageType('');

    try {
      const passwordData = {
        contactnumber: userData.contactNumber,
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim()
      };

      console.log('Sending password update request:', passwordData);

      const response = await axios.put('http://localhost:8080/auth/updatePassword', passwordData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Password update response:', response.data);

      setUpdateMessage('Password updated successfully!');
      setMessageType('success');

      // Clear form and close modal after success
      setTimeout(() => {
        handleClosePasswordModal();
        setUpdateMessage('');
        setMessageType('');
      }, 2000);

    } catch (error) {
      console.error('Error updating password:', error);
      
      let errorMessage = 'Failed to update password';
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
          errorMessage = 'Bad request. Please check your input.';
        } else if (error.response.status === 401) {
          errorMessage = 'Current password is incorrect';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setUpdateMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // ===== DELETE ACCOUNT FUNCTIONS =====

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeleteConfirmation('');
    setDeletePassword('');
    setShowDeleteForm(false);
    setUpdateMessage('');
    setMessageType('');
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmation('');
    setDeletePassword('');
    setShowDeleteForm(false);
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteForm) {
      // First step: Show warning and ask for confirmation
      if (deleteConfirmation.toLowerCase() !== 'delete my account') {
        setUpdateMessage('Please type "delete my account" to confirm');
        setMessageType('error');
        return;
      }
      setShowDeleteForm(true);
      setUpdateMessage('');
      return;
    }

    // Second step: Verify password and delete
    if (!deletePassword.trim()) {
      setUpdateMessage('Please enter your password to confirm deletion');
      setMessageType('error');
      return;
    }

    setIsDeleting(true);
    setUpdateMessage('');

    try {
      // First, verify the password by attempting to login
      const loginData = {
        contactnumber: userData.contactNumber,
        password: deletePassword
      };

      const loginResponse = await axios.post('http://localhost:8080/auth/login', loginData);
      
      if (loginResponse.data === "Invalid contact number or password") {
        setUpdateMessage('Incorrect password. Please try again.');
        setMessageType('error');
        setIsDeleting(false);
        return;
      }

      // If password is correct, proceed with deletion
      const deleteResponse = await axios.delete(
        'http://localhost:8080/auth/deletebycontact', 
        {
          params: { contactnumber: userData.contactNumber },
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('Delete response:', deleteResponse.data);

      if (deleteResponse.data === "User deleted successfully") {
        // Clear localStorage
        localStorage.removeItem('user');
        
        setUpdateMessage('Account deleted successfully. Redirecting to login...');
        setMessageType('success');

        // Redirect to login after delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setUpdateMessage(deleteResponse.data || 'Failed to delete account');
        setMessageType('error');
      }

    } catch (error) {
      console.error('Error deleting account:', error);
      
      let errorMessage = 'Failed to delete account';
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
          errorMessage = 'Bad request';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setUpdateMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={handleBack}>
            &larr; Back to Home
          </button>
          <h1>Profile</h1>
        </div>
        <div className="profile-content">
          <p className="no-data">No user data found. Please login again.</p>
          <button className="back-home-btn" onClick={handleBack}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay" onClick={handleClosePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={handleClosePasswordModal}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              {/* Password modal content remains the same */}
              {/* ... */}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button className="modal-close" onClick={handleCloseDeleteModal}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              {!showDeleteForm ? (
                <>
                  <div className="delete-warning">
                    <div className="warning-icon">⚠️</div>
                    <h3>Are you sure you want to delete your account?</h3>
                    <p className="warning-text">
                      This action <strong>cannot be undone</strong>. All your data, orders, and preferences will be permanently deleted.
                    </p>
                    
                    <div className="consequences-list">
                      <p><strong>You will lose:</strong></p>
                      <ul>
                        <li>Your profile information</li>
                        <li>Order history</li>
                        <li>Saved preferences</li>
                        <li>Account access</li>
                      </ul>
                    </div>
                    
                    <div className="confirmation-input">
                      <label htmlFor="deleteConfirmation">
                        To confirm, type <strong>"delete my account"</strong> below:
                      </label>
                      <input
                        type="text"
                        id="deleteConfirmation"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="confirmation-text"
                        placeholder='Type "delete my account" here'
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="delete-verification">
                  <div className="verification-icon">🔒</div>
                  <h3>Final Verification</h3>
                  <p className="verification-text">
                    Please enter your password to confirm account deletion:
                  </p>
                  
                  <div className="password-verification">
                    <label htmlFor="deletePassword">Your Password</label>
                    <input
                      type="password"
                      id="deletePassword"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="password-input-field"
                      placeholder="Enter your password"
                      disabled={isDeleting}
                    />
                    <p className="verification-hint">
                      This is required to verify your identity before permanent deletion.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {!showDeleteForm ? (
                <>
                  <button 
                    className="modal-btn cancel-btn" 
                    onClick={handleCloseDeleteModal}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="modal-btn delete-confirm-btn" 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="modal-btn cancel-btn" 
                    onClick={() => setShowDeleteForm(false)}
                    disabled={isDeleting}
                  >
                    Back
                  </button>
                  <button 
                    className="modal-btn delete-final-btn" 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="spinner"></span>
                        Deleting...
                      </>
                    ) : (
                      'Permanently Delete Account'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="profile-header">
        <button className="back-button" onClick={handleBack}>
          &larr; Back to Home
        </button>
        <h1>My Account</h1>
      </div>

      {/* Update Message */}
      {updateMessage && (
        <div className={`update-message ${messageType}`}>
          <div className="message-icon">
            {messageType === 'success' ? '✅' : '❌'}
          </div>
          <div className="message-text">{updateMessage}</div>
          <button 
            className="message-close"
            onClick={() => {
              setUpdateMessage('');
              setMessageType('');
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-avatar">
            {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="profile-name">{userData.username || 'User'}</h2>
          <p className="profile-role">Hunger Box Member</p>
        </div>

        {/* Profile Details */}
        <div className="profile-details-section">
          <h3 className="section-title">Account Information</h3>
          
          <div className="detail-card">
            <div className="detail-item">
              <span className="detail-label">Username</span>
              {isEditing ? (
                <div className="edit-username-container">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="username-input"
                    placeholder="Enter new username"
                    disabled={isUpdating}
                    maxLength="50"
                  />
                </div>
              ) : (
                <span className="detail-value">{userData.username || 'Not set'}</span>
              )}
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Contact Number</span>
              <span className="detail-value">{userData.contactNumber || 'Not provided'}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Account Status</span>
              <span className="detail-value status-active">Active</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button 
                className="action-btn save-btn" 
                onClick={handleSaveUsername}
                disabled={isUpdating}
              >
                <span className="action-icon">
                  {isUpdating ? '⏳' : '💾'}
                </span>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button 
                className="action-btn cancel-btn" 
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <span className="action-icon">❌</span>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="action-btn edit-btn" onClick={handleEditProfile}>
                <span className="action-icon">✏️</span>
                Edit Profile
              </button>
              
              <button className="action-btn password-btn" onClick={handleOpenPasswordModal}>
                <span className="action-icon">🔒</span>
                Change Password
              </button>
              
              <button className="action-btn delete-btn" onClick={handleOpenDeleteModal}>
                <span className="action-icon">🗑️</span>
                Delete Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;