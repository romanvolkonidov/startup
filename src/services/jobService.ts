// Use environment variable with fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://startup-bp55.onrender.com/api';

export const jobService = {
  getJobs: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  postJob: async (job: any, token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(job),
      });
      if (!res.ok) throw new Error('Failed to post job');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  getJobById: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
      if (!res.ok) throw new Error('Failed to fetch job');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  updateJob: async (id: string, job: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(job),
      });
      if (!res.ok) throw new Error('Failed to update job');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  saveJob: async (jobId: string, token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to save/unsave job');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  getSavedJobs: async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/saved-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch saved jobs');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  getJobContacts: async (id: string, token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${id}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Not authorized');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  deleteJob: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete job');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
};