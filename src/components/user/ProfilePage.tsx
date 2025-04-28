import React, { useRef, useState } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';

const ProfilePage: React.FC = () => {
  // Dummy user data for demonstration
  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    bio: 'Startup founder. Passionate about tech, sustainability, and innovation.',
    joined: 'January 2024',
    profilePicture: '', // Add profilePicture field
  };

  // State for previewing uploaded image (for demonstration)
  const [preview, setPreview] = useState<string | null>(user.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 500 }}>
        <h1 className={styles.brandTitle}>Profile</h1>
        <div style={{ margin: '24px 0 16px 0', textAlign: 'center' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: preview
                ? `url(${preview}) center/cover no-repeat`
                : 'linear-gradient(135deg, #1e88e5 60%, #43a047 100%)',
              color: '#fff',
              fontSize: 36,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              cursor: 'pointer',
              border: preview ? '2px solid #1e88e5' : undefined,
            }}
            title="Click to change profile picture"
            onClick={handleImageClick}
          >
            {!preview && user.name[0]}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <h2 style={{ margin: 0, color: '#222', fontWeight: 600 }}>{user.name}</h2>
          <div style={{ color: '#757575', fontSize: 15 }}>{user.email}</div>
        </div>
        <div style={{ color: '#333', fontSize: '1.05rem', marginBottom: 16 }}>{user.bio}</div>
        <div style={{ color: '#8e24aa', fontWeight: 500, fontSize: 14 }}>Joined {user.joined}</div>
      </div>
    </div>
  );
};

export default ProfilePage;
