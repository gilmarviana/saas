# SaaS MicroSistema - Plataforma de Delivery para Restaurantes

## Overview

This is a comprehensive multi-tenant SaaS platform for restaurants and food businesses, built with React, Express.js, and PostgreSQL. The system supports a four-tier user hierarchy: Super Admin, Empresas (restaurants), Garçoms (waiters), and Clientes Finais (end customers). It includes subscription management via Asaas, menu management, order processing, WhatsApp integration, and delivery area configuration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React Context for authentication
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM with type-safe database operations
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Payment Processing**: Stripe integration for subscriptions

### Authentication & Authorization
- **Authentication**: Email/password with session-based auth
- **Authorization**: Role-based access control (RBAC) with four levels:
  - Super Admin: Full system access, manage empresas, templates, and plans
  - Empresa: Manage menu, orders, customers, and financial data
  - Garçom: Simplified order interface per table
  - Cliente Final: Access restaurant landing pages and digital menu
- **Session Storage**: PostgreSQL sessions for scalability

## Key Components

### Database Schema
The system uses a relational database with the following main entities:
- **Users**: Central user table with role-based access (super_admin, empresa, garcom, cliente)
- **Empresas**: Restaurant/business data with subscription plans
- **Cardapio**: Menu items with categories, prices, and availability
- **Pedidos**: Order management with status tracking
- **Clientes**: Customer data and order history
- **Subscriptions**: Asaas subscription management with plan limits
- **Delivery Areas**: Geographic delivery zones with pricing rules

### API Structure
RESTful API with the following main endpoints:
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/empresas/*` - Restaurant/business management
- `/api/cardapio/*` - Menu management
- `/api/pedidos/*` - Order management
- `/api/clientes/*` - Customer management
- `/api/asaas/*` - Subscription and payment management
- `/api/whatsapp/*` - WhatsApp integration endpoints
- `/api/delivery/*` - Delivery area management
- `/api/stats/*` - Analytics and reporting

### Frontend Components
- **Layout Components**: Protected routes, headers, navigation
- **UI Components**: Comprehensive shadcn/ui component library
- **Pages**: Role-specific dashboards and management interfaces
- **Hooks**: Custom hooks for authentication, mobile detection, toast notifications

## Data Flow

1. **User Authentication**: Users log in via email/password, sessions stored in PostgreSQL
2. **Role-based Routing**: Protected routes ensure users only access authorized content
3. **Data Fetching**: TanStack Query handles API calls with caching and error handling
4. **Real-time Updates**: Manual refresh patterns with optimistic updates
5. **Payment Flow**: Stripe integration for subscription management

## External Dependencies

### Payment Processing
- **Asaas**: Brazilian payment gateway for subscription management
- **Webhook Support**: Handles subscription status changes and plan upgrades
- **Plan Management**: Gratuito, Padrão, Premium with order limits

### Database & Storage
- **Supabase PostgreSQL**: Production-ready PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database operations with migrations
- **Storage Implementation**: Using persistent database storage with Supabase integration

### UI & Styling
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for UI elements

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API
- **Hot Module Replacement**: Enabled for fast development cycles
- **Environment Variables**: Separate configs for dev/prod

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend in production

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for frontend
- `NODE_ENV`: Environment setting (development/production)

### Database Management
- **Migrations**: Drizzle Kit handles schema migrations
- **Schema**: Centralized in `shared/schema.ts` for type safety
- **Push Command**: `npm run db:push` for development schema updates

## Recent Changes

### Financial System Implementation (July 14, 2025)
- ✓ Created transacoes_financeiras table with complete schema
- ✓ Implemented automatic transaction creation when orders are confirmed
- ✓ Added manual transaction management for expenses and revenues
- ✓ Updated financial summary to use real transaction data
- ✓ Fixed database columns (disponivel, tempo_preparacao) for menu items
- ✓ Connected all financial operations to PostgreSQL database

### Database Migration (July 14, 2025)
- ✓ Migrated from in-memory storage to PostgreSQL database
- ✓ Implemented DatabaseStorage class with full CRUD operations
- ✓ Applied database schema using Drizzle migrations
- ✓ Created super admin user in database
- ✓ Updated super admin credentials to user's email
- ✓ Verified authentication and data persistence

The system is designed for scalability with proper separation of concerns, type safety throughout, and a modern development experience with fast builds and hot reloading.