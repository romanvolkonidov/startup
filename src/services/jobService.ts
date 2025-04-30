// Use environment variable with fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://startapp-bp55.onrender.com/api';

export const jobService = {
  getJobs: async (token?: string) => {
    try {
      console.log('Fetching all jobs');
      
      // Add token to headers if available (some endpoints might filter results based on auth)
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Including authentication token with jobs request');
      }
      
      const res = await fetch(`${API_BASE_URL}/jobs`, { headers });
      
      if (!res.ok) {
        console.error(`Jobs fetch failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error(`Failed to fetch jobs: ${res.status}`);
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error fetching jobs:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  postJob: async (job: any, token: string) => {
    try {
      console.log('Posting new job');
      console.log(`Token present: ${!!token}`);
      
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(job),
      });
      
      if (!res.ok) {
        console.error(`Post job failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error('Failed to post job');
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error posting job:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  getJobById: async (id: string, token?: string) => {
    try {
      console.log(`Fetching job with ID: ${id}`);
      
      if (!id) {
        console.error('Invalid job ID');
        return { success: false, message: 'Invalid job ID provided' };
      }
      
      // Add token to headers if available (may provide additional data for authorized users)
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Including authentication token with job request');
      }
      
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, { headers });
      
      if (!res.ok) {
        console.error(`Job fetch failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error(`Failed to fetch job: ${res.status}`);
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error fetching job:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  updateJob: async (id: string, job: any, token: string) => {
    try {
      console.log(`Updating job ${id}`);
      console.log(`Token present: ${!!token}`);
      
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(job),
      });
      
      if (!res.ok) {
        console.error(`Update job failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error('Failed to update job');
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error updating job:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  saveJob: async (jobId: string, token: string) => {
    try {
      console.log(`Saving/unsaving job ${jobId}`);
      console.log(`Token present: ${!!token}`);
      
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        console.error(`Save job operation failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error('Failed to save/unsave job');
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error saving/unsaving job:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  getSavedJobs: async (token: string) => {
    try {
      console.log('Fetching saved jobs');
      console.log(`Token present: ${!!token}`);
      
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      const res = await fetch(`${API_BASE_URL}/user/saved-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        console.error(`Saved jobs fetch failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error(`Failed to fetch saved jobs: ${res.status}`);
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  getMyJobs: async (token: string) => {
    try {
      console.log('Fetching my jobs');
      console.log(`Token present: ${!!token}`);
      
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      // Use a direct URL to ensure we're hitting the correct endpoint
      const res = await fetch(`${API_BASE_URL}/user/my-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // Add cache: 'no-store' to prevent caching issues
        cache: 'no-store'
      });
      
      console.log('My jobs response status:', res.status);
      
      if (!res.ok) {
        console.error(`My jobs fetch failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        return { success: false, message: `Failed to fetch your jobs: ${res.status}` };
      }
      
      const data = await res.json();
      console.log('My jobs data received:', Array.isArray(data) ? `${data.length} jobs` : 'Not an array');
      return data;
    } catch (err) {
      console.error('Error fetching my jobs:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  getJobContacts: async (id: string, token: string) => {
    try {
      console.log(`Fetching contacts for job ${id}`);
      console.log(`Token present: ${!!token}`);
      
      // Check if token is valid before making request
      if (!token) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }

      // Simple check that ID exists but allow server to do main validation
      if (!id) {
        console.error('Missing job ID');
        return { success: false, message: 'Missing job ID' };
      }
      
      const res = await fetch(`${API_BASE_URL}/jobs/${id}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error(`Contact fetch failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        if (res.status === 400) {
          return { success: false, message: 'Invalid job ID format' };
        }
        throw new Error('Not authorized to view contacts');
      }
      return await res.json();
    } catch (err) {
      console.error('Error fetching job contacts:', err);
      return { success: false, message: (err as Error).message };
    }
  },
  deleteJob: async (id: string, token?: string) => {
    try {
      // If token is not passed, try to get from localStorage (fallback)
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        console.error('No authentication token available');
        return { success: false, message: 'Authentication required. Please log in again.' };
      }
      
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return { success: false, message: 'Your session has expired. Please log in again.' };
        }
        throw new Error('Failed to delete job');
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error deleting job:', err);
      return { success: false, message: (err as Error).message };
    }
  },
};