import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jobService } from '../../services/jobService';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video' | null>(null);

  // Demo fields (replace with real job.image/job.video when backend ready)
  const image = (job as any)?.image || null;
  const video = (job as any)?.video || null;

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError('');
      const res = await jobService.getJobById(id!);
      if (res && res.id) setJob(res);
      else setError(res.message || 'Job not found');
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  if (loading) return <div>Loading job details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!job) return null;

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
      <div style={{ color: '#757575', fontSize: 15, marginBottom: 16 }}>
        By {job.owner} &middot; <span style={{ color: '#43a047', fontWeight: 500 }}>Posted {job.postedAt}</span>
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
      <button
        style={{
          background: 'linear-gradient(90deg, #ff9800 60%, #8e24aa 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 32px',
          fontWeight: 600,
          fontSize: '1.1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.10)',
          transition: 'background 0.2s',
        }}
        onClick={() => window.location.href = '/invest'}
      >
        Invest / Support
      </button>
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
    </div>
  );
};

export default JobDetails;
