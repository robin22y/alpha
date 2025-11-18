# Supabase Setup Guide

This guide explains how to set up Supabase for device ID tracking and subscription management in zdebt.

## Why Supabase?

Supabase stores:
- **Device IDs and Restore Codes**: For admin management and device transfers
- **PRO Subscriptions**: Centralized subscription tracking
- **Device Transfer Requests**: Track device transfers across the system

**Note**: User financial data (debts, check-ins, etc.) remains in localStorage for privacy. Only device identifiers and subscription status are stored in Supabase.

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `zdebt` (or your choice)
   - Database password: (save this securely)
   - Region: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### 2. Get API Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Set Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env.local` to git!

### 4. Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy the entire SQL file content
4. Paste into SQL Editor
5. Click "Run" (or press Ctrl+Enter)

This creates:
- `devices` table (device IDs and restore codes)
- `subscriptions` table (PRO status)
- `device_transfers` table (transfer requests)
- Indexes and RLS policies

### 5. Verify Setup

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Create a new user account in zdebt
3. Check Supabase Dashboard → Table Editor → `devices`
4. You should see a new device record

## How It Works

### Device Registration

When a user first visits zdebt:
1. Device ID and restore code are generated
2. Stored in localStorage (for offline access)
3. **Also registered in Supabase** (for admin management)

### Subscription Management

- Admin grants PRO via restore code → Updates Supabase
- Admin panel loads subscriptions from Supabase
- Falls back to localStorage if Supabase unavailable

### Privacy

- **Financial data**: Stays in localStorage only
- **Device IDs**: Stored in Supabase (anonymous)
- **Restore codes**: Stored in Supabase (for transfers)
- **No personal info**: No names, emails, or addresses

## Fallback Behavior

If Supabase is not configured or unavailable:
- ✅ App continues working with localStorage only
- ✅ All features work normally
- ⚠️ Admin panel shows only local subscriptions
- ⚠️ Device transfers work locally only

## Troubleshooting

### "Failed to register device in Supabase"

- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check browser console for detailed errors
- App continues working with localStorage fallback

### "No subscriptions found"

- Check Supabase Dashboard → Table Editor → `subscriptions`
- Verify RLS policies allow reads
- Check network tab for API errors

### Admin panel shows no PRO users

- Refresh admin panel (subscriptions load async)
- Check Supabase `subscriptions` table
- Verify `is_pro` column is `true`

## Security Notes

1. **RLS Policies**: Currently allow all operations. In production:
   - Use service role key for admin operations
   - Restrict device reads to own device
   - Add admin authentication

2. **API Keys**: 
   - `anon` key is safe for client-side (RLS protects data)
   - Never expose `service_role` key in client code

3. **Data Privacy**:
   - Device IDs are anonymous
   - Restore codes are random (562M+ combinations)
   - No personal information stored

## Next Steps

- [ ] Set up production Supabase project
- [ ] Configure stricter RLS policies
- [ ] Add admin authentication
- [ ] Set up monitoring/alerts
- [ ] Consider encrypted cloud backup (optional PRO feature)

