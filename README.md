# Werkout.in

A hyperlocal fitness connection platform that connects fitness seekers with local trainers and group leaders.

## About

Werkout.in serves as a connection layer between fitness seekers and providers (trainers, coaches, group leaders) with a hyperlocal focus. Rather than creating a closed ecosystem, the platform integrates with existing social and fitness platforms where users and professionals already maintain a presence.

## Key Features

- **User Profiles**: Separate workflows for fitness seekers and providers
- **Location-Based Search**: Find providers based on proximity and specialties
- **External Platform Integration**: Connect with platforms like Strava
- **Responsive Design**: Mobile-first approach for optimal user experience

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, SWR for data fetching
- **UI Components**: Custom component library with shadcn/ui
- **Form Handling**: React Hook Form + Zod validation
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- Clerk account for authentication
- Strava API credentials (for Strava integration)

### Environment Setup

Create a `.env.local` file with the following variables:

```
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Strava (for OAuth integration)
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=your_redirect_uri
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Development Workflow

- **UI Components**: Located in `src/components/ui`
- **API Routes**: Located in `src/app/api/`
- **MongoDB Models**: Located in `src/models/`
- **Form Validations**: Located in `src/lib/validations/`

## Deployment

The application is deployed on Vercel. Push to the main branch triggers automatic deployment.

## License

[MIT](LICENSE)
