# Stability Testing Guide

This guide explains how to test the stability of the frontend and backend components of the Werkout.in platform.

## Quick Start

The easiest way to test stability is to use our automated test script:

```bash
# Install dependencies
npm install

# Run the stability test
npm run test:stability
```

This script will:
1. Check if environment files exist
2. Start the backend server
3. Verify the backend health endpoint responds
4. Start the frontend server
5. Verify the frontend responds
6. Report the results

## Manual Testing

If you prefer to test manually, follow these steps:

### 1. Start the Backend Server

```bash
cd src/backend
npm install
npm run dev
```

The backend server should start on port 5000.

### 2. Verify Backend Health

Open a browser or use a tool like curl to access the health endpoint:

```bash
curl http://localhost:5000/api/health
```

You should receive a JSON response like:

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 3. Start the Frontend Server

```bash
cd src/frontend
npm install
npm run dev
```

The frontend server should start on port 3000.

### 4. Access the Health Check Page

Open a browser and navigate to:

```
http://localhost:3000/health
```

This page will attempt to connect to the backend health endpoint and display the results.

## Common Issues and Solutions

### Backend Won't Start

1. Check if MongoDB is running (if using a local instance)
2. Verify the .env file exists with correct configuration
3. Make sure the required ports are available (default: 5000)
4. Check for errors in the console output

### Frontend Can't Connect to Backend

1. Verify the backend is running
2. Check CORS configuration in the backend (should allow requests from frontend origin)
3. Verify the frontend environment variables are set correctly
4. Check network tab in browser dev tools for specific errors

### Environment Setup

Both the frontend and backend require environment files:

- Backend: `.env` in `src/backend/`
- Frontend: `.env.development` in `src/frontend/`

Make sure these files exist with the proper configuration. 