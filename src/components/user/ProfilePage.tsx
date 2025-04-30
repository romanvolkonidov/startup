import React, { useRef, useState, useEffect } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';

const ProfilePage: React.FC = () => {
  const { currentUser, token, setCurrentUser } = useAuthContext();
  const { addNotification } = useNotificationContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // User data with default values
  const [userData, setUserData] = useState({
    name: currentUser?.name || 'User',
    email: currentUser?.email || '',
    bio: currentUser?.bio || 'No bio yet.',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    website: currentUser?.website || '',
    joined: currentUser?.joined || 'January 2024',
  });
  
  // State for profile image
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser?.profilePicture || null);
  const [previewImage, setPreviewImage] = useState<string | null>(currentUser?.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !token) return;
      
      try {
        const response = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUserData({
            name: userData.name || currentUser.name || 'User',
            email: userData.email || currentUser.email || '',
            bio: userData.bio || 'No bio yet.',
            phone: userData.phone || '',
            location: userData.location || '',
            website: userData.website || '',
            joined: userData.joined || 'January 2024',
          });
          
          if (userData.profilePicture) {
            setProfilePicture(userData.profilePicture);
            setPreviewImage(userData.profilePicture);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    
    fetchUserData();
  }, [currentUser, token]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!currentUser || !token) {
      setError('You must be logged in to update your profile');
      setLoading(false);
      return;
    }
    
    try {
      // Handle profile picture upload if changed
      let profilePictureUrl = profilePicture;
      
      if (previewImage !== profilePicture && fileInputRef.current?.files?.[0]) {
        try {
          const formData = new FormData();
          formData.append('profilePicture', fileInputRef.current.files[0]);
          
          console.log('Uploading profile picture...');
          const uploadResponse = await fetch('/api/upload/profile-picture', {
            method: 'POST',
            headers: { 
              Authorization: `Bearer ${token}` 
            },
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            profilePictureUrl = uploadData.url;
            console.log('Profile picture uploaded successfully:', profilePictureUrl);
          } else {
            console.error('Upload response error:', await uploadResponse.text());
            throw new Error('Failed to upload profile picture');
          }
        } catch (uploadErr) {
          console.error('Profile picture upload error:', uploadErr);
          throw new Error('Failed to upload profile picture');
        }
      }
      
      // Ensure bio is a string, not an object
      const bioValue = typeof userData.bio === 'object' ? JSON.stringify(userData.bio) : userData.bio;
      
      // Update user profile with all data
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...userData,
          bio: bioValue,
          profilePicture: profilePictureUrl,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update state with successful upload data
        if (data.user && data.user.profilePicture) {
          setProfilePicture(data.user.profilePicture);
          setPreviewImage(data.user.profilePicture);
        }
        
        setSuccess('Profile updated successfully!');
        
        // Update context with new user data
        if (data.user) {
          setCurrentUser({
            ...currentUser, 
            ...data.user
          });
        }
        
        // Show notification
        addNotification({
          message: 'Profile updated successfully!',
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      
      // Show error notification
      addNotification({
        message: err.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setPreviewImage(profilePicture);
    setUserData({
      name: currentUser?.name || 'User',
      email: currentUser?.email || '',
      bio: currentUser?.bio || 'No bio yet.',
      phone: currentUser?.phone || '',
      location: currentUser?.location || '',
      website: currentUser?.website || '',
      joined: currentUser?.joined || 'January 2024',
    });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 500 }}>
        <h1 className={styles.brandTitle}>Profile</h1>
        
        {isEditing ? (
          // Edit mode with form
          <form onSubmit={handleSubmit} className={styles.form}>
            <div style={{ margin: '24px 0 16px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: previewImage
                    ? `url(${previewImage}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #1e88e5 60%, #43a047 100%)',
                  color: '#fff',
                  fontSize: 36,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  cursor: 'pointer',
                  border: previewImage ? '2px solid #1e88e5' : undefined,
                }}
                title="Click to change profile picture"
                onClick={handleImageClick}
              >
                {!previewImage && (userData.name[0] || 'U')}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
              <div style={{ color: '#757575', fontSize: 13, marginTop: 4 }}>Click to upload profile picture</div>
            </div>
            
            <label className={styles.label} htmlFor="name">Name</label>
            <input 
              className={styles.input}
              id="name"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              required
            />
            
            <label className={styles.label} htmlFor="email">Email</label>
            <input 
              className={styles.input}
              id="email"
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              required
              disabled
            />
            
            <label className={styles.label} htmlFor="bio">Bio</label>
            <textarea 
              className={styles.input}
              id="bio"
              name="bio"
              value={userData.bio}
              onChange={handleInputChange}
              rows={4}
              style={{ resize: 'vertical' }}
            />
            
            <label className={styles.label} htmlFor="phone">Phone</label>
            <input 
              className={styles.input}
              id="phone"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
            />
            
            <label className={styles.label} htmlFor="location">Location</label>
            <input 
              className={styles.input}
              id="location"
              name="location"
              value={userData.location}
              onChange={handleInputChange}
            />
            
            <label className={styles.label} htmlFor="website">Website</label>
            <input 
              className={styles.input}
              id="website"
              name="website"
              value={userData.website}
              onChange={handleInputChange}
            />
            
            {error && <div style={{ color: '#e65100', fontSize: '0.95rem', marginTop: 8 }}>{error}</div>}
            {success && <div style={{ color: '#43a047', fontSize: '0.95rem', marginTop: 8 }}>{success}</div>}
            
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <button 
                type="submit" 
                className={buttonStyles.primaryButton}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              <button 
                type="button" 
                onClick={cancelEditing}
                style={{
                  background: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: 6,
                  padding: '12px 0',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          // View mode
          <>
            <div style={{ margin: '24px 0 16px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: profilePicture
                    ? `url(${profilePicture}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #1e88e5 60%, #43a047 100%)',
                  color: '#fff',
                  fontSize: 36,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                {!profilePicture && (userData.name[0] || 'U')}
              </div>
              <h2 style={{ margin: 0, color: '#222', fontWeight: 600 }}>{userData.name}</h2>
              <div style={{ color: '#757575', fontSize: 15 }}>{userData.email}</div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#1976d2', margin: '0 0 8px 0', fontWeight: 600, fontSize: '1.1rem' }}>Bio</h3>
              <div style={{ color: '#333', fontSize: '1.05rem' }}>{userData.bio}</div>
            </div>
            
            {userData.phone && (
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ color: '#1976d2', margin: '0 0 4px 0', fontWeight: 600, fontSize: '1rem' }}>Phone</h3>
                <div style={{ color: '#333' }}>{userData.phone}</div>
              </div>
            )}
            
            {userData.location && (
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ color: '#1976d2', margin: '0 0 4px 0', fontWeight: 600, fontSize: '1rem' }}>Location</h3>
                <div style={{ color: '#333' }}>{userData.location}</div>
              </div>
            )}
            
            {userData.website && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ color: '#1976d2', margin: '0 0 4px 0', fontWeight: 600, fontSize: '1rem' }}>Website</h3>
                <a href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style={{ color: '#8e24aa', textDecoration: 'none' }}
                >
                  {userData.website}
                </a>
              </div>
            )}
            
            <div style={{ color: '#8e24aa', fontWeight: 500, fontSize: 14, marginBottom: 24 }}>Joined {userData.joined}</div>
            
            <button 
              onClick={() => setIsEditing(true)} 
              className={buttonStyles.primaryButton} 
              style={{
                background: 'linear-gradient(90deg, #43a047 60%, #1e88e5 100%)',
              }}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
