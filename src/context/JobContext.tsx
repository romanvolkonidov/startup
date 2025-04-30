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
  savedBy?: string[]; // Add savedBy property to fix type errors
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
  savedJobsLoading: boolean; // Add loading state for saved jobs
  savedJobsError: string; // Add error state for saved jobs
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
  const [savedJobsLoading, setSavedJobsLoading] = useState(false); // Initialize savedJobsLoading state
  const [savedJobsError, setSavedJobsError] = useState(''); // Initialize savedJobsError state
  const { currentUser } = useAuthContext(); // Add this line to get the real user

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    const res = await jobService.getJobs(token || undefined);
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
    setSavedJobsLoading(true); // Use loading state
    setSavedJobsError(''); // Clear previous errors
    try {
      const res = await jobService.getSavedJobs(token);
      if (Array.isArray(res)) {
        setSavedJobs(res);
      } else {
        // Handle potential error object { success: false, message: '...' }
        const errorMessage = res?.message || 'Failed to fetch saved jobs';
        console.error('fetchSavedJobs error:', errorMessage);
        setSavedJobsError(errorMessage);
        setSavedJobs([]); // Clear saved jobs on error
      }
    } catch (err) {
      console.error('fetchSavedJobs exception:', err);
      setSavedJobsError((err as Error).message || 'An unexpected error occurred');
      setSavedJobs([]); // Clear saved jobs on error
    } finally {
      setSavedJobsLoading(false);
    }
  };

  const saveJob = async (jobId: string) => {
    if (!token || !currentUser) return { success: false, message: 'Not authenticated' };
    
    const userId = currentUser.id;
    const jobIndexInAll = jobs.findIndex(j => j.id === jobId);
    const jobIndexInSaved = savedJobs.findIndex(j => j.id === jobId);
    const jobInAll = jobs[jobIndexInAll];
    const jobInSaved = savedJobs[jobIndexInSaved];
    
    if (!jobInAll) {
      console.error('Job not found in main list for saving:', jobId);
      return { success: false, message: 'Job not found' };
    }

    const isCurrentlySaved = jobInAll.savedBy?.includes(userId);
    console.log(`[saveJob ${jobId}] Start. Is currently saved: ${isCurrentlySaved}`);

    // --- Optimistic Update --- 
    // 1. Update the main 'jobs' list
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const currentSavedBy = job.savedBy || [];
        const newSavedBy = isCurrentlySaved
          ? currentSavedBy.filter(id => id !== userId)
          : [...currentSavedBy, userId];
        console.log(`[saveJob ${jobId}] Optimistic update for 'jobs' list. New savedBy:`, newSavedBy);
        return { ...job, savedBy: newSavedBy };
      }
      return job;
    }));

    // 2. Update the 'savedJobs' list
    if (isCurrentlySaved) {
      // Remove from savedJobs
      console.log(`[saveJob ${jobId}] Optimistic remove from 'savedJobs' list.`);
      setSavedJobs(prevSaved => prevSaved.filter(job => job.id !== jobId));
    } else {
      // Add to savedJobs (using the potentially updated job object from 'jobs')
      console.log(`[saveJob ${jobId}] Optimistic add to 'savedJobs' list.`);
      // Ensure we add the version with the updated savedBy array
      const updatedJobForSavedList = { 
          ...jobInAll, 
          savedBy: [...(jobInAll.savedBy || []), userId] 
      };
      setSavedJobs(prevSaved => [...prevSaved, updatedJobForSavedList]);
    }
    // --- End Optimistic Update ---

    try {
      const res = await jobService.saveJob(jobId, token);
      console.log(`[saveJob ${jobId}] API response:`, res);

      if (!res.success) {
        console.error(`[saveJob ${jobId}] API failed: ${res.message}. Reverting optimistic update.`);
        // --- Revert Optimistic Update --- 
        // 1. Revert the main 'jobs' list
        setJobs(prevJobs => prevJobs.map(job => {
          if (job.id === jobId) {
            console.log(`[saveJob ${jobId}] Reverting 'jobs' list.`);
            return { ...job, savedBy: jobInAll.savedBy }; // Restore original savedBy
          }
          return job;
        }));

        // 2. Revert the 'savedJobs' list
        if (isCurrentlySaved) {
          // Add it back if it was originally saved
          if (jobInSaved) { // Should exist if isCurrentlySaved was true
             console.log(`[saveJob ${jobId}] Reverting 'savedJobs' list (add back).`);
             setSavedJobs(prevSaved => [...prevSaved, jobInSaved]); 
          }
        } else {
          // Remove it if it was originally unsaved
          console.log(`[saveJob ${jobId}] Reverting 'savedJobs' list (remove).`);
          setSavedJobs(prevSaved => prevSaved.filter(job => job.id !== jobId));
        }
        // --- End Revert --- 
        return res; // Return the error response
      }

      // API Success - Ensure state matches API response (though optimistic should be correct)
      console.log(`[saveJob ${jobId}] API success. State should be consistent.`);
      // Optional: Could force-update state from response if needed, but optimistic should suffice.
      // setJobs(prev => prev.map(j => j.id === jobId ? { ...j, savedBy: res.saved ? [...(j.savedBy || []), userId] : (j.savedBy || []).filter(id => id !== userId) } : j));
      // if (res.saved && !savedJobs.some(j => j.id === jobId)) setSavedJobs(prev => [...prev, jobs.find(j => j.id === jobId)!]);
      // if (!res.saved) setSavedJobs(prev => prev.filter(j => j.id !== jobId));

      return res; // Return the success response

    } catch (error) {
      console.error(`[saveJob ${jobId}] Exception:`, error, `. Reverting optimistic update.`);
      // --- Revert Optimistic Update on Exception --- 
      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          console.log(`[saveJob ${jobId}] Reverting 'jobs' list on exception.`);
          return { ...job, savedBy: jobInAll.savedBy };
        }
        return job;
      }));
      if (isCurrentlySaved) {
        if (jobInSaved) {
          console.log(`[saveJob ${jobId}] Reverting 'savedJobs' list on exception (add back).`);
          setSavedJobs(prevSaved => [...prevSaved, jobInSaved]);
        }
      } else {
        console.log(`[saveJob ${jobId}] Reverting 'savedJobs' list on exception (remove).`);
        setSavedJobs(prevSaved => prevSaved.filter(job => job.id !== jobId));
      }
      // --- End Revert --- 
      return { success: false, message: (error as Error).message || 'Failed to save/unsave job' };
    }
  };

  // Define the deleteMyJob function
  const deleteMyJob = async (jobId: string) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const res = await jobService.deleteJob(jobId, token);
      if (res.success) {
        // Remove from myJobs list
        setMyJobs(prev => prev.filter(job => job.id !== jobId));
        // Remove from main jobs list if present
        setJobs(prev => prev.filter(job => job.id !== jobId));
        // Remove from savedJobs list if present
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      }
      return res;
    } catch (error) {
      console.error('Error deleting job in context:', error);
      return { success: false, message: (error as Error).message || 'Failed to delete job' };
    }
  };

  useEffect(() => {
    fetchJobs();
    if (token) {
      fetchSavedJobs();
      fetchMyJobs(); // Fetch my jobs when context is loaded
    }
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
    savedJobsLoading, // Add loading state
    savedJobsError,   // Add error state
    fetchSavedJobs, 
    saveJob,
    deleteMyJob
  }), [jobs, myJobs, loading, myJobsLoading, error, myJobsError, savedJobs, savedJobsLoading, savedJobsError, deleteMyJob]);

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
