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
- **Backend**: Node.js, Express, TypeScript  
- **Database**: MongoDB with Mongoose  
- **Authentication**: Clerk `when required, documentation provided for clerk or any other`
- **Storage**: AWS S3  
- **Deployment**: Vercel (frontend), AWS Elastic Beanstalk (backend)  
- **CI/CD**: GitHub Actions  
- **Testing**: Jest, React Testing Library, Cypress  

---

## Critical Patterns & Conventions

_For implementation details and development workflow, see `/implementation.md`_

- **Location Structure**: City-based routing with pattern `werkout.in/[city]` (e.g., `werkout.in/london`)  
- **API Design**: RESTful endpoints with `/api/v1/[resource]` pattern  
- **Geospatial Queries**: MongoDB geospatial indexing for proximity search  
- **External Integration**: OAuth-based integration with social/fitness platforms  
- **Authentication**: JWT with refresh token rotation  
- **Code Organization**: Feature-based directory structure  
- **Error Handling**: Structured error responses with consistent format  
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
