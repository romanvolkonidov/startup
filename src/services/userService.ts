// User service with comprehensive error handling
// Use environment variable with fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://startapp-bp55.onrender.com/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  joined?: string;
  profilePicture?: string | null;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  profilePicture?: string | null;
}

export const userService = {
  getMyProfile: async (token: string) => {
    try {
      console.log('Fetching current user profile');
      
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error(`Profile fetch failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error(`Failed to fetch your profile: ${res.status}`);
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  
  updateUser: async (userData: UserUpdateData, token: string) => {
    try {
      console.log('Updating user profile');
      console.log(`Token present: ${!!token}`);
      
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(userData)
      });
      
      if (!res.ok) {
        console.error(`Profile update failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error(`Failed to update profile: ${res.status}`);
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error updating user profile:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  
  getUserById: async (userId: string, token: string) => {
    try {
      console.log(`Fetching user profile for ID: ${userId}`);
      console.log(`Token present: ${!!token}`);
      
      // Check if token is valid before making request
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      // Validate the user ID before querying
      if (!userId || userId === 'undefined') {
        console.error('Invalid user ID:', userId);
        return { success: false, message: 'Invalid user ID provided' };
      }
      
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error(`Profile fetch failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error(`Failed to fetch user profile: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Profile data retrieved successfully');
      return data;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  
  // Upload profile picture using FormData
  uploadProfilePicture: async (file: File, token: string) => {
    try {
      console.log('Uploading profile picture');
      
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const res = await fetch(`${API_BASE_URL}/users/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) {
        console.error(`Profile picture upload failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error(`Failed to upload profile picture: ${res.status}`);
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      return { success: false, message: (err as Error).message };
    }
  }
};