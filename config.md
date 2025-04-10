# Project Configuration (LTM)

This file contains the stable, long-term context for the **Werkout.in** project.  
It should be updated infrequently, primarily when core goals, tech, or patterns change.

---

## Core Goal

Create a **hyperlocal platform** that connects fitness seekers with fitness providers (trainers, coaches, group leaders) in specific geographic areas.  
The platform will facilitate **direct connections** rather than creating another closed ecosystem, integrating with users' existing presences on platforms like **Instagram**, **TikTok**, and **Strava**.

See `/spec.md` for detailed project specifications and requirements.

---

## Tech Stack

_For complete technology evaluation and rationale, see `/stack.md`_

- **Frontend**: Next.js, TypeScript, Tailwind CSS  
- **State Management**: React Context + SWR  
- **Form Handling**: React Hook Form + Zod  
- **Backend**: Node.js (via Next.js API Routes), TypeScript  
- **Database**: MongoDB with Mongoose  
- **Authentication**: Clerk  
- **Storage**: AWS S3 (Planned/Optional)  
- **Deployment**: Vercel (Frontend + API Routes), MongoDB Atlas  
- **CI/CD**: GitHub Actions (Planned/Optional)  
- **Testing**: Jest, React Testing Library, Cypress (Planned/Optional)  

---

## Critical Patterns & Conventions

_For implementation details and development workflow, see `/implementation.md`_

- **Location Structure**: City-based routing TBD; currently using Provider IDs.  
- **API Design**: RESTful endpoints via Next.js API Routes (`/api/...`)  
- **Geospatial Queries**: MongoDB geospatial indexing for proximity search  
- **External Integration**: OAuth-based integration with social/fitness platforms (Strava implemented)  
- **Authentication**: Managed via Clerk  
- **Code Organization**: Standard Next.js `app` directory structure  
- **Error Handling**: Structured error responses in API routes  
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints  

---

## Key Constraints

- **Hyperlocal Focus**: Default search radius limited to 1–3 miles  
- **Performance Targets**: Page load < 2s, API response < 500ms  
- **Location Detection**: Required for core functionality  
- **Data Privacy**: GDPR-compliant data storage and processing  
- **Platform Integration**: Limited by third-party API constraints  
- **Initial Rollout**: City-by-city approach with focused adoption strategy  
- **Mobile Optimization**: Must function well on mobile devices as primary use case  
