import React, { useRef, useState } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';

const SettingsPage: React.FC = () => {
  const [email, setEmail] = useState('jane.doe@email.com');
  const [bio, setBio] = useState('Startup founder. Passionate about tech, sustainability, and innovation.');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Settings updated!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 500 }}>
        <h1 className={styles.brandTitle}>Settings</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
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
                cursor: 'pointer',
                border: profilePicture ? '2px solid #1e88e5' : undefined,
              }}
              title="Click to change profile picture"
              onClick={handleImageClick}
            >
              {!profilePicture && email[0]?.toUpperCase()}
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
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            className={styles.input}
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label className={styles.label} htmlFor="bio">Bio</label>
          <textarea
            className={styles.input}
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={4}
            style={{ resize: 'vertical' }}
          />
          {success && <div style={{ color: '#43a047', background: '#e8f5e9', borderRadius: 4, padding: '6px 10px', fontSize: '0.95rem', marginBottom: 4 }}>{success}</div>}
          <button className={buttonStyles.primaryButton} type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
