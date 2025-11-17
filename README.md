# zdebt - Privacy-First Debt Tracking

A Next.js 14 application for tracking your path to financial freedom with complete anonymity.

## Features Implemented (Day 1-3)

### ✅ Project Setup
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS with custom color scheme
- Zustand for state management
- Recharts (installed, ready for charts)
- Supabase client (installed, ready for cloud sync)

### ✅ Core Systems
- **Currency Detection**: Auto-detects user's locale and currency (GBP, USD, EUR, CAD, AUD, INR, JPY)
- **Device ID System**: Generates anonymous device ID and restore code (4 letters + 4 numbers, no confusing chars)
- **Privacy Badge**: Sticky component showing privacy-first design
- **Zustand Store**: Persistent state management with localStorage

### ✅ Pages & Flows

#### Landing Page (`/`)
- Life-stage messaging (Young, Midlife, Older)
- Privacy emphasis throughout
- "See Your Date" CTA
- Mobile responsive

#### Onboarding Flow
1. **Welcome** (`/onboarding/welcome`)
   - Privacy USPs
   - What to expect
   - Initializes user (device ID + restore code)

2. **Goal Selection** (`/onboarding/goal`)
   - 5 goal options with icons
   - Step indicator (1/4)
   - Saves to Zustand store

3. **Timeline Selection** (`/onboarding/timeline`)
   - 5 timeline options (6mo, 1yr, 2yr, 3-5yr, no pressure)
   - Calculates target dates
   - "Most choose this" badge on 2-year option
   - Step indicator (2/4)

4. **Finances Entry** (`/onboarding/finances`)
   - Monthly income input
   - Monthly spending input
   - Optional breakdown toggle
   - Real-time leftover calculation
   - Step indicator (3/4)

5. **1% Habit Commitment** (`/onboarding/habit`)
   - Shows 1% of monthly income
   - Three choices: Yes, Custom amount, No
   - Behavioral framing (not financial advice)
   - Challenge flow for "No" responses

6. **Challenge Flow** (`/onboarding/habit/challenge`)
   - Step 1: Comparative examples (coffees, subscriptions)
   - Step 2: Reality check (gentle, non-judgmental)
   - Step 3: Life moments (why people track this)
   - Step 4: Final choice (commit, custom, or skip)

## Privacy Features

- **No name required**: Never asked, never stored
- **Device ID**: Internal only (timestamp-random format)
- **Restore Code**: 8 characters (4 letters + 4 numbers, excludes I/O/S/Z/0/1/2)
- **Local Storage**: All data stored on device by default
- **Anonymous if hacked**: Just numbers, no identifying information

## Color Scheme

- **Active Income**: Red tones (#FF6B6B)
- **Passive Income**: Green tones (#51CF66)
- **Trust/Privacy**: Green tones (#69DB7C)
- **Goals**: Blue tones (#4DABF7)
- **Debt**: Orange/Amber tones (#FFC107)

## Storage Keys

All localStorage keys use `zdebt_` prefix:
- `zdebt_device_id`
- `zdebt_restore_code`
- `zdebt_created_at`
- `zdebt_currency`
- `zdebt_storage_mode`
- `zdebt_user_store` (Zustand persisted state)

## Safe Wording

All pages use safe, non-advice wording:
- "For planning purposes only. Not financial advice."
- "Behavioral commitment" (not "financial strategy")
- "Estimated target date" (not "guaranteed")
- "Your choice" (emphasizes user agency)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Next Steps (Day 4+)

- Debt entry form
- Calculation engine
- Results dashboard
- Month-by-month breakdown
- Charts and visualizations
