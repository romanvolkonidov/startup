import React from 'react';
import JobCard from './JobCard';
import { useJobContext } from '../../context/JobContext';

const JobPostList: React.FC = React.memo(() => {
  const { jobs, loading, error } = useJobContext();
  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  return (
    <div>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
});

export default JobPostList;
