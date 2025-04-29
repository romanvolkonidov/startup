import { render } from '@testing-library/react';
import SignUpPage from '../components/auth/SignUpPage';

// Mock React Router hooks
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => jest.fn(),
  };
});

describe('SignUpPage', () => {
  it('renders without errors', () => {
    // SignUpPage now returns null as all registration functionality
    // has been moved to the LoginPage component
    const { container } = render(<SignUpPage />);
    expect(container).toBeDefined();
  });
});
