# Supabase Region Migration Plan
## BePart (mucharakuigyoujwlgyp) → Sydney ap-southeast-2

**Status:** Awaiting Supabase account credentials for project creation

### Current Project
- **Project ID:** mucharakuigyoujwlgyp
- **Region:** US-East (WRONG)
- **URL:** https://mucharakuigyoujwlgyp.supabase.co
- **Database Status:** Empty (demo data only)
- **Critical:** Must migrate BEFORE customer signups

### Target Project
- **Region:** ap-southeast-2 (Sydney, Australia)
- **New URL:** https://[new-project-id].supabase.co
- **Purpose:** NDIS/aged care SaaS for Australian customers

### Migration Steps

#### Step 1: Create New Project (BLOCKED - needs credentials)
- Log into Supabase dashboard
- Create NEW project in region ap-southeast-2 (Sydney)
- Get new project URL, anon key, service role key
- **Note:** Do NOT delete old project until new one fully tested

#### Step 2: Run Schema Setup (Ready)
SQL migration file exists: `/home/rich/.openclaw/workspace/careapp/supabase/migrations/001_initial_schema.sql`

Contains:
- 8 tables (organisations, profiles, clients, care_log_entries, family_client_links, client_carers, tasks, storage buckets)
- RLS (Row Level Security) policies for all tables
- Indexes for performance
- Storage buckets: `care-photos`, `avatars`
- Helper function: `get_my_profile()`

#### Step 3: Re-seed Demo Data (Ready)
Two options:
1. **SQL approach:** Run `/home/rich/.openclaw/workspace/careapp/supabase/migrations/002_seed_demo_data.sql`
2. **TypeScript approach:** Use `/home/rich/.openclaw/workspace/careapp/scripts/seed.ts` with new credentials

Demo users to create:
- admin@demo.com / Demo1234!
- carer@demo.com / Demo1234!
- family@demo.com / Demo1234!

(Note: Current seed script uses @sunshinecare.com.au emails - will need to update for @demo.com)

#### Step 4: Update App Configuration
Files to update:
- `/home/rich/.openclaw/workspace/careapp/.env.local` — with new URL + keys
- `~/.openclaw/credentials/bepart-supabase.txt` — backup new credentials

#### Step 5: Test Connection
Run the app and verify it can:
- Connect to new database
- Authenticate with demo users
- Create/read records
- Access storage buckets

#### Step 6: Verify OLD Project Still Works
Before deleting old project, confirm:
- All data migrated successfully
- No dependency on old URLs in code
- Rollback capability (keep old project credentials saved)

### Credentials Needed
To proceed, I need:
- Supabase account email
- Supabase account password
- OR existing account token/session

**Current blockers:**
- Browser GitHub OAuth login to Supabase not completing in headless mode
- No stored Supabase Management API token found

### Files Ready for Migration
```
✅ Schema:    /home/rich/.openclaw/workspace/careapp/supabase/migrations/001_initial_schema.sql
✅ Seed SQL:  /home/rich/.openclaw/workspace/careapp/supabase/migrations/002_seed_demo_data.sql
✅ Seed TS:   /home/rich/.openclaw/workspace/careapp/scripts/seed.ts
✅ App config: /home/rich/.openclaw/workspace/careapp/.env.local (needs update)
✅ Credentials backup: ~/.openclaw/credentials/bepart-supabase.txt (needs update)
```

### Current Credentials (Old Project)
```
URL: https://mucharakuigyoujwlgyp.supabase.co
DB Password: srHFeuBx38YUZEms
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Y2hhcmFrdWlneW91andsZ3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzUyMDgsImV4cCI6MjA5MjE1MTIwOH0.zetCKEhsC_oFtSpXLF724v2TVx8GW24PGi5ZuDWi_A4
Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Y2hhcmFrdWlneW91andsZ3lwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU3NTIwOCwiZXhwIjoyMDkyMTUxMjA4fQ.r_zLhI9CGiRSLI_cIPy3TLgnrJgabsdTrngYMBOeklQ
```

### Next Actions
1. ✅ Collected all schema + seed files
2. ✅ Verified current database is accessible (empty)
3. ⏳ Awaiting: Supabase account credentials
4. ⏳ Then: Create new project in Sydney
5. ⏳ Then: Run migrations + seed
6. ⏳ Then: Test + update app
7. ⏳ Then: Decommission old project
