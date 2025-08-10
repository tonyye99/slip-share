# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SlipShare is a Next.js 15 receipt sharing application that allows users to upload, parse, and manage receipts using OCR and AI. It integrates with Supabase for authentication and data storage, and uses both Google Cloud Document AI and OpenAI for receipt parsing.

## Development Commands

- **Development server**: `pnpm dev` or `npm run dev` (uses Turbopack)
- **Build**: `pnpm build` or `npm run build`
- **Production server**: `pnpm start` or `npm run start`
- **Linting**: `pnpm lint` or `npm run lint`
- **Lint fix**: `pnpm lint:fix` or `npm run lint:fix`
- **Format code**: `pnpm format` or `npm run format`
- **Check formatting**: `pnpm format:check` or `npm run format:check`

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth with custom AuthContext
- **Database**: PostgreSQL via Supabase with RLS policies
- **OCR/Parsing**: Google Cloud Document AI and OpenAI GPT-4.1-mini
- **State Management**: React Context (AuthContext)
- **Form Handling**: React Hook Form with Zod validation

### Key Architecture Patterns

**Authentication Flow**:

- Uses Supabase SSR with middleware for session management
- AuthContext (`src/contexts/auth-context.tsx`) provides auth state and methods
- Protected routes redirect unauthenticated users to sign-in
- Middleware (`src/middleware.ts`) handles session updates across requests

**Database Schema**:

- `receipts` table: Main receipt metadata with user_id, merchant info, tax/service percentages, and user_type
- `receipts_items` table: Line items linked to receipts via foreign key
- `user_selections` table: Stores user item selections and share counts
- Row Level Security (RLS) ensures users only access their own data

**Receipt Processing Pipeline**:

1. Image upload → Base64 encoding
2. Parallel processing via two APIs:
   - `/api/ocr/parse` - Google Cloud Document AI
   - `/api/openai/parse` - OpenAI structured output with JSON schema
3. Parsed data shown in confirmation UI (`ParsedResults` component)
4. User confirmation saves to Supabase

### File Structure Conventions

**API Routes** (`src/app/api/`):

- Follow RESTful patterns with proper error handling
- Use TypeScript interfaces for request/response types
- Environment variables for API keys (Google Cloud uses service account JSON)

**Components** (`src/components/`):

- shadcn/ui components in `ui/` subdirectory
- Business components at root level
- Use TypeScript interfaces for props

**Supabase Integration**:

- Client-side: `src/lib/supabase/client.ts`
- Server-side: `src/lib/supabase/server.ts`
- OAuth: `src/lib/supabase/oauth.ts`
- Middleware: `src/lib/supabase/middleware.ts`

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

Google Cloud credentials are loaded from `slipshare-3c33bb175e7b.json` in project root.

### Database Migrations

Located in `supabase/migrations/` - use Supabase CLI for schema changes.

### Import Aliases

Uses `@/*` for `./src/*` path mapping configured in `tsconfig.json`.

### Example parsed response from OpenAI API

```
{
"items": [
{ "id": "22", "name": "Stir Fried (P) R V", "qty": 1, "unit_price": 289.0 },
{ "id": "24", "name": "BBQ (P) R V", "qty": 1, "unit_price": 279.0 },
{
"id": "32",
"name": "Kimchi Fried Rice (P)",
"qty": 1,
"unit_price": 239.0
},
{ "id": "water", "name": "Water", "qty": 1, "unit_price": 20.0 }
],
"tax_percent": 7.35,
"service_percent": 5,
"total": 929.13,
"subtotal": 827.0,
"rounding": 0
}
```

### Types Organization

TypeScript types are organized in the `src/types/` folder:

- `database.ts` - Database entity types (Receipt, ReceiptItem, UserSelection)
- `api.ts` - API request/response types (CreateReceiptRequest, SaveSelectionsRequest)
- `components.ts` - Component prop types (CostCalculatorProps, ReceiptItemSelectorProps)
- `common.ts` - Utility types (UserType, ShareCounts, FormState)
- `index.ts` - Re-exports all types for easy importing

Import types using: `import type { Receipt, UserType } from '@/types'`

## Current Development Tasks

### User Role-Based Bill Splitting System ✅ COMPLETED

- **Goal**: Distinguish between bill payers and sharers for appropriate user experiences
- **Implementation**: Added `user_type` field to receipts table with values 'payer' or 'sharer'

**Key Features**:

- **Payer Experience**: "Your Consumption" view showing what they consumed from the bill they paid
- **Sharer Experience**: "Your Share" view calculating exactly what they owe
- Different UI messaging and button labels based on user role
- Flexible system where receipt uploader can be either payer or sharer

### Receipt Detail Page with Cost Sharing ✅ COMPLETED

- **Location**: `src/app/receipts/[id]/page.tsx`
- **Features**:
  - Editable item selection with checkboxes
  - Real-time calculation with item sharing (divide by number of people)
  - Proportional tax and service charges
  - Share count input per item (1-99 people)
  - Persistent storage of selections and share counts

### Completed Components

- `ReceiptItemSelector`: Interactive table with item selection and share count inputs
- `CostCalculator`: Real-time calculation display with role-based messaging
- Database migrations for `user_selections` table and `user_type` field
- API endpoints for saving/loading user selections with share data

### Next Potential Features

- **Payer Dashboard**: Show all participants and their calculated totals (for payers to see who owes what)
- **Payment Tracking**: Mark payments as received/confirmed
- **Receipt Sharing**: Invite system for adding participants to bills
