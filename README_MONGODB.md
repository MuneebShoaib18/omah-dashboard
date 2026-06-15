# MongoDB Integration - Complete Implementation Guide

## 📋 What You're Getting

A complete MongoDB integration for your OMAHCONNECT project:
- ✅ Replace JSON file storage with MongoDB database
- ✅ Automatic Google Form data sync to MongoDB
- ✅ All data displays in Applications tab
- ✅ Automatic import of existing data
- ✅ Data persistence across server restarts

---

## 🚀 Quick Start (5 Minutes)

### 1. Install MongoDB
```
Download: https://www.mongodb.com/try/download/community
Platform: Windows 64-bit
Edition: Community Edition
Installation: Complete (auto-starts as service)
```

### 2. Create Models Directory
```
Location: c:\Users\munee\OneDrive\Desktop\OMEH\
Create folder: models
Move files INTO models/:
  - Application.js
  - Job.js
  - Company.js
```

### 3. Install Mongoose Dependency
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm install mongoose
```

### 4. Update server.js
Copy content from `COMPLETE_SERVER_JS.md` and replace entire server.js file

### 5. Start Server
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm start
```

Expected output:
```
🔗 Connecting to MongoDB...
✅ MongoDB connected successfully at mongodb://localhost:27017/omahconnect
📦 Importing existing data to MongoDB...
✅ Imported X applications
✅ Imported X jobs
✅ Imported X companies
🚀 Server running on port 5000
```

### 6. Test in Browser
- Open: http://localhost:5173
- Go to: Applications tab
- Should see: All applications from MongoDB!

---

## 📁 Files Provided

### Documentation (Read in Order)
1. **README_MONGODB.md** (this file) - Overview
2. **MONGODB_CHECKLIST.md** - Step-by-step checklist
3. **MONGODB_INTEGRATION_GUIDE.md** - Detailed guide
4. **SERVER_UPDATES.md** - Code snippets
5. **COMPLETE_SERVER_JS.md** - Full server.js code

### Code Files (Ready to Use)
- **mongoConnection.js** - MongoDB connection setup
- **Application.js** - Application model (move to models/)
- **Job.js** - Job model (move to models/)
- **Company.js** - Company model (move to models/)

### Configuration
- **package.json** - Already updated with mongoose

---

## 🔧 Installation Steps

### Step 1: Install MongoDB Community Edition
1. Go to: https://www.mongodb.com/try/download/community
2. Select: Windows (64-bit)
3. Download and run installer
4. Choose: Complete Installation
5. MongoDB auto-starts as Windows Service

### Step 2: Create Folder Structure
```
c:\Users\munee\OneDrive\Desktop\OMEH\models\
  ├── Application.js (move from root)
  ├── Job.js (move from root)
  └── Company.js (move from root)
```

### Step 3: Install Dependencies
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm install mongoose
```

### Step 4: Update server.js
1. Open: `COMPLETE_SERVER_JS.md`
2. Copy ALL content
3. Open: `server.js`
4. Select All (Ctrl+A)
5. Delete All
6. Paste new code
7. Save (Ctrl+S)

### Step 5: Start MongoDB
MongoDB auto-starts, but verify:
```bash
mongosh
# Should connect to test database
exit
```

### Step 6: Start Backend
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm start
```

### Step 7: Start Frontend
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH\omahconnect-admin
npm run dev
```

### Step 8: Test
Open: http://localhost:5173

---

## ✨ What Happens After Setup

### Automatic Data Import
- **First Run**: All existing JSON data imported to MongoDB
- **Files Imported**: applications.json, jobs.json, companies.json
- **Existing Data**: Preserved in MongoDB

### Google Form Sync
- **Behavior**: Form responses save to MongoDB
- **Deduplication**: Same email + date = prevents duplicates
- **Display**: All data shows in Applications tab

### Data Persistence
- **Before**: Data lost when server restarted
- **After**: Data persists permanently in MongoDB
- **Restart Safe**: Can restart server without data loss

---

## 🗂️ File Structure After Setup

```
OMEH/
├── models/
│   ├── Application.js       ✅ (moved from root)
│   ├── Job.js               ✅ (moved from root)
│   └── Company.js           ✅ (moved from root)
│
├── mongoConnection.js        ✅ (connection setup)
├── server.js                ✅ (UPDATED - with MongoDB code)
├── package.json             ✅ (UPDATED - with mongoose)
│
├── data/                    (old JSON files - no longer used)
│   ├── applications.json
│   ├── jobs.json
│   └── companies.json
│
└── ... (other files unchanged)
```

---

## 📊 MongoDB Database Schema

### Applications Collection
```
{
  _id: ObjectId,
  email: String (unique per date),
  name: String,
  phone: String,
  education: String,
  skills: [String],
  portfolioUrl: String,
  resumeUrl: String,
  coverLetter: String,
  jobTitle: String,
  companyName: String,
  jobId: String,
  status: String (applied|reviewed|interview|rejected|hired),
  appliedDate: Date,
  source: String (google-form|manual|csv|api),
  userId: String,
  syncIdentifier: String (prevents duplicates),
  createdAt: Date,
  updatedAt: Date
}
```

### Jobs Collection
```
{
  _id: ObjectId,
  title: String,
  company: String,
  description: String,
  skills: [String],
  active: Boolean,
  status: String (active|expired|closed),
  createdAt: Date,
  updatedAt: Date
}
```

### Companies Collection
```
{
  _id: ObjectId,
  name: String (unique),
  industry: String,
  location: String,
  website: String,
  accountStatus: String (active|suspended|closed),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔍 Verify MongoDB Installation

### Check MongoDB Running
```bash
mongosh
# Should show: test>
exit
```

### View Database
```bash
mongosh
use omahconnect
db.applications.find()
db.applications.countDocuments()
exit
```

### Check All Collections
```bash
mongosh
use omahconnect
db.getCollectionNames()
```

---

## ❌ Troubleshooting

### Error: "connect ECONNREFUSED"
**Cause**: MongoDB not running  
**Fix**: 
1. Open Services (services.msc)
2. Find "MongoDB"
3. Right-click → Start
4. Restart backend

### Error: "Cannot find module 'mongoose'"
**Cause**: Not installed  
**Fix**:
```bash
npm install mongoose
```

### Error: "connect ENOTFOUND"
**Cause**: MongoDB service stopped  
**Fix**:
```bash
net start "MongoDB"
```

### Applications Not Showing
**Cause**: Connection or migration failed  
**Fix**:
1. Check console for errors
2. Verify MongoDB running: `mongosh`
3. Check imports: `db.applications.countDocuments()`
4. Restart backend: `npm start`

### Duplicate Prevention Not Working
**Cause**: Different dates  
**Fix**: System prevents duplicates only on same calendar date. Different dates = allowed.

---

## 📞 Support Resources

- **MongoDB Docs**: https://docs.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/
- **MongoDB Community**: https://community.mongodb.com/

---

## ✅ Verification Checklist

After setup, verify:
- [ ] MongoDB installed and running
- [ ] models/ folder created
- [ ] Model files moved to models/
- [ ] mongoose installed (npm install mongoose)
- [ ] server.js updated with MongoDB code
- [ ] Backend starts without errors
- [ ] Applications page loads
- [ ] Data shows in MongoDB (mongosh)
- [ ] Google Form sync works
- [ ] Data persists after restart

---

## 🎯 You're Done!

Once completed:
1. ✅ MongoDB stores all data
2. ✅ Google Forms sync automatically
3. ✅ Applications display in dashboard
4. ✅ Data persists permanently
5. ✅ Ready for production

---

## Next Steps

1. Read **MONGODB_CHECKLIST.md** for step-by-step guide
2. Follow **MONGODB_INTEGRATION_GUIDE.md** for detailed instructions
3. Copy **COMPLETE_SERVER_JS.md** into server.js
4. Start MongoDB, start backend, start frontend
5. Test everything!

**Questions?** Check the documents or MongoDB documentation.
