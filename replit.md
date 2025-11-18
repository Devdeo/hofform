# Overview

This is a Next.js application built with TypeScript that generates self-declaration forms. The application is password-protected and allows authenticated users to fill out a form with personal information, capture a digital signature, and export the completed form as a PDF document. It's designed to create A4-sized declaration documents with proper formatting and styling.

**Recent Changes (November 18, 2025)**:
- Added password protection using server-side authentication
- Implemented cookie-based session persistence (30-day expiry)
- Users authenticate once and remain logged in for 30 days
- Blue signature color for form signatures

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: Next.js 15 with React 19 and TypeScript
- **Rationale**: Next.js provides server-side rendering capabilities, built-in routing, and API routes. TypeScript adds type safety for better development experience.
- **Pages Router**: Uses the traditional pages directory structure (`pages/index.tsx`, `pages/_app.tsx`) rather than the newer app directory
- **Pros**: Mature ecosystem, excellent documentation, good developer experience
- **Cons**: Pages router is the older pattern; Next.js is moving toward the app directory

**Styling**: Tailwind CSS 4.0
- **Rationale**: Utility-first CSS framework for rapid UI development
- **Implementation**: Global styles in `styles/globals.css` with Tailwind configuration
- **Pros**: Fast development, consistent design system, minimal CSS bundle
- **Cons**: HTML can become verbose with many utility classes

**State Management**: React useState hooks
- **Rationale**: Simple form state management without external libraries
- **Implementation**: Local component state for form data, preview mode, and signature data
- **Pros**: No additional dependencies, straightforward for simple use cases
- **Cons**: Doesn't scale well for complex state sharing

## Client-Side Form Processing

**Signature Capture**: react-signature-canvas
- **Rationale**: Provides canvas-based signature drawing functionality
- **Implementation**: Dynamically imported to avoid SSR issues (`dynamic` import with `ssr: false`)
- **Pros**: Simple API, captures signature as base64 data
- **Cons**: Requires client-side only rendering

**PDF Generation**: jsPDF + html-to-image
- **Rationale**: Client-side PDF generation without server dependency
- **Process**: Converts form HTML to PNG image using html-to-image, then embeds in PDF using jsPDF
- **Pros**: No server processing needed, works entirely in browser
- **Cons**: Limited control over PDF layout compared to server-side solutions

## Form Data Model

The application manages a structured form with the following fields:
- Head of Family information (name, address, Aadhaar)
- Resident information (name, Aadhaar, relationship)
- Additional resident names
- Date and signature

Form validation and submission logic appears to be in development (incomplete in `pages/index.tsx`).

## Development Configuration

**ESLint**: Next.js core web vitals configuration
- Standard Next.js linting rules for code quality

**TypeScript Configuration**:
- Non-strict mode enabled (`strict: false`)
- Target: ES2017
- Module resolution: Node

**Next.js Configuration**:
- Custom allowed dev origins for Replit environment
- Configured to work with Replit's domain system

# External Dependencies

## UI/UX Libraries

**react-signature-canvas** (^1.1.0-alpha.2)
- Purpose: Digital signature capture on canvas element
- Integration: Dynamically imported to prevent SSR issues

**Tailwind CSS** (^4.0.15)
- Purpose: Utility-first CSS framework for styling
- Integration: Configured via global CSS imports

## Document Generation Libraries

**jsPDF** (^3.0.3)
- Purpose: Client-side PDF generation
- Usage: Creates PDF documents from form data

**html-to-image** (^1.11.13)
- Purpose: Converts HTML/DOM to image format
- Usage: Renders form as PNG before embedding in PDF

## Development Tools

**TypeScript** (^5.8.2)
- Type checking and enhanced development experience

**ESLint** (^9.23.0)
- Code linting with Next.js configuration

## Runtime Environment

**Replit Integration**:
- Configured for Replit's domain and development environment
- Custom Next.js config to allow Replit dev origins
- Development server runs on port 3000, bound to 0.0.0.0

## Authentication System

**Password Protection**: Server-side verification with cookie-based persistence
- **Implementation**: API route `/api/verify-password` validates password against `FORM_PASSWORD` environment variable
- **Session Management**: 30-day cookie (`form_authenticated`) stored with SameSite=Strict flag
- **Security**: Password never exposed to client; verification happens server-side only
- **User Experience**: Users authenticate once and remain logged in for 30 days

## Security Features

- **Environment Variables**: Sensitive password stored in Replit Secrets as `FORM_PASSWORD`
- **Server-side Validation**: Password verification happens via API route, never in client code
- **Cookie Security**: Authentication cookie set with 30-day expiry and SameSite=Strict flag
- **No Data Persistence**: Form data is not stored on server; only exists in client state and exported PDFs