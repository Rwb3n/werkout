# Werkout.in Platform

## Project Overview

Werkout.in is a platform designed to connect fitness seekers with fitness providers, including personal trainers, coaches, fitness groups, clubs, gyms, and event organizers. The platform aims to foster a comprehensive fitness community with a connection-first approach, prioritizing direct, unmediated connections between users and fitness providers.

## Development Approach

We are following an agile methodology with self-contained sprints as defined in our [Development SOP](AI_SOP.md). Our approach is guided by these core principles:

1. **Agile Methodology**: Development through multiple self-contained sprints
2. **Reference-Driven Development**: Continuous reference to project specification files 
3. **Skeleton First**: Ensure basic structure works before adding detailed functionality
4. **Test After Every Task**: Complete testing after each task before moving to the next
5. **Strict Timeline Adherence**: Follow the development timeline without deviation

The development timeline is organized into 5 major phases:

1. **Foundation (Weeks 1-4)**: Environment setup, core backend, initial frontend
2. **Core Features (Weeks 5-10)**: Profiles, search, community features
3. **AI Scaffolding (Weeks 11-12)**: Data collection, templates, manual workflows
4. **Testing and Refinement (Weeks 13-14)**: Comprehensive testing, refinement
5. **Deployment and Launch (Weeks 15-16)**: Deployment, monitoring, launch

Each sprint has a dedicated folder in the `sprints/` directory with detailed planning, tasks, and documentation.

## Repository Structure

This repository is organized as follows:

```
workspace/
├── docs/               # Documentation files
├── src/                # Source code
│   ├── frontend/       # Next.js frontend application
│   ├── backend/        # Node.js/Express backend API
│   └── shared/         # Shared code between frontend and backend
├── tests/              # Test files
├── scripts/            # Utility scripts
├── design/             # Design assets and mockups
├── sprints/            # Sprint planning and documentation
│   ├── sprint1-foundation/
│   ├── sprint2-core-features/
│   ├── sprint3-ai-scaffolding/
│   ├── sprint4-testing/
│   └── sprint5-deployment/
├── references/         # Reference materials and specifications
└── AI_SOP.md           # Development Standard Operating Procedures
```

## Key Documents

- [Development SOP](AI_SOP.md): Standard operating procedures for development
- [Executive Summary](references/executive_summary.md): Overview of the project goals and approach
- [Project Plan](references/project_plan.md): Detailed project timeline and resource allocation
- [Technical Architecture](references/technical_architecture.md): System architecture and technology stack
- [AI Integration Strategy](references/ai_integration_strategy.md): Approach to AI features implementation
- [Database Schema](references/database_schema.md): Data model and relationships
- [MVP Analysis](references/mvp_analysis.md): Core features and user personas
- [UI Mockups](references/): Various UI mockups and design specifications
- Current Sprint: [Sprint 1: Foundation](sprints/sprint1-foundation/README.md)

## Getting Started

1. Clone this repository
2. Run the setup script to initialize the development environment:
   ```
   node scripts/setup.js
   ```
3. Set up environment variables (see `.env.example` files)
4. Start development servers:
   ```
   # Frontend
   cd src/frontend && npm run dev
   
   # Backend
   cd src/backend && npm run dev
   ```

## Contribution Guidelines

1. Always create a feature branch from the main branch
2. Follow the code style guidelines in the documentation
3. Include appropriate tests for all functionality
4. Test each task immediately after completion
5. Submit a pull request for review
6. Ensure CI/CD pipeline passes all tests

## AI Integration

For AI-related features, we're using a "scaffolding with human-in-the-loop" approach:

1. Building infrastructure to support future AI capabilities
2. Implementing manual processes that mimic future AI functionality
3. Collecting data that will train future AI models
4. Establishing feedback loops for continuous improvement

All AI features should follow the specifications in the [AI Integration Strategy](references/ai_integration_strategy.md) document.

## Testing

Testing must be performed after each task is completed:

- Unit tests using Jest
- Integration tests for API endpoints
- End-to-end tests using Cypress
- Minimum code coverage target: 80%

Refer to the [Testing Strategy](tests/README.md) for detailed guidelines.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile (requires authentication)

### Seeker Profiles

The Seeker Profile API allows fitness seekers to manage their profiles and track their fitness journey.

- `GET /api/seekers/profile` - Get the current user's seeker profile
- `POST /api/seekers/profile` - Create or update a seeker profile
- `POST /api/seekers/profile/journey` - Add a fitness journey milestone
- `PUT /api/seekers/profile/measurements` - Update fitness measurements
- `GET /api/seekers/profile/completion` - Get profile completion score and missing fields

### Health Check

- `GET /api/health` - System health check endpoint

## Testing

### Running Tests

To run tests, use the following commands:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests with verbose logging
npm run test:with-logs
```

### Test Logging

Test results are logged to the `logs/tests/` directory. Each test run creates a timestamped log file with detailed information about the test execution.

## Stability Testing

To test the stability of the frontend and backend servers:

```bash
npm run test:stability
```

This will:
1. Check if environment files exist
2. Start the backend server and verify it's responding
3. Start the frontend server and verify it's responding
4. Output the results

For more details, see [Stability Testing Guide](docs/stability-testing.md).

## License

[License information to be added] 