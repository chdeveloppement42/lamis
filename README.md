# Immo Lamis

A modern, high-performance real estate platform built with NestJS, React (Vite), and PostgreSQL.

## Project Structure

- `backend/`: NestJS API with Prisma ORM and CASL for RBAC.
- `frontend/`: React application with Vite, tailored for speed and premium UX.
- `specs/`: Comprehensive project documentation, including architecture, API specs, and deployment plans.

## Features

- **RBAC & Security**: Granular permissions for Admins, Managers, and Moderators.
- **Media Pipeline**: Automatic resizing and watermarking of listing images.
- **Advanced Search**: Filter by city, category, and price with real-time results.
- **Provider Portal**: Verified provider accounts with moderation workflow.
- **Notifications**: In-app alerts for critical system events.

## Deployment

Refer to `specs/05_deployment_plan.md` for detailed instructions on deploying to Netlify, Render, and Supabase.

## Development

### Quick Start (recommended)
```bash
# From the project root — installs all workspaces in one shot
npm install

# Start backend + frontend concurrently (color-coded output)
npm run dev
```

### Individual Servers
```bash
npm run backend     # NestJS API on :3000 (watch mode)
npm run frontend    # Vite + React on :5173 (HMR)
```

### Other Root Scripts
```bash
npm run build       # Build backend then frontend
npm run test        # Run backend Jest tests
npm run lint        # Lint all workspaces
```

### Using Shared Types
Both packages can import from the shared type library:
```ts
import { JwtPayload, ListingResponse, ProviderStatus } from '@immo/shared';
```

### Database (Prisma)
```bash
npm run db:migrate  # npx prisma migrate dev (backend workspace)
npm run db:seed     # npx prisma db seed    (backend workspace)

# Or directly from backend/
cd backend && npx prisma studio
```

