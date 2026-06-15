// ============================================================================
// ADD THIS AT THE TOP OF server.js (after line 5, after db = require('./db'))
// ============================================================================

// MongoDB Integration
const { connectToMongoDB, mongoose } = require('./mongoConnection');
const Application = require('./models/Application');
const Job = require('./models/Job');
const Company = require('./models/Company');

// ============================================================================
// REPLACE THE BOTTOM OF server.js (lines 1211-1214) WITH THIS:
// ============================================================================

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

// ============================================================================
// REPLACE THE GET /api/applications ENDPOINT (around line 990)
// Find this code and replace:
// ============================================================================

/*
OLD CODE TO FIND AND REPLACE:

app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await db.getApplications();
    return res.json({ success: true, applications });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

REPLACE WITH:
*/

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

// ============================================================================
// UPDATE /api/applications/sync-sheet ENDPOINT (around line 1000-1120)
// Find the part where it saves applications and replace:
// ============================================================================

/*
OLD CODE TO FIND AND REPLACE (inside sync-sheet endpoint):

await db.saveApplications([...existingApps, ...newApplications]);

REPLACE WITH:
*/

// NEW: Save to MongoDB
const savedApps = [];
for (const app of newApplications) {
  try {
    const skillsArray = Array.isArray(app.skills) 
      ? app.skills 
      : (typeof app.skills === 'string' ? app.skills.split(',').map(s => s.trim()) : []);
    
    const newAppRecord = new Application({
      email: app.email || app.userEmail,
      name: app.userName || app.name,
      phone: app.phone || '',
      education: app.education || '',
      skills: skillsArray,
      portfolioUrl: app.portfolioUrl || '',
      resumeUrl: app.resumeUrl || '',
      coverLetter: app.coverLetter || '',
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      jobId: app.jobId || '',
      status: app.status || 'applied',
      appliedDate: app.appliedDate || new Date(),
      source: 'google-form',
      userId: 'google-form-sync'
    });
    
    const saved = await newAppRecord.save();
    savedApps.push(saved);
    console.log(`✅ Saved: ${app.email} for ${app.jobTitle}`);
  } catch (error) {
    if (error.code === 11000) {
      console.log(`⏭️ Skipped duplicate: ${app.email} (same email + date)`);
    } else {
      console.error(`❌ Error saving ${app.email}:`, error.message);
    }
  }
}

console.log(`💾 Successfully saved ${savedApps.length} new applications to MongoDB`);

// ============================================================================
// REPLACE GET /api/jobs ENDPOINT
// ============================================================================

/*
OLD CODE:

app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await db.getJobs();
    return res.json({ success: true, jobs });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

REPLACE WITH:
*/

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

// ============================================================================
// REPLACE GET /api/companies ENDPOINT
// ============================================================================

/*
OLD CODE:

app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await db.getCompanies();
    return res.json({ success: true, companies });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

REPLACE WITH:
*/

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

// ============================================================================
// END OF REPLACEMENTS - No other changes needed!
// ============================================================================
