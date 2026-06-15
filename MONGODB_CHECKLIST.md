# MongoDB Integration - Quick Checklist

## 📋 Pre-Setup (Do These First)

### 1. Create Models Directory ✅
```
Action: Create folder "models" inside OMEH root directory
Location: c:\Users\munee\OneDrive\Desktop\OMEH\models\
Status: Create new folder in Windows Explorer
```

### 2. Move Model Files ✅
The following files are already created in root - MOVE them to the models/ folder:
```
FROM root:
- Application.js
- Job.js
- Company.js

TO models folder:
- models/Application.js
- models/Job.js
- models/Company.js
```

### 3. MongoDB Connection File ✅
```
✅ Already created: mongoConnection.js
Location: c:\Users\munee\OneDrive\Desktop\OMEH\mongoConnection.js
Status: Ready to use
```

---

## 🚀 Installation Steps

### Step 1: Install MongoDB Community Edition
```
Link: https://www.mongodb.com/try/download/community
Platform: Windows (64-bit)
Edition: Community Edition
Installation Type: Complete
Auto-start: Yes (as Windows Service)
```

### Step 2: Verify MongoDB Installed
```bash
Open Command Prompt and type:
mongosh

Expected output:
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
Using MongoDB: X.X.X
Mongosh Version: X.X.X
test>

Type: exit
```

### Step 3: Install Mongoose Dependency
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm install mongoose
```

---

## 🔧 Server Code Updates

### Step 4: Update server.js

Open file: `c:\Users\munee\OneDrive\Desktop\OMEH\server.js`

#### Location 1: Add imports at top (after line 5)
Add these lines after: `const db = require('./db');`

```javascript
// MongoDB Integration
const { connectToMongoDB, mongoose } = require('./mongoConnection');
const Application = require('./models/Application');
const Job = require('./models/Job');
const Company = require('./models/Company');
```

#### Location 2: Replace server startup (lines 1211-1214)
Find:
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

Replace with code from: `SERVER_UPDATES.md` → "REPLACE THE BOTTOM OF server.js"

#### Location 3: Replace GET /api/applications endpoint
Find the endpoint around line ~980-990 and replace with code from `SERVER_UPDATES.md`

#### Location 4: Update /api/applications/sync-sheet endpoint
Find the part around line ~1100 where it saves and replace with MongoDB save code

#### Location 5: Replace GET /api/jobs endpoint
Find and replace with MongoDB version

#### Location 6: Replace GET /api/companies endpoint
Find and replace with MongoDB version

---

## ✅ Verify Installation

### Step 5: Start MongoDB Service
```
Windows:
- MongoDB should auto-start on boot
- If not: Start Command Prompt (admin) and run:
  net start "MongoDB"

Verify:
- mongosh (should connect)
- exit
```

### Step 6: Start Backend Server
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH
npm start
```

Expected console output:
```
🔗 Connecting to MongoDB...
✅ MongoDB connected successfully at mongodb://localhost:27017/omahconnect
📦 Importing existing data to MongoDB...
✅ Imported 9 applications
✅ Imported X jobs
✅ Imported X companies
🚀 Server running on port 5000
```

### Step 7: Start Frontend
```bash
cd c:\Users\munee\OneDrive\Desktop\OMEH\omahconnect-admin
npm run dev
```

### Step 8: Test in Browser
```
1. Open: http://localhost:5173
2. Navigate to: Applications (left sidebar)
3. Should see: All applications from MongoDB
4. Try: "Sync Form Responses" button
5. Expected: New form data saves to MongoDB
```

---

## 📊 Test MongoDB Data

### View Applications
```bash
mongosh
use omahconnect
db.applications.find()
db.applications.countDocuments()
exit
```

### View Jobs
```bash
mongosh
use omahconnect
db.jobs.find()
exit
```

### View Companies
```bash
mongosh
use omahconnect
db.companies.find()
exit
```

---

## 🐛 Troubleshooting

### Problem: "connect ECONNREFUSED"
**Solution:**
1. Start MongoDB: `net start "MongoDB"`
2. Verify: `mongosh`
3. Restart server

### Problem: "Cannot find module 'mongoose'"
**Solution:**
```bash
npm install mongoose
```

### Problem: MongoDB won't start on Windows
**Solution:**
1. Open Services (services.msc)
2. Find "MongoDB"
3. Right-click → Start

### Problem: All applications not showing
**Solution:**
1. Check console for errors
2. Verify MongoDB is running: `mongosh`
3. Check data imported: `db.applications.countDocuments()`
4. Restart backend server

---

## 📝 File Checklist

### Files Already Created:
- ✅ mongoConnection.js (root)
- ✅ Application.js (root → move to models/)
- ✅ Job.js (root → move to models/)
- ✅ Company.js (root → move to models/)
- ✅ MONGODB_INTEGRATION_GUIDE.md (comprehensive guide)
- ✅ SERVER_UPDATES.md (code snippets to copy)

### Files to Update:
- 📝 server.js (add MongoDB code)
- 📝 package.json (already updated with mongoose)

### Files Created (Reference):
- 📄 MONGODB_INTEGRATION_GUIDE.md (full guide)
- 📄 SERVER_UPDATES.md (code snippets)
- 📄 MONGODB_CHECKLIST.md (this file)

---

## ✨ What Happens After Setup

1. **Data Persistence**: Applications saved to MongoDB instead of JSON
2. **Google Form Sync**: Form responses automatically save to MongoDB
3. **Dashboard Display**: All data visible in Applications tab
4. **Deduplication**: Same email + date prevents duplicates
5. **Auto-Import**: Existing JSON data migrated on first run
6. **Server Restart**: Data persists (not lost)

---

## 🎯 Next Steps

1. ✅ Create models/ directory
2. ✅ Move .js files to models/
3. ✅ Install MongoDB Community Edition
4. ✅ Run: npm install mongoose
5. ✅ Update server.js with MongoDB code
6. ✅ Start MongoDB service
7. ✅ Run: npm start
8. ✅ Test in browser
9. ✅ Sync Google Forms
10. ✅ View data in MongoDB

**Total Time: ~20 minutes**

---

## 📞 Support

If you get stuck:
1. Check MONGODB_INTEGRATION_GUIDE.md (detailed steps)
2. Check SERVER_UPDATES.md (exact code to copy)
3. Check console output for error messages
4. Verify MongoDB is running: `mongosh`
5. Check data: `db.applications.find()`
