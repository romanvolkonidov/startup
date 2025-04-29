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
  myJobs: Job[]; // Add myJobs state
  loading: boolean;
  myJobsLoading: boolean; // Add loading state for myJobs
  error: string;
  myJobsError: string; // Add error state for myJobs
  fetchJobs: () => Promise<void>;
  fetchMyJobs: () => Promise<void>; // Add fetchMyJobs function
  postJob: (job: Partial<Job>) => Promise<any>;
  updateJobInList: (job: Job) => void;
  updateMyJobInList: (job: Job) => void; // Add updateMyJobInList function
  savedJobs: Job[];
  fetchSavedJobs: () => Promise<void>;
  saveJob: (jobId: string) => Promise<any>;
  deleteMyJob: (jobId: string) => Promise<any>; // Add deleteMyJob function
}

export const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]); // Initialize myJobs state
  const [loading, setLoading] = useState(false);
  const [myJobsLoading, setMyJobsLoading] = useState(false); // Initialize myJobsLoading state
  const [error, setError] = useState('');
  const [myJobsError, setMyJobsError] = useState(''); // Initialize myJobsError state
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

  const fetchMyJobs = async () => {
    if (!token) return;
    setMyJobsLoading(true);
    setMyJobsError('');
    const res = await jobService.getMyJobs(token);
    if (Array.isArray(res)) setMyJobs(res);
    else setMyJobsError(res.message || 'Failed to fetch your jobs');
    setMyJobsLoading(false);
  };

  const postJob = async (job: Partial<Job>) => {
    setError('');
    if (!token) return { success: false, message: 'Not authenticated' };
    const res = await jobService.postJob({ ...job, owner: 'You' }, token);
    if (res.success) {
      fetchJobs();
      fetchMyJobs(); // Also fetch my jobs after posting
    }
    else setError(res.message || 'Failed to post job');
    return res;
  };

  const updateJobInList = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...j, ...updatedJob } : j));
  };

  const updateMyJobInList = (updatedJob: Job) => {
    setMyJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...j, ...updatedJob } : j));
    // Also update in the main jobs list if present
    updateJobInList(updatedJob);
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

  const deleteMyJob = async (jobId: string) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    const res = await jobService.deleteJob(jobId);
    if (res.success) {
      // Remove from myJobs list
      setMyJobs(prev => prev.filter(job => job.id !== jobId));
      // Remove from main jobs list if present
      setJobs(prev => prev.filter(job => job.id !== jobId));
      // Remove from savedJobs list if present
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    }
    return res;
  };

  useEffect(() => {
    fetchJobs();
    if (token) {
      fetchSavedJobs();
      fetchMyJobs(); // Fetch my jobs when context is loaded
    }
    // eslint-disable-next-line
  }, [token]);

  const contextValue = useMemo(() => ({ 
    jobs, 
    myJobs, 
    loading, 
    myJobsLoading, 
    error, 
    myJobsError,
    fetchJobs, 
    fetchMyJobs,
    postJob, 
    updateJobInList, 
    updateMyJobInList,
    savedJobs, 
    fetchSavedJobs, 
    saveJob,
    deleteMyJob
  }), [jobs, myJobs, loading, myJobsLoading, error, myJobsError, savedJobs]);

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJobContext must be used within JobProvider');
  return context;
};
