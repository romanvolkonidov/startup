import React, { useState } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { jobService } from '../../services/jobService';

interface EditJobModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated: (job: any) => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, isOpen, onClose, onJobUpdated }) => {
  const [form, setForm] = useState({
    title: job.title || '',
    description: job.description || '',
    amount: job.amount || '',
    returnPercent: job.returnPercent || '',
    paybackTime: job.paybackTime || '',
    image: job.image || '',
    video: job.video || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updated = await jobService.updateJob(job.id, form);
      if (updated && updated.success) {
        onJobUpdated(updated.job);
        onClose();
      } else {
        setError(updated.message || 'Failed to update job');
      }
    } catch (err) {
      setError('Failed to update job');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 350, maxWidth: 420, boxShadow: '0 4px 24px #0003', position: 'relative' }}>
        <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#e65100' }} onClick={onClose}>&times;</button>
        <h2>Edit Job</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>Title</label>
          <input className={styles.input} name="title" value={form.title} onChange={handleChange} required />
          <label className={styles.label}>Description</label>
          <textarea className={styles.input} name="description" value={form.description} onChange={handleChange} required />
          <label className={styles.label}>Amount Requested</label>
          <input className={styles.input} name="amount" type="number" value={form.amount} onChange={handleChange} />
          <label className={styles.label}>Investor's Return (%)</label>
          <input className={styles.input} name="returnPercent" type="number" value={form.returnPercent} onChange={handleChange} />
          <label className={styles.label}>Payback Time</label>
          <input className={styles.input} name="paybackTime" value={form.paybackTime} onChange={handleChange} />
          <label className={styles.label}>Image URL</label>
          <input className={styles.input} name="image" value={form.image} onChange={handleChange} />
          <label className={styles.label}>Video URL</label>
          <input className={styles.input} name="video" value={form.video} onChange={handleChange} />
          {error && <div className={styles.error}>{error}</div>}
          <button className={buttonStyles.primaryButton} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;
