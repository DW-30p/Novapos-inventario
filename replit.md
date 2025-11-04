# Inventory Management & Barcode Scanner Application

## Overview

This is a full-stack inventory management system with barcode scanning capabilities, designed for mobile-first productivity. The application enables users to scan product barcodes using their device camera, manage product information, and export inventory data to Excel or SQL formats. Built with a modern React frontend following Material Design principles and an Express backend with PostgreSQL database storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for hot module replacement
- Wouter for lightweight client-side routing (instead of React Router)

**UI Component System:**
- Shadcn/ui components (New York style variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design system implementation via Roboto font family
- Responsive design with mobile-first breakpoints (768px threshold)

**State Management:**
- TanStack Query (React Query) for server state management
- Query client configured with infinite stale time and disabled refetch on window focus
- Form state managed via React Hook Form with Zod validation

**Design Tokens:**
- CSS custom properties for theming (light/dark mode support)
- Consistent spacing system using Tailwind units (3, 4, 6, 8, 12)
- Custom color palette with semantic naming (primary, secondary, destructive, muted, accent)
- Border radius tokens: lg (9px), md (6px), sm (3px)

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- Middleware chain: JSON body parsing, URL encoding, request logging
- Custom request/response logging with duration tracking for API endpoints

**API Design:**
- RESTful API with `/api` prefix for all endpoints
- Product CRUD operations: GET, POST, PUT, DELETE
- Search functionality with query parameter support
- Validation using Zod schemas at the API boundary

**Build & Deployment:**
- Development: tsx for TypeScript execution with hot reload
- Production: esbuild bundling with ES modules format
- Separate build outputs: Vite for frontend (dist/public), esbuild for backend (dist)

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database queries and migrations
- Connection pooling using @neondatabase/serverless Pool

**Schema Design:**
- `inventory_products` table with comprehensive product fields:
  - Core fields: id (serial PK), name, barcode, description
  - Financial: price (decimal 10,2), cost (optional decimal 10,2)
  - Inventory: stock (integer), minStock (integer)
  - Categorization: categoryName (varchar 100)
  - Timestamps: createdAt, updatedAt (auto-managed)
- `users` table for authentication (template scaffold)

**Data Validation:**
- Zod schemas derived from Drizzle schema using drizzle-zod
- Separate insert and update schemas with appropriate field requirements
- Type inference for full-stack type safety

### Authentication & Authorization

**Current State:**
- User table exists in schema with username/password fields
- Authentication layer not yet implemented
- Session management scaffolded via connect-pg-simple (PostgreSQL session store)

**Design Intent:**
- Prepared for session-based authentication
- User ID generation via PostgreSQL gen_random_uuid()

### Key Features

**Barcode Scanning:**
- Html5Qrcode library for camera-based scanning
- Environment-facing camera preference for mobile devices
- Configurable scan box (250x250px) with 10 FPS
- Real-time barcode detection with visual feedback
- Success indicator with 2-second timeout

**Product Management:**
- Multi-field product forms with validation
- Stock level tracking with minimum threshold alerts
- Category-based organization
- Price and cost tracking for margin analysis
- Search and filter capabilities (by name, barcode, category, stock status)

**Data Export:**
- Excel export via xlsx library (dynamically imported)
- Formatted output with Spanish column headers
- Timestamped filenames for version control
- Complete product data including metadata

**UI Patterns:**
- Dialog-based scanner interface
- Toast notifications for user feedback
- Alert dialogs for destructive actions (delete confirmation)
- Responsive table layout with mobile considerations
- Badge components for stock status visualization

### Performance Optimizations

- Dynamic imports for heavy libraries (xlsx for Excel export)
- Memoized filtered/sorted data in product lists
- Query result caching via React Query
- Optimistic UI updates disabled (server as source of truth)

## External Dependencies

### Third-Party Services

**Database:**
- Neon PostgreSQL serverless database (via DATABASE_URL environment variable)
- Requires WebSocket support for real-time capabilities

### External Libraries

**Frontend Core:**
- @tanstack/react-query: Server state synchronization
- react-hook-form + @hookform/resolvers: Form management with validation
- html5-qrcode: Barcode/QR code scanning via device camera
- wouter: Minimal routing solution
- date-fns: Date formatting and manipulation

**UI Components:**
- @radix-ui/* (18+ packages): Accessible primitive components
- lucide-react: Icon library
- class-variance-authority: Component variant management
- tailwindcss: Utility-first CSS framework
- embla-carousel-react: Carousel/slider functionality

**Data Processing:**
- xlsx: Excel file generation and export
- drizzle-orm: Type-safe ORM
- drizzle-zod: Schema-to-validation bridge
- zod: Runtime type validation

**Backend:**
- express: Web server framework
- @neondatabase/serverless: PostgreSQL client
- connect-pg-simple: Session store (prepared for auth)
- ws: WebSocket library for Neon connection

**Development Tools:**
- vite: Frontend build tool
- tsx: TypeScript execution for development
- esbuild: Production bundler
- @replit/vite-plugin-*: Replit-specific development enhancements (cartographer, dev-banner, runtime-error-modal)

### Font Dependencies

- Google Fonts CDN: Roboto (400, 500, 700) and Roboto Mono families

### Configuration Requirements

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- `REPL_ID`: Replit environment detection (optional)

**Build Configuration:**
- TypeScript paths: `@/*`, `@shared/*`, `@assets/*` aliases
- Drizzle migrations output: `./migrations`
- Schema location: `./shared/schema.ts`