const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');
const EMAILS_FILE = path.join(__dirname, 'data', 'emails.json');
const CALLS_FILE = path.join(__dirname, 'data', 'calls.json');
const NOTIFICATIONS_FILE = path.join(__dirname, 'data', 'notifications.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');
const COMPANIES_FILE = path.join(__dirname, 'data', 'companies.json');
const JOBS_FILE = path.join(__dirname, 'data', 'jobs.json');
const REPORTS_FILE = path.join(__dirname, 'data', 'company_reports.json');
const LOGS_FILE = path.join(__dirname, 'data', 'company_logs.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'company_settings.json');
const APPLICATIONS_FILE = path.join(__dirname, 'data', 'applications.json');

// Read current database state
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading local JSON database:', error);
    return { users: [], posts: [] };
  }
}

// Write to database
async function writeDB(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('⚠️ Error writing to local JSON database:', error);
  }
}

// Get user by ID
async function getUserById(id) {
  const db = await readDB();
  return db.users.find(u => u.id === id) || null;
}

// Get user by Email
async function getUserByEmail(email) {
  const db = await readDB();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Create User
async function createUser(user) {
  const db = await readDB();
  const newUser = {
    id: 'u' + (db.users.length + 1),
    avatar: null,
    coverPage: null,
    gender: 'Other',
    country: 'United States',
    city: 'San Francisco',
    profession: 'Developer',
    isStudent: false,
    isVerified: false,
    joinedDate: new Date().toISOString().split('T')[0],
    trustScore: 80,
    status: 'Active',
    plan: 'Starter',
    badge: 'New User',
    bio: '',
    phone: '+1 (555) 019-' + (1000 + db.users.length).toString().substring(1),
    emergencyPhone: '+1 (555) 911-' + (2000 + db.users.length).toString().substring(1),
    notificationPermissions: { push: true, email: true, inApp: true },
    ...user
  };
  db.users.push(newUser);
  await writeDB(db);
  return newUser;
}

// Get all users
async function getUsers() {
  const db = await readDB();
  return db.users;
}

// Update notification permissions for user
async function updateNotificationPermissions(userId, permissions) {
  const db = await readDB();
  const index = db.users.findIndex(u => u.id === userId);
  if (index !== -1) {
    db.users[index].notificationPermissions = {
      ...db.users[index].notificationPermissions,
      ...permissions
    };
    await writeDB(db);
    return db.users[index];
  }
  return null;
}

// Get all posts, joined with their author details, sorted by created_at DESC
async function getPosts() {
  const db = await readDB();
  const users = db.users;
  
  return db.posts
    .map(post => {
      const author = users.find(u => u.id === post.userId) || {};
      return {
        id: post.id,
        userId: post.userId,
        title: post.title,
        description: post.description,
        attachments: post.attachments || [],
        postType: post.postType,
        visibility: post.visibility,
        created_at: post.created_at,
        author_name: author.name || 'Unknown User',
        author_role: author.role || 'User',
        author_avatar: author.avatar || null
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Get sent emails
async function getEmails() {
  try {
    const data = await fs.readFile(EMAILS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading emails database:', error);
    return [];
  }
}

// Save sent email record
async function saveEmail(emailRecord) {
  try {
    const emails = await getEmails();
    const newRecord = {
      id: emails.length + 1,
      sentAt: new Date().toISOString(),
      status: 'Sent',
      ...emailRecord
    };
    emails.push(newRecord);
    await fs.writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2), 'utf8');
    return newRecord;
  } catch (error) {
    console.error('⚠️ Error saving email:', error);
    return null;
  }
}

/* =========================
   CALL CENTER
========================= */

// Get Call logs
async function getCalls() {
  try {
    const data = await fs.readFile(CALLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading calls database:', error);
    return [];
  }
}

// Save Call log
async function saveCall(callRecord) {
  try {
    const calls = await getCalls();
    const newRecord = {
      id: calls.length + 1,
      timestamp: new Date().toISOString(),
      ...callRecord
    };
    calls.push(newRecord);
    await fs.writeFile(CALLS_FILE, JSON.stringify(calls, null, 2), 'utf8');
    return newRecord;
  } catch (error) {
    console.error('⚠️ Error saving call:', error);
    return null;
  }
}

/* =========================
   NOTIFICATION HUB
========================= */

// Get Notifications log
async function getNotifications() {
  try {
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading notifications database:', error);
    return [];
  }
}

// Save Notification log
async function saveNotification(notificationRecord) {
  try {
    const notifications = await getNotifications();
    const newRecord = {
      id: notifications.length + 1,
      sentAt: new Date().toISOString(),
      status: 'Sent',
      ...notificationRecord
    };
    notifications.push(newRecord);
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf8');
    return newRecord;
  } catch (error) {
    console.error('⚠️ Error saving notification:', error);
    return null;
  }
}

/* =========================
   MESSAGE CENTER / CHAT
========================= */

// Get all conversations list
async function getConversations() {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading messages database:', error);
    return [];
  }
}

// Get messages in a single conversation
async function getMessagesByConversationId(id) {
  const conversations = await getConversations();
  const conv = conversations.find(c => c.id === id);
  return conv ? conv.messages : [];
}

// Save message to conversation (create conversation if doesn't exist)
async function saveMessage(userId, messageRecord) {
  try {
    const conversations = await getConversations();
    let conv = conversations.find(c => c.userId === userId);
    
    if (!conv) {
      const users = await getUsers();
      const targetUser = users.find(u => u.id === userId);
      
      conv = {
        id: 'c' + (conversations.length + 1),
        userId,
        userName: targetUser ? targetUser.name : 'Unknown User',
        userAvatar: targetUser ? targetUser.avatar : null,
        isFlagged: false,
        messages: []
      };
      conversations.push(conv);
    }

    const newMessage = {
      id: conv.messages.length + 1,
      timestamp: new Date().toISOString(),
      isSpam: false,
      moderated: false,
      ...messageRecord
    };

    conv.messages.push(newMessage);
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(conversations, null, 2), 'utf8');
    return { conversation: conv, message: newMessage };
  } catch (error) {
    console.error('⚠️ Error saving chat message:', error);
    return null;
  }
}

// Flag or unflag a conversation
async function flagConversation(id, isFlagged) {
  try {
    const conversations = await getConversations();
    const index = conversations.findIndex(c => c.id === id);
    if (index !== -1) {
      conversations[index].isFlagged = isFlagged;
      await fs.writeFile(MESSAGES_FILE, JSON.stringify(conversations, null, 2), 'utf8');
      return conversations[index];
    }
    return null;
  } catch (error) {
    console.error('⚠️ Error flagging conversation:', error);
    return null;
  }
}

/* =========================
   COMPANY MODULE
========================= */

// Get all companies
async function getCompanies() {
  try {
    const data = await fs.readFile(COMPANIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading companies database:', error);
    return [];
  }
}

// Save all companies
async function saveCompanies(companies) {
  try {
    await fs.writeFile(COMPANIES_FILE, JSON.stringify(companies, null, 2), 'utf8');
  } catch (error) {
    console.error('⚠️ Error writing companies database:', error);
  }
}

// Get all jobs
async function getJobs() {
  try {
    const data = await fs.readFile(JOBS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading jobs database:', error);
    return [];
  }
}

// Save all jobs
async function saveJobs(jobs) {
  try {
    await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf8');
  } catch (error) {
    console.error('⚠️ Error writing jobs database:', error);
  }
}

// Get company reports
async function getCompanyReports() {
  try {
    const data = await fs.readFile(REPORTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading reports database:', error);
    return [];
  }
}

// Save company reports
async function saveCompanyReports(reports) {
  try {
    await fs.writeFile(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf8');
  } catch (error) {
    console.error('⚠️ Error writing reports database:', error);
  }
}

// Get company logs
async function getCompanyLogs() {
  try {
    const data = await fs.readFile(LOGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading logs database:', error);
    return [];
  }
}

// Save company log
async function saveCompanyLog(logRecord) {
  try {
    const logs = await getCompanyLogs();
    const newRecord = {
      id: 'log' + (logs.length + 1),
      timestamp: new Date().toISOString(),
      ...logRecord
    };
    logs.push(newRecord);
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
    return newRecord;
  } catch (error) {
    console.error('⚠️ Error saving company log:', error);
    return null;
  }
}

// Get settings
async function getCompanySettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading settings database:', error);
    return {};
  }
}

// Save settings
async function saveCompanySettings(settings) {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    console.error('⚠️ Error writing settings database:', error);
  }
}

// Suspend Company Cascade
async function suspendCompanyCascade(companyId, suspendStatus) {
  // Read and update company status
  const companies = await getCompanies();
  const compIdx = companies.findIndex(c => c.id === companyId);
  if (compIdx === -1) return null;

  const company = companies[compIdx];
  company.accountStatus = suspendStatus ? 'suspended' : 'active';
  await saveCompanies(companies);

  // Cascade to jobs
  const jobs = await getJobs();
  let jobsUpdated = false;
  jobs.forEach(j => {
    if (j.companyId === companyId) {
      j.status = suspendStatus ? 'expired' : 'active';
      jobsUpdated = true;
    }
  });
  if (jobsUpdated) {
    await saveJobs(jobs);
  }

  // Cascade to users (Recruiters & Employers belonging to this company)
  const dbData = await readDB();
  let usersUpdated = false;
  dbData.users.forEach(u => {
    if (u.company && u.company.toLowerCase() === company.name.toLowerCase()) {
      u.status = suspendStatus ? 'Suspended' : 'Active';
      usersUpdated = true;
    }
  });
  if (usersUpdated) {
    await writeDB(dbData);
  }

  return company;
}

// Get all applications
async function getApplications() {
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading applications database:', error);
    return [];
  }
}

// Save all applications
async function saveApplications(apps) {
  try {
    await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf8');
  } catch (error) {
    console.error('⚠️ Error writing applications database:', error);
  }
}

// Get Database Collections Summary Counts
async function getDbSummary() {
  const summary = {};
  try {
    const dbData = await readDB();
    summary.users = dbData.users ? dbData.users.length : 0;
    summary.posts = dbData.posts ? dbData.posts.length : 0;

    const companies = await getCompanies();
    summary.companies = companies.length;

    const jobs = await getJobs();
    summary.jobs = jobs.length;

    const applications = await getApplications();
    summary.applications = applications.length;

    const reports = await getCompanyReports();
    summary.reports = reports.length;

    const conversations = await getConversations();
    summary.conversations = conversations.length;

    const calls = await getCalls();
    summary.calls = calls.length;

    const emails = await getEmails();
    summary.emails = emails.length;

    const notifications = await getNotifications();
    summary.notifications = notifications.length;
  } catch (error) {
    console.error('⚠️ Error getting DB summary:', error);
  }
  return summary;
}

module.exports = {
  getUserById,
  getUserByEmail,
  createUser,
  getUsers,
  updateNotificationPermissions,
  getPosts,
  getEmails,
  saveEmail,
  getCalls,
  saveCall,
  getNotifications,
  saveNotification,
  getConversations,
  getMessagesByConversationId,
  saveMessage,
  flagConversation,
  getCompanies,
  saveCompanies,
  getJobs,
  saveJobs,
  getCompanyReports,
  saveCompanyReports,
  getCompanyLogs,
  saveCompanyLog,
  getCompanySettings,
  saveCompanySettings,
  suspendCompanyCascade,
  getApplications,
  saveApplications,
  getDbSummary
};
