import axios from 'axios';

// Create an Axios instance with base URL pointing to the Express backend
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Setup interceptor to fallback to mock data if API fails
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.log('API Error:', error.message, '- Using mock data');
    // Don't throw, let the calling function handle the fallback
    throw error;
  }
);

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  coverPage: string | null;
  gender?: string;
  country?: string;
  city?: string;
  profession?: string;
  isStudent?: boolean;
  isVerified?: boolean;
  joinedDate?: string;
  trustScore?: number;
  status?: 'Active' | 'Pending' | 'Suspended';
  plan?: string;
  badge?: string;
  bio?: string;
  phone?: string;
  emergencyPhone?: string;
  company?: string;
  lastActive?: string;
  notificationPermissions?: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
}

export interface Post {
  id: number;
  userId: string;
  title: string;
  description: string;
  attachments: any[];
  postType: string;
  visibility: string;
  created_at: string;
  author_name: string;
  author_role: string;
  author_avatar: string | null;
}

export interface EmailRecord {
  id: number;
  sentAt: string;
  status: string;
  senderId: string;
  senderName: string;
  recipientType: 'direct' | 'bulk';
  recipientGroup: string | null;
  recipientCount: number;
  recipientSummary: string;
  subject: string;
  body: string;
  campaignType: string;
}

export interface SendEmailPayload {
  recipientType: 'direct' | 'bulk';
  recipientId?: string;
  recipientGroup?: 'all' | 'students' | 'professionals' | 'verified' | 'unverified';
  subject: string;
  body: string;
  campaignType: string;
}

export interface CallRecord {
  id: number;
  timestamp: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  duration: number;
  status: 'Completed' | 'Missed' | 'No Answer';
  type: 'Standard Call' | 'Emergency Call' | 'Recruiter Support Call';
}

export interface InitiateCallPayload {
  recipientId: string;
  duration: number;
  status: 'Completed' | 'Missed' | 'No Answer';
  type: 'Standard Call' | 'Emergency Call' | 'Recruiter Support Call';
}

export interface NotificationRecord {
  id: number;
  sentAt: string;
  status: 'Sent' | 'Failed';
  senderId: string;
  senderName: string;
  recipientType: 'direct' | 'bulk';
  recipientGroup: string | null;
  recipientSummary: string;
  recipientCount: number;
  optOutCount: number;
  title: string;
  message: string;
  channel: 'push' | 'email' | 'in-app';
}

export interface SendNotificationPayload {
  recipientType: 'direct' | 'bulk';
  recipientId?: string;
  recipientGroup?: 'all' | 'students' | 'professionals' | 'verified' | 'unverified';
  title: string;
  message: string;
  channel: 'push' | 'email' | 'in-app';
}

export interface ChatMessage {
  id: number;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSpam?: boolean;
  moderated?: boolean;
  warningSent?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  isFlagged: boolean;
  messages: ChatMessage[];
}

export interface VerificationDoc {
  type: string;
  name: string;
  submittedAt: string;
  docId: string;
  size: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  website: string;
  industry: string;
  location: string;
  description: string;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  accountStatus: 'active' | 'suspended';
  createdDate: string;
  lastActive: string;
  recruiterCount: number;
  totalJobs: number;
  size: string;
  verificationDocs?: VerificationDoc[];
  verificationNotes?: string;
  riskScore: number;
  riskReasons?: string[];
  analytics?: {
    applicants: number;
    views: number;
    hires: number;
    engagementRate: number;
  };
  isSuspicious?: boolean;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  category: string;
  location: string;
  status: 'active' | 'expired';
  postedDate: string;
  isFeatured: boolean;
  applicantCount: number;
}

export interface CompanyReport {
  id: string;
  targetType: 'company' | 'job';
  targetId: string;
  targetName: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved';
  createdDate: string;
}

export interface CompanyLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  timestamp: string;
}

export interface CompanySettings {
  requireVerificationDocs: boolean;
  autoFilterSpamJobs: boolean;
  allowedDomains: string[];
  minTrustScoreToPost: number;
  spamKeywords: string[];
  googleSheetSyncUrl?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: string;
  userName: string;
  userEmail: string;
  resumeUrl: string;
  status: 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected';
  appliedDate: string;
  coverLetter?: string;
  phone?: string;
  education?: string;
  skills?: string;
  portfolioUrl?: string;
}

export interface DbSummary {
  users: number;
  posts: number;
  companies: number;
  jobs: number;
  applications: number;
  reports: number;
  conversations: number;
  calls: number;
  emails: number;
  notifications: number;
}

// Mock data for fallback
const mockApplications: Application[] = [
  {
    id: "a1",
    jobId: "j1",
    jobTitle: "React Frontend Developer",
    companyName: "TalentNova",
    userId: "u1",
    userName: "Amina Yusuf",
    userEmail: "amina@youthconnect.io",
    resumeUrl: "https://omahconnect.com/resumes/amina_yusuf.pdf",
    status: "interview",
    appliedDate: "2025-02-10",
    coverLetter: "I have 2+ years of React experience and have worked on high-engagement social platforms."
  },
  {
    id: "a2",
    jobId: "j2",
    jobTitle: "Summer Product Management Internship",
    companyName: "BuildWise",
    userId: "u6",
    userName: "John Doe",
    userEmail: "john.doe@edu.org",
    resumeUrl: "https://omahconnect.com/resumes/john_doe.pdf",
    status: "applied",
    appliedDate: "2025-03-12",
    coverLetter: "CS student at NYU eager to apply agile product coordination skills to construction technology."
  },
  {
    id: "a3",
    jobId: "j5",
    jobTitle: "Machine Learning Research Intern",
    companyName: "Google",
    userId: "u11",
    userName: "Chloe Dupont",
    userEmail: "chloe.dupont@sorbonne.fr",
    resumeUrl: "https://omahconnect.com/resumes/chloe_dupont.pdf",
    status: "interview",
    appliedDate: "2025-04-22",
    coverLetter: "Working with multimodal LLMs in Sorbonne. Excited about the research opportunities at Google."
  },
  {
    id: "a4",
    jobId: "j1",
    jobTitle: "React Frontend Developer",
    companyName: "TalentNova",
    userId: "u24",
    userName: "Zara Khan",
    userEmail: "zara.khan@lahore.pk",
    resumeUrl: "https://omahconnect.com/resumes/zara_khan.pdf",
    status: "applied",
    appliedDate: "2025-04-05",
    coverLetter: "Passionate software engineering student with several fullstack projects using React and Node.js."
  },
  {
    id: "a5",
    jobId: "j5",
    jobTitle: "Machine Learning Research Intern",
    companyName: "Google",
    userId: "u25",
    userName: "William Taylor",
    userEmail: "william.t@melbourne.au",
    resumeUrl: "https://omahconnect.com/resumes/william_taylor.pdf",
    status: "hired",
    appliedDate: "2025-04-18",
    coverLetter: "Focusing on NLP models and predictive systems. Excited to join the research team."
  },
  {
    id: "a6",
    jobId: "j2",
    jobTitle: "Summer Product Management Internship",
    companyName: "BuildWise",
    userId: "u9",
    userName: "Carlos Mendez",
    userEmail: "carlos.m@estudiante.es",
    resumeUrl: "https://omahconnect.com/resumes/carlos_mendez.pdf",
    status: "rejected",
    appliedDate: "2025-03-24",
    coverLetter: "Interested in structural design and smart city construction coordination."
  },
  {
    id: "a7",
    jobId: "j5",
    jobTitle: "Machine Learning Research Intern",
    companyName: "Google",
    userId: "u14",
    userName: "Aravind Nair",
    userEmail: "aravind.n@tech.in",
    resumeUrl: "https://omahconnect.com/resumes/aravind_nair.pdf",
    status: "interview",
    appliedDate: "2025-05-02",
    coverLetter: "Studying system designs at IISc and researching parallel distributed computing networks."
  },
  {
    id: "a8",
    jobId: "j2",
    jobTitle: "Summer Product Management Internship",
    companyName: "BuildWise",
    userId: "candidate",
    userName: "Verification Test Candidate",
    userEmail: "test.candidate@domain.com",
    phone: "+1 (555) 999-8888",
    education: "State University, BS Computer Science",
    skills: "React, Node, Testing",
    portfolioUrl: "https://github.com/testcandidate",
    resumeUrl: "https://omahconnect.com/resumes/test_candidate.pdf",
    status: "applied",
    appliedDate: "2026-06-10",
    coverLetter: "I am highly interested in the Summer Product Management Internship!"
  },
  {
    id: "a9",
    jobId: "j2",
    jobTitle: "Summer Product Management Internship",
    companyName: "BuildWise",
    userId: "candidate",
    userName: "Muneeb Shoaib",
    userEmail: "muneebshoaib2005@gmail.com",
    phone: "023150949",
    education: "comsats",
    skills: "react, typescript",
    portfolioUrl: "https://www.linkedin.com/in/muneeb-shoaib-4b584425b/",
    resumeUrl: "https://omahconnect.com/resumes/1781274811429_muneeb_shoaib.pdf",
    status: "applied",
    appliedDate: "2026-06-12",
    coverLetter: "nothing"
  }
];

const mockCurrentUser: User = {
  id: "admin-1",
  email: "admin@omahconnect.com",
  name: "Admin User",
  role: "Super Admin",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  coverPage: null,
  gender: "Male",
  country: "United States",
  city: "Austin",
  profession: "Operations Director",
  isStudent: false,
  isVerified: true,
  joinedDate: "2025-01-10",
  trustScore: 99,
  status: "Active",
  plan: "Enterprise",
  badge: "System Creator",
  bio: "Managing the platform's core administrative and verification tools.",
  phone: "+1 (555) 019-000",
  emergencyPhone: "+1 (555) 911-000",
  notificationPermissions: { push: true, email: true, inApp: true }
};

/* =========================
   AUTHENTICATION API
========================= */
export const fetchCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  } catch (error) {
    console.log('Using mock current user');
    return mockCurrentUser;
  }
};

/* =========================
   APPLICATION MODULE MODELS & API
========================= */
export const fetchApplications = async (): Promise<Application[]> => {
  try {
    const response = await apiClient.get('/applications');
    return response.data.applications;
  } catch (error) {
    console.log('Using mock applications data');
    return mockApplications;
  }
};

export const updateApplicationStatus = async (id: string, status: 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected'): Promise<Application> => {
  try {
    const response = await apiClient.post(`/applications/${id}/status`, { status });
    return response.data.application;
  } catch (error) {
    const app = mockApplications.find(a => a.id === id);
    if (app) {
      app.status = status;
      return app;
    }
    throw error;
  }
};

export const deleteApplication = async (id: string): Promise<{ success: boolean }> => {
  try {
    const response = await apiClient.post(`/applications/${id}/delete`);
    return response.data;
  } catch (error) {
    const idx = mockApplications.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockApplications.splice(idx, 1);
      return { success: true };
    }
    throw error;
  }
};

export const syncGoogleSheet = async (sheetUrl: string): Promise<{ success: boolean; addedCount: number }> => {
  try {
    const response = await apiClient.post('/applications/sync-sheet', { sheetUrl });
    return response.data;
  } catch (error) {
    console.log('Google Sheet sync failed:', error);
    return { success: false, addedCount: 0 };
  }
};

export const fetchPublicInternships = async (): Promise<Job[]> => {
  try {
    const response = await apiClient.get('/public/internships');
    return response.data.internships;
  } catch (error) {
    return [];
  }
};

export const submitApplication = async (payload: {
  jobId: string;
  userName: string;
  userEmail: string;
  phone?: string;
  education?: string;
  skills?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  coverLetter?: string;
}): Promise<{ success: boolean; application: Application }> => {
  try {
    const response = await apiClient.post('/public/applications/submit', payload);
    return response.data;
  } catch (error) {
    return { success: false, application: {} as Application };
  }
};

// Stub out all other API functions that aren't critical for applications page
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/users');
    return response.data.users;
  } catch {
    return [mockCurrentUser];
  }
};

export const toggleNotificationPermissions = async (userId: string, permissions: any): Promise<any> => {
  try {
    const response = await apiClient.post(`/users/${userId}/notifications/toggle`, permissions);
    return response.data;
  } catch {
    return {};
  }
};

export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await apiClient.get('/posts');
    return response.data.posts;
  } catch {
    return [];
  }
};

export const fetchEmails = async (): Promise<EmailRecord[]> => {
  try {
    const response = await apiClient.get('/emails');
    return response.data.emails;
  } catch {
    return [];
  }
};

export const sendEmail = async (payload: SendEmailPayload): Promise<any> => {
  try {
    const response = await apiClient.post('/emails/send', payload);
    return response.data;
  } catch {
    return { success: false };
  }
};

export const fetchCalls = async (): Promise<CallRecord[]> => {
  try {
    const response = await apiClient.get('/calls');
    return response.data.calls;
  } catch {
    return [];
  }
};

export const initiateCall = async (payload: InitiateCallPayload): Promise<any> => {
  try {
    const response = await apiClient.post('/calls/initiate', payload);
    return response.data;
  } catch {
    return { success: false };
  }
};

export const fetchNotifications = async (): Promise<NotificationRecord[]> => {
  try {
    const response = await apiClient.get('/notifications');
    return response.data.notifications;
  } catch {
    return [];
  }
};

export const sendNotification = async (payload: SendNotificationPayload): Promise<any> => {
  try {
    const response = await apiClient.post('/notifications/send', payload);
    return response.data;
  } catch {
    return { success: false };
  }
};

export const resendNotification = async (notificationId: number): Promise<any> => {
  try {
    const response = await apiClient.post('/notifications/resend', { notificationId });
    return response.data;
  } catch {
    return { success: false };
  }
};

export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get('/messages/conversations');
    return response.data.conversations;
  } catch {
    return [];
  }
};

export const fetchMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const response = await apiClient.get(`/messages/conversations/${conversationId}`);
    return response.data.messages;
  } catch {
    return [];
  }
};

export const sendMessage = async (userId: string, text: string, senderId?: string): Promise<any> => {
  try {
    const response = await apiClient.post('/messages/send', { userId, text, senderId });
    return response.data;
  } catch {
    return { success: false };
  }
};

export const flagConversation = async (conversationId: string, isFlagged: boolean): Promise<any> => {
  try {
    const response = await apiClient.post(`/messages/conversations/${conversationId}/flag`, { isFlagged });
    return response.data;
  } catch {
    return { success: false };
  }
};

export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const response = await apiClient.get('/companies');
    return response.data.companies;
  } catch {
    return [];
  }
};

export const fetchCompanyRecruiters = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/companies/recruiters');
    return response.data.recruiters;
  } catch {
    return [];
  }
};

export const fetchCompanyJobs = async (): Promise<Job[]> => {
  try {
    const response = await apiClient.get('/companies/jobs');
    return response.data.jobs;
  } catch {
    return [];
  }
};

export const fetchCompanyReports = async (): Promise<CompanyReport[]> => {
  try {
    const response = await apiClient.get('/companies/reports');
    return response.data.reports;
  } catch {
    return [];
  }
};

export const fetchCompanyLogs = async (): Promise<CompanyLog[]> => {
  try {
    const response = await apiClient.get('/companies/logs');
    return response.data.logs;
  } catch {
    return [];
  }
};

export const fetchCompanySettings = async (): Promise<CompanySettings> => {
  try {
    const response = await apiClient.get('/companies/settings');
    return response.data.settings;
  } catch {
    return { requireVerificationDocs: false, autoFilterSpamJobs: false, allowedDomains: [], minTrustScoreToPost: 0, spamKeywords: [] };
  }
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<CompanySettings> => {
  try {
    const response = await apiClient.post('/companies/settings', settings);
    return response.data.settings;
  } catch {
    return settings;
  }
};

export const verifyCompany = async (id: string, status: any, notes: string): Promise<Company> => {
  try {
    const response = await apiClient.post(`/companies/${id}/verify`, { status, notes });
    return response.data.company;
  } catch {
    return {} as Company;
  }
};

export const suspendCompany = async (id: string, status: boolean): Promise<Company> => {
  try {
    const response = await apiClient.post(`/companies/${id}/suspend`, { status });
    return response.data.company;
  } catch {
    return {} as Company;
  }
};

export const sendRecruiterCampaign = async (payload: any): Promise<any> => {
  try {
    const response = await apiClient.post('/companies/communications/send', payload);
    return response.data;
  } catch {
    return { success: false };
  }
};

export const toggleJobFeature = async (id: string): Promise<Job> => {
  try {
    const response = await apiClient.post(`/companies/jobs/${id}/toggle-feature`);
    return response.data.job;
  } catch {
    return {} as Job;
  }
};

export const updateJobStatus = async (id: string, status: any): Promise<Job> => {
  try {
    const response = await apiClient.post(`/companies/jobs/${id}/status`, { status });
    return response.data.job;
  } catch {
    return {} as Job;
  }
};

export const resolveCompanyReport = async (id: string): Promise<CompanyReport> => {
  try {
    const response = await apiClient.post(`/companies/reports/${id}/resolve`);
    return response.data.report;
  } catch {
    return {} as CompanyReport;
  }
};

export const fetchDbSummary = async (): Promise<DbSummary> => {
  try {
    const response = await apiClient.get('/dev/db-summary');
    return response.data.summary;
  } catch {
    return {
      users: 0,
      posts: 0,
      companies: 0,
      jobs: 0,
      applications: mockApplications.length,
      reports: 0,
      conversations: 0,
      calls: 0,
      emails: 0,
      notifications: 0
    };
  }
};
