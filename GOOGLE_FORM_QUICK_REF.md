# Quick Reference: Google Form → Applications Sync

## One-Page Quick Guide

### 5-Minute Setup

```
1. Create Google Form on forms.google.com
   ↓
2. Add fields: Name, Email, Phone, Education, Skills, Portfolio, Resume, Position
   ↓
3. Share form with candidates (copy public link)
   ↓
4. Candidates fill form and submit
   ↓
5. Go to Form → Responses tab → click Google Sheets icon
   ↓
6. In Google Sheet: File → Share → Publish to web
   ↓
7. Select "Form Responses 1" sheet and "CSV" format
   ↓
8. Copy the published URL
   ↓
9. In OMAHCONNECT Dashboard: Click "Sync Form Responses"
   ↓
10. Paste URL and click "Run Sync"
   ↓
✅ Applications now appear in Applications tab!
```

## Visual Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR CANDIDATES                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │   GOOGLE FORM          │
        │  (Public Link Shared)  │
        └────────────┬───────────┘
                     │
                     ↓ (Auto-collects)
        ┌────────────────────────┐
        │  GOOGLE SHEETS         │
        │ (Form Responses 1)     │
        └────────────┬───────────┘
                     │
                     ↓ (Publish as CSV)
        ┌────────────────────────┐
        │  CSV URL               │
        │  (Publicly Available)  │
        └────────────┬───────────┘
                     │
                     ↓ (Copy URL)
┌─────────────────────────────────────────────────────────────┐
│           OMAHCONNECT ADMIN DASHBOARD                       │
│                                                             │
│  Applications → Sync Form Responses → Paste URL → Sync    │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (Parse CSV)
        ┌────────────────────────┐
        │  applications.json     │
        │  (Database)            │
        └────────────┬───────────┘
                     │
                     ↓ (Display)
        ┌────────────────────────┐
        │  Applications Tab      │
        │  ✅ Ready to review!   │
        └────────────────────────┘
```

## Supported Form Fields

| Form Field | Automatically Maps To | Required |
|------------|----------------------|----------|
| Name | Candidate Name | ✅ YES |
| Email | Candidate Email | ✅ YES |
| Phone | Phone | ❌ No |
| Education | Education Background | ❌ No |
| Skills | Skills List | ❌ No |
| Portfolio / LinkedIn | Portfolio URL | ❌ No |
| Resume | Resume File/URL | ❌ No |
| Cover Letter | Cover Letter Text | ❌ No |
| Position Interest | Job Title/Company | ❌ No |

## Example Form Response

**Google Form Response:**
```
Name: Muneeb Shoaib
Email: muneeb@example.com
Phone: +1-555-1234
Education: COMSATS
Skills: React, TypeScript
Portfolio: https://linkedin.com/in/muneeb
Resume URL: https://example.com/resume.pdf
Which internship? React Frontend Developer
Cover Letter: Excited to join your team!
```

**Creates Application:**
```
{
  id: "a_sync_abc123xyz",
  userName: "Muneeb Shoaib",
  userEmail: "muneeb@example.com",
  phone: "+1-555-1234",
  education: "COMSATS",
  skills: "React, TypeScript",
  portfolioUrl: "https://linkedin.com/in/muneeb",
  resumeUrl: "https://example.com/resume.pdf",
  jobTitle: "React Frontend Developer",
  companyName: "TalentNova",
  status: "applied",
  appliedDate: "2026-06-13",
  coverLetter: "Excited to join your team!"
}
```

## Common Issues & Fixes

### ❌ "Failed to fetch the Google Sheet CSV"
**Causes:**
- Sheet not published to web
- Wrong URL copied
- Sheet is private

**Fix:**
1. Open Google Sheet
2. File → Share → Publish to web
3. Make sure it's on "Form Responses 1" sheet
4. Copy the new URL
5. Try sync again

### ❌ "The CSV has no data rows"
**Causes:**
- No one has filled the form yet
- Form responses not in sheet

**Fix:**
1. Fill out the form yourself to test
2. Wait for people to submit
3. Verify responses show in Google Sheet

### ❌ "Could not find columns for Email or Name"
**Causes:**
- Form field names don't match expected patterns
- Column headers misspelled

**Fix:**
In Google Form, make sure to name fields:
- "Name" or "Full Name" (not "Applicant" or "First Name")
- "Email" or "Email Address" (not "contact" or "e-mail")

### ❌ Applications appear with "OMAHCONNECT Partner"
**Causes:**
- Position name doesn't match any of your internship positions

**Fix:**
1. Check your internship position titles in Jobs tab
2. In Google Form question, use exact position names
3. Or manually update the company after import

### ❌ Duplicate applications appearing
**Causes:**
- Same person submitted twice on same day
- Or system sync ran twice

**Fix:**
1. This shouldn't happen (system prevents it)
2. If it does, delete manually and check form
3. Only one submission per person per day

## How Deduplication Works

The system prevents duplicates by checking:
```
IF email matches AND date matches
  THEN skip (already have this application)
  ELSE add new application
```

This means:
- ✅ Same person can apply for different positions
- ✅ Same person can reapply on different days
- ✅ Same person submitting twice on same day = 1 application (not 2)

## Data Validation

The sync process:
- ✅ Validates email format
- ✅ Checks name is not empty
- ✅ Converts timestamps to dates
- ✅ Matches position to nearest internship job
- ✅ Generates unique IDs for each application
- ✅ Saves with "applied" status automatically

## Sync Frequency

**Recommended schedule:**
- **Real-time:** Form collecting actively → Sync every 1-2 hours
- **Daily:** Ongoing applications → Sync once per day (morning)
- **Weekly:** Slow-moving form → Sync weekly on Monday
- **As-needed:** One-time event → Sync after event ends

## Key Points

- ✅ Form responses auto-save to Google Sheets
- ✅ You publish that sheet as CSV (one-time setup)
- ✅ System fetches CSV and imports responses
- ✅ All data stored in Applications tab
- ✅ You can update status/review/reject in dashboard
- ✅ No limit on applications

## Step 1️⃣: Create Your Form

**Example Google Form Questions:**
1. What is your name? (Required, Short answer)
2. What is your email? (Required, Email)
3. Phone number (Optional, Short answer)
4. Current education/school (Optional, Short answer)
5. What are your skills? (Optional, Paragraph)
6. LinkedIn or Portfolio URL (Optional, URL)
7. Attach resume (Optional, File upload)
8. Tell us why you're interested (Optional, Paragraph)
9. Which position? (Required, Multiple choice)
   - React Frontend Developer
   - Product Manager Internship
   - ML Research Intern

## Step 2️⃣: Share the Form

1. In Google Form, click "Send" button
2. Click the link icon to copy shareable URL
3. Share with candidates via:
   - Email
   - Social media
   - Your website
   - LinkedIn

## Step 3️⃣: Sync Responses

1. Click "Sync Form Responses" in Applications tab
2. Paste CSV URL
3. Click "Run Sync"
4. Done! ✨

---

**That's it! Your form is now connected to your applications database!**
