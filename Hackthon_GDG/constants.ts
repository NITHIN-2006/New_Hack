import { AidmateProfile, PendingAidmate } from './types';

export const PREDEFINED_SERVICES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'House Cleaning',
  'Appliance Repair',
  'Painting',
  'Pest Control',
  'Gardening',
  'Cooking',
  'Elderly Care',
  'Babysitting',
  'Tutoring'
];

export const MOCK_VERIFIED_AIDMATES: AidmateProfile[] = [
  {
    id: 'aidmate-1',
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=rajesh',
    district: 'Koramangala',
    state: 'Bangalore',
    overallRating: 4.8,
    reviewCount: 127,
    services: ['Plumbing', 'Appliance Repair'],
    skills: ['Plumbing', 'Pipe Repair', 'Bathroom Fitting'],
    jobs: [
      { id: 'job-1', title: 'Leaky Faucet Repair', area: 'Gajuwaka', date: '2023-10-25', status: 'completed' },
      { id: 'job-2', title: 'Geyser Installation', area: 'MVP Colony', date: '2023-10-24', status: 'completed' },
    ],
    ratings: { '5': 110, '4': 15, '3': 2, '2': 0, '1': 0 },
    isAvailable: true,
    isVerified: true,
    location: { lat: 12.9352, lng: 77.6245 },
    distance: '2.3 km',
    bio: 'Expert plumber with 15+ years of experience. Available for emergency repairs and installations.'
  },
  {
    id: 'aidmate-2',
    name: 'Anitha Reddy',
    mobile: '9876543211',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=anitha',
    district: 'Hyderabad',
    state: 'Telangana',
    overallRating: 4.9,
    reviewCount: 218,
    services: ['House Cleaning', 'Cooking'],
    skills: ['Deep Cleaning', 'Kitchen Prep', 'Residential Cleaning'],
    jobs: [
        { id: 'job-3', title: 'Deep Cleaning', area: 'T. Nagar', date: '2023-10-26', status: 'completed' },
        { id: 'job-4', title: 'Cooking Help', area: 'Adyar', date: '2023-10-26', status: 'rejected', rejectionReason: 'User canceled' },
    ],
    ratings: { '5': 210, '4': 8, '3': 0, '2': 0, '1': 0 },
    isAvailable: true,
    isVerified: true,
    location: { lat: 17.4375, lng: 78.4483 },
    distance: '5.6 km',
    bio: 'Professional cleaning services with attention to detail. I bring my own eco-friendly supplies.'
  },
   {
    id: 'aidmate-3',
    name: 'Suresh Nair',
    mobile: '9876543212',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=suresh',
    district: 'Kochi',
    state: 'Kerala',
    overallRating: 4.5,
    reviewCount: 89,
    services: ['Electrical Work', 'Carpentry'],
    skills: ['Wiring Check', 'Fixture Installation', 'Furniture Assembly'],
    jobs: [],
    ratings: { '5': 70, '4': 15, '3': 4, '2': 0, '1': 0 },
    isAvailable: false,
    isVerified: true,
    location: { lat: 9.9312, lng: 76.2673 },
    distance: '8.1 km',
    bio: 'Certified electrician and carpenter. Reliable and committed to quality workmanship.'
  }
];

export const MOCK_PENDING_AIDMATES: PendingAidmate[] = [
  {
    id: 'pending-1',
    name: 'Ravi Teja',
    mobile: '9876543210',
    providerType: 'professional',
    submissionDate: '2023-10-26',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=ravi',
    documents: {
      aadhaarFrontUrl: '#',
      aadhaarBackUrl: '#',
      selfieVideoUrl: '#',
      certificateUrl: '#',
    },
  },
  {
    id: 'pending-2',
    name: 'Sunita Rao',
    mobile: '8765432109',
    providerType: 'casual',
    submissionDate: '2023-10-25',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=sunita',
    documents: {
      aadhaarFrontUrl: '#',
      aadhaarBackUrl: '#',
      selfieVideoUrl: '#',
      bankPassbookUrl: '#',
    },
  }
];


export const SOUTH_INDIAN_STATES = [
  'Andhra Pradesh',
  'Karnataka',
  'Kerala',
  'Tamil Nadu',
  'Telangana'
];

export const DISTRICTS_BY_STATE: { [key: string]: string[] } = {
  'Andhra Pradesh': ['Visakhapatnam', 'Krishna', 'Guntur', 'Chittoor', 'East Godavari'],
  'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Mangaluru', 'Belagavi', 'Hubballi-Dharwad'],
  'Kerala': ['Thiruvananthapuram', 'Ernakulam', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Rangareddy']
};

export const LOCAL_AREAS_BY_DISTRICT: { [key: string]: { [key: string]: string[] } } = {
  'Andhra Pradesh': {
    'Visakhapatnam': ['Gajuwaka', 'MVP Colony', '530026'],
    'Krishna': ['Vijayawada', 'Gannavaram', '520001'],
    'Guntur': ['Brodipet', 'Pattabhipuram', '522002'],
    'Chittoor': ['Tirupati', 'Madanapalle', '517501'],
    'East Godavari': ['Rajahmundry', 'Kakinada', '533001']
  },
  'Karnataka': {
    'Bengaluru Urban': ['Koramangala', 'Indiranagar', '560034'],
    'Mysuru': ['Jayalakshmipuram', 'Kuvempunagar', '570023'],
    'Mangaluru': ['Kadri', 'Bejai', '575001'],
    'Belagavi': ['Tilakwadi', 'Sadashiv Nagar', '590001'],
    'Hubballi-Dharwad': ['Vidyanagar', 'Keshwapur', '580021']
  },
  'Kerala': {
    'Thiruvananthapuram': ['Pattom', 'Kowdiar', '695003'],
    'Ernakulam': ['Kakkanad', 'Edappally', '682024'],
    'Kozhikode': ['Mavoor Road', 'Nadakkavu', '673001'],
    'Thrissur': ['Poonkunnam', 'Ayyanthole', '680003'],
    'Kollam': ['Chinnakada', 'Kavanad', '691001']
  },
  'Tamil Nadu': {
    'Chennai': ['T. Nagar', 'Adyar', '600017'],
    'Coimbatore': ['R.S. Puram', 'Saibaba Colony', '641002'],
    'Madurai': ['Anna Nagar', 'K.K. Nagar', '625020'],
    'Tiruchirappalli': ['Thillai Nagar', 'Srirangam', '620006'],
    'Salem': ['Fairlands', 'Hasthampatti', '636007']
  },
  'Telangana': {
    'Hyderabad': ['Banjara Hills', 'Jubilee Hills', '500033'],
    'Warangal': ['Hanamkonda', 'Kazipet', '506001'],
    'Nizamabad': ['Vinayak Nagar', 'Subhash Nagar', '503001'],
    'Karimnagar': ['Kothirampur', 'Mankammathota', '505001'],
    'Rangareddy': ['Gachibowli', 'Manikonda', '500032']
  }
};