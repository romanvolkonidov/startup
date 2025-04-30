import React, { useEffect } from 'react';
import { useJobContext } from '../context/JobContext';
import { useAuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import JobCard from '../components/dashboard/JobCard';

const MyPostsPage: React.FC = () => {
  const { 
    myJobs, 
    myJobsLoading, 
    myJobsError, 
    fetchMyJobs, 
    deleteMyJob, 
    updateMyJobInList 
  } = useJobContext();
  
  const { currentUser, loading } = useAuthContext();

  useEffect(() => {
    // Fetch user's posts when the component mounts
    fetchMyJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If authentication is still loading, show loading state
  if (loading) {
    return <div className="loading-container">Loading user data...</div>;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: '/my-posts' }} />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        color: '#1976d2', 
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#8e24aa">
          <path d="M14,10H2V12H14V10M14,6H2V8H14V6M2,16H10V14H2V16M21.5,11.5L23,13L16,20L11.5,15.5L13,14L16,17L21.5,11.5Z" />
        </svg>
        My Posts
      </h1>
      
      {myJobsLoading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          background: '#f5f5f5',
          borderRadius: 8 
        }}>
          <div style={{ 
            fontSize: 18, 
            color: '#1976d2', 
            marginBottom: 16 
          }}>
            Loading your posts...
          </div>
          <svg width="40" height="40" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="#e0e0e0" strokeWidth="4" fill="none" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#1976d2" strokeWidth="4" fill="none" />
          </svg>
        </div>
      ) : myJobsError ? (
        <div style={{ 
          padding: 24, 
          background: '#ffebee', 
          color: '#d32f2f',
          borderRadius: 8,
          border: '1px solid #ffcdd2',
          marginBottom: 24
        }}>
          <strong>Error loading your posts:</strong> {myJobsError}
          <div style={{ marginTop: 16 }}>
            <button 
              onClick={() => fetchMyJobs()} 
              style={{ 
                background: '#d32f2f', 
                color: 'white',
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: 4,
                cursor: 'pointer' 
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      ) : myJobs.length === 0 ? (
        <div style={{ 
          padding: 32, 
          background: '#e8f5e9', 
          borderRadius: 8,
          border: '1px solid #c8e6c9',
          textAlign: 'center',
          color: '#2e7d32'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#43a047" style={{ marginBottom: 16 }}>
            <path d="M19,20H5V4H7V7H17V4H19M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M14.8,8H9.2C7.9,8 7,8.9 7,10.2V13.8C7,15.1 7.9,16 9.2,16H14.8C16.1,16 17,15.1 17,13.8V10.2C17,8.9 16.1,8 14.8,8M14,12V11H16V12H14M11,12V11H13V12H11M8,12V11H10V12H8Z" />
          </svg>
          <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>
            You haven't posted any jobs yet
          </h3>
          <p style={{ marginBottom: 20, color: '#37474f', maxWidth: 500, margin: '0 auto' }}>
            Create your first job post to promote your business, request funding, or offer services. 
            Your posts will appear here for easy management.
          </p>
          <button 
            onClick={() => window.location.href = '/create-job'}
            style={{ 
              background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 6,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
            }}
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: 24, 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ color: '#8e24aa', fontWeight: 600, fontSize: '1.1rem' }}>
                {myJobs.length} {myJobs.length === 1 ? 'Post' : 'Posts'}
              </span>
            </div>
            
            <button 
              onClick={() => window.location.href = '/create-job'}
              style={{ 
                background: 'linear-gradient(90deg, #8e24aa 60%, #e65100 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(142, 36, 170, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              New Post
            </button>
          </div>
          
          {myJobs.map(job => (
            <JobCard 
              key={job.id}
              job={job}
              isMyPostsPage={true} 
              onJobDeleted={(jobId) => {
                // Job deletion is handled by the card itself using deleteMyJob
              }}
              onJobUpdated={(updatedJob) => {
                // Update in the context
                updateMyJobInList(updatedJob);
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default MyPostsPage;