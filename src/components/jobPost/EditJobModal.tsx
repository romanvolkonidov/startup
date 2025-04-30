import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { jobService } from '../../services/jobService';
import { useNotificationContext } from '../../context/NotificationContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface EditJobModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated: (job: any) => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, isOpen, onClose, onJobUpdated }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(job.image || null);
  const [videoPreview, setVideoPreview] = useState<string | null>(job.video || null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotificationContext();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const validationSchema = Yup.object({
    title: Yup.string().min(3, 'Title must be at least 3 characters').required('Project title is required'),
    description: Yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
    amount: Yup.number().min(1, 'Amount must be at least 1').required('Amount is required'),
    returnPercent: Yup.number().min(1, 'Return must be at least 1%').max(100, 'Return cannot exceed 100%').required('Return (%) is required'),
    paybackTime: Yup.string().required('Payback time is required'),
    phone: Yup.string(),
    whatsapp: Yup.string(),
    instagram: Yup.string(),
    facebook: Yup.string(),
  });

  const handleMediaUpload = async (imageFile: File | null, videoFile: File | null) => {
    if (!imageFile && !videoFile) return { image: job.image, video: job.video };
    
    const formData = new FormData();
    if (imageFile) formData.append('image', imageFile);
    if (videoFile) formData.append('video', videoFile);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/upload/job-media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error('Failed to upload media');
      
      const data = await res.json();
      return {
        image: imageFile ? data.image : job.image,
        video: videoFile ? data.video : job.video,
      };
    } catch (err) {
      console.error('Media upload error:', err);
      return { image: job.image, video: job.video };
    }
  };

  // Helper to delete uploaded media from server
  const deleteMedia = async (fileUrl: string) => {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
    
    const token = localStorage.getItem('token');
    const file = fileUrl.split('/').pop();
    try {
      await fetch(`/api/upload/job-media?file=${encodeURIComponent(file!)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to delete media:', err);
    }
  };

  const handleDeleteJob = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setDeleting(true);
    try {
      const result = await jobService.deleteJob(job.id);
      if (result && result.success) {
        addNotification({ message: 'Project deleted successfully', type: 'success' });
        onClose();
        navigate('/dashboard');
      } else {
        setError(result?.message || 'Failed to delete project');
        addNotification({ message: result?.message || 'Failed to delete project', type: 'error' });
      }
    } catch (err) {
      setError('An error occurred while deleting the project');
      addNotification({ message: 'An error occurred while deleting the project', type: 'error' });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 2000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'auto', padding: '20px 0',
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 16, 
        padding: '32px 40px', 
        width: '90%',
        maxWidth: 600, 
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)', 
        position: 'relative',
        margin: 'auto',
      }}>
        <button 
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#e65100' }} 
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h1 className={styles.brandTitle}>Edit Project</h1>
        <p className={styles.subtitle}>Update your project details and contact information.</p>
        
        <Formik
          initialValues={{
            title: job.title || '',
            description: job.description || '',
            amount: job.amount || '',
            returnPercent: job.returnPercent || '',
            paybackTime: job.paybackTime || '',
            email: job.email || '',
            phone: job.phone || '',
            whatsapp: job.whatsapp || '',
            instagram: job.instagram || '',
            facebook: job.facebook || '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError('');
            setSuccess('');
            setLoading(true);
            
            try {
              // Handle media files
              const imageFile = imageInputRef.current?.files?.[0] || null;
              const videoFile = videoInputRef.current?.files?.[0] || null;
              const media = await handleMediaUpload(imageFile, videoFile);
              
              // Update the job
              const token = localStorage.getItem('token') || '';
              const updated = await jobService.updateJob(job.id, {
                ...values,
                image: media.image,
                video: media.video,
              }, token);
              
              if (updated && updated.success) {
                setSuccess('Project updated successfully!');
                addNotification({ message: 'Project updated successfully!', type: 'success' });
                onJobUpdated(updated.job);
                
                // Close modal after a brief delay
                setTimeout(() => {
                  onClose();
                }, 1500);
              } else {
                setError(updated?.message || 'Failed to update project');
                addNotification({ message: updated?.message || 'Failed to update project', type: 'error' });
              }
            } catch (err) {
              setError('An error occurred while updating the project');
              addNotification({ message: 'An error occurred while updating the project', type: 'error' });
            } finally {
              setLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className={styles.form}>
              {/* Media upload section */}
              <div style={{ marginBottom: 16 }}>
                <label className={styles.label}>Project Image (optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      background: imagePreview
                        ? `url(${imagePreview}) center/cover no-repeat`
                        : '#f7f7f7',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Click to upload image"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {!imagePreview && <span style={{ color: '#757575', fontSize: 24 }}>+</span>}
                    <input
                      type="file"
                      accept="image/*"
                      ref={imageInputRef}
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {imagePreview && (
                    <button 
                      type="button" 
                      style={{ color: '#e65100', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={async () => {
                        await deleteMedia(job.image || '');
                        setImagePreview(null);
                        if (imageInputRef.current) imageInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imagePreview && <div style={{ fontSize: 13, color: '#757575', marginTop: 4 }}>Image selected</div>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className={styles.label}>Project Video (optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      background: '#f7f7f7',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Click to upload video"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    {!videoPreview && <span style={{ color: '#757575', fontSize: 24 }}>+</span>}
                    {videoPreview && <span style={{ color: '#e65100', fontSize: 13 }}>Video</span>}
                    <input
                      type="file"
                      accept="video/*"
                      ref={videoInputRef}
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setVideoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                  {videoPreview && (
                    <button 
                      type="button" 
                      style={{ color: '#e65100', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={async () => {
                        await deleteMedia(job.video || '');
                        setVideoPreview(null);
                        if (videoInputRef.current) videoInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {videoPreview && <div style={{ fontSize: 13, color: '#757575', marginTop: 4 }}>Video selected</div>}
              </div>

              <label className={styles.label} htmlFor="title">Project Title</label>
              <Field className={styles.input} id="title" name="title" type="text" placeholder="e.g. AI-Powered Tutoring App" />
              <ErrorMessage name="title" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="description">Project Description</label>
              <Field as="textarea" className={styles.input} id="description" name="description" rows={5} placeholder="Describe your project, goals, and what support you need..." />
              <ErrorMessage name="description" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="amount">Amount Requested (KES)</label>
              <Field className={styles.input} id="amount" name="amount" type="number" min="1" placeholder="e.g. 100000" />
              <ErrorMessage name="amount" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="returnPercent">Expected Return (%)</label>
              <Field className={styles.input} id="returnPercent" name="returnPercent" type="number" min="1" max="100" placeholder="e.g. 20" />
              <ErrorMessage name="returnPercent" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="paybackTime">Payback Time (e.g. 6 months)</label>
              <Field className={styles.input} id="paybackTime" name="paybackTime" type="text" placeholder="e.g. 6 months" />
              <ErrorMessage name="paybackTime" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="email">Email</label>
              <Field className={styles.input} id="email" name="email" type="email" disabled readOnly />
              <ErrorMessage name="email" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="phone">Phone (optional)</label>
              <Field className={styles.input} id="phone" name="phone" type="text" placeholder="e.g. 0700000000" />
              <ErrorMessage name="phone" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="whatsapp">WhatsApp (optional)</label>
              <Field className={styles.input} id="whatsapp" name="whatsapp" type="text" placeholder="e.g. 0700000000" />
              <ErrorMessage name="whatsapp" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="instagram">Instagram (optional)</label>
              <Field className={styles.input} id="instagram" name="instagram" type="text" placeholder="e.g. @yourprofile" />
              <ErrorMessage name="instagram" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="facebook">Facebook (optional)</label>
              <Field className={styles.input} id="facebook" name="facebook" type="text" placeholder="e.g. @yourprofile" />
              <ErrorMessage name="facebook" component="div" className={styles.error} />

              {error && <div className={styles.error} style={{ marginTop: 16 }}>{error}</div>}
              {success && <div style={{ color: '#43a047', background: '#e8f5e9', borderRadius: 4, padding: '6px 10px', fontSize: '0.95rem', marginTop: 16, marginBottom: 8 }}>{success}</div>}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 16 }}>
                <button
                  type="submit"
                  className={buttonStyles.primaryButton}
                  disabled={isSubmitting || loading}
                  style={{ flex: 2 }}
                >
                  {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
                </button>
                
                <button
                  type="button"
                  onClick={handleDeleteJob}
                  disabled={deleting}
                  style={{
                    background: confirmDelete ? '#d32f2f' : '#f5f5f5',
                    color: confirmDelete ? '#fff' : '#d32f2f',
                    border: 'none',
                    borderRadius: 6,
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flex: 1,
                    transition: 'background-color 0.2s, color 0.2s',
                  }}
                >
                  {deleting ? 'Deleting...' : confirmDelete ? 'Confirm Delete' : 'Delete'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditJobModal;