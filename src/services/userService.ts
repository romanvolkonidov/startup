// Basic user service stub
export const userService = {
  getUser: async () => {
    // TODO: Fetch user profile
    return null;
  },
  updateUser: async (user: { email: string; bio: string }) => {
    // TODO: Update user profile
    return { success: true };
  },
};