import React from 'react';
import { Link } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import { useAuthContext } from '../context/AuthContext';
import buttonStyles from '../styles/components/Button.module.css';

const HomePage: React.FC = () => {
  const { currentUser } = useAuthContext();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1976d2 0%, #8e24aa 100%)',
        color: '#fff',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background shapes */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          zIndex: 0,
          background: 'linear-gradient(45deg, #ffffff11 25%, transparent 25%, transparent 50%, #ffffff11 50%, #ffffff11 75%, transparent 75%, transparent)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ 
          maxWidth: 900, 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            marginBottom: 16,
          }}>
            Connect. Invest. <span style={{ color: '#ff9800' }}>Grow.</span>
          </h1>

          <p style={{
            fontSize: '1.4rem',
            maxWidth: 700,
            margin: '0 auto 40px auto',
            lineHeight: 1.5,
          }}>
            StartApp Connect brings entrepreneurs and investors together to build the next generation of successful businesses.
          </p>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {currentUser ? (
              <>
                <Link to="/post-project">
                  <button className={buttonStyles.primaryButton} style={{
                    background: 'linear-gradient(90deg, #ff9800 60%, #8e24aa 100%)',
                    fontSize: '1.1rem',
                    padding: '14px 32px',
                    boxShadow: '0 4px 16px rgba(255, 152, 0, 0.2)',
                  }}>
                    Post Your Project
                  </button>
                </Link>
                <Link to="/dashboard">
                  <button className={buttonStyles.primaryButton} style={{
                    background: 'linear-gradient(90deg, #43a047 60%, #1e88e5 100%)',
                    fontSize: '1.1rem',
                    padding: '14px 32px',
                  }}>
                    Browse Projects
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className={buttonStyles.primaryButton} style={{
                    background: 'linear-gradient(90deg, #ff9800 60%, #8e24aa 100%)',
                    fontSize: '1.1rem',
                    padding: '14px 32px',
                    boxShadow: '0 4px 16px rgba(255, 152, 0, 0.2)',
                  }}>
                    Join Now
                  </button>
                </Link>
                <Link to="/login">
                  <button className={buttonStyles.primaryButton} style={{
                    background: 'linear-gradient(90deg, #43a047 60%, #1e88e5 100%)',
                    fontSize: '1.1rem',
                    padding: '14px 32px',
                  }}>
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '2.2rem',
          color: '#1976d2',
          marginBottom: 48
        }}>
          How It Works
        </h2>

        <div style={{ 
          display: 'flex',
          gap: 40,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            flex: '1 1 300px',
            maxWidth: 350,
            padding: 24,
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            background: '#fff',
            transition: 'transform 0.3s',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e88e5 60%, #43a047 100%)',
              margin: '0 auto 24px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: '#fff',
              fontWeight: 'bold'
            }}>1</div>
            <h3 style={{ color: '#1976d2', marginBottom: 16 }}>Post Your Project</h3>
            <p style={{ color: '#333', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Share your startup vision or business idea with our community, detailing your goals and investment needs.
            </p>
          </div>

          <div style={{ 
            flex: '1 1 300px',
            maxWidth: 350,
            padding: 24,
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            background: '#fff',
            transition: 'transform 0.3s',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8e24aa 60%, #e65100 100%)',
              margin: '0 auto 24px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: '#fff',
              fontWeight: 'bold'
            }}>2</div>
            <h3 style={{ color: '#8e24aa', marginBottom: 16 }}>Connect with Investors</h3>
            <p style={{ color: '#333', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Get discovered by potential investors who are looking for opportunities that match their investment criteria.
            </p>
          </div>

          <div style={{ 
            flex: '1 1 300px',
            maxWidth: 350,
            padding: 24,
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            background: '#fff',
            transition: 'transform 0.3s',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff9800 60%, #1e88e5 100%)',
              margin: '0 auto 24px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: '#fff',
              fontWeight: 'bold'
            }}>3</div>
            <h3 style={{ color: '#ff9800', marginBottom: 16 }}>Grow Together</h3>
            <p style={{ color: '#333', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Build successful partnerships and take your business to new heights with the right funding and support.
            </p>
          </div>
        </div>
      </section>

      {/* Trending projects section */}
      <section style={{ 
        background: '#f7f9fc',
        padding: '60px 24px 80px 24px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.2rem',
            color: '#1976d2',
            textAlign: 'center',
            marginBottom: 48
          }}>
            Trending Projects
          </h2>
          
          <Dashboard />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
