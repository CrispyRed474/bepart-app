# BePart Supabase Migration: US-East → Sydney
## Complete Guide

**Status:** Ready to execute (awaiting new project credentials)

---

## Problem

The Supabase project `mucharakuigyoujwlgyp` is in the **wrong region (US-East)**. For Australian NDIS/aged care customers, it needs to be in **ap-southeast-2 (Sydney)**.

**Current state:** Database is empty (demo data only) — **now is the time to migrate**.

---

## Prerequisites

### What You'll Need

1. **Supabase Account Access**
   - Email and password for the account that owns the project
   - OR existing browser session
   - OR Supabase Management API token

2. **New Project in Sydney**
   - Log into https://supabase.com/dashboard
   - Create new project in region **ap-southeast-2 (Sydney)**
   - Copy the following from project settings:
     - Project URL (e.g., `https://abcdefghij.supabase.co`)
     - Anon (public) key
     - Service Role (secret) key

3. **Local Environment**
   - Node.js 18+ (for TypeScript seed script)
   - Python 3.6+ (for Python migration script)
   - Git/Bash (for shell script)

---

## Quick Start (5 Minutes)

### Step 1: Create New Project in Sydney
1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Select region: **ap-southeast-2 (Sydney)**
4. Create project
5. Wait for it to be ready (~2-3 min)

### Step 2: Get Credentials
In Supabase dashboard:
1. Click your new project name
2. Go to **Settings** → **API**
3. Copy these three values:
   - **Project URL**
   - **Anon Key** (under "Project API keys")
   - **Service Role** (under "Project API keys")

### Step 3: Run Migration

**Option A: Python (Recommended)**
```bash
cd /home/rich/.openclaw/workspace/careapp

python3 scripts/migrate-to-sydney.py \
  "https://your-new-project.supabase.co" \
  "eyJhbGc..." \
  "eyJhbGc..."
```

**Option B: Bash**
```bash
cd /home/rich/.openclaw/workspace/careapp

./scripts/migrate-to-sydney.sh \
  "https://your-new-project.supabase.co" \
  "eyJhbGc..." \
  "eyJhbGc..."
```

### Step 4: Apply Schema Manually
The script will prompt you. In Supabase dashboard:

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Paste contents of: `supabase/migrations/001_initial_schema.sql`
4. Click **"Run"**

**Note:** This creates all tables, RLS policies, storage buckets, and triggers.

### Step 5: Seed Demo Data
In terminal:
```bash
cd /home/rich/.openclaw/workspace/careapp

NEXT_PUBLIC_SUPABASE_URL="https://your-new-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..." \
npx ts-node scripts/seed.ts
```

### Step 6: Test the App
```bash
npm run dev
```

Then:
1. Open http://localhost:3000
2. Log in with:
   - Email: `admin@sunshinecare.com.au`
   - Password: `Demo1234!`

If login works → ✅ **Migration successful!**

### Step 7: Delete Old Project
Once confirmed working:

1. Go to Supabase dashboard
2. Find project `mucharakuigyoujwlgyp` (US-East)
3. Click **Settings** → **Delete project**
4. Type project name to confirm
5. Done!

---

## Detailed Walkthrough

### Understanding the Migration

Your Supabase project contains:

**Database (PostgreSQL):**
- 8 tables for NDIS/aged care management
- Row-level security (RLS) for data protection
- Indexes for performance
- Demo organisation, client, and user accounts

**Storage:**
- `care-photos` bucket for photos
- `avatars` bucket for profile pictures

**Auth:**
- Demo users for testing (admin, carer, family roles)

When you migrate:
1. **Old project is NOT deleted** — stays as fallback
2. **Schema** applied to new project
3. **Demo data** re-seeded in new project
4. **App config** updated to use new project
5. **Credentials** backed up

### File Structure

```
careapp/
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql      ← Run this in Supabase SQL Editor
│       └── 002_seed_demo_data.sql      ← Alternative seed (SQL only)
├── scripts/
│   ├── seed.ts                         ← Demo data creation (TypeScript)
│   ├── migrate-to-sydney.sh            ← Bash automation script
│   └── migrate-to-sydney.py            ← Python automation script
├── .env.local                          ← Will be auto-updated
├── MIGRATION_PLAN.md                   ← Detailed steps
└── MIGRATION_README.md                 ← This file
```

---

## What Each Script Does

### migrate-to-sydney.py
**Best for:** Cross-platform, minimal dependencies

**Does:**
1. Validates credentials format
2. Tests connection to new project
3. Updates `.env.local` with new credentials
4. Saves credentials to `~/.openclaw/credentials/bepart-supabase.txt`
5. Prints next steps

**Does NOT:**
- Apply schema (requires dashboard)
- Seed data (requires manual command)

### migrate-to-sydney.sh
**Best for:** Linux/Mac, automated flow

**Does:**
- Everything in Python script PLUS:
- Attempts to apply schema (if Supabase CLI available)
- Runs seed script
- Tests app connection
- Provides complete summary

**Does NOT:**
- Work on Windows (without WSL)
- Work if Supabase CLI not installed

---

## Troubleshooting

### "Cannot access new project"
**Cause:** Wrong URL or keys  
**Fix:** Copy them again from Supabase dashboard — Project Settings → API

### "Schema migration failed"
**Cause:** Missing Supabase CLI or auth issues  
**Fix:** Apply schema manually in Supabase SQL Editor (paste file contents, click Run)

### "Seed script failed"
**Cause:** Schema not applied yet  
**Fix:** Make sure you ran the SQL in Supabase SQL Editor first

### "App can't connect to database"
**Cause:** `.env.local` not updated  
**Fix:** Manually update:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### "Login doesn't work"
**Cause:** Demo users not created  
**Fix:** Run seed script manually:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..." \
npx ts-node scripts/seed.ts
```

---

## Rollback Plan

If something goes wrong:

### Option 1: Keep Using Old Project
The old project `mucharakuigyoujwlgyp` is still working:
```bash
# Edit .env.local
NEXT_PUBLIC_SUPABASE_URL=https://mucharakuigyoujwlgyp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Y2hhcmFrdWlneW91andsZ3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzUyMDgsImV4cCI6MjA5MjE1MTIwOH0.zetCKEhsC_oFtSpXLF724v2TVx8GW24PGi5ZuDWi_A4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Y2hhcmFrdWlneW91andsZ3lwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU3NTIwOCwiZXhwIjoyMDkyMTUxMjA4fQ.r_zLhI9CGiRSLI_cIPy3TLgnrJgabsdTrngYMBOeklQ
```

### Option 2: Retry on New Project
1. Delete all tables from new project (or delete and recreate project)
2. Run migration again

### Option 3: Manual Recovery
1. Get credentials from `~/.openclaw/credentials/bepart-supabase.txt`
2. Update `.env.local`
3. Test connection

---

## Demo User Accounts

After successful migration, you can log in with:

### Admin Account
- **Email:** admin@sunshinecare.com.au
- **Password:** Demo1234!
- **Role:** Full access (create orgs, manage users, manage clients)

### Carer Account
- **Email:** carer@sunshinecare.com.au
- **Password:** Demo1234!
- **Role:** Create care logs, manage tasks, view clients

### Family Account
- **Email:** family@sunshinecare.com.au
- **Password:** Demo1234!
- **Role:** View client status, see care logs

---

## Post-Migration Checklist

- [ ] New project created in ap-southeast-2 (Sydney)
- [ ] Credentials copied from Supabase dashboard
- [ ] Migration script run (Python or Bash)
- [ ] Schema applied in SQL Editor
- [ ] Demo data seeded
- [ ] `.env.local` updated
- [ ] App tested (npm run dev)
- [ ] Login works with demo accounts
- [ ] Can view clients and care logs
- [ ] Old project deleted (or archived)
- [ ] Credentials backed up at `~/.openclaw/credentials/bepart-supabase.txt`

---

## What's Next

### Before Going Live
1. **Update email domains:** Change `@sunshinecare.com.au` to your real domain
2. **Disable demo accounts:** Remove or lock demo user accounts
3. **Configure real users:** Create accounts for actual admin and carers
4. **Test all features:** Care logs, photos, permissions, etc.
5. **Set up backups:** Enable automated backups in Supabase

### Going Live
1. Deploy app to production
2. Point domain to new app URL
3. Inform users of new instance
4. Monitor for issues
5. Delete old project after 30 days (if no issues)

---

## Reference

**Old Project (Current — Do NOT Use After Migration):**
```
Project: mucharakuigyoujwlgyp
Region: US-East (WRONG)
URL: https://mucharakuigyoujwlgyp.supabase.co
Action: Delete after new project confirmed
```

**New Project (Target):**
```
Region: ap-southeast-2 (Sydney) ✅
URL: https://[YOUR_NEW_PROJECT].supabase.co
Action: This is where you're migrating
```

---

## Need Help?

1. **Migration script errors?** Check credentials format (should start with `eyJ`)
2. **Schema won't apply?** Paste directly in Supabase SQL Editor manually
3. **App won't connect?** Check `.env.local` has correct URL and keys
4. **Login failing?** Ensure seed script completed without errors

---

**Created:** 2026-04-19  
**Updated:** Ready for execution  
**Time estimate:** 20-30 minutes with credentials
