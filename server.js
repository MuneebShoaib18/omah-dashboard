const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('./db');
const mongoConnection = require('./mongoConnection');
const applicationStore = require('./applicationStore');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

// Helper to authenticate requests (middleware - auto-resolves admin-1 in local environment)
async function authenticateToken(req, res, next) {
  try {
    const user = await db.getUserById('admin-1');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Default admin user not found' });
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, error: 'Authentication middleware error' });
  }
}

/* =========================
   AUTHENTICATION ENDPOINTS
========================= */

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter all fields' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const newUser = await db.createUser({
      name,
      email,
      password,
      role: role || 'User'
    });

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        coverPage: newUser.coverPage
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Server error during signup' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter email and password' });
    }

    const user = await db.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        coverPage: user.coverPage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Auth Me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      avatar: req.user.avatar,
      coverPage: req.user.coverPage
    }
  });
});

/* =========================
   USER DIRECTORY ENDPOINTS
========================= */

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.getUsers();
    // Exclude passwords from response
    const cleanUsers = users.map(u => {
      const { password, ...clean } = u;
      return clean;
    });
    return res.json({ success: true, users: cleanUsers });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching users' });
  }
});

// Toggle User Notification Permissions
app.post('/api/users/:id/notifications/toggle', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { push, email, inApp } = req.body;
    
    const updatedUser = await db.updateNotificationPermissions(userId, { push, email, inApp });
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Notification permissions updated successfully',
      notificationPermissions: updatedUser.notificationPermissions
    });
  } catch (error) {
    console.error('Toggle notification permission error:', error);
    return res.status(500).json({ success: false, error: 'Server error updating permissions' });
  }
});

/* =========================
   POSTS ENDPOINTS
========================= */

app.get('/api/posts', async (_req, res) => {
  try {
    const posts = await db.getPosts();
    return res.json({ success: true, posts });
  } catch (err) {
    console.error('GET /api/posts error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   EMAIL CAMPAIGN ENDPOINTS
========================= */

// Get emails history
app.get('/api/emails', authenticateToken, async (req, res) => {
  try {
    const emails = await db.getEmails();
    return res.json({ success: true, emails });
  } catch (error) {
    console.error('Fetch emails error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching emails' });
  }
});

// Send simulated emails (Direct or Bulk)
app.post('/api/emails/send', authenticateToken, async (req, res) => {
  try {
    const { recipientType, recipientId, recipientGroup, subject, body, campaignType } = req.body;
    
    if (!recipientType || !subject || !body || !campaignType) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    const allUsers = await db.getUsers();
    let recipients = [];
    let recipientNameSummary = '';

    if (recipientType === 'direct') {
      const targetUser = allUsers.find(u => u.id === recipientId);
      if (!targetUser) {
        return res.status(404).json({ success: false, error: 'Recipient user not found' });
      }
      recipients = [targetUser];
      recipientNameSummary = `${targetUser.name} (${targetUser.email})`;
    } else {
      // Bulk emails based on group filter
      if (recipientGroup === 'all') {
        recipients = allUsers;
        recipientNameSummary = 'All Users';
      } else if (recipientGroup === 'students') {
        recipients = allUsers.filter(u => u.isStudent);
        recipientNameSummary = 'All Students';
      } else if (recipientGroup === 'professionals') {
        recipients = allUsers.filter(u => !u.isStudent && u.role === 'User');
        recipientNameSummary = 'All Professionals';
      } else if (recipientGroup === 'verified') {
        recipients = allUsers.filter(u => u.isVerified);
        recipientNameSummary = 'Verified Users';
      } else if (recipientGroup === 'unverified') {
        recipients = allUsers.filter(u => !u.isVerified);
        recipientNameSummary = 'Unverified Users';
      } else {
        return res.status(400).json({ success: false, error: 'Invalid recipient group' });
      }
    }

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'No recipients matched the criteria' });
    }

    // Save to the emails outbox log
    const emailRecord = await db.saveEmail({
      senderId: req.user.id,
      senderName: req.user.name,
      recipientType,
      recipientGroup: recipientType === 'bulk' ? recipientGroup : null,
      recipientCount: recipients.length,
      recipientSummary: recipientNameSummary,
      subject,
      body,
      campaignType
    });

    // Simulate sending in the console log
    console.log(`\n========================================`);
    console.log(`📧 SIMULATING EMAIL CAMPAIGN: [${campaignType.toUpperCase()}]`);
    console.log(`From: ${req.user.name} <${req.user.email}>`);
    console.log(`To (${recipients.length} recipients): ${recipientNameSummary}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: `Successfully simulated campaign. Sent ${recipients.length} emails.`,
      emailRecord
    });

  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ success: false, error: 'Server error during email send' });
  }
});

/* =========================
   CRM CALLING ENDPOINTS
========================= */

// Get call logs
app.get('/api/calls', authenticateToken, async (req, res) => {
  try {
    const calls = await db.getCalls();
    return res.json({ success: true, calls });
  } catch (error) {
    console.error('Fetch calls error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching call log' });
  }
});

// Initiate simulated call
app.post('/api/calls/initiate', authenticateToken, async (req, res) => {
  try {
    const { recipientId, duration, status, type } = req.body;
    if (!recipientId || !status || !type) {
      return res.status(400).json({ success: false, error: 'Missing calling parameters' });
    }

    const allUsers = await db.getUsers();
    const recipientUser = allUsers.find(u => u.id === recipientId);
    if (!recipientUser) {
      return res.status(404).json({ success: false, error: 'Recipient user not found' });
    }

    const phone = type === 'Emergency Call' 
      ? recipientUser.emergencyPhone 
      : recipientUser.phone;

    // Save Call Record
    const callRecord = await db.saveCall({
      senderId: req.user.id,
      senderName: req.user.name,
      recipientId,
      recipientName: recipientUser.name,
      recipientPhone: phone || 'No phone set',
      duration: duration || 0,
      status,
      type
    });

    console.log(`\n========================================`);
    console.log(`📞 CRM CALL DIALER INTEGRATION: [${type.toUpperCase()}]`);
    console.log(`Caller: ${req.user.name}`);
    console.log(`Recipient: ${recipientUser.name} (${phone})`);
    console.log(`Status: ${status} | Duration: ${duration}s`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: `Call successfully simulated and recorded.`,
      callRecord
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    return res.status(500).json({ success: false, error: 'Server error initiating call' });
  }
});

/* =========================
   NOTIFICATION HUB ENDPOINTS
========================= */

// Get notification history
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.getNotifications();
    return res.json({ success: true, notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching notifications' });
  }
});

// Send simulated notification
app.post('/api/notifications/send', authenticateToken, async (req, res) => {
  try {
    const { recipientType, recipientId, recipientGroup, title, message, channel } = req.body;
    
    if (!recipientType || !title || !message || !channel) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    const allUsers = await db.getUsers();
    let recipients = [];
    let recipientNameSummary = '';

    if (recipientType === 'direct') {
      const targetUser = allUsers.find(u => u.id === recipientId);
      if (!targetUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      recipients = [targetUser];
      recipientNameSummary = targetUser.name;
    } else {
      if (recipientGroup === 'all') {
        recipients = allUsers;
        recipientNameSummary = 'All Users';
      } else if (recipientGroup === 'students') {
        recipients = allUsers.filter(u => u.isStudent);
        recipientNameSummary = 'Students';
      } else if (recipientGroup === 'professionals') {
        recipients = allUsers.filter(u => !u.isStudent && u.role === 'User');
        recipientNameSummary = 'Professionals';
      } else if (recipientGroup === 'verified') {
        recipients = allUsers.filter(u => u.isVerified);
        recipientNameSummary = 'Verified Users';
      } else if (recipientGroup === 'unverified') {
        recipients = allUsers.filter(u => !u.isVerified);
        recipientNameSummary = 'Unverified Users';
      } else {
        return res.status(400).json({ success: false, error: 'Invalid group' });
      }
    }

    // Filter recipients who have active permissions for the requested channel
    const allowedRecipients = recipients.filter(r => {
      if (!r.notificationPermissions) return true;
      return r.notificationPermissions[channel] !== false;
    });

    const optOutCount = recipients.length - allowedRecipients.length;

    if (allowedRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: `All selected recipients have disabled ${channel} notifications.`
      });
    }

    // Save outbox record
    const notificationRecord = await db.saveNotification({
      senderId: req.user.id,
      senderName: req.user.name,
      recipientType,
      recipientGroup: recipientType === 'bulk' ? recipientGroup : null,
      recipientSummary: recipientNameSummary,
      recipientCount: allowedRecipients.length,
      optOutCount,
      title,
      message,
      channel,
      status: 'Sent'
    });

    console.log(`\n========================================`);
    console.log(`🔔 ALERTS DISPATCHED: [${channel.toUpperCase()} CHANNEL]`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${message}`);
    console.log(`Delivered to: ${allowedRecipients.length} users | Opt-outs skipped: ${optOutCount}`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: `Notification dispatched successfully. Sent to ${allowedRecipients.length} recipients. (${optOutCount} opt-outs skipped).`,
      notificationRecord
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return res.status(500).json({ success: false, error: 'Server error dispatching notification' });
  }
});

// Resend notification
app.post('/api/notifications/resend', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.body;
    const notifications = await db.getNotifications();
    const existing = notifications.find(n => n.id === parseInt(notificationId, 10));
    
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Original notification record not found' });
    }

    const resentRecord = await db.saveNotification({
      senderId: req.user.id,
      senderName: req.user.name,
      recipientType: existing.recipientType,
      recipientGroup: existing.recipientGroup,
      recipientSummary: existing.recipientSummary + ' (Resent)',
      recipientCount: existing.recipientCount,
      optOutCount: existing.optOutCount || 0,
      title: existing.title,
      message: existing.message,
      channel: existing.channel,
      status: 'Sent'
    });

    console.log(`\n========================================`);
    console.log(`🔔 RESENDING ALERT: [${existing.channel.toUpperCase()} CHANNEL]`);
    console.log(`Title: ${existing.title} (Resending original campaign)`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: 'Notification resent successfully.',
      notificationRecord: resentRecord
    });
  } catch (error) {
    console.error('Resend notification error:', error);
    return res.status(500).json({ success: false, error: 'Server error resending notification' });
  }
});

/* =========================
   MESSAGE CENTER / CHAT ENDPOINTS
========================= */

// Get all conversations list
app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await db.getConversations();
    return res.json({ success: true, conversations });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return res.status(500).json({ success: false, error: 'Server error loading conversations' });
  }
});

// Get messages for a single conversation
app.get('/api/messages/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const convs = await db.getConversations();
    const match = convs.find(c => c.id === req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    return res.json({ success: true, messages: match.messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return res.status(500).json({ success: false, error: 'Server error loading messages' });
  }
});

// Flag conversation
app.post('/api/messages/conversations/:id/flag', authenticateToken, async (req, res) => {
  try {
    const { isFlagged } = req.body;
    const updated = await db.flagConversation(req.params.id, isFlagged);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    return res.json({ success: true, conversation: updated });
  } catch (error) {
    console.error('Flag conversation error:', error);
    return res.status(500).json({ success: false, error: 'Server error flagging chat' });
  }
});

// Send Chat Message (Admin or Mock User) with AI/Spam moderation
app.post('/api/messages/send', authenticateToken, async (req, res) => {
  try {
    const { userId, text, senderId } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ success: false, error: 'Missing message parameters' });
    }

    const finalSenderId = senderId || req.user.id;
    const finalSenderName = finalSenderId === req.user.id ? req.user.name : 'User';

    // AI Spam Moderation Check
    const spamKeywords = ['crypto', 'scam', 'free money', 'buy tokens', 'bitcoin', 'credit card', 'scams', 'cash prize'];
    const textLower = text.toLowerCase();
    const isSpamMatch = spamKeywords.some(keyword => textLower.includes(keyword));

    // Save actual message
    const chatRecord = await db.saveMessage(userId, {
      senderId: finalSenderId,
      senderName: finalSenderName,
      text,
      isSpam: isSpamMatch,
      moderated: isSpamMatch
    });

    let autoWarningRecord = null;

    if (isSpamMatch) {
      // Auto Warning System: Automatically flag conversation and post warning bubble
      const convs = await db.getConversations();
      const match = convs.find(c => c.userId === userId);
      if (match) {
        await db.flagConversation(match.id, true);
        
        // Save System Warning bubble
        const warnResult = await db.saveMessage(userId, {
          senderId: 'system',
          senderName: 'System Moderator',
          text: '⚠️ Auto Warning: Promotional links, financial schemes, or suspicious keyword triggers are prohibited on OMAHCONNECT. Admin has been notified.',
          warningSent: true
        });
        autoWarningRecord = warnResult.message;
      }
    }

    return res.json({
      success: true,
      message: 'Message sent successfully',
      chatRecord: chatRecord.message,
      conversation: chatRecord.conversation,
      spamWarningTriggered: isSpamMatch,
      autoWarning: autoWarningRecord
    });

  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, error: 'Server error sending message' });
  }
});

/* =========================
   COMPANY MODULE ENDPOINTS
========================= */

// Get all companies
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await db.getCompanies();
    return res.json({ success: true, companies });
  } catch (error) {
    console.error('Fetch companies error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching companies' });
  }
});

// Get recruiters directory (synced with users in db.json)
app.get('/api/companies/recruiters', authenticateToken, async (req, res) => {
  try {
    const allUsers = await db.getUsers();
    const recruiters = allUsers
      .filter(u => u.role === 'Recruiter' || u.role === 'Employer')
      .map(u => {
        const { password, ...clean } = u;
        return clean;
      });
    return res.json({ success: true, recruiters });
  } catch (error) {
    console.error('Fetch recruiters error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching recruiters' });
  }
});

// Get all jobs
app.get('/api/companies/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await db.getJobs();
    return res.json({ success: true, jobs });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching jobs' });
  }
});

// Get all reports/flags
app.get('/api/companies/reports', authenticateToken, async (req, res) => {
  try {
    const reports = await db.getCompanyReports();
    return res.json({ success: true, reports });
  } catch (error) {
    console.error('Fetch company reports error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching reports' });
  }
});

// Get audit logs
app.get('/api/companies/logs', authenticateToken, async (req, res) => {
  try {
    const logs = await db.getCompanyLogs();
    return res.json({ success: true, logs });
  } catch (error) {
    console.error('Fetch company logs error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching logs' });
  }
});

// Get settings
app.get('/api/companies/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await db.getCompanySettings();
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching settings' });
  }
});

// Save settings
app.post('/api/companies/settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;
    await db.saveCompanySettings(settings);
    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: 'Updated global company policies & settings',
      targetType: 'settings',
      targetId: 'global',
      targetName: 'Company Policies'
    });
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('Save settings error:', error);
    return res.status(500).json({ success: false, error: 'Server error saving settings' });
  }
});

// Verify company
app.post('/api/companies/:id/verify', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const companies = await db.getCompanies();
    const company = companies.find(c => c.id === id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    company.verificationStatus = status;
    company.verificationNotes = notes || '';
    if (status === 'verified') {
      company.riskScore = Math.max(0, company.riskScore - 25);
      company.riskReasons = (company.riskReasons || []).filter(r => !r.includes('Verification documents pending'));
    }
    await db.saveCompanies(companies);
    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Company verification updated to [${status.toUpperCase()}]`,
      targetType: 'company',
      targetId: id,
      targetName: company.name
    });
    return res.json({ success: true, company });
  } catch (error) {
    console.error('Verify company error:', error);
    return res.status(500).json({ success: false, error: 'Server error verifying company' });
  }
});

// Suspend company (with cascades)
app.post('/api/companies/:id/suspend', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const company = await db.suspendCompanyCascade(id, status);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: status ? 'Suspended Company Profile (Cascaded to jobs & recruiters)' : 'Reactivated Company Profile',
      targetType: 'company',
      targetId: id,
      targetName: company.name
    });
    return res.json({ success: true, company });
  } catch (error) {
    console.error('Suspend company error:', error);
    return res.status(500).json({ success: false, error: 'Server error suspending company' });
  }
});

// Send email campaign to recruiters
app.post('/api/companies/communications/send', authenticateToken, async (req, res) => {
  try {
    const { recipientGroup, subject, body } = req.body;
    if (!recipientGroup || !subject || !body) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    const allUsers = await db.getUsers();
    let recruiters = allUsers.filter(u => u.role === 'Recruiter' || u.role === 'Employer');
    if (recipientGroup === 'verified') {
      const companies = await db.getCompanies();
      const verifiedCompanyNames = companies.filter(c => c.verificationStatus === 'verified').map(c => c.name.toLowerCase());
      recruiters = recruiters.filter(r => r.company && verifiedCompanyNames.includes(r.company.toLowerCase()));
    } else if (recipientGroup === 'pending') {
      const companies = await db.getCompanies();
      const pendingCompanyNames = companies.filter(c => c.verificationStatus === 'pending').map(c => c.name.toLowerCase());
      recruiters = recruiters.filter(r => r.company && pendingCompanyNames.includes(r.company.toLowerCase()));
    }

    const emailRecord = await db.saveEmail({
      senderId: req.user.id,
      senderName: req.user.name,
      recipientType: 'bulk',
      recipientGroup: 'recruiters_' + recipientGroup,
      recipientCount: recruiters.length,
      recipientSummary: `Recruiters of ${recipientGroup} companies`,
      subject,
      body,
      campaignType: 'Company Moderation Update'
    });

    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Sent recruiter email campaign: ${subject}`,
      targetType: 'communication',
      targetId: 'email_' + Date.now(),
      targetName: `Group: ${recipientGroup}`
    });

    console.log(`\n========================================`);
    console.log(`📧 RECRUITER CAMPAIGN SENT: ${subject}`);
    console.log(`Recipients matched: ${recruiters.length}`);
    console.log(`========================================\n`);

    return res.json({ success: true, emailRecord, recipientCount: recruiters.length });
  } catch (error) {
    console.error('Send recruiter email error:', error);
    return res.status(500).json({ success: false, error: 'Server error sending email campaign' });
  }
});

// Toggle Job Featured Star
app.post('/api/companies/jobs/:id/toggle-feature', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await db.getJobs();
    const job = jobs.find(j => j.id === id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    job.isFeatured = !job.isFeatured;
    await db.saveJobs(jobs);
    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: job.isFeatured ? 'Starred/Featured Job Post' : 'Unstarred Job Post',
      targetType: 'job',
      targetId: id,
      targetName: job.title
    });
    return res.json({ success: true, job });
  } catch (error) {
    console.error('Toggle feature job error:', error);
    return res.status(500).json({ success: false, error: 'Server error toggling job feature' });
  }
});

// Expire/Active job status
app.post('/api/companies/jobs/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const jobs = await db.getJobs();
    const job = jobs.find(j => j.id === id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    job.status = status;
    await db.saveJobs(jobs);
    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Job post status updated to [${status.toUpperCase()}]`,
      targetType: 'job',
      targetId: id,
      targetName: job.title
    });
    return res.json({ success: true, job });
  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({ success: false, error: 'Server error updating job status' });
  }
});

// Resolve Report ticket
app.post('/api/companies/reports/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reports = await db.getCompanyReports();
    const report = reports.find(r => r.id === id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    report.status = 'resolved';
    await db.saveCompanyReports(reports);
    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Resolved report ticket [${id}]`,
      targetType: report.targetType,
      targetId: report.targetId,
      targetName: report.targetName
    });
    return res.json({ success: true, report });
  } catch (error) {
    console.error('Resolve report error:', error);
    return res.status(500).json({ success: false, error: 'Server error resolving report' });
  }
});

/* =========================
   APPLICATION MODULE ENDPOINTS
========================= */

// Get all applications
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await applicationStore.getAllApplications();
    return res.json({ success: true, applications });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching applications' });
  }
});

// Update application status
app.post('/api/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appRecord = await applicationStore.findApplicationById(id);
    if (!appRecord) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const oldStatus = appRecord.status;
    const updated = await applicationStore.updateApplicationStatus(id, status);
    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Updated application status for [${appRecord.userName}] from [${oldStatus.toUpperCase()}] to [${status.toUpperCase()}]`,
      targetType: 'application',
      targetId: id,
      targetName: `${appRecord.userName} - ${appRecord.jobTitle}`
    });
    return res.json({ success: true, application: updated });
  } catch (error) {
    console.error('Update application status error:', error);
    return res.status(500).json({ success: false, error: 'Server error updating application status' });
  }
});

// Delete application
app.post('/api/applications/:id/delete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const appRecord = await applicationStore.deleteApplication(id);
    if (!appRecord) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Deleted application for candidate [${appRecord.userName}] for role [${appRecord.jobTitle}]`,
      targetType: 'application',
      targetId: id,
      targetName: `${appRecord.userName} - ${appRecord.jobTitle}`
    });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete application error:', error);
    return res.status(500).json({ success: false, error: 'Server error deleting application' });
  }
});

// CSV parser helper for Google Sheets
function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') { i++; }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  return lines;
}

// Sync Google Form responses from Google Sheets CSV
async function syncFormResponsesFromSheet(sheetUrl) {
  const response = await fetch(sheetUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch the Google Sheet CSV. Make sure it is published to the web as CSV.');
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    throw new Error('The CSV has no data rows.');
  }

  const headers = rows[0].map(h => h.toLowerCase().trim());

  const timestampIdx = headers.findIndex(h => h.includes('timestamp'));
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
  const nameIdx = headers.findIndex(h => h.includes('name'));
  const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('contact'));
  const educationIdx = headers.findIndex(h => h.includes('education') || h.includes('school') || h.includes('university'));
  const skillsIdx = headers.findIndex(h => h.includes('skill'));
  const portfolioIdx = headers.findIndex(h => h.includes('portfolio') || h.includes('linkedin') || h.includes('website') || h.includes('github'));
  const resumeIdx = headers.findIndex(h => h.includes('resume') || h.includes('cv') || h.includes('upload'));
  const coverLetterIdx = headers.findIndex(h => h.includes('cover') || h.includes('letter') || h.includes('purpose') || h.includes('statement'));
  const positionIdx = headers.findIndex(h => h.includes('position') || h.includes('job') || h.includes('role') || h.includes('interest'));

  if (emailIdx === -1 || nameIdx === -1) {
    throw new Error('Could not find columns for Email or Name. Check your Sheet headers.');
  }

  let addedCount = 0;
  const jobs = await db.getJobs();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row[emailIdx]) continue;

    const email = row[emailIdx].trim();
    const name = row[nameIdx].trim();
    const rawTimestamp = timestampIdx !== -1 && row[timestampIdx] ? row[timestampIdx].trim() : '';

    let appliedDate = new Date().toISOString().split('T')[0];
    if (rawTimestamp) {
      const parsedDate = new Date(rawTimestamp);
      if (!isNaN(parsedDate.getTime())) {
        appliedDate = parsedDate.toISOString().split('T')[0];
      }
    }

    const phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx].trim() : '';
    const education = educationIdx !== -1 && row[educationIdx] ? row[educationIdx].trim() : '';
    const skills = skillsIdx !== -1 && row[skillsIdx] ? row[skillsIdx].trim() : '';
    const portfolioUrl = portfolioIdx !== -1 && row[portfolioIdx] ? row[portfolioIdx].trim() : '';
    const resumeUrl = resumeIdx !== -1 && row[resumeIdx] ? row[resumeIdx].trim() : 'https://omahconnect.com/resumes/default_resume.pdf';
    const coverLetter = coverLetterIdx !== -1 && row[coverLetterIdx] ? row[coverLetterIdx].trim() : '';
    const rawPosition = positionIdx !== -1 && row[positionIdx] ? row[positionIdx].trim() : 'Internship Candidate';

    let jobId = 'j-google-form';
    let jobTitle = rawPosition;
    let companyName = 'OMAHCONNECT Partner';

    const matchedJob = jobs.find(j => j.title.toLowerCase().includes(rawPosition.toLowerCase()) || rawPosition.toLowerCase().includes(j.title.toLowerCase()));
    if (matchedJob) {
      jobId = matchedJob.id;
      jobTitle = matchedJob.title;
      companyName = matchedJob.companyName;
    }

    const created = await applicationStore.createFromSheetRow({
      email,
      name,
      phone,
      education,
      skills,
      portfolioUrl,
      resumeUrl,
      coverLetter,
      jobId,
      jobTitle,
      companyName,
      appliedDate,
    });

    if (created) addedCount++;
  }

  const settings = await db.getCompanySettings();
  settings.googleSheetSyncUrl = sheetUrl;
  await db.saveCompanySettings(settings);

  return addedCount;
}

app.post('/api/applications/sync-sheet', authenticateToken, async (req, res) => {
  try {
    const { sheetUrl } = req.body;
    if (!sheetUrl) {
      return res.status(400).json({ success: false, error: 'Google Sheet CSV URL is required.' });
    }

    const addedCount = await syncFormResponsesFromSheet(sheetUrl);

    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Synchronized Google Sheet form responses. Imported [${addedCount}] new applications.`,
      targetType: 'applications_sync',
      targetId: 'sync_' + Date.now(),
      targetName: 'Google Sheets Integration'
    });

    return res.json({ success: true, addedCount });
  } catch (error) {
    console.error('Google Sheet sync error:', error);
    return res.status(500).json({ success: false, error: 'Server error during Google Sheet synchronization: ' + error.message });
  }
});

// Get database stats summary
app.get('/api/dev/db-summary', authenticateToken, async (req, res) => {
  try {
    const summary = await db.getDbSummary();
    return res.json({ success: true, summary });
  } catch (error) {
    console.error('Fetch DB summary error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching DB summary' });
  }
});

/* =========================
   PUBLIC CANDIDATE ENDPOINTS
========================= */

// Get active internships (public)
app.get('/api/public/internships', async (req, res) => {
  try {
    const jobs = await db.getJobs();
    const internships = jobs.filter(j => j.type === 'Internship' && j.status === 'active');
    return res.json({ success: true, internships });
  } catch (error) {
    console.error('Fetch public internships error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching internships' });
  }
});

// Submit application (public)
app.post('/api/public/applications/submit', async (req, res) => {
  try {
    const { jobId, userName, userEmail, phone, education, skills, portfolioUrl, resumeUrl, coverLetter } = req.body;
    
    if (!jobId || !userName || !userEmail) {
      return res.status(400).json({ success: false, error: 'Job ID, Full Name, and Email are required fields.' });
    }

    const jobs = await db.getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Selected internship position not found.' });
    }

    const newApplication = await applicationStore.createApplication({
      name: userName,
      email: userEmail,
      phone,
      education,
      skills,
      portfolioUrl,
      resumeUrl: resumeUrl || 'https://omahconnect.com/resumes/default_resume.pdf',
      coverLetter,
      jobId,
      jobTitle: job.title,
      companyName: job.companyName,
      source: 'api',
      userId: 'candidate',
    });

    job.applicantCount = (job.applicantCount || 0) + 1;
    await db.saveJobs(jobs);

    await db.saveCompanyLog({
      adminId: 'system',
      adminName: 'Public Candidate Form',
      action: `New internship application submitted by candidate [${userName}] for [${job.title}] at [${job.companyName}]`,
      targetType: 'application',
      targetId: newApplication.id,
      targetName: `${userName} - ${job.title}`
    });

    return res.json({ success: true, application: newApplication });
  } catch (error) {
    console.error('Submit application error:', error);
    return res.status(500).json({ success: false, error: 'Server error submitting application' });
  }
});

async function startServer() {
  await applicationStore.init(mongoConnection);

  const sheetUrl = process.env.GOOGLE_FORM_SHEET_CSV_URL;
  if (sheetUrl) {
    try {
      const added = await syncFormResponsesFromSheet(sheetUrl);
      console.log(`📋 Google Form sync: imported ${added} new response(s)`);
    } catch (error) {
      console.warn('⚠️  Google Form auto-sync skipped:', error.message);
    }
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📦 Applications storage: ${applicationStore.isUsingMongo() ? 'MongoDB' : 'JSON file (data/applications.json)'}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
