import React, { useState } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { useNotificationContext } from '../../context/NotificationContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const FeedbackForm: React.FC = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotificationContext();

  const validationSchema = Yup.object({
    message: Yup.string().min(5, 'Feedback must be at least 5 characters').required('Feedback is required'),
  });

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 520 }}>
        <h1 className={styles.brandTitle}>Feedback</h1>
        <p className={styles.subtitle}>We value your input. Please let us know how we can improve.</p>
        <Formik
          initialValues={{ message: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setError('');
            setSuccess('');
            setLoading(true);
            try {
              setSuccess('Thank you for your feedback!');
              addNotification({ message: 'Thank you for your feedback!', type: 'success' });
              resetForm();
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
              <label className={styles.label} htmlFor="feedback">Your Feedback</label>
              <Field
                as="textarea"
                className={styles.input}
                id="feedback"
                name="message"
                rows={5}
                placeholder="Type your feedback here..."
                style={{ resize: 'vertical' }}
              />
              <ErrorMessage name="message" component="div" className={styles.error} />
              {error && <div className={styles.error}>{error}</div>}
              {success && <div style={{ color: '#43a047', background: '#e8f5e9', borderRadius: 4, padding: '6px 10px', fontSize: '0.95rem', marginBottom: 4 }}>{success}</div>}
              <button
                className={buttonStyles.primaryButton}
                type="submit"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Sending...' : 'Send Feedback'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default FeedbackForm;
