import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { jobService } from '../services/jobService';
import { useAuthContext } from './AuthContext';

interface Job {
  id: string;
  title: string;
  description: string;
  owner: string;
  postedAt: string;
  amount?: number;
  returnPercent?: number;
  paybackTime?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  image?: string; // Add image URL
  video?: string; // Add video URL
}

interface JobContextType {
  jobs: Job[];
  loading: boolean;
  error: string;
  fetchJobs: () => Promise<void>;
  postJob: (job: Partial<Job>) => Promise<any>;
  updateJobInList: (job: Job) => void;
  savedJobs: Job[];
  fetchSavedJobs: () => Promise<void>;
  saveJob: (jobId: string) => Promise<any>;
}

export const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuthContext();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    const res = await jobService.getJobs();
    if (Array.isArray(res)) setJobs(res);
    else setError(res.message || 'Failed to fetch jobs');
    setLoading(false);
  };

  const postJob = async (job: Partial<Job>) => {
    setError('');
    if (!token) return { success: false, message: 'Not authenticated' };
    const res = await jobService.postJob({ ...job, owner: 'You' }, token);
    if (res.success) fetchJobs();
    else setError(res.message || 'Failed to post job');
    return res;
  };

  const updateJobInList = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...j, ...updatedJob } : j));
  };

  const fetchSavedJobs = async () => {
    if (!token) return;
    const res = await jobService.getSavedJobs(token);
    if (Array.isArray(res)) setSavedJobs(res);
  };

  const saveJob = async (jobId: string) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    const res = await jobService.saveJob(jobId, token);
    if (res.success) fetchJobs();
    fetchSavedJobs();
    return res;
  };

  useEffect(() => {
    fetchJobs();
    if (token) fetchSavedJobs();
    // eslint-disable-next-line
  }, [token]);

  return (
    <JobContext.Provider value={useMemo(() => ({ jobs, loading, error, fetchJobs, postJob, updateJobInList, savedJobs, fetchSavedJobs, saveJob }), [jobs, loading, error, savedJobs])}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJobContext must be used within JobProvider');
  return context;
};
