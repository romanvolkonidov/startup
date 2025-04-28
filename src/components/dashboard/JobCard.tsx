import React, { useState } from 'react';
import EditJobModal from '../jobPost/EditJobModal';
import { useJobContext } from '../../context/JobContext';
import { useAuthContext } from '../../context/AuthContext';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    owner: string;
    postedAt: string;
    amount?: number;
    returnPercent?: number;
    paybackTime?: string;
    // ...other possible fields
  };
}

const JobCard: React.FC<JobCardProps> = React.memo(({ job }) => {
  // Demo: Assume job.image and job.video are base64 or URL strings if present
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video' | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { updateJobInList } = useJobContext?.() || {};
  const { savedJobs, saveJob } = useJobContext?.() || {};
  const { currentUser } = useAuthContext();
  const [saving, setSaving] = useState(false);

  // Demo fields (replace with real job.image/job.video when backend ready)
  const image = (job as any).image || null;
  const video = (job as any).video || null;

  // Determine if this job is saved by the current user
  const isSaved = !!savedJobs?.some(j => j.id === job.id);
  // For save count, assume job.savedBy is an array of user IDs
  const saveCount = (job as any).savedBy?.length || 0;
  const isOwner = currentUser && currentUser.id === job.owner;

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    await saveJob?.(job.id);
    setSaving(false);
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(44, 62, 80, 0.08)',
        marginBottom: 24,
        padding: '24px 20px',
        borderLeft: '6px solid #1976d2',
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
      <h3 style={{ color: '#1976d2', margin: 0, fontWeight: 700 }}>{job.title}</h3>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
        <span style={{ color: '#757575' }}>By {job.owner}</span>
        <span style={{ color: '#43a047', fontWeight: 500 }}>Posted {job.postedAt}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {/* Heart (save) button */}
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
          disabled={saving || !currentUser}
        >
          {isSaved ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#e53935" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" /></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" /></svg>
          )}
        </button>
        {isOwner && (
          <span title="Number of users who saved this post" style={{ color: '#e53935', fontWeight: 600, fontSize: 15 }}>
            {saveCount} saved
          </span>
        )}
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
        <button
          style={{
            background: 'linear-gradient(90deg, #ff9800 60%, #8e24aa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.10)',
            transition: 'background 0.2s',
          }}
        >
          Invest / Support
        </button>
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
      {/* Edit Job Modal */}
      {editModalOpen && (
        <EditJobModal
          job={job}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onJobUpdated={updateJobInList || (() => {})}
        />
      )}
    </div>
  );
});

export default JobCard;
