#!/bin/bash

# Job Board Database Setup Script

echo "🔧 Setting up Job Board Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL in your .env.local file"
  exit 1
fi

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "❌ Migration failed"
  exit 1
fi

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with DATABASE_URL"
echo "2. Run: npm run dev"
echo ""
