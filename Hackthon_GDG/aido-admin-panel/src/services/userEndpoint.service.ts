import { UnifiedAidoUser } from '../types/user.types';
import { clearAdminSession, getAdminToken } from './adminAuth.service';

const UNIFIED_API_ENDPOINT = (import.meta.env.VITE_UNIFIED_API_ENDPOINT || '').replace(/\/$/, '');

// Initial Demo Data (Used when testing before connecting live Firebase credentials)
const DEMO_USERS: UnifiedAidoUser[] = [
  {
    id: 'usr_101',
    name: 'Ramesh Kumar',
    mobile: '+91 98765 43210',
    email: 'ramesh.k@example.com',
    isActiveAidmate: true,
    skills: ['Electrical Work', 'Ceiling Fan Repair', 'MCB Wiring'],
    certificates: [
      {
        id: 'cert_101',
        title: 'ITI Electrician Trade Certificate.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        uploadedAt: '2026-11-01',
      },
      {
        id: 'cert_102',
        title: 'State Wireman Permit.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        uploadedAt: '2026-11-02',
      },
    ],
    customerReviews: {
      averageRating: 4.8,
      totalCount: 2,
      items: [
        {
          id: 'cr_1',
          reviewerName: 'Suresh Plumbers',
          rating: 5,
          comment: 'Clear task instructions and immediate UPI payment.',
          createdAt: '2026-10-25',
        },
        {
          id: 'cr_2',
          reviewerName: 'Kiran Cleaners',
          rating: 4.6,
          comment: 'Very polite customer, provided all cleaning supplies.',
          createdAt: '2026-10-29',
        },
      ],
    },
    aidmateReviews: {
      averageRating: 4.9,
      totalCount: 2,
      items: [
        {
          id: 'ar_1',
          reviewerName: 'Anita Sharma',
          rating: 5,
          comment: 'Fixed the ceiling fan capacitor in 15 minutes!',
          createdAt: '2026-11-02',
        },
        {
          id: 'ar_2',
          reviewerName: 'Vikram Rao',
          rating: 4.8,
          comment: 'Arrived on time and carried proper testing tools.',
          createdAt: '2026-11-04',
        },
      ],
    },
    customerComplaints: [],
    aidmateComplaints: [
      {
        id: 'ac_1',
        complainantName: 'Deepak V.',
        reason: 'Arrived 20 minutes late for scheduled electrical check.',
        severity: 'LOW',
        status: 'OPEN',
        createdAt: '2026-11-03',
      },
    ],
    isVerified: true,
    verifiedAt: '2026-11-02T10:30:00Z',
  },
  {
    id: 'usr_102',
    name: 'Priya Nair',
    mobile: '+91 91234 56780',
    email: 'priya.nair@example.com',
    isActiveAidmate: false, // Toggled OFF -> Inactive AIDMATE (Normal Customer)
    skills: ['Home Tutoring', 'Cooking & Meal Prep'],
    certificates: [
      {
        id: 'cert_201',
        title: 'B.Ed Qualification & FSSAI Basic Hygiene.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        uploadedAt: '2026-11-03',
      },
    ],
    customerReviews: {
      averageRating: 4.5,
      totalCount: 1,
      items: [
        {
          id: 'cr_3',
          reviewerName: 'Manoj Carpentry',
          rating: 4.5,
          comment: 'Helpful customer, explained the wardrobe hinge issue clearly.',
          createdAt: '2026-11-01',
        },
      ],
    },
    aidmateReviews: {
      averageRating: 4.7,
      totalCount: 1,
      items: [
        {
          id: 'ar_3',
          reviewerName: 'Lakshmi K.',
          rating: 4.7,
          comment: 'Excellent algebra tutoring session for my daughter.',
          createdAt: '2026-10-20',
        },
      ],
    },
    customerComplaints: [
      {
        id: 'cc_1',
        complainantName: 'Raju Painters',
        reason: 'Cancelled active request 10 mins after acceptance.',
        severity: 'MEDIUM',
        status: 'OPEN',
        createdAt: '2026-11-04',
      },
    ],
    aidmateComplaints: [],
    isVerified: false,
    verifiedAt: null,
  },
  {
    id: 'usr_103',
    name: 'Karthik Reddy',
    mobile: '+91 99887 76655',
    email: 'karthik.r@example.com',
    isActiveAidmate: true,
    skills: ['Plumbing', 'Leak Repair', 'Water Tank Cleaning'],
    certificates: [],
    customerReviews: {
      averageRating: 5.0,
      totalCount: 1,
      items: [
        {
          id: 'cr_4',
          reviewerName: 'Arun Tech Support',
          rating: 5.0,
          comment: 'Smooth experience setting up Wi-Fi router at his house.',
          createdAt: '2026-10-15',
        },
      ],
    },
    aidmateReviews: {
      averageRating: 4.3,
      totalCount: 1,
      items: [
        {
          id: 'ar_4',
          reviewerName: 'Meena S.',
          rating: 4.3,
          comment: 'Stopped the kitchen pipe leak quickly.',
          createdAt: '2026-11-01',
        },
      ],
    },
    customerComplaints: [],
    aidmateComplaints: [
      {
        id: 'ac_2',
        complainantName: 'Naveen Kumar',
        reason: 'Left old pipe fittings near the washbasin.',
        severity: 'MEDIUM',
        status: 'OPEN',
        createdAt: '2026-11-04',
      },
    ],
    isVerified: false,
    verifiedAt: null,
  },
];

function normalizeUser(user: Partial<UnifiedAidoUser> & { id: string }): UnifiedAidoUser {
  return {
    id: user.id,
    name: user.name ?? 'Unknown User',
    mobile: user.mobile ?? '',
    email: user.email ?? '',
    isActiveAidmate: Boolean(user.isActiveAidmate),
    skills: user.skills ?? [],
    certificates: user.certificates ?? [],
    customerReviews: {
      averageRating: Number(user.customerReviews?.averageRating ?? 0),
      totalCount: Number(user.customerReviews?.totalCount ?? 0),
      items: user.customerReviews?.items ?? [],
    },
    aidmateReviews: {
      averageRating: Number(user.aidmateReviews?.averageRating ?? 0),
      totalCount: Number(user.aidmateReviews?.totalCount ?? 0),
      items: user.aidmateReviews?.items ?? [],
    },
    customerComplaints: user.customerComplaints ?? [],
    aidmateComplaints: user.aidmateComplaints ?? [],
    isVerified: Boolean(user.isVerified),
    verifiedAt: user.verifiedAt ?? null,
  };
}

// Local storage persistence for demo mode
function getLocalUsers(): UnifiedAidoUser[] {
  const saved = localStorage.getItem('aido_unified_users_db');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('aido_unified_users_db', JSON.stringify(DEMO_USERS));
  return DEMO_USERS;
}

function saveLocalUsers(users: UnifiedAidoUser[]) {
  localStorage.setItem('aido_unified_users_db', JSON.stringify(users));
}

function adminHeaders(): HeadersInit {
  const token = getAdminToken();
  if (!token) throw new Error('Admin session is missing. Please sign in again.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function ensureAdminResponse(response: Response): Promise<void> {
  if (response.status === 401 || response.status === 403) {
    clearAdminSession();
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Admin API request failed (${response.status}).`);
  }
}

/**
 * Fetch unified users from the API, or use local demo data when no API is configured.
 */
export async function fetchAllUnifiedUsers(): Promise<{
  users: UnifiedAidoUser[];
  source: 'ENDPOINT' | 'DEMO_MODE';
}> {
  if (UNIFIED_API_ENDPOINT) {
    const res = await fetch(UNIFIED_API_ENDPOINT, {
      method: 'GET',
      headers: adminHeaders(),
    });
    await ensureAdminResponse(res);
    const data = await res.json();
    const rawUsers = data.users ?? data.rows ?? data.data ?? data;
    const users = Array.isArray(rawUsers) ? rawUsers.map(user => normalizeUser(user)) : [];
    return { users, source: 'ENDPOINT' };
  }

  return { users: getLocalUsers(), source: 'DEMO_MODE' };
}

/**
 * Toggle Active AIDMATE vs Inactive AIDMATE on the same unified user.
 */
export async function toggleUserAidmateStatus(
  userId: string,
  nextAidmateState: boolean
): Promise<UnifiedAidoUser[]> {
  if (UNIFIED_API_ENDPOINT) {
    const res = await fetch(`${UNIFIED_API_ENDPOINT}/${encodeURIComponent(userId)}/toggle-aidmate`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ isActiveAidmate: nextAidmateState }),
    });
    await ensureAdminResponse(res);
    return (await fetchAllUnifiedUsers()).users;
  }

  const updated = getLocalUsers().map(u =>
    u.id === userId ? { ...u, isActiveAidmate: nextAidmateState } : u
  );
  saveLocalUsers(updated);
  return updated;
}

/**
 * Set the user's verification badge.
 */
export async function toggleUserVerificationBadge(
  userId: string,
  nextVerifiedState: boolean
): Promise<UnifiedAidoUser[]> {
  const verifiedAt = nextVerifiedState ? new Date().toISOString() : null;

  if (UNIFIED_API_ENDPOINT) {
    const res = await fetch(`${UNIFIED_API_ENDPOINT}/${encodeURIComponent(userId)}/verify-badge`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ isVerified: nextVerifiedState, verifiedAt }),
    });
    await ensureAdminResponse(res);
    return (await fetchAllUnifiedUsers()).users;
  }

  const updated = getLocalUsers().map(u =>
    u.id === userId ? { ...u, isVerified: nextVerifiedState, verifiedAt } : u
  );
  saveLocalUsers(updated);
  return updated;
}