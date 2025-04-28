// Basic payment service stub
export const paymentService = {
  makePayment: async (amount: number, method: string) => {
    // TODO: Implement payment logic
    return { success: true };
  },
  getPayments: async () => {
    // TODO: Fetch payment history
    return [];
  },
};