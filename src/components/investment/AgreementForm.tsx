import React, { useState } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { useNotificationContext } from '../../context/NotificationContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const AgreementForm: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotificationContext();

  const validationSchema = Yup.object({
    investorName: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
    terms: Yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
  });

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 540 }}>
        <h1 className={styles.brandTitle}>Investment Agreement</h1>
        <p className={styles.subtitle}>Review and sign the agreement to formalize your investment.</p>
        <Formik
          initialValues={{ investorName: '', terms: false }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setError('');
            setLoading(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              addNotification({ message: 'Agreement signed successfully!', type: 'success' });
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
              <label className={styles.label} htmlFor="investorName">Your Name</label>
              <Field
                className={styles.input}
                id="investorName"
                name="investorName"
                type="text"
                placeholder="Investor Name"
              />
              <ErrorMessage name="investorName" component="div" className={styles.error} />
              {error && <p className={styles.error}>{error}</p>}
              <label className={styles.label} htmlFor="terms" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Field type="checkbox" id="terms" name="terms" />
                I agree to the terms and conditions of this investment.
              </label>
              <ErrorMessage name="terms" component="div" className={styles.error} />
              <button
                className={buttonStyles.primaryButton}
                type="submit"
                style={{ marginTop: 8 }}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Signing...' : 'Sign Agreement'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AgreementForm;
