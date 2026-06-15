# MongoDB Integration - Step by Step Guide

## CRITICAL: First Time Setup Steps

### Step 1: Create the `/models` Folder
```
Windows File Explorer:
1. Navigate to: c:\Users\munee\OneDrive\Desktop\OMEH\
2. Create new folder named: models
3. Confirmed: c:\Users\munee\OneDrive\Desktop\OMEH\models\ now exists
```

### Step 2: Move Model Files to `/models`
Move these files from root to `/models/` folder:
- Move: `Application.js` → `models/Application.js`
- Move: `Job.js` → `models/Job.js`
- Move: `Company.js` → `models/Company.js`

The final structure should be:
```
OMEH/
├── models/
│   ├── Application.js
│   ├── Job.js
│   └── Company.js
├── mongoConnection.js
├── server.js
├── package.json
└── ... (other files)
```

### Step 3: Install MongoDB Community Edition

**Windows Installation:**

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows (64-bit)
   - Click: Download

2. **Install MongoDB**
   - Run installer (MongoDBCommunityServer-x.x.x-x64-2024.msi)
   - Accept terms
   - Choose "Complete" installation
   - Install MongoDB Compass (optional but recommended)

3. **MongoDB Should Auto-Start**
   - MongoDB installs as a Windows Service
   - Should start automatically on system boot
   - Default connection: `mongodb://localhost:27017`

4. **Verify MongoDB is Running**
   - Open Command Prompt: `mongosh` or `mongo`
   - Should connect to `test` database
   - Type `exit` to quit

### Step 4: Install Mongoose Dependency

```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm install mongoose
```

This installs mongoose based on the updated package.json

### Step 5: Start Your Backend Server

```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm start
```

You should see:
```
✅ MongoDB connected successfully at mongodb://localhost:27017/omahconnect
🚀 Server running on port 5000
```

### Step 6: Migrate Existing Data

Once server is running, MongoDB automatically imports your JSON data.

---

## Backend Code Changes Required

The `server.js` file needs to be updated to use MongoDB instead of JSON files.

### Change 1: Import MongoDB connection at top of server.js

Add after line 4 (after other requires):
```javascript
const { connectToMongoDB } = require('./mongoConnection');
const Application = require('./models/Application');
const Job = require('./models/Job');
const Company = require('./models/Company');
const db = require('./db'); // Still needed for other functionality
```

### Change 2: Initialize MongoDB connection on server startup

Find this in server.js (around line 180-200):
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

Replace with:
```javascript
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Import existing data on first run
    await importExistingData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
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
      if (applications.length > 0) {
        await Application.insertMany(applications);
        console.log(`✅ Imported ${applications.length} applications`);
      }
      
      // Import jobs
      const jobs = await db.getJobs();
      if (jobs.length > 0) {
        // Add IDs if missing
        const jobsWithIds = jobs.map((job, idx) => ({
          ...job,
          _id: job.id || new mongoose.Types.ObjectId()
        }));
        await Job.insertMany(jobsWithIds);
        console.log(`✅ Imported ${jobs.length} jobs`);
      }
      
      // Import companies
      const companies = await db.getCompanies();
      if (companies.length > 0) {
        const companiesWithIds = companies.map((company, idx) => ({
          ...company,
          _id: company.id || new mongoose.Types.ObjectId()
        }));
        await Company.insertMany(companiesWithIds);
        console.log(`✅ Imported ${companies.length} companies`);
      }
    }
  } catch (error) {
    console.error('Warning: Could not import data:', error.message);
  }
}

startServer();
```

### Change 3: Update GET /api/applications endpoint

Find the existing endpoint (around line 990-1000):
```javascript
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await db.getApplications();
    return res.json({ success: true, applications });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
```

Replace with:
```javascript
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({}).sort({ appliedDate: -1 });
    
    // Convert MongoDB documents to plain objects
    const data = applications.map(app => ({
      id: app._id.toString(),
      email: app.email,
      userName: app.name,
      userEmail: app.email,
      phone: app.phone,
      education: app.education,
      skills: app.skills,
      portfolioUrl: app.portfolioUrl,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      jobId: app.jobId,
      status: app.status,
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
```

### Change 4: Update POST /api/applications/sync-sheet endpoint

Find the existing sync endpoint (around line 990-1120) and update to save to MongoDB:

Replace the part where it saves:
```javascript
// OLD: Save to JSON file
await db.saveApplications([...existingApplications, ...newApplications]);
```

With:
```javascript
// NEW: Save to MongoDB
const savedApps = [];
for (const app of newApplications) {
  try {
    const newApp = new Application({
      email: app.email,
      name: app.userName || app.name,
      phone: app.phone,
      education: app.education,
      skills: Array.isArray(app.skills) ? app.skills : (app.skills ? app.skills.split(',') : []),
      portfolioUrl: app.portfolioUrl,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      jobId: app.jobId,
      status: app.status || 'applied',
      appliedDate: app.appliedDate || new Date(),
      source: 'google-form',
      userId: 'google-form-sync'
    });
    
    const saved = await newApp.save();
    savedApps.push(saved);
  } catch (error) {
    if (error.code === 11000) {
      console.log(`⏭️ Duplicate prevented for: ${app.email}`);
    } else {
      console.error(`Error saving application for ${app.email}:`, error.message);
    }
  }
}

console.log(`💾 Saved ${savedApps.length} new applications to MongoDB`);
```

### Change 5: Update GET /api/jobs endpoint

```javascript
// OLD: File-based
app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await db.getJobs();
    return res.json({ success: true, jobs });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: MongoDB
app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });
    const data = jobs.map(job => ({
      id: job._id.toString(),
      title: job.title,
      company: job.company,
      description: job.description,
      skills: job.skills,
      active: job.active,
      createdAt: job.createdAt
    }));
    return res.json({ success: true, jobs: data });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});
```

### Change 6: Update GET /api/companies endpoint

```javascript
// OLD: File-based
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await db.getCompanies();
    return res.json({ success: true, companies });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: MongoDB
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await Company.find({ accountStatus: 'active' }).sort({ createdAt: -1 });
    const data = companies.map(company => ({
      id: company._id.toString(),
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
```

---

## Testing MongoDB Integration

### 1. Start MongoDB
```bash
# MongoDB should auto-start with Windows Service
# Verify: open Command Prompt and type: mongosh
# You should see: test>
```

### 2. Start Backend Server
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm install mongoose  # If not installed
npm start
```

Expected output:
```
✅ MongoDB connected successfully at mongodb://localhost:27017/omahconnect
📦 Importing existing data to MongoDB...
✅ Imported 9 applications
✅ Imported X jobs
✅ Imported X companies
🚀 Server running on port 5000
```

### 3. Start Frontend
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH\omahconnect-admin
npm run dev
```

### 4. Test Applications Tab
- Open: http://localhost:5173
- Go to: Applications tab (left sidebar)
- Should display: All applications from MongoDB
- Try: Sync Form Responses (will save to MongoDB)

### 5. Verify Data Persistence
```bash
# In Command Prompt:
mongosh

# Then in MongoDB shell:
use omahconnect
db.applications.find()
db.applications.countDocuments()
```

---

## MongoDB Troubleshooting

### Error: "connect ECONNREFUSED"
**Cause**: MongoDB not running
**Fix**:
1. Check if MongoDB Service is running (Services.msc)
2. Start MongoDB: `net start "MongoDB"`
3. Or restart computer to auto-start service

### Error: "Cannot find module 'mongoose'"
**Cause**: Mongoose not installed
**Fix**:
```bash
npm install mongoose
```

### Error: "E11000 duplicate key error"
**Cause**: Same email applied twice in same day
**Fix**: This is intentional - prevents duplicate applications. The system will skip duplicate and log it.

### MongoDB Connection Hanging
**Fix**:
1. Stop server: Ctrl+C
2. Restart MongoDB: `net start "MongoDB"`
3. Clear MongoDB: Open mongosh and run: `db.applications.deleteMany({})`
4. Restart server: `npm start`

---

## FAQ

**Q: Do I need to install MongoDB if I want to use the app?**
A: Yes. MongoDB must be running locally for the application to save data. Without it, applications won't persist.

**Q: Will my existing data be lost?**
A: No. Your JSON files will be automatically imported to MongoDB on first run.

**Q: Can I switch back to JSON files?**
A: Yes, but you'd need to revert the server.js changes and export MongoDB data.

**Q: How do I access MongoDB data?**
A: Use `mongosh` command line or MongoDB Compass GUI (installed with MongoDB).

**Q: What if Google Form sync fails?**
A: The error will be logged in the console with details about what went wrong.

---

## Summary

✅ Install MongoDB Community Edition  
✅ Create models/ folder and move files  
✅ Run: `npm install mongoose`  
✅ Update server.js with MongoDB code  
✅ Run: `npm start`  
✅ Access http://localhost:5173  
✅ Go to Applications tab - see MongoDB data!
