

import React, { useState, useMemo } from 'react';
import { AidmateProfile, Job } from '../../types';
import Card from '../ui/Card';

interface AidmateDetailPageProps {
  aidmate: AidmateProfile;
  onBack: () => void;
}

const AidmateDetailPage: React.FC<AidmateDetailPageProps> = ({ aidmate, onBack }) => {
  const [modalContent, setModalContent] = useState<{ title: string; jobs: Job[] } | null>(null);

  const stats = useMemo(() => {
    const completedJobs = aidmate.jobs.filter(j => j.status === 'completed');
    const jobsByDate = completedJobs.reduce((acc, job) => {
      acc[job.date] = (acc[job.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Fix: Cast the result of Object.values to number[] to ensure type safety with Math.max.
    const highestJobsInDay = Math.max(0, ...(Object.values(jobsByDate) as number[]));
    const highestJobDate = Object.keys(jobsByDate).find(date => jobsByDate[date] === highestJobsInDay) || 'N/A';
    
    const totalDaysWithJobs = Object.keys(jobsByDate).length;
    const averageJobsPerDay = totalDaysWithJobs > 0 ? (completedJobs.length / totalDaysWithJobs).toFixed(1) : '0.0';

    return {
      totalJobs: completedJobs.length,
      rejectedJobs: aidmate.jobs.filter(j => j.status === 'rejected'),
      // Fix: Cast the result of Object.values to number[] to ensure type safety for the reduce operation.
      totalRatings: (Object.values(aidmate.ratings) as number[]).reduce((sum, count) => sum + count, 0),
      averageJobsPerDay,
      highestJobsInDay,
      highestJobDate,
    };
  }, [aidmate.jobs, aidmate.ratings]);
  
  const StatCard: React.FC<{title: string; value: string | number; onClick?: () => void;}> = ({ title, value, onClick }) => (
    <Card onClick={onClick} className="text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </Card>
  );

  const renderJobsModal = () => {
    if (!modalContent) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">{modalContent.title} ({modalContent.jobs.length})</h3>
            <button onClick={() => setModalContent(null)} className="text-gray-500 hover:text-gray-800">&times;</button>
          </div>
          <div className="overflow-y-auto p-4 space-y-3">
            {modalContent.jobs.map(job => (
              <div key={job.id} className="p-3 bg-gray-50 rounded-md border">
                <p className="font-semibold text-gray-800">{job.title}</p>
                <p className="text-sm text-gray-600">{job.area} - <span className="text-xs text-gray-400">{job.date}</span></p>
                {job.rejectionReason && <p className="text-xs text-red-500 mt-1">Reason: {job.rejectionReason}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderJobsModal()}
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src={aidmate.profilePictureUrl} alt={aidmate.name} className="h-12 w-12 rounded-full mr-4" />
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{aidmate.name}</h2>
            <p className="text-gray-500">{aidmate.district}, {aidmate.state}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Jobs Completed" value={stats.totalJobs} onClick={() => setModalContent({title: 'Completed Jobs', jobs: aidmate.jobs.filter(j=>j.status === 'completed')})} />
        <StatCard title="Overall Rating" value={aidmate.overallRating.toFixed(1)} />
        <StatCard title="Jobs Rejected" value={stats.rejectedJobs.length} onClick={() => setModalContent({title: 'Rejected Jobs', jobs: stats.rejectedJobs})} />
        <StatCard title="Avg Jobs/Day" value={stats.averageJobsPerDay} />
        <StatCard title="Highest Jobs/Day" value={stats.highestJobsInDay} onClick={() => setModalContent({title: `Jobs on ${stats.highestJobDate}`, jobs: aidmate.jobs.filter(j => j.date === stats.highestJobDate && j.status === 'completed')})}/>
        <StatCard title="Total Ratings" value={stats.totalRatings} />
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Breakdown</h3>
        <div className="flex justify-around text-center">
          {([5, 4, 3, 2, 1] as const).map(star => (
            <div key={star}>
              <p className="text-xl font-bold">{aidmate.ratings[star]}</p>
              <p className="text-sm text-gray-500">{star} star{star > 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AidmateDetailPage;