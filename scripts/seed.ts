/**
 * CareApp Demo Seed Script
 * Creates demo users in Supabase Auth + profiles + sample data
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ORG_ID = '00000000-0000-0000-0000-000000000001'
const CLIENT_ID = '00000000-0000-0000-0000-000000000010'

const DEMO_USERS = [
  {
    email: 'admin@sunshinecare.com.au',
    password: 'Demo1234!',
    full_name: 'Sarah Mitchell',
    role: 'admin',
    phone: '0400 000 001',
  },
  {
    email: 'carer@sunshinecare.com.au',
    password: 'Demo1234!',
    full_name: 'James Wilson',
    role: 'carer',
    phone: '0400 000 002',
  },
  {
    email: 'family@sunshinecare.com.au',
    password: 'Demo1234!',
    full_name: 'David Thompson',
    role: 'family',
    phone: '0400 000 003',
  },
]

async function seed() {
  console.log('🌱 Starting CareApp seed...')

  const profileIds: Record<string, string> = {}

  for (const user of DEMO_USERS) {
    console.log(`Creating user: ${user.email}`)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already')) {
        console.log(`  User already exists, fetching...`)
        const { data: existing } = await supabase.auth.admin.listUsers()
        const found = existing?.users?.find(u => u.email === user.email)
        if (found) {
          profileIds[user.role] = found.id
          // upsert profile
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', found.id)
            .single()
          if (existingProfile) {
            profileIds[user.role] = existingProfile.id
            console.log(`  Profile exists: ${existingProfile.id}`)
            continue
          }
        }
      } else {
        console.error(`  Error: ${authError.message}`)
        continue
      }
    } else {
      profileIds[user.role] = authData.user!.id
    }

    const userId = profileIds[user.role]

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        org_id: ORG_ID,
        phone: user.phone,
      })
      .select('id')
      .single()

    if (profileError) {
      console.error(`  Profile error: ${profileError.message}`)
    } else {
      profileIds[user.role] = profile!.id
      console.log(`  Profile created: ${profile!.id}`)
    }
  }

  // Link family member to client
  if (profileIds['family']) {
    const { error: linkError } = await supabase
      .from('family_client_links')
      .insert({
        family_user_id: profileIds['family'],
        client_id: CLIENT_ID,
        org_id: ORG_ID,
      })
      .select()

    if (linkError && !linkError.message.includes('duplicate')) {
      console.error(`Family link error: ${linkError.message}`)
    } else {
      console.log('✅ Family linked to client')
    }
  }

  // Create sample care log entries
  if (profileIds['carer']) {
    const entries = [
      {
        entry_type: 'activity',
        title: 'Morning walk in garden',
        description: 'Margaret enjoyed a 20-minute walk in the garden. She identified several plants by name and seemed happy. Good mobility today.',
        is_incident: false,
        logged_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        entry_type: 'meal',
        title: 'Breakfast completed',
        description: 'Margaret ate full breakfast — porridge with honey, toast, and orange juice. Good appetite this morning.',
        is_incident: false,
        logged_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        entry_type: 'medication',
        title: 'Morning medications administered',
        description: 'Administered blood pressure medication (Ramipril 5mg) and vitamin D supplement. No adverse reactions.',
        is_incident: false,
        logged_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        entry_type: 'incident',
        title: 'Minor fall in bathroom',
        description: 'Margaret slipped getting out of the shower but was caught by handrail. No injury. Floor was wet. Incident report filed. Family notified.',
        is_incident: true,
        severity: 'medium',
        logged_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        entry_type: 'health',
        title: 'Blood pressure check',
        description: 'BP reading: 128/82 mmHg. Slightly elevated but within acceptable range. Will monitor tomorrow.',
        is_incident: false,
        logged_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        entry_type: 'hygiene',
        title: 'Personal care completed',
        description: 'Assisted with shower, hair washing, and dressing. Margaret chose her floral dress today. Skin integrity check — no concerns noted.',
        is_incident: false,
        logged_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    for (const entry of entries) {
      const { error } = await supabase.from('care_log_entries').insert({
        ...entry,
        org_id: ORG_ID,
        client_id: CLIENT_ID,
        carer_id: profileIds['carer'],
      })

      if (error) {
        console.error(`Log entry error: ${error.message}`)
      }
    }
    console.log(`✅ Created ${entries.length} sample log entries`)
  }

  console.log('\n🎉 Seed complete!')
  console.log('\nDemo accounts:')
  console.log('  Admin:  admin@sunshinecare.com.au  / Demo1234!')
  console.log('  Carer:  carer@sunshinecare.com.au  / Demo1234!')
  console.log('  Family: family@sunshinecare.com.au / Demo1234!')
}

seed().catch(console.error)
