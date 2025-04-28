import React, { useState } from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const { addNotification } = useNotificationContext();
  const navigate = useNavigate();

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.brandTitle}>StartUp Connect</h1>
        <p className={styles.subtitle}>Log in to post your project or invest in new ideas</p>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            setError('');
            setLoading(true);
            try {
              const res = await login(values.email, values.password);
              if (res.success) {
                navigate('/dashboard');
              } else {
                setError(res.message || 'Invalid email or password');
                addNotification({ message: res.message || 'Login failed', type: 'error' });
                setFieldError('email', res.message || 'Invalid email or password');
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
              {error && <div className={styles.error}>{error}</div>}
              <button
                className={buttonStyles.primaryButton}
                type="submit"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Logging in...' : 'Log In'}
              </button>
              <Link to="/forgot-password" style={{ display: 'block', marginTop: '1rem' }}>
                Forgot Password?
              </Link>
            </Form>
          )}
        </Formik>
        <div className={styles.signupPrompt}>
          New here?{' '}
          <Link className={styles.signupLink} to="/signup">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
