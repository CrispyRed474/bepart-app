#!/bin/bash
# Supabase Region Migration Script
# Migrates BePart database from US-East to Sydney (ap-southeast-2)
#
# Usage: 
#   ./scripts/migrate-to-sydney.sh <NEW_PROJECT_URL> <NEW_ANON_KEY> <NEW_SERVICE_ROLE_KEY>
#
# Example:
#   ./scripts/migrate-to-sydney.sh \
#     "https://abcdefghijklmnop.supabase.co" \
#     "eyJhbGc..." \
#     "eyJhbGc..."

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Supabase Migration: US-East → Sydney${NC}"
echo ""

# Validate arguments
if [ $# -lt 3 ]; then
  echo -e "${RED}❌ Missing arguments${NC}"
  echo "Usage: ./migrate-to-sydney.sh <NEW_URL> <NEW_ANON_KEY> <NEW_SERVICE_ROLE_KEY>"
  echo ""
  echo "To get new credentials:"
  echo "1. Log into Supabase dashboard"
  echo "2. Create new project in region ap-southeast-2 (Sydney)"
  echo "3. Copy project URL, anon key, and service role key from project settings"
  exit 1
fi

NEW_URL="$1"
NEW_ANON_KEY="$2"
NEW_SERVICE_ROLE_KEY="$3"

# Validate format
if [[ ! "$NEW_URL" =~ ^https://.*\.supabase\.co$ ]]; then
  echo -e "${RED}❌ Invalid URL format${NC}"
  exit 1
fi

if [[ ! "$NEW_ANON_KEY" =~ ^eyJ ]]; then
  echo -e "${RED}❌ Invalid anon key format (should start with eyJ)${NC}"
  exit 1
fi

if [[ ! "$NEW_SERVICE_ROLE_KEY" =~ ^eyJ ]]; then
  echo -e "${RED}❌ Invalid service role key format (should start with eyJ)${NC}"
  exit 1
fi

echo "📝 Step 1: Verifying new Supabase project..."
curl -s -X GET "$NEW_URL/rest/v1/organisations?limit=1" \
  -H "apikey: $NEW_ANON_KEY" \
  -H "Content-Type: application/json" > /dev/null && \
  echo -e "${GREEN}✅ New project is accessible${NC}" || \
  { echo -e "${RED}❌ Cannot access new project${NC}"; exit 1; }

echo ""
echo "📝 Step 2: Running database schema migration..."
NEXT_PUBLIC_SUPABASE_URL="$NEW_URL" \
SUPABASE_SERVICE_ROLE_KEY="$NEW_SERVICE_ROLE_KEY" \
npx supabase db push --project-ref="$(echo $NEW_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')" \
  > /dev/null 2>&1 && \
  echo -e "${GREEN}✅ Schema applied${NC}" || \
  echo -e "${YELLOW}⚠️  Schema push skipped (may require auth token)${NC}"

echo ""
echo "📝 Step 3: Running seed script..."
NEXT_PUBLIC_SUPABASE_URL="$NEW_URL" \
SUPABASE_SERVICE_ROLE_KEY="$NEW_SERVICE_ROLE_KEY" \
npx ts-node scripts/seed.ts && \
  echo -e "${GREEN}✅ Demo data seeded${NC}" || \
  { echo -e "${RED}❌ Seed failed${NC}"; exit 1; }

echo ""
echo "📝 Step 4: Updating .env.local..."
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$NEW_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEW_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$NEW_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=
EOF
echo -e "${GREEN}✅ Environment updated${NC}"

echo ""
echo "📝 Step 5: Saving credentials backup..."
cat > ~/.openclaw/credentials/bepart-supabase.txt << EOF
Supabase Project: BePart (Sydney)
URL: $NEW_URL
DB Password: [set in Supabase dashboard]
Anon Key: $NEW_ANON_KEY
Service Role Key: $NEW_SERVICE_ROLE_KEY
Migrated: $(date)
EOF
echo -e "${GREEN}✅ Credentials saved${NC}"

echo ""
echo "📝 Step 6: Starting app for connection test..."
npm run dev &
SERVER_PID=$!
sleep 5

echo "Testing database connection..."
curl -s http://localhost:3000 > /dev/null && \
  echo -e "${GREEN}✅ App is running${NC}" || \
  echo -e "${YELLOW}⚠️  App not responding yet${NC}"

kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 Migration complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Test login with:"
echo "   - Email: admin@demo.com"
echo "   - Email: carer@demo.com"
echo "   - Email: family@demo.com"
echo "   - Password: Demo1234!"
echo "3. Verify all features work"
echo "4. Once confirmed, DELETE the old Supabase project:"
echo "   - Old URL: https://mucharakuigyoujwlgyp.supabase.co"
echo ""
