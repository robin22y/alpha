-- Supabase Database Schema for zdebt
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Devices table: Stores device IDs and restore codes
CREATE TABLE IF NOT EXISTS devices (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  restore_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  storage_mode TEXT DEFAULT 'local' CHECK (storage_mode IN ('local', 'cloud')),
  currency TEXT DEFAULT 'USD'
);

-- Subscriptions table: Stores PRO subscription status
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  restore_code TEXT NOT NULL,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_since TIMESTAMPTZ,
  pro_expires_at TIMESTAMPTZ,
  last_device_change TIMESTAMPTZ,
  device_transfer_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device transfers table: Tracks device transfer requests
CREATE TABLE IF NOT EXISTS device_transfers (
  id BIGSERIAL PRIMARY KEY,
  restore_code TEXT NOT NULL,
  old_device_id TEXT NOT NULL,
  new_device_id TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  rejection_reason TEXT
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_transfers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert devices (for registration)
CREATE POLICY "Allow device registration"
  ON devices FOR INSERT
  WITH CHECK (true);

-- Policy: Devices can read their own record
CREATE POLICY "Devices can read own record"
  ON devices FOR SELECT
  USING (true); -- For now, allow all reads (can be restricted later)

-- Policy: Anyone can insert/update subscriptions (for admin management)
CREATE POLICY "Allow subscription management"
  ON subscriptions FOR ALL
  USING (true); -- For now, allow all (can be restricted to admin service role later)

-- Policy: Allow device transfer requests
CREATE POLICY "Allow device transfers"
  ON device_transfers FOR ALL
  USING (true); -- For now, allow all (can be restricted later)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_restore_code ON devices(restore_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_device_id ON subscriptions(device_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_restore_code ON subscriptions(restore_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_pro ON subscriptions(is_pro);
CREATE INDEX IF NOT EXISTS idx_transfers_restore_code ON device_transfers(restore_code);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON device_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_requested_at ON device_transfers(requested_at);

-- Note: In production, you may want to:
-- 1. Use service role key for admin operations
-- 2. Add more restrictive RLS policies
-- 3. Add indexes for better query performance
-- 4. Add constraints for data validation

