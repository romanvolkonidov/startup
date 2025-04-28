import React, { useState, useRef } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { useNotificationContext } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';
import { useJobContext } from '../../context/JobContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const PostJobPage: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotificationContext();
  const { currentUser } = useAuthContext();
  const { postJob } = useJobContext();

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

  const handleMediaUpload = async () => {
    if (!imageInputRef.current?.files?.length && !videoInputRef.current?.files?.length) return {} as { image?: string; video?: string };
    const formData = new FormData();
    if (imageInputRef.current?.files?.[0]) formData.append('image', imageInputRef.current.files[0]);
    if (videoInputRef.current?.files?.[0]) formData.append('video', videoInputRef.current.files[0]);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/upload/job-media', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) return {} as { image?: string; video?: string };
    return await res.json() as { image?: string; video?: string };
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

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 500 }}>
        <h1 className={styles.brandTitle}>Post a New Project</h1>
        <p className={styles.subtitle}>Share your startup or project to attract investors and supporters.</p>
        <Formik
          initialValues={{ title: '', description: '', amount: '', returnPercent: '', paybackTime: '', phone: '', whatsapp: '', instagram: '', facebook: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, resetForm, setFieldError }) => {
            setError('');
            setSuccess('');
            setLoading(true);
            try {
              let media: { image?: string; video?: string } = {};
              if (imageInputRef.current?.files?.length || videoInputRef.current?.files?.length) {
                media = await handleMediaUpload();
              }
              const res = await postJob({
                title: values.title,
                description: values.description,
                amount: Number(values.amount),
                returnPercent: Number(values.returnPercent),
                paybackTime: values.paybackTime,
                email: currentUser?.email,
                phone: values.phone,
                whatsapp: values.whatsapp,
                instagram: values.instagram,
                facebook: values.facebook,
                image: media.image,
                video: media.video,
              });
              if (res.success) {
                setSuccess('Project posted successfully!');
                addNotification({ message: 'Project posted successfully!', type: 'success' });
                resetForm();
                setImagePreview(null);
                setVideoPreview(null);
                if (imageInputRef.current) imageInputRef.current.value = '';
                if (videoInputRef.current) videoInputRef.current.value = '';
              } else {
                setError(res.message || 'Failed to post project');
                addNotification({ message: res.message || 'Failed to post project', type: 'error' });
              }
            } catch (err) {
              setError('Something went wrong.');
              addNotification({ message: 'Something went wrong.', type: 'error' });
            }
            setLoading(false);
            setSubmitting(false);
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
                        await deleteMedia(imagePreview.startsWith('/uploads/') ? imagePreview : '');
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
                        await deleteMedia(videoPreview.startsWith('/uploads/') ? videoPreview : '');
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
              <label className={styles.label} htmlFor="description">Description</label>
              <Field as="textarea" className={styles.input} id="description" name="description" rows={5} placeholder="Describe your project, goals, and what support you need..." style={{ resize: 'vertical' }} />
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
              {/* Contact fields */}
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
              <button
                className={buttonStyles.primaryButton}
                type="submit"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Posting...' : 'Post Project'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PostJobPage;
