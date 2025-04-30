import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { useAuthContext } from '../../context/AuthContext';
import { isValidObjectId } from '../../utils/validateForm';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, token } = useAuthContext();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video' | null>(null);
  const [contacts, setContacts] = useState<any>(null);
  const [contactsError, setContactsError] = useState('');
  
  // Profile related states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Demo fields (replace with real job.image/job.video when backend ready)
  const image = (job as any)?.image || null;
  const video = (job as any)?.video || null;

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError('');
      
      if (!id || !isValidObjectId(id)) {
        setError('Invalid job ID');
        setLoading(false);
        return;
      }
      
      const res = await jobService.getJobById(id);
      if (res && res.id) setJob(res);
      else setError(res.message || 'Job not found');
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  const handleShowContacts = async () => {
    if (!currentUser || !token) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    
    if (!id || !isValidObjectId(id)) {
      setContactsError('Invalid job ID');
      return;
    }
    
    setContactsError('');
    const res = await jobService.getJobContacts(id!, token);
    if (res && !res.success && res.message) {
      setContactsError('Please log in to view contacts.');
    } else {
      setContacts(res);
    }
  };

  // Function to fetch and show profile
  const handleShowProfile = async () => {
    if (!currentUser || !token) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileModalOpen(true);
    
    try {
      // Get the user ID from the job owner
      const ownerId = job.ownerId || job.owner;
      
      // Fetch the user profile
      const response = await fetch(`/api/users/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOwnerProfile(data);
      } else {
        setProfileError(data.message || 'Failed to load profile');
      }
    } catch (err) {
      setProfileError('An error occurred while loading profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) return <div>Loading job details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!job) return null;

  const isOwner = currentUser && currentUser.id === job.owner;

  return (
    <div style={{
      maxWidth: 600,
      margin: '40px auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(44, 62, 80, 0.10)',
      padding: '40px 32px',
      position: 'relative',
      minHeight: 400,
    }}>
      {/* Media preview at top */}
      {(image || video) && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {image && (
            <span
              title="View image"
              style={{ cursor: 'pointer', background: '#f7f7f7', borderRadius: 8, padding: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0' }}
              onClick={() => { setModalType('image'); setModalOpen(true); }}
            >
              <img src={image} alt="Project" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
            </span>
          )}
          {video && (
            <span
              title="Play video"
              style={{ cursor: 'pointer', background: '#f7f7f7', borderRadius: 8, padding: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0' }}
              onClick={() => { setModalType('video'); setModalOpen(true); }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" rx="8" fill="#e65100"/><polygon points="24,18 24,42 44,30" fill="#fff"/></svg>
            </span>
          )}
        </div>
      )}
      <h1 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 8 }}>{job.title}</h1>
      
      {/* Author with profile picture */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        {currentUser ? (
          <div 
            onClick={handleShowProfile}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              marginRight: 12,
              background: job.ownerProfilePicture 
                ? `url(${job.ownerProfilePicture}) center/cover no-repeat` 
                : 'linear-gradient(135deg, #1e88e5 60%, #43a047 100%)',
              color: '#fff',
              fontSize: 18,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title="View profile"
          >
            {!job.ownerProfilePicture && job.owner ? job.owner[0].toUpperCase() : ''}
          </div>
        ) : (
          <div 
            onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              marginRight: 12,
              background: '#f5f5f5',
              border: '1px dashed #1976d2',
              color: '#1976d2',
              fontSize: 18,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Login to view profile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 7l-1.41 1.41M7 7l1.41 1.41M12 4v2M21 13h-2M3 13h2M12 20v-2M17 17l-1.41-1.41M7 17l1.41-1.41"></path>
            </svg>
          </div>
        )}
        <div>
          <div style={{ color: '#757575', fontSize: 15 }}>
            By <span style={{ fontWeight: 500 }}>{job.owner}</span> &middot; <span style={{ color: '#43a047', fontWeight: 500 }}>Posted {job.postedAt}</span>
          </div>
        </div>
      </div>
      
      <p style={{ color: '#333', fontSize: '1.1rem', marginBottom: 32 }}>{job.description}</p>
      {job.amount !== undefined && (
        <div style={{ color: '#1e88e5', fontWeight: 500, marginBottom: 8 }}>
          Amount Requested: <span style={{ color: '#43a047' }}>KES {job.amount?.toLocaleString()}</span>
        </div>
      )}
      {job.returnPercent !== undefined && (
        <div style={{ color: '#8e24aa', fontWeight: 500, marginBottom: 8 }}>
          Investor's Return: <span style={{ color: '#e65100' }}>{job.returnPercent}%</span>
        </div>
      )}
      {job.paybackTime && (
        <div style={{ color: '#757575', fontWeight: 500, marginBottom: 24 }}>
          Payback Time: <span style={{ color: '#222' }}>{job.paybackTime}</span>
        </div>
      )}
      
      {/* Edit button for owners */}
      {isOwner && (
        <button
          style={{
            background: 'linear-gradient(90deg, #8e24aa 60%, #e65100 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(142, 36, 170, 0.10)',
            transition: 'background 0.2s',
            marginRight: 16,
          }}
          onClick={() => navigate(`/edit-job/${id}`)}
        >
          Edit Project
        </button>
      )}
      
      {/* Contacts button */}
      <button 
        onClick={handleShowContacts} 
        style={{
          background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 8, 
          padding: '10px 24px', 
          fontWeight: 600, 
          fontSize: '1rem', 
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
        }}
      >
        Show Contacts
      </button>
      
      {contactsError && <div style={{ color: 'red', marginTop: 8 }}>{contactsError}</div>}
      {contacts && (
        <div style={{ marginTop: 16, background: '#f7f7f7', borderRadius: 8, padding: 16 }}>
          <div><b>Email:</b> {contacts.email || '-'}</div>
          {contacts.phone && <div><b>Phone:</b> {contacts.phone}</div>}
          {contacts.whatsapp && <div><b>WhatsApp:</b> {contacts.whatsapp}</div>}
          {contacts.instagram && <div><b>Instagram:</b> {contacts.instagram}</div>}
          {contacts.facebook && <div><b>Facebook:</b> {contacts.facebook}</div>}
        </div>
      )}
      
      {/* Modal for image/video preview */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setModalOpen(false)}
        >
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 500, maxHeight: 500, boxShadow: '0 4px 24px #0003', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#e65100' }} onClick={() => setModalOpen(false)}>&times;</button>
            {modalType === 'image' && image && (
              <img src={image} alt="Project" style={{ maxWidth: 450, maxHeight: 450, borderRadius: 8 }} />
            )}
            {modalType === 'video' && video && (
              <video src={video} controls style={{ maxWidth: 450, maxHeight: 450, borderRadius: 8 }} />
            )}
          </div>
        </div>
      )}
      
      {/* Profile Modal */}
      {profileModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
          onClick={() => setProfileModalOpen(false)}
        >
          <div 
            style={{ 
              background: '#fff', 
              borderRadius: 16, 
              padding: 32, 
              maxWidth: 450,
              maxHeight: '90vh',
              width: '100%',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)', 
              position: 'relative',
              overflow: 'auto'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#e65100' }} 
              onClick={() => setProfileModalOpen(false)}
            >
              &times;
            </button>
            
            {profileLoading ? (
              <div style={{ textAlign: 'center', padding: 30 }}>
                <div style={{ fontSize: 18, color: '#1976d2', marginBottom: 8 }}>Loading profile...</div>
                <svg width="40" height="40" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  <circle cx="12" cy="12" r="10" stroke="#e0e0e0" strokeWidth="4" fill="none" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#1976d2" strokeWidth="4" fill="none" />
                </svg>
              </div>
            ) : profileError ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#e53935' }}>
                {profileError}
              </div>
            ) : ownerProfile ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: ownerProfile.profilePicture
                      ? `url(${ownerProfile.profilePicture}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #1e88e5 60%, #43a047 100%)',
                    color: '#fff',
                    fontSize: 36,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}>
                    {!ownerProfile.profilePicture && (ownerProfile.name?.[0] || 'U')}
                  </div>
                  <h2 style={{ margin: 0, color: '#222', fontWeight: 600 }}>{ownerProfile.name}</h2>
                  <div style={{ color: '#757575', fontSize: 15 }}>{ownerProfile.email}</div>
                </div>
                
                {ownerProfile.bio && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ color: '#1976d2', margin: '0 0 8px 0', fontWeight: 600, fontSize: '1.1rem' }}>Bio</h3>
                    <div style={{ color: '#333', fontSize: '1.05rem' }}>{ownerProfile.bio}</div>
                  </div>
                )}
                
                {ownerProfile.phone && (
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ color: '#1976d2', margin: '0 0 4px 0', fontWeight: 600, fontSize: '1rem' }}>Phone</h3>
                    <div style={{ color: '#333' }}>{ownerProfile.phone}</div>
                  </div>
                )}
                
                {ownerProfile.location && (
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ color: '#1976d2', margin: '0 0 4px 0', fontWeight: 600, fontSize: '1rem' }}>Location</h3>
                    <div style={{ color: '#333' }}>{ownerProfile.location}</div>
                  </div>
                )}
                
                {ownerProfile.website && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ color: '#1976d2', margin: '0 0 4px 0', fontWeight: 600, fontSize: '1rem' }}>Website</h3>
                    <a 
                      href={ownerProfile.website.startsWith('http') ? ownerProfile.website : `https://${ownerProfile.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#8e24aa', textDecoration: 'none' }}
                    >
                      {ownerProfile.website}
                    </a>
                  </div>
                )}
                
                {ownerProfile.joined && (
                  <div style={{ color: '#8e24aa', fontWeight: 500, fontSize: 14, marginBottom: 24 }}>
                    Joined {ownerProfile.joined}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 30, color: '#1976d2' }}>
                No profile information available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
