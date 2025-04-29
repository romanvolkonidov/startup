import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import JobCard from '../dashboard/JobCard';
import buttonStyles from '../../styles/components/Button.module.css';

interface MyPostsPageProps {
  savedOnly?: boolean;
}

const MyPostsPage: React.FC<MyPostsPageProps> = ({ savedOnly = false }) => {
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, token } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !token) {
      navigate('/login', { state: { from: savedOnly ? '/saved-posts' : '/my-posts' } });
      return;
    }
    
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        if (savedOnly) {
          data = await jobService.getSavedJobs(token);
        } else {
          data = await jobService.getMyJobs(token);
        }
        
        if (Array.isArray(data)) {
          setMyJobs(data);
        } else {
          setError(`Failed to fetch your ${savedOnly ? 'saved posts' : 'posts'}`);
        }
      } catch (err) {
        setError(`An error occurred while fetching your ${savedOnly ? 'saved posts' : 'posts'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [currentUser, token, navigate, savedOnly]);

  const handleJobDeleted = (deletedJobId: string) => {
    // Remove the deleted job from the list
    setMyJobs(prev => prev.filter(job => job.id !== deletedJobId));
  };

  const handleJobUpdated = (updatedJob: any) => {
    // Update the job in the list
    setMyJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#1976d2', fontWeight: 700, margin: 0 }}>{savedOnly ? 'Saved Posts' : 'My Posts'}</h1>
        <button 
          className={buttonStyles.primaryButton}
          style={{ maxWidth: 180 }}
          onClick={() => navigate('/post-project')}
        >
          Post New Project
        </button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 18, color: '#1976d2', marginBottom: 12 }}>Loading {savedOnly ? 'saved posts' : 'your posts'}...</div>
          <svg width="40" height="40" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="#e0e0e0" strokeWidth="4" fill="none" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#1976d2" strokeWidth="4" fill="none" />
          </svg>
        </div>
      ) : error ? (
        <div style={{ color: 'red', background: '#ffebee', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      ) : myJobs.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f5f5f5',
          borderRadius: 12,
          marginTop: 20
        }}>
          <div style={{ fontSize: 20, color: '#757575', marginBottom: 16 }}>
            {savedOnly 
              ? "You haven't saved any projects yet"
              : "You haven't posted any projects yet"
            }
          </div>
          <p style={{ color: '#757575', maxWidth: 450, margin: '0 auto 24px auto' }}>
            {savedOnly
              ? "Browse projects and save the ones you're interested in."
              : "Share your project ideas with potential investors and get the funding you need."
            }
          </p>
          <button 
            className={buttonStyles.primaryButton} 
            style={{ maxWidth: 200, margin: '0 auto' }}
            onClick={() => savedOnly ? navigate('/dashboard') : navigate('/post-project')}
          >
            {savedOnly ? 'Browse Projects' : 'Post Your First Project'}
          </button>
        </div>
      ) : (
        <div>
          {myJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onJobDeleted={handleJobDeleted}
              onJobUpdated={handleJobUpdated}
              isMyPostsPage={!savedOnly} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;