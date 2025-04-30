import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { jobService } from '../../services/jobService';
import { useNotificationContext } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';
import { useJobContext } from '../../context/JobContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const EditJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const { addNotification } = useNotificationContext();
  const { currentUser, token } = useAuthContext();
  const { updateJobInList } = useJobContext();
  const navigate = useNavigate();

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

  // Load job data when component mounts
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !token) return;
      
      setIsLoading(true);
      try {
        const jobData = await jobService.getJobById(jobId);
        
        if (jobData) {
          setJob(jobData);
          
          // Set media previews if available
          if (jobData.image) {
            const imageSrc = jobData.image.startsWith('http') || jobData.image.startsWith('/') 
              ? jobData.image 
              : `${window.location.origin}/${jobData.image}`;
            setImagePreview(imageSrc);
          }
          
          if (jobData.video) {
            const videoSrc = jobData.video.startsWith('http') || jobData.video.startsWith('/') 
              ? jobData.video 
              : `${window.location.origin}/${jobData.video}`;
            setVideoPreview(videoSrc);
          }
        } else {
          setError('Failed to load job data');
          addNotification({ message: 'Failed to load job data', type: 'error' });
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('An error occurred while loading the job');
        addNotification({ message: 'An error occurred while loading the job', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if user is authenticated
    if (!currentUser) {
      navigate('/login', { state: { from: `/edit-job/${jobId}` } });
    } else {
      fetchJob();
    }
  }, [jobId, token, currentUser, navigate, addNotification]);

  const handleMediaUpload = async () => {
    if (!imageInputRef.current?.files?.length && !videoInputRef.current?.files?.length) {
      console.log("No media files to upload");
      return { 
        image: job?.image || undefined, 
        video: job?.video || undefined 
      };
    }
    
    try {
      const formData = new FormData();
      if (imageInputRef.current?.files?.[0]) {
        formData.append('image', imageInputRef.current.files[0]);
        console.log("Image file added to upload:", imageInputRef.current.files[0].name);
      }
      if (videoInputRef.current?.files?.[0]) {
        formData.append('video', videoInputRef.current.files[0]);
        console.log("Video file added to upload:", videoInputRef.current.files[0].name);
      }
      
      if (!token) {
        console.error("No authentication token available");
        throw new Error("Authentication required");
      }
      
      console.log("Uploading media files to server...");
      const res = await fetch('/api/upload/job-media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Media upload failed:", errorText);
        throw new Error("Failed to upload media");
      }
      
      const uploadResult = await res.json();
      console.log("Media upload successful:", uploadResult);
      
      // Return the uploaded media URLs, or keep existing ones if not changed
      return {
        image: imageInputRef.current?.files?.length ? uploadResult.image : job?.image,
        video: videoInputRef.current?.files?.length ? uploadResult.video : job?.video,
      };
    } catch (error) {
      console.error("Media upload error:", error);
      throw error;
    }
  };

  // Helper to delete uploaded media from server
  const deleteMedia = async (fileUrl: string) => {
    if (!fileUrl) return;
    
    const token = localStorage.getItem('token');
    const file = fileUrl.split('/').pop();
    await fetch(`/api/upload/job-media?file=${encodeURIComponent(file!)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleDeleteJob = async () => {
    if (!jobId) return;
    
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 5000); // Reset after 5 seconds
      return;
    }
    
    setDeleting(true);
    try {
      // Fix TypeScript error: Convert null to undefined to match function signature
      const safeToken = token || undefined;
      const result = await jobService.deleteJob(jobId, safeToken);
      if (result && result.success) {
        addNotification({ message: 'Project deleted successfully', type: 'success' });
        navigate('/my-posts');
      } else {
        setError(result?.message || 'Failed to delete project');
        addNotification({ message: result?.message || 'Failed to delete project', type: 'error' });
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('An error occurred while deleting the project');
      addNotification({ message: 'An error occurred while deleting the project', type: 'error' });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox} style={{ maxWidth: 500, textAlign: 'center', padding: '50px 20px' }}>
          <h2>Loading project details...</h2>
          <div style={{ margin: '30px 0' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <circle cx="12" cy="12" r="10" stroke="#e0e0e0" strokeWidth="4" fill="none" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#1976d2" strokeWidth="4" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox} style={{ maxWidth: 500, textAlign: 'center', padding: '50px 20px' }}>
          <h2>Error Loading Project</h2>
          <p style={{ color: '#f44336', marginBottom: 20 }}>{error}</p>
          <button 
            className={buttonStyles.primaryButton} 
            onClick={() => navigate('/my-posts')}
          >
            Back to My Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 500 }}>
        <h1 className={styles.brandTitle}>Edit Project</h1>
        <p className={styles.subtitle}>Update your project details and contact information.</p>
        
        <Formik
          initialValues={{
            title: job?.title || '',
            description: job?.description || '',
            amount: job?.amount || '',
            returnPercent: job?.returnPercent || '',
            paybackTime: job?.paybackTime || '',
            phone: job?.phone || '',
            whatsapp: job?.whatsapp || '',
            instagram: job?.instagram || '',
            facebook: job?.facebook || '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError('');
            setSuccess('');
            setLoading(true);
            
            try {
              // First handle media uploads
              const media = await handleMediaUpload();
              
              // Then update the job with all data including media URLs
              const updatedJobData = {
                ...values,
                image: media.image,
                video: media.video,
              };
              
              // Fix TypeScript error: Ensure token is not null
              const safeToken = token || '';
              const updated = await jobService.updateJob(jobId!, updatedJobData, safeToken);
              
              if (updated && updated.success) {
                setSuccess('Project updated successfully!');
                addNotification({ message: 'Project updated successfully!', type: 'success' });
                
                // Update the job in context if available
                if (updateJobInList) {
                  updateJobInList(updated.job);
                }
                
                // Navigate back after a brief delay
                setTimeout(() => {
                  navigate('/my-posts');
                }, 2000);
              } else {
                setError(updated?.message || 'Failed to update project');
                addNotification({ message: updated?.message || 'Failed to update project', type: 'error' });
              }
            } catch (err) {
              console.error('Error updating job:', err);
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
                    <button type="button" style={{ color: '#e65100', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={async () => {
                        if (job?.image) await deleteMedia(job.image);
                        setImagePreview(null);
                        if (imageInputRef.current) imageInputRef.current.value = '';
                      }}>
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
                          const reader = new FileReader();
                          reader.onloadend = () => setVideoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {videoPreview && (
                    <button type="button" style={{ color: '#e65100', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={async () => {
                        if (job?.video) await deleteMedia(job.video);
                        setVideoPreview(null);
                        if (videoInputRef.current) videoInputRef.current.value = '';
                      }}>
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
              
              <label className={styles.label} htmlFor="returnPercent">Investor's Return (%)</label>
              <Field className={styles.input} id="returnPercent" name="returnPercent" type="number" min="1" max="100" placeholder="e.g. 10" />
              <ErrorMessage name="returnPercent" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="paybackTime">Payback Time (e.g. 12 months, 2026-06-01)</label>
              <Field className={styles.input} id="paybackTime" name="paybackTime" type="text" placeholder="e.g. 12 months" />
              <ErrorMessage name="paybackTime" component="div" className={styles.error} />
              
              <label className={styles.label}>Your Email</label>
              <input className={styles.input} type="email" value={currentUser?.email || ''} disabled readOnly />
              
              <label className={styles.label} htmlFor="phone">Phone (optional)</label>
              <Field className={styles.input} id="phone" name="phone" type="text" placeholder="e.g. +254712345678" />
              <ErrorMessage name="phone" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="whatsapp">WhatsApp (optional)</label>
              <Field className={styles.input} id="whatsapp" name="whatsapp" type="text" placeholder="e.g. +254712345678" />
              <ErrorMessage name="whatsapp" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="instagram">Instagram (optional)</label>
              <Field className={styles.input} id="instagram" name="instagram" type="text" placeholder="e.g. @yourhandle" />
              <ErrorMessage name="instagram" component="div" className={styles.error} />
              
              <label className={styles.label} htmlFor="facebook">Facebook (optional)</label>
              <Field className={styles.input} id="facebook" name="facebook" type="text" placeholder="e.g. facebook.com/yourprofile" />
              <ErrorMessage name="facebook" component="div" className={styles.error} />
              
              {error && <div className={styles.error}>{error}</div>}
              {success && <div style={{ color: '#43a047', background: '#e8f5e9', borderRadius: 4, padding: '6px 10px', fontSize: '0.95rem', marginBottom: 4 }}>{success}</div>}
              
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
              
              <button 
                type="button" 
                onClick={() => navigate('/my-posts')}
                style={{
                  background: 'transparent',
                  color: '#1976d2',
                  border: 'none',
                  padding: '8px',
                  margin: '16px auto 0',
                  display: 'block',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                Cancel and go back
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditJobPage;