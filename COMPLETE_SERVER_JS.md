# Complete Updated server.js - Ready to Use

This file contains the COMPLETE updated server.js with MongoDB integration.

**How to use:**
1. Copy the entire content below
2. Open: c:\Users\munee\OneDrive\Desktop\OMEH\server.js
3. Select all (Ctrl+A)
4. Delete all
5. Paste the code below
6. Save (Ctrl+S)

---

```javascript
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const db = require('./db');

// MongoDB Integration
const { connectToMongoDB, mongoose } = require('./mongoConnection');
const Application = require('./models/Application');
const Job = require('./models/Job');
const Company = require('./models/Company');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Adjust to Vite dev server port
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
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
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

// Current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  try {
    res.clearCookie('auth_token');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error during logout' });
  }
});

/* =========================
   EMAILS / CONTACT MODULE
========================= */

// Get all sent emails
app.get('/api/emails', authenticateToken, async (req, res) => {
  try {
    const emails = await db.getEmails();
    return res.json({ success: true, emails });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Send email (mock)
app.post('/api/emails/send', authenticateToken, async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, error: 'To, Subject, and Body are required' });
    }

    const emailRecord = await db.saveEmail({
      to,
      subject,
      body
    });

    return res.json({ success: true, email: emailRecord });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   CALL CENTER MODULE
========================= */

// Get all call logs
app.get('/api/calls', authenticateToken, async (req, res) => {
  try {
    const calls = await db.getCalls();
    return res.json({ success: true, calls });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Log a call
app.post('/api/calls/log', authenticateToken, async (req, res) => {
  try {
    const { candidateName, candidatePhone, duration, outcome } = req.body;

    if (!candidateName || !candidatePhone) {
      return res.status(400).json({ success: false, error: 'Candidate name and phone are required' });
    }

    const callRecord = await db.saveCall({
      candidateName,
      candidatePhone,
      duration: duration || '0:00',
      outcome: outcome || 'completed'
    });

    return res.json({ success: true, call: callRecord });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   NOTIFICATIONS MODULE
========================= */

// Get all notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.getNotifications();
    return res.json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Send notification
app.post('/api/notifications/send', authenticateToken, async (req, res) => {
  try {
    const { recipientId, title, message } = req.body;

    if (!recipientId || !title || !message) {
      return res.status(400).json({ success: false, error: 'Recipient, Title, and Message are required' });
    }

    const notificationRecord = await db.saveNotification({
      recipientId,
      title,
      message
    });

    return res.json({ success: true, notification: notificationRecord });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   MESSAGING / CHAT
========================= */

// Get conversations
app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await db.getConversations();
    return res.json({ success: true, conversations });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single conversation
app.get('/api/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await db.getMessagesByConversationId(id);
    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Send message
app.post('/api/conversations/:userId/message', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { text, attachments } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const result = await db.saveMessage(userId, {
      text,
      attachments: attachments || [],
      sender: req.user.id
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Flag conversation
app.patch('/api/conversations/:id/flag', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFlagged } = req.body;

    const conversation = await db.flagConversation(id, isFlagged);
    return res.json({ success: true, conversation });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   COMPANY MODULE
========================= */

// Get all companies
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await Company.find({ accountStatus: 'active' }).sort({ createdAt: -1 });
    const data = companies.map(company => ({
      id: company._id ? company._id.toString() : company.id,
      name: company.name,
      industry: company.industry,
      location: company.location,
      website: company.website,
      createdAt: company.createdAt
    }));
    return res.json({ success: true, companies: data });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single company
app.get('/api/companies/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    return res.json({ success: true, company });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create company
app.post('/api/companies', authenticateToken, async (req, res) => {
  try {
    const { name, industry, location, website } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Company name is required' });
    }

    const newCompany = new Company({
      name,
      industry: industry || '',
      location: location || '',
      website: website || '',
      accountStatus: 'active'
    });

    const saved = await newCompany.save();
    return res.status(201).json({ success: true, company: saved });
  } catch (error) {
    console.error('Error creating company:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Suspend company
app.patch('/api/companies/:id/suspend', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { suspend } = req.body;

    const company = await Company.findByIdAndUpdate(
      id,
      { accountStatus: suspend ? 'suspended' : 'active' },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    return res.json({ success: true, company });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   JOBS MODULE
========================= */

// Get all jobs
app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ status: { $ne: 'expired' } }).sort({ createdAt: -1 });
    const data = jobs.map(job => ({
      id: job._id ? job._id.toString() : job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      skills: job.skills || [],
      active: job.active,
      status: job.status,
      createdAt: job.createdAt
    }));
    return res.json({ success: true, jobs: data });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single job
app.get('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    return res.json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create job
app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const { title, company, description, skills } = req.body;

    if (!title || !company) {
      return res.status(400).json({ success: false, error: 'Title and company are required' });
    }

    const newJob = new Job({
      title,
      company,
      description: description || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',') : []),
      active: true,
      status: 'active'
    });

    const saved = await newJob.save();
    return res.status(201).json({ success: true, job: saved });
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update job
app.patch('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findByIdAndUpdate(id, updates, { new: true });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    return res.json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   APPLICATIONS MODULE
========================= */

// Get all applications (MongoDB)
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({}).sort({ appliedDate: -1 });
    
    // Convert MongoDB documents to API format
    const data = applications.map(app => ({
      id: app._id ? app._id.toString() : `a_${Date.now()}`,
      email: app.email,
      userName: app.name,
      userEmail: app.email,
      phone: app.phone || '',
      education: app.education || '',
      skills: app.skills || [],
      portfolioUrl: app.portfolioUrl || '',
      resumeUrl: app.resumeUrl || '',
      coverLetter: app.coverLetter || '',
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      jobId: app.jobId || '',
      status: app.status || 'applied',
      appliedDate: app.appliedDate,
      userId: app.userId,
      source: app.source,
      createdAt: app.createdAt
    }));
    
    return res.json({ success: true, applications: data });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single application
app.get('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const app = await Application.findById(id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    return res.json({ success: true, application: app });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update application status
app.patch('/api/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const app = await Application.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    return res.json({ success: true, application: app });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// CSV Parser function
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = [];
    let currentField = '';
    let insideQuotes = false;

    for (let char of line) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        fields.push(currentField.trim().replace(/^"|"$/g, ''));
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim().replace(/^"|"$/g, ''));

    const row = {};
    headers.forEach((header, index) => {
      row[header] = fields[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

// Google Sheet sync
app.post('/api/applications/sync-sheet', authenticateToken, async (req, res) => {
  try {
    const { sheetUrl } = req.body;

    if (!sheetUrl) {
      return res.status(400).json({ success: false, error: 'Sheet URL is required' });
    }

    const csvUrl = sheetUrl.replace('/edit', '/export?format=csv');

    console.log('📥 Fetching Google Sheet CSV from:', csvUrl);

    const axios = require('axios');
    const response = await axios.get(csvUrl, { timeout: 10000 });
    const csvContent = response.data;

    const { headers, rows } = parseCSV(csvContent);

    const columnMap = {
      email: ['email', 'mail', 'e-mail'],
      name: ['name', 'full name', 'candidate name'],
      phone: ['phone', 'contact', 'mobile'],
      education: ['education', 'school', 'university', 'college'],
      skills: ['skills', 'skill'],
      portfolioUrl: ['portfolio', 'linkedin', 'website', 'github'],
      resumeUrl: ['resume', 'cv', 'upload'],
      coverLetter: ['cover', 'letter', 'purpose', 'statement'],
      jobTitle: ['position', 'job', 'role', 'interest']
    };

    const findColumn = (columnName) => {
      const lowerName = columnName.toLowerCase().trim();
      for (const [field, keywords] of Object.entries(columnMap)) {
        if (keywords.some(k => lowerName.includes(k))) {
          return field;
        }
      }
      return null;
    };

    const columnIndices = {};
    headers.forEach((header, index) => {
      const field = findColumn(header);
      if (field) {
        columnIndices[field] = index;
      }
    });

    const newApplications = [];
    let skippedCount = 0;

    for (const row of rows) {
      const email = row[headers[columnIndices.email]] || '';
      if (!email) continue;

      const skills = (row[headers[columnIndices.skills]] || '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      const jobTitle = row[headers[columnIndices.jobTitle]] || 'Not Specified';
      const jobs = await Job.find({ title: new RegExp(jobTitle, 'i') });
      const matchedJob = jobs.length > 0 ? jobs[0] : null;

      newApplications.push({
        email: email.toLowerCase(),
        name: row[headers[columnIndices.name]] || 'N/A',
        phone: row[headers[columnIndices.phone]] || '',
        education: row[headers[columnIndices.education]] || '',
        skills,
        portfolioUrl: row[headers[columnIndices.portfolioUrl]] || '',
        resumeUrl: row[headers[columnIndices.resumeUrl]] || '',
        coverLetter: row[headers[columnIndices.coverLetter]] || '',
        jobTitle,
        companyName: matchedJob ? matchedJob.company : 'Not Matched',
        jobId: matchedJob ? matchedJob._id.toString() : ''
      });
    }

    // Save to MongoDB
    const savedApps = [];
    for (const app of newApplications) {
      try {
        const skillsArray = Array.isArray(app.skills) 
          ? app.skills 
          : (typeof app.skills === 'string' ? app.skills.split(',').map(s => s.trim()) : []);
        
        const newAppRecord = new Application({
          email: app.email || app.userEmail,
          name: app.name,
          phone: app.phone || '',
          education: app.education || '',
          skills: skillsArray,
          portfolioUrl: app.portfolioUrl || '',
          resumeUrl: app.resumeUrl || '',
          coverLetter: app.coverLetter || '',
          jobTitle: app.jobTitle,
          companyName: app.companyName,
          jobId: app.jobId || '',
          status: 'applied',
          appliedDate: new Date(),
          source: 'google-form',
          userId: 'google-form-sync'
        });
        
        const saved = await newAppRecord.save();
        savedApps.push(saved);
        console.log(`✅ Saved: ${app.email} for ${app.jobTitle}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️ Skipped duplicate: ${app.email}`);
          skippedCount++;
        } else {
          console.error(`❌ Error saving ${app.email}:`, error.message);
        }
      }
    }

    console.log(`💾 Successfully saved ${savedApps.length} applications to MongoDB`);

    const settings = await db.getCompanySettings();
    settings.googleSheetSyncUrl = sheetUrl;
    await db.saveCompanySettings(settings);

    await db.saveCompanyLog({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Synchronized Google Sheet form responses. Imported [${savedApps.length}] new applications.`,
      targetType: 'applications_sync',
      targetId: 'sync_' + Date.now(),
      targetName: 'Google Sheets Integration'
    });

    return res.json({ success: true, addedCount: savedApps.length });
  } catch (error) {
    console.error('Google Sheet sync error:', error);
    return res.status(500).json({ success: false, error: 'Server error: ' + error.message });
  }
});

// Get database stats summary
app.get('/api/dev/db-summary', authenticateToken, async (req, res) => {
  try {
    const summary = {
      applications: await Application.countDocuments(),
      jobs: await Job.countDocuments(),
      companies: await Company.countDocuments()
    };
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
    const jobs = await Job.find({ active: true, status: 'active' });
    const internships = jobs.map(j => ({
      id: j._id.toString(),
      title: j.title,
      company: j.company,
      description: j.description,
      skills: j.skills
    }));
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

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Selected internship position not found.' });
    }

    const newApplication = new Application({
      email: userEmail,
      name: userName,
      phone: phone || '',
      education: education || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',') : []),
      portfolioUrl: portfolioUrl || '',
      resumeUrl: resumeUrl || '',
      coverLetter: coverLetter || '',
      jobTitle: job.title,
      companyName: job.company,
      jobId: jobId,
      status: 'applied',
      userId: 'candidate',
      source: 'api'
    });

    const saved = await newApplication.save();

    // Log the application
    await db.saveCompanyLog({
      adminId: 'system',
      adminName: 'Public Candidate Form',
      action: `New internship application submitted by candidate [${userName}] for [${job.title}] at [${job.company}]`,
      targetType: 'application',
      targetId: saved._id.toString(),
      targetName: `${userName} - ${job.title}`
    });

    return res.json({ success: true, application: saved });
  } catch (error) {
    console.error('Submit application error:', error);
    return res.status(500).json({ success: false, error: 'Server error submitting application' });
  }
});

/* =========================
   SERVER STARTUP
========================= */

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await connectToMongoDB();
    
    // Import existing data on first run
    await importExistingData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Make sure MongoDB is running on localhost:27017');
    process.exit(1);
  }
}

// Import existing JSON data to MongoDB if first run
async function importExistingData() {
  try {
    const count = await Application.countDocuments();
    
    if (count === 0) {
      console.log('📦 Importing existing data to MongoDB...');
      
      // Import applications
      const applications = await db.getApplications();
      if (applications && applications.length > 0) {
        await Application.insertMany(applications);
        console.log(`✅ Imported ${applications.length} applications`);
      }
      
      // Import jobs
      const jobs = await db.getJobs();
      if (jobs && jobs.length > 0) {
        const jobsWithIds = jobs.map((job, idx) => ({
          title: job.title,
          company: job.company || job.companyName,
          companyId: job.companyId || job.id,
          description: job.description,
          skills: Array.isArray(job.skills) ? job.skills : (job.skills ? job.skills.split(',') : []),
          active: job.status !== 'expired' && job.status !== 'closed',
          status: job.status || 'active'
        }));
        await Job.insertMany(jobsWithIds);
        console.log(`✅ Imported ${jobs.length} jobs`);
      }
      
      // Import companies
      const companies = await db.getCompanies();
      if (companies && companies.length > 0) {
        const companiesWithIds = companies.map((company, idx) => ({
          name: company.name,
          industry: company.industry,
          location: company.location,
          website: company.website,
          accountStatus: company.accountStatus || 'active'
        }));
        await Company.insertMany(companiesWithIds);
        console.log(`✅ Imported ${companies.length} companies`);
      }
    }
  } catch (error) {
    console.error('⚠️ Warning: Could not import data:', error.message);
  }
}

startServer();
```

---

## Usage

1. Backup your current server.js (copy and rename it)
2. Replace the entire content of server.js with the code above
3. Save the file
4. Proceed with MongoDB setup steps in MONGODB_CHECKLIST.md
