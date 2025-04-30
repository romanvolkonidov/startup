import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditJobModal from '../jobPost/EditJobModal';
import { useJobContext } from '../../context/JobContext';
import { useAuthContext } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    owner: string;
    ownerId?: string;
    ownerProfilePicture?: string;
    postedAt: string;
    amount?: number;
    returnPercent?: number;
    paybackTime?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    image?: string;
    video?: string;
    savedBy?: string[];
  };
  onJobDeleted?: (jobId: string) => void;
  onJobUpdated?: (job: any) => void;
  isMyPostsPage?: boolean;
}

const JobCard: React.FC<JobCardProps> = React.memo(({ 
  job, 
  onJobDeleted, 
  onJobUpdated,
  isMyPostsPage = false 
}) => {
  // Demo: Assume job.image and job.video are base64 or URL strings if present
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video' | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [contactsVisible, setContactsVisible] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { updateJobInList } = useJobContext?.() || {};
  const { savedJobs, saveJob, fetchJobs } = useJobContext?.() || {};
  const { currentUser, token } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState<any>(null);
  const [contactsError, setContactsError] = useState('');
  const navigate = useNavigate();
  
  // Profile related states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Demo fields (replace with real job.image/job.video when backend ready)
  const image = (job as any).image || null;
  const video = (job as any).video || null;

  // Determine if this job is saved by the current user
  const isSaved = !!savedJobs?.some(j => j.id === job.id);
  // For save count, assume job.savedBy is an array of user IDs
  const saveCount = (job as any).savedBy?.length || 0;
  // Consistently use ownerId for ownership check, falling back to owner only if it's an ID
  const isOwner = !!currentUser && (
    (job.ownerId && currentUser.id === job.ownerId) || 
    (job.owner && currentUser.id === job.owner)
  );

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    await saveJob?.(job.id);
    setSaving(false);
  };

  const handleShowContacts = async () => {
    if (!currentUser || !token) {
      navigate('/login', { state: { from: `/jobs/${job.id}` } });
      return;
    }
    
    // If user is the owner, just show contacts directly without API call to save a request
    if (isOwner) {
      setContacts({
        email: (job as any).email || currentUser.email,
        phone: (job as any).phone || '',
        whatsapp: (job as any).whatsapp || '',
        instagram: (job as any).instagram || '',
        facebook: (job as any).facebook || '',
      });
      setContactsVisible(true);
      return;
    }
    
    setContactsError('');
    setContactsVisible(true);
    
    try {
      // First attempt to use contact info directly from the job object if available
      if (job.email) {
        // If the job already has contact information, use it directly 
        // This avoids unnecessary API calls
        setContacts({
          email: job.email || '',
          phone: job.phone || '',
          whatsapp: job.whatsapp || '',
          instagram: job.instagram || '',
          facebook: job.facebook || '',
        });
        return;
      }

      // If we don't have the contact info already, fetch it from the API
      console.log('Fetching contacts for job ID:', job.id);
      const response = await jobService.getJobContacts(job.id, token);
      
      if (response.success === false) {
        setContactsError(response.message || 'Failed to load contacts');
        console.error('Contact fetch error:', response.message);
      } else {
        setContacts(response);
      }
    } catch (err) {
      console.error('Error fetching job contacts:', err);
      setContactsError('An error occurred. Please try again.');
    }
  };

  // Function to close contacts section
  const closeContacts = () => {
    setContactsVisible(false);
    setContacts(null);
  };

  // Function to fetch and show profile
  const handleShowProfile = async () => {
    if (!currentUser || !token) {
      navigate('/login', { state: { from: `/jobs/${job.id}` } });
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileModalOpen(true);
    
    try {
      // Get the user ID from the job owner
      const ownerId = job.ownerId || job.owner;
      
      // Fetch the user profile using userService
      const response = await userService.getUserById(ownerId, token);
      
      if (response.success === false) {
        setProfileError(response.message || 'Failed to load profile');
      } else {
        setOwnerProfile(response);
      }
    } catch (err) {
      setProfileError('An error occurred while loading profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Function to delete a job
  const handleDeleteJob = async () => {
    if (!currentUser || !isOwner) return;
    setDeleting(true);
    
    try {
      const res = await jobService.deleteJob(job.id);
      if (res.success) {
        if (onJobDeleted) {
          onJobDeleted(job.id);
        } else {
          // Refresh the jobs list if no callback provided
          fetchJobs?.();
        }
      } else {
        console.error('Failed to delete job:', res.message);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleJobUpdated = (updatedJob: any) => {
    // Call the prop callback if provided
    if (onJobUpdated) {
      onJobUpdated(updatedJob);
    } else {
      // Fall back to context method
      updateJobInList?.(updatedJob);
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(44, 62, 80, 0.08)',
        marginBottom: 24,
        padding: '24px 20px',
        borderLeft: isOwner ? '6px solid #8e24aa' : '6px solid #1976d2',
        transition: 'box-shadow 0.2s',
        position: 'relative',
        minHeight: 180,
        overflow: 'hidden',
      }}
    >
      {/* Media icons */}
      {(image || video) && (
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
          {image && (
            <span
              title="View image"
              style={{ cursor: 'pointer', background: '#fff', borderRadius: '50%', padding: 4, boxShadow: '0 1px 4px #0001' }}
              onClick={() => { setModalType('image'); setModalOpen(true); }}
            >
              <svg width="22" height="22" fill="#1e88e5" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zm-2 0H5V5h14zm-7-3l2.03 2.71a1 1 0 0 0 1.58 0L19 14.13V17H5v-1.13l3.47-4.34a1 1 0 0 1 1.58 0z"/></svg>
            </span>
          )}
          {video && (
            <span
              title="Play video"
              style={{ cursor: 'pointer', background: '#fff', borderRadius: '50%', padding: 4, boxShadow: '0 1px 4px #0001' }}
              onClick={() => { setModalType('video'); setModalOpen(true); }}
            >
              <svg width="22" height="22" fill="#e65100" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </span>
          )}
        </div>
      )}

      {/* Author with profile picture */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        {currentUser ? (
          <div 
            onClick={handleShowProfile}
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%', 
              marginRight: 12,
              background: job.ownerProfilePicture 
                ? `url(${job.ownerProfilePicture}) center/cover no-repeat` 
                : 'linear-gradient(135deg, #1e88e5 60%, #43a047 100%)',
              color: '#fff',
              fontSize: 16,
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
            onClick={() => navigate('/login', { state: { from: `/jobs/${job.id}` } })}
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%', 
              marginRight: 12,
              background: '#f5f5f5',
              border: '1px dashed #1976d2',
              color: '#1976d2',
              fontSize: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Login to view profile"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 7l-1.41 1.41M7 7l1.41 1.41M12 4v2M21 13h-2M3 13h2M12 20v-2M17 17l-1.41-1.41M7 17l1.41-1.41"></path>
            </svg>
          </div>
        )}
        <div>
          <h3 style={{ color: isOwner ? '#8e24aa' : '#1976d2', margin: 0, fontWeight: 700 }}>{job.title}</h3>
          <div style={{ fontSize: 14 }}>
            <span style={{ color: '#757575' }}>By {job.owner}</span>
            <span style={{ color: '#757575', margin: '0 6px' }}>&middot;</span>
            <span style={{ color: '#43a047', fontWeight: 500 }}>Posted {job.postedAt}</span>
            {isOwner && isMyPostsPage && (
              <>
                <span style={{ color: '#757575', margin: '0 6px' }}>&middot;</span>
                <span style={{ color: '#8e24aa', fontWeight: 500 }}>Your post</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p style={{ color: '#333', margin: '12px 0 8px 0', fontSize: '1.05rem' }}>{job.description}</p>
      {job.amount !== undefined && (
        <div style={{ color: '#1e88e5', fontWeight: 500, marginBottom: 4 }}>
          Amount Requested: <span style={{ color: '#43a047' }}>KES {job.amount?.toLocaleString()}</span>
        </div>
      )}
      {job.returnPercent !== undefined && (
        <div style={{ color: '#8e24aa', fontWeight: 500, marginBottom: 4 }}>
          Investor's Return: <span style={{ color: '#e65100' }}>{job.returnPercent}%</span>
        </div>
      )}
      {job.paybackTime && (
        <div style={{ color: '#757575', fontWeight: 500, marginBottom: 8 }}>
          Payback Time: <span style={{ color: '#222' }}>{job.paybackTime}</span>
        </div>
      )}
      
      {contactsVisible && contacts && (
        <div style={{ marginTop: 16, background: '#f7f7f7', borderRadius: 8, padding: 16, position: 'relative' }}>
          <button 
            style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#e65100' }}
            onClick={closeContacts}
          >
            &times;
          </button>
          <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Contact Information</h4>
          <div><b>Email:</b> {contacts.email || '-'}</div>
          {contacts.phone && <div><b>Phone:</b> {contacts.phone}</div>}
          {contacts.whatsapp && <div><b>WhatsApp:</b> {contacts.whatsapp}</div>}
          {contacts.instagram && <div><b>Instagram:</b> {contacts.instagram}</div>}
          {contacts.facebook && <div><b>Facebook:</b> {contacts.facebook}</div>}
        </div>
      )}
      
      {contactsError && (
        <div style={{ color: 'red', marginTop: 12, fontSize: 14 }}>{contactsError}</div>
      )}
      
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Heart (save) button - don't show on own posts page */}
        {!isMyPostsPage && (
          <button
            title={isSaved ? 'Unsave this post' : 'Save this post'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginRight: 8,
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              opacity: saving ? 0.6 : 1,
            }}
            onClick={handleSave}
            disabled={!!(saving || !currentUser || isOwner)}
          >
            {isSaved ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#e53935" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" /></svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" /></svg>
            )}
          </button>
        )}
        
        {isOwner && saveCount > 0 && !isMyPostsPage && (
          <span title="Number of users who saved this post" style={{ color: '#e53935', fontWeight: 600, fontSize: 15 }}>
            {saveCount} saved
          </span>
        )}
        
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {/* Only show Edit button to owners */}
          {isOwner && (
            <button
              style={{
                background: 'linear-gradient(90deg, #8e24aa 60%, #e65100 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(142, 36, 170, 0.10)',
                transition: 'background 0.2s',
              }}
              onClick={() => setEditModalOpen(true)}
            >
              Edit
            </button>
          )}
          
          {/* Delete button - only shown on My Posts page */}
          {isOwner && isMyPostsPage && (
            <button
              style={{
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)',
              }}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </button>
          )}
          
          {/* Contacts button - available to everyone */}
          <button
            style={{
              background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
              transition: 'background 0.2s',
            }}
            onClick={handleShowContacts}
            disabled={contactsVisible}
          >
            View Contacts
          </button>
        </div>
      </div>

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
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 400, maxHeight: 400, boxShadow: '0 4px 24px #0003', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#e65100' }} onClick={() => setModalOpen(false)}>&times;</button>
            {modalType === 'image' && image && (
              <img src={image} alt="Project" style={{ maxWidth: 350, maxHeight: 350, borderRadius: 8 }} />
            )}
            {modalType === 'video' && video && (
              <video src={video} controls style={{ maxWidth: 350, maxHeight: 350, borderRadius: 8 }} />
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 400, boxShadow: '0 4px 24px #0003', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#d32f2f', margin: '0 0 16px 0' }}>Delete this post?</h3>
            <p style={{ margin: '0 0 24px 0', color: '#555' }}>This action cannot be undone. Are you sure you want to delete this post?</p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                style={{
                  background: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => !deleting && setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                style={{
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: deleting ? 0.7 : 1,
                }}
                onClick={handleDeleteJob}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editModalOpen && (
        <EditJobModal
          job={job}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onJobUpdated={(updatedJob) => {
            handleJobUpdated(updatedJob);
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
});

export default JobCard;
