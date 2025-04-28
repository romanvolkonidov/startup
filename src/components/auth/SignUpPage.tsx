import React, { useState } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignUpPage: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuthContext();
  const { addNotification } = useNotificationContext();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), ''], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.brandTitle}>StartUp Connect</h1>
        <p className={styles.subtitle}>Create your account to get started</p>
        <Formik
          initialValues={{ email: '', password: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            setError('');
            setLoading(true);
            try {
              const res = await signup(values.email, values.password, values.email.split('@')[0]);
              if (res.success) {
                addNotification({ message: 'Account created! Please check your email to verify your account.', type: 'success' });
                navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
              } else {
                setError(res.message || 'Sign up failed');
                addNotification({ message: res.message || 'Sign up failed', type: 'error' });
                setFieldError('email', res.message || 'Sign up failed');
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
              <label className={styles.label} htmlFor="email">Email</label>
              <Field className={styles.input} id="email" name="email" type="email" autoFocus />
              <ErrorMessage name="email" component="div" className={styles.error} />
              <label className={styles.label} htmlFor="password">Password</label>
              <Field className={styles.input} id="password" name="password" type="password" />
              <ErrorMessage name="password" component="div" className={styles.error} />
              <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
              <Field className={styles.input} id="confirmPassword" name="confirmPassword" type="password" />
              <ErrorMessage name="confirmPassword" component="div" className={styles.error} />
              {error && <div className={styles.error}>{error}</div>}
              <button
                className={buttonStyles.primaryButton}
                type="submit"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </Form>
          )}
        </Formik>
        <div className={styles.signupPrompt}>
          Already have an account?{' '}
          <Link className={styles.signupLink} to="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
