#!/usr/bin/env python3
"""
Supabase Region Migration Script
Migrates BePart database from US-East to Sydney (ap-southeast-2)

Usage:
    python3 migrate-to-sydney.py <NEW_URL> <NEW_ANON_KEY> <NEW_SERVICE_ROLE_KEY>

Example:
    python3 scripts/migrate-to-sydney.py \
        "https://abcdefghijklmnop.supabase.co" \
        "eyJhbGc..." \
        "eyJhbGc..."
"""

import sys
import os
import json
import time
import requests
from pathlib import Path

# Colors for output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

def log(level, msg):
    """Log message with color"""
    if level == "error":
        print(f"{Colors.RED}❌ {msg}{Colors.NC}")
    elif level == "success":
        print(f"{Colors.GREEN}✅ {msg}{Colors.NC}")
    elif level == "warning":
        print(f"{Colors.YELLOW}⚠️  {msg}{Colors.NC}")
    elif level == "info":
        print(f"{Colors.BLUE}ℹ️  {msg}{Colors.NC}")
    else:
        print(f"{Colors.YELLOW}📝 {msg}{Colors.NC}")

def validate_args(url, anon_key, service_role_key):
    """Validate arguments format"""
    if not url.startswith("https://") or not url.endswith(".supabase.co"):
        log("error", "Invalid URL format. Should be: https://xxx.supabase.co")
        return False
    
    if not anon_key.startswith("eyJ"):
        log("error", "Invalid anon key format (should start with eyJ)")
        return False
    
    if not service_role_key.startswith("eyJ"):
        log("error", "Invalid service role key format (should start with eyJ)")
        return False
    
    return True

def test_connection(url, anon_key):
    """Test connection to new project"""
    try:
        response = requests.get(
            f"{url}/rest/v1/organisations?limit=1",
            headers={
                "apikey": anon_key,
                "Content-Type": "application/json"
            },
            timeout=10
        )
        return response.status_code < 400
    except Exception as e:
        log("error", f"Connection test failed: {str(e)}")
        return False

def run_schema_migration(url, service_role_key):
    """Apply database schema to new project"""
    schema_file = Path(__file__).parent.parent / "supabase" / "migrations" / "001_initial_schema.sql"
    
    if not schema_file.exists():
        log("warning", f"Schema file not found: {schema_file}")
        return False
    
    with open(schema_file) as f:
        schema_sql = f.read()
    
    # For this we need to use the REST API to execute SQL
    # Since Supabase REST API doesn't directly support executing arbitrary SQL,
    # we would need to use the direct PostgreSQL connection
    # This is better done via the Supabase CLI or dashboard
    
    log("warning", "Schema migration requires Supabase CLI or dashboard")
    log("info", f"Schema file location: {schema_file}")
    return True

def update_env_file(url, anon_key, service_role_key):
    """Update .env.local with new credentials"""
    env_content = f"""NEXT_PUBLIC_SUPABASE_URL={url}
NEXT_PUBLIC_SUPABASE_ANON_KEY={anon_key}
SUPABASE_SERVICE_ROLE_KEY={service_role_key}
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=
"""
    
    env_file = Path(__file__).parent.parent / ".env.local"
    
    try:
        env_file.write_text(env_content)
        log("success", f"Environment file updated: {env_file}")
        return True
    except Exception as e:
        log("error", f"Failed to update .env.local: {str(e)}")
        return False

def save_credentials(url, anon_key, service_role_key):
    """Save credentials backup"""
    cred_file = Path.home() / ".openclaw" / "credentials" / "bepart-supabase.txt"
    
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    content = f"""Supabase Project: BePart (Sydney)
URL: {url}
DB Password: [set in Supabase dashboard]
Anon Key: {anon_key}
Service Role Key: {service_role_key}
Migrated: {timestamp}
Region: ap-southeast-2 (Sydney)
"""
    
    try:
        cred_file.parent.mkdir(parents=True, exist_ok=True)
        cred_file.write_text(content)
        os.chmod(cred_file, 0o600)  # Restrict permissions
        log("success", f"Credentials saved: {cred_file}")
        return True
    except Exception as e:
        log("error", f"Failed to save credentials: {str(e)}")
        return False

def main():
    """Main migration flow"""
    print(f"{Colors.YELLOW}🔄 Supabase Migration: US-East → Sydney{Colors.NC}")
    print()
    
    # Parse arguments
    if len(sys.argv) < 4:
        log("error", "Missing arguments")
        print("Usage: python3 migrate-to-sydney.py <URL> <ANON_KEY> <SERVICE_ROLE_KEY>")
        print()
        print("To get new credentials:")
        print("1. Log into Supabase dashboard")
        print("2. Create new project in region ap-southeast-2 (Sydney)")
        print("3. Copy URL, anon key, and service role key from project settings")
        sys.exit(1)
    
    new_url = sys.argv[1]
    new_anon_key = sys.argv[2]
    new_service_role_key = sys.argv[3]
    
    # Validate arguments
    if not validate_args(new_url, new_anon_key, new_service_role_key):
        sys.exit(1)
    
    print(f"Target URL: {new_url}")
    print()
    
    # Step 1: Test connection
    print("📝 Step 1: Verifying new Supabase project...")
    if test_connection(new_url, new_anon_key):
        log("success", "New project is accessible")
    else:
        log("error", "Cannot access new project - check credentials")
        sys.exit(1)
    
    print()
    
    # Step 2: Schema migration
    print("📝 Step 2: Database schema migration...")
    run_schema_migration(new_url, new_service_role_key)
    print()
    print(f"{Colors.YELLOW}⚠️  Schema must be applied manually:{Colors.NC}")
    print("   Option 1: Use Supabase CLI: supabase db push")
    print("   Option 2: Run in Supabase SQL Editor:")
    schema_file = Path(__file__).parent.parent / "supabase" / "migrations" / "001_initial_schema.sql"
    print(f"      File: {schema_file}")
    print()
    
    # Step 3: Update .env.local
    print("📝 Step 3: Updating .env.local...")
    if update_env_file(new_url, new_anon_key, new_service_role_key):
        log("success", "Environment configured")
    else:
        log("warning", "Failed to update .env.local - do this manually")
    
    print()
    
    # Step 4: Save credentials
    print("📝 Step 4: Saving credentials backup...")
    if save_credentials(new_url, new_anon_key, new_service_role_key):
        log("success", "Credentials saved")
    else:
        log("warning", "Failed to save credentials backup")
    
    print()
    print(f"{Colors.GREEN}🎉 Pre-migration setup complete!{Colors.NC}")
    print()
    print(f"{Colors.YELLOW}Manual steps still required:{Colors.NC}")
    print("1. Apply database schema:")
    print("   a) Go to Supabase dashboard")
    print("   b) Open SQL Editor")
    print("   c) Copy content from: supabase/migrations/001_initial_schema.sql")
    print("   d) Run the query")
    print()
    print("2. Seed demo data:")
    print(f"   npm install && NEXT_PUBLIC_SUPABASE_URL={new_url} SUPABASE_SERVICE_ROLE_KEY={new_service_role_key} npx ts-node scripts/seed.ts")
    print()
    print("3. Test the app:")
    print("   npm run dev")
    print("   Login with: admin@demo.com / Demo1234!")
    print()
    print("4. When fully tested, delete the old Supabase project:")
    print("   Old URL: https://mucharakuigyoujwlgyp.supabase.co")
    print()

if __name__ == "__main__":
    main()
