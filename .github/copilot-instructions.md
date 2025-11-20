# Copilot Instructions for zdebt

Welcome to the `zdebt` codebase! This document provides essential guidelines for AI coding agents to be productive in this project. Follow these instructions to understand the architecture, workflows, and conventions.

## Project Overview

`zdebt` is a **Next.js 14** application designed for privacy-first debt tracking. Key technologies include:
- **TypeScript**: Enforces type safety.
- **Tailwind CSS**: Custom color scheme for consistent UI.
- **Zustand**: State management with localStorage persistence.
- **Supabase**: Backend for cloud sync and data storage.
- **Recharts**: For data visualization (charts).

### Key Features
- **Privacy-first design**: No personal identifiers, localStorage by default.
- **Onboarding flow**: Multi-step process to set goals, timelines, and habits.
- **Currency detection**: Supports multiple locales (e.g., USD, EUR, GBP).
- **Device ID system**: Anonymous user identification.

## Codebase Structure

### Major Directories
- `app/`: Contains all Next.js pages and routes.
  - Example: `app/onboarding/goal/page.tsx` for the goal selection step.
- `components/`: Reusable UI components.
  - Example: `components/IncomeChart.tsx` for income-related visualizations.
- `lib/`: Utility functions and business logic.
  - Example: `lib/debtEngine.ts` for debt calculations.
- `store/`: Zustand store definitions.
  - Example: `store/useUserStore.ts` for user state management.
- `supabase/`: Supabase-specific integrations.
  - Example: `supabase/incomeIdeas.ts` for income-related queries.

### Key Files
- `tsconfig.json`: TypeScript configuration.
- `tailwind.config.js`: Tailwind CSS setup.
- `package.json`: Dependencies and scripts.
- `README.md`: Project overview and setup instructions.

## Development Workflows

### Setup
1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Build for production: `npm run build`

### Testing
- No explicit testing framework is mentioned. Add tests in `__tests__/` or similar if required.

### Debugging
- Use browser dev tools and Next.js debugging features.
- Check Zustand state via browser console.

## Project-Specific Conventions

### State Management
- Use Zustand for all persistent state.
- LocalStorage keys are prefixed with `zdebt_` (e.g., `zdebt_device_id`).

### Privacy Guidelines
- Avoid storing personal identifiers.
- Use safe wording (e.g., "For planning purposes only").

### UI Patterns
- Tailwind CSS for styling.
- Consistent color scheme:
  - Active Income: `#FF6B6B`
  - Passive Income: `#51CF66`
  - Goals: `#4DABF7`

### API Integration
- Supabase for backend operations.
- Example: `lib/supabase.ts` initializes the Supabase client.

## Examples

### Adding a New Page
1. Create a new folder under `app/` (e.g., `app/new-feature/`).
2. Add `page.tsx` for the route.
3. Use Tailwind CSS for styling and Zustand for state management if needed.

### Creating a Component
1. Add a new file in `components/` (e.g., `components/NewComponent.tsx`).
2. Follow existing patterns (e.g., props validation with TypeScript).
3. Import and use the component in relevant pages.

## External Dependencies
- **Supabase**: For cloud sync and data storage.
- **Recharts**: For charts and visualizations.
- **Zustand**: For state management.

## Notes for AI Agents
- Follow the privacy-first principles strictly.
- Adhere to the established color scheme and UI patterns.
- Use existing utilities in `lib/` to avoid duplicating logic.
- Refer to `README.md` for additional context on features and next steps.

---

For questions or updates, consult the `README.md` or relevant maintainers.