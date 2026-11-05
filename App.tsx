import React, { useState, useEffect } from 'react';
import { UserData, UserRole, Deal, Notification, AidmateProfile, PendingAidmate } from './types';
import SignUpPage from './components/auth/SignUpPage';
import HomeDashboard from './components/home/HomeDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import SettingsPage from './components/settings/SettingsPage';
import ChatPage from './components/chat/ChatPage';
import NotificationToast from './components/ui/NotificationToast';
import ActiveJobExecution from './components/jobs/ActiveJobExecution';
import { initializeFirebase, onForegroundMessage } from './firebase';
import { MOCK_PENDING_AIDMATES, MOCK_VERIFIED_AIDMATES } from './constants';
import { clearAuthSession, restoreAuthSession, submitReview } from './services/api';


type View = 'signup' | 'home-dashboard' | 'admin-dashboard' | 'chat' | 'settings';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [view, setView] = useState<View>('signup');
  const [activeChatDeal, setActiveChatDeal] = useState<Deal | null>(null);
  const [activeChatRole, setActiveChatRole] = useState<'seeker' | 'provider'>('seeker');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isAuthRestoring, setIsAuthRestoring] = useState(true);

  const [isAidmateActive, setIsAidmateActive] = useState(false);

  // Centralized state management for application data
  const [verifiedAidmates, setVerifiedAidmates] = useState<AidmateProfile[]>(MOCK_VERIFIED_AIDMATES);
  const [pendingAidmates, setPendingAidmates] = useState<PendingAidmate[]>(MOCK_PENDING_AIDMATES);

  const [jobBroadcasts, setJobBroadcasts] = useState<Deal[]>([
    { id: 'job-alert-1', service: 'Plumbing Leak Fix', location: 'Gajuwaka, Visakhapatnam', time: '5m ago', seekerName: 'Ramesh K.', seekerLocation: { lat: 17.6868, lng: 83.2185 } },
    { id: 'job-alert-2', service: 'Electrical Wiring Check', location: 'Madhapur, Hyderabad', time: '22m ago', seekerName: 'Priya S.', seekerLocation: { lat: 17.4483, lng: 78.3915 } },
    { id: 'job-alert-3', service: 'Full House Cleaning', location: 'T. Nagar, Chennai', time: '1h ago', seekerName: 'Anjali M.', seekerLocation: { lat: 13.0475, lng: 80.2409 } },
  ]);
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState<Set<string | number>>(new Set());
  const [activeJob, setActiveJob] = useState<Deal | null>(null);

  useEffect(() => {
    let active = true;
    restoreAuthSession()
      .then(account => {
        if (!active || !account) return;
        setUserData(account);
        setUserRole(account.accountType === 'provider' ? 'provider' : 'seeker');
        setIsAidmateActive(account.accountType === 'provider');
        setView('home-dashboard');
      })
      .catch(error => {
        if (active) {
          setNotification({
            title: 'Session could not be restored',
            body: error instanceof Error ? error.message : 'Please sign in again.',
            type: 'alert',
          });
        }
      })
      .finally(() => {
        if (active) setIsAuthRestoring(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleCompleteRequest = (dealId: string) => {
    setJobBroadcasts(prev => prev.filter(deal => deal.id !== dealId));
    
    // Broadcast complete
    localStorage.setItem('job_completed', dealId);
    localStorage.removeItem('job_completed');
    
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { title: 'Review Submitted', body: 'Thank you for your feedback!', type: 'success' }
    }));
  };

  const handleCreateBroadcast = async (service: string, offer: string = "", description?: string, imageUrl?: string) => {
      if (!userData) return;
      const newDealId = `broadcast-${Date.now()}`;
      
      const newBroadcast: Deal = {
          id: newDealId,
          service,
          location: 'Your Location', // In a real app, use reverse geocoding
          time: 'Just now',
          seekerName: userData.name,
          seekerMobile: userData.mobile,
          seekerLocation: { lat: 17.6868, lng: 83.2185 }, // Visakhapatnam
          offer,
          description,
          imageUrl,
          status: 'pending'
      };

      setJobBroadcasts(prev => [newBroadcast, ...prev]);
      
      // Save to localStorage to sync across tabs (simulating backend pub/sub)
      localStorage.setItem('new_broadcast', JSON.stringify(newBroadcast));
      // Immediately remove it so the same broadcast can't get stuck, storage event still fires
      localStorage.removeItem('new_broadcast');

      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: { title: 'Request Broadcasted', body: `Notified all active AIDMATEs in your area about: ${service}` }
      }));
  };

  useEffect(() => {
    initializeFirebase();
    
    const handleShowNotification = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setNotification({ title: detail.title, body: detail.body, type: detail.type });
    };

        const handleStorage = (e: StorageEvent) => {
      if (e.key === 'new_broadcast' && e.newValue) {
        const newBroadcast = JSON.parse(e.newValue);
        setJobBroadcasts(prev => [newBroadcast, ...prev]);
        
        if (isAidmateActive && newBroadcast.seekerMobile !== userData?.mobile) {
            window.dispatchEvent(new CustomEvent('show-notification', {
                detail: { 
                    title: 'New Job Alert Nearby', 
                    body: `${newBroadcast.seekerName} needs ${newBroadcast.service}. Tap 'My Work' to reply!`,
                    type: 'alert'
                }
            }));
        }
      }
      
      if (e.key === 'job_accepted' && e.newValue) {
        const acceptedDealId = e.newValue;
        // Update jobBroadcasts so seeker knows it's accepted
        setJobBroadcasts(prev => prev.map(deal => 
          deal.id === acceptedDealId 
            ? { ...deal, status: 'accepted', providerName: 'Your AidMate' } 
            : deal
        ));
      }
      
      if (e.key === 'job_completed' && e.newValue) {
        const completedDealId = e.newValue;
        setJobBroadcasts(prev => prev.filter(deal => deal.id !== completedDealId));
      }
    };

    window.addEventListener('show-notification', handleShowNotification);
    window.addEventListener('storage', handleStorage);

    const unsubscribe = onForegroundMessage((payload) => {
      if (payload.notification) {
         setNotification({
            title: payload.notification.title || 'New Notification',
            body: payload.notification.body || ''
        });
      }
    });

    return () => {
      window.removeEventListener('show-notification', handleShowNotification);
      window.removeEventListener('storage', handleStorage);
      if(unsubscribe) unsubscribe();
    };
  }, [isAidmateActive, userData]);

  const handleSignUpSuccess = (data: UserData, role?: UserRole) => {
    setUserData(data);
    setIsAidmateActive(role === 'provider');
    if (role === 'admin') {
      setUserRole('admin');
      setView('admin-dashboard');
    } else {
      setUserRole(role || 'seeker');
      setView('home-dashboard');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setUserData(null);
    setUserRole(null);
    setIsAidmateActive(false);
    setView('signup');
  };

  const handleAcceptJob = (deal: Deal) => {
    setActiveJob(deal);
    setDismissedBroadcasts(prev => new Set(prev).add(deal.id));
    
    // Broadcast acceptance
    localStorage.setItem('job_accepted', deal.id.toString());
    localStorage.removeItem('job_accepted');
  };
  
  const handleTwoWayRating = async (
    rating: number,
    feedback: string,
    fromRole: 'seeker' | 'provider',
    job: Deal,
  ) => {
    const targetName = fromRole === 'seeker'
      ? job.providerName || 'Your AidMate'
      : job.seekerName;
    const targetMobile = fromRole === 'seeker' ? job.providerMobile : job.seekerMobile;

    await submitReview({
      jobId: String(job.id),
      targetName,
      targetMobile,
      rating,
      comment: feedback,
    });

    if (fromRole === 'seeker') {
      setVerifiedAidmates(prev => prev.map(aidmate => {
        const isMatched = targetMobile
          ? aidmate.mobile === targetMobile
          : aidmate.name === targetName;
        if (isMatched) {
          const starKey = rating.toString() as '1' | '2' | '3' | '4' | '5';
          const newRatings = { ...aidmate.ratings, [starKey]: (aidmate.ratings[starKey] || 0) + 1 };
          const newCount = aidmate.reviewCount + 1;
          const totalScore = (aidmate.overallRating * aidmate.reviewCount) + rating;
          const newOverall = parseFloat((totalScore / newCount).toFixed(1));
          return {
            ...aidmate,
            ratings: newRatings,
            reviewCount: newCount,
            overallRating: newOverall
          };
        }
        return aidmate;
      }));
    } else if (userData) {
      setUserData(prev => {
        if (!prev) return prev;
        const starKey = rating.toString() as '1' | '2' | '3' | '4' | '5';
        const currentRatings = prev.ratings || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
        const currentCount = prev.reviewCount || 0;
        const currentOverall = prev.overallRating || 0;
        const newCount = currentCount + 1;
        const newRatings = { ...currentRatings, [starKey]: (currentRatings[starKey] || 0) + 1 };
        const newOverall = Number((((currentOverall * currentCount) + rating) / newCount).toFixed(1));

        return {
          ...prev,
          ratings: newRatings,
          reviewCount: newCount,
          overallRating: newOverall,
        };
      });
    }

    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: {
        title: 'Review Submitted',
        body: `Your ${rating}-star rating and feedback have been saved.`,
        type: 'success',
      },
    }));
  };

  const handleCompleteJob = () => {
    setActiveJob(null);
  };

  const handleContact = (deal: Deal, chatRole?: 'seeker' | 'provider') => {
    setActiveChatDeal(deal);
    setActiveChatRole(chatRole || 'seeker');
    setView('chat');
  };
  
  const handleBackFromChat = () => {
    setView('home-dashboard');
  };

  const handleToggleAidmateStatus = (isActive: boolean) => {
    setIsAidmateActive(isActive);
    if (!userData) return;
    
    if (isActive) {
        const existing = verifiedAidmates.find(p => p.name === userData.name);
        if (!existing) {
            const newProfile: AidmateProfile = {
                id: `aidmate-${Date.now()}`,
                name: userData.name,
                mobile: userData.mobile,
                profilePictureUrl: 'https://i.pravatar.cc/150?u=' + userData.name,
                district: 'Local',
                state: 'Area',
                overallRating: 5,
                reviewCount: 0,
                services: ['General Help', 'Errands'],
                skills: ['General Help', 'Errands'],
                jobs: [],
                ratings: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
                isAvailable: true,
                isVerified: true,
                location: { lat: 12.9716, lng: 77.5946 },
                distance: '0 km',
                bio: 'Available to help in the neighborhood.',
            };
            setVerifiedAidmates(current => [...current, newProfile]);
        } else {
            setVerifiedAidmates(current => current.map(p => 
                p.name === userData.name ? { ...p, isAvailable: true } : p
            ));
        }
    } else {
        setVerifiedAidmates(current => current.map(p => 
            p.name === userData.name ? { ...p, isAvailable: false } : p
        ));
    }
  };

  const handleApprove = (id: string) => {
      const approvedProvider = pendingAidmates.find(p => p.id === id);
      if (!approvedProvider) return;

      // Find the existing unverified profile and update its status
      setVerifiedAidmates(prev => 
          prev.map(profile => 
              profile.name === approvedProvider.name 
                  ? { ...profile, isVerified: true, bio: 'Newly verified AIDMATE!' } 
                  : profile
          )
      );
      
      // Remove from pending list
      setPendingAidmates(prev => prev.filter(p => p.id !== id));
      
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: { title: 'Provider Approved', body: `${approvedProvider.name} is now a verified AIDMATE.` }
      }));
  };

  const handleReject = (id: string) => {
      const rejectedProvider = pendingAidmates.find(p => p.id === id);
      if (rejectedProvider) {
          // Remove from both pending and the main list
          setPendingAidmates(prev => prev.filter(p => p.id !== id));
          setVerifiedAidmates(prev => prev.filter(p => p.name !== rejectedProvider.name));
          
          window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { title: 'Provider Rejected', body: `${rejectedProvider.name}'s application has been rejected.` }
          }));
       }
  };
  
  const handleUpdateProfile = (updatedProfile: AidmateProfile) => {
    setVerifiedAidmates(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };


  const handleSimulateAcceptance = (dealId: string | number) => {
    const matchedAidmate = verifiedAidmates[0] || {
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      location: { lat: 17.6958, lng: 83.2285 }
    };

    setJobBroadcasts(prev => prev.map(deal => 
      deal.id === dealId 
        ? { 
            ...deal, 
            status: 'accepted', 
            providerName: matchedAidmate.name,
            providerMobile: matchedAidmate.mobile,
            providerLocation: matchedAidmate.location || { lat: 17.6958, lng: 83.2285 }
          } 
        : deal
    ));

    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { 
        title: 'Task Accepted by AidMate', 
        body: `${matchedAidmate.name} accepted your task! Live map tracking, chat and calling are now unlocked.`,
        type: 'success'
      }
    }));
  };

  const renderContent = () => {
    if (activeJob) {
      return (
        <ActiveJobExecution 
          job={activeJob} 
          onComplete={handleCompleteJob} 
          onRate={handleTwoWayRating}
          onChat={() => handleContact(activeJob, 'provider')}
          role="provider" 
        />
      );
    }
    
    const myActiveRequest = jobBroadcasts.find(j => j.seekerMobile === userData?.mobile && j.status === 'accepted');
    if (myActiveRequest) {
      return (
        <ActiveJobExecution 
          job={myActiveRequest} 
          onComplete={() => handleCompleteRequest(myActiveRequest.id as string)} 
          onRate={handleTwoWayRating}
          onChat={() => handleContact(myActiveRequest, 'seeker')}
          role="seeker" 
        />
      );
    }
    const matchedProfile = userData
        ? verifiedAidmates.find(p => p.name === userData.name)
        : undefined;

    const currentUserProfile: AidmateProfile | undefined = matchedProfile || (userData ? {
      id: `user-${userData.mobile}`,
      name: userData.name,
      mobile: userData.mobile,
      profilePictureUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${userData.name}`,
      district: 'Local Area',
      state: 'India',
      overallRating: userData.overallRating || 5.0,
      reviewCount: userData.reviewCount || 1,
      services: ['Community Member'],
      skills: ['Community Member'],
      jobs: [],
      ratings: userData.ratings || { '5': 1, '4': 0, '3': 0, '2': 0, '1': 0 },
      isAvailable: isAidmateActive,
      isVerified: true,
      location: { lat: 17.6868, lng: 83.2185 },
      distance: '0 km',
      bio: 'Active community participant.'
    } : undefined);
        
    if (view === 'settings' && userData) {
        return <SettingsPage 
          userRole={userRole}
          profileData={currentUserProfile}
          onUpdateProfile={handleUpdateProfile}
          onBack={() => setView('home-dashboard')} 
          onLogout={handleLogout} 
        />
    }
    
    if (view === 'chat' && activeChatDeal && userData) {
        return <ChatPage 
          deal={activeChatDeal} 
          currentUser={userData} 
          onBack={handleBackFromChat} 
          userRole={activeChatRole}
          verifiedAidmates={verifiedAidmates}
        />
    }

    if (userData) {
      const previousAidmates = verifiedAidmates.slice(0, 2);

      switch (view) {
        case 'home-dashboard':
          return <HomeDashboard 
            userData={userData}
            userRole={userRole}
            jobBroadcasts={jobBroadcasts}
            verifiedAidmates={verifiedAidmates}
            previousAidmates={previousAidmates}
            isAidmateActive={isAidmateActive}
            onToggleAidmateStatus={handleToggleAidmateStatus}
            onGoToSettings={() => setView('settings')}
            onScanForHelp={handleCreateBroadcast}
            onCompleteRequest={handleCompleteRequest}
            onContact={handleAcceptJob}
            onOpenChat={(deal) => handleContact(deal, 'seeker')}
            onSimulateAccept={handleSimulateAcceptance}
            onDismissBroadcast={(id) => setDismissedBroadcasts(prev => new Set(prev).add(id))}
            dismissedBroadcasts={dismissedBroadcasts}
          />;
        case 'admin-dashboard':
          if (userRole !== 'admin') {
            return <HomeDashboard 
              userData={userData}
              jobBroadcasts={jobBroadcasts}
              verifiedAidmates={verifiedAidmates}
              previousAidmates={previousAidmates}
              isAidmateActive={isAidmateActive}
              onToggleAidmateStatus={handleToggleAidmateStatus}
              onGoToSettings={() => setView('settings')}
              onScanForHelp={handleCreateBroadcast}
              onCompleteRequest={handleCompleteRequest}
              onContact={handleAcceptJob}
              onOpenChat={(deal) => handleContact(deal, 'seeker')}
              onSimulateAccept={handleSimulateAcceptance}
              onDismissBroadcast={(id) => setDismissedBroadcasts(prev => new Set(prev).add(id))}
              dismissedBroadcasts={dismissedBroadcasts}
            />;
          }
          return <AdminDashboard 
            verifiedAidmates={verifiedAidmates}
            pendingAidmates={pendingAidmates}
            onApprove={handleApprove}
            onReject={handleReject}
            onLogout={handleLogout}
          />;
      }
    }

    const handleRegisterAidmatePending = (pendingData: PendingAidmate) => {
      setPendingAidmates(prev => [pendingData, ...prev]);
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          title: 'AidMate Certificate Submitted',
          body: `${pendingData.name}'s certificate is queued for Admin verification!`,
          type: 'success'
        }
      }));
    };

    return (
      <SignUpPage 
        onSignUpSuccess={handleSignUpSuccess} 
        onRegisterAidmatePending={handleRegisterAidmatePending}
      />
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {isAuthRestoring ? (
          <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-gray-500">
            Restoring your session…
          </div>
        ) : renderContent()}
      </main>
      {notification && (
        <NotificationToast 
          title={notification.title} 
          body={notification.body} 
          type={notification.type}
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
};

export default App;