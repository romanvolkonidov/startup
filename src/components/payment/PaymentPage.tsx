import React, { useState } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { useNotificationContext } from '../../context/NotificationContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const PaymentPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { addNotification } = useNotificationContext();

  const validationSchema = Yup.object({
    amount: Yup.number().min(1, 'Amount must be at least 1').required('Amount is required'),
    method: Yup.string().required('Payment method is required'),
  });

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 520 }}>
        <h1 className={styles.brandTitle}>Make a Payment</h1>
        <p className={styles.subtitle}>Complete your investment or project payment securely.</p>
        <Formik
          initialValues={{ amount: 1000, method: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setError('');
            setLoading(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              addNotification({ message: 'Payment successful!', type: 'success' });
              resetForm();
            } catch (err) {
              setError('Something went wrong.');
              addNotification({ message: 'Something went wrong.', type: 'error' });
            }
            setLoading(false);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className={styles.form}>
              <label className={styles.label} htmlFor="amount">Amount</label>
              <Field
                className={styles.input}
                id="amount"
                name="amount"
                type="number"
                min="1"
                placeholder="$1000"
              />
              <ErrorMessage name="amount" component="div" className={styles.error} />
              <label className={styles.label} htmlFor="method">Payment Method</label>
              <Field
                as="select"
                className={styles.input}
                id="method"
                name="method"
              >
                <option value="">Select a method</option>
                <option value="card">Credit/Debit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="crypto">Cryptocurrency</option>
              </Field>
              <ErrorMessage name="method" component="div" className={styles.error} />
              {error && <p className={styles.error}>{error}</p>}
              <button
                className={buttonStyles.primaryButton}
                type="submit"
                style={{ marginTop: 8 }}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Processing...' : 'Pay Now'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PaymentPage;
