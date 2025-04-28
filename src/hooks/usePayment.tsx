import { useContext } from 'react';
import { PaymentContext } from '../context/PaymentContext';

export const usePayment = () => {
  return useContext(PaymentContext);
};
