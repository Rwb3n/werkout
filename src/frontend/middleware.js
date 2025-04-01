import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/about",
    "/sign-in",
    "/sign-up",
    "/api/health",
    "/health",
    "/api/webhooks/clerk",
    "/search",
    "/search/:path*"
  ],
  // Routes that can be accessed if the user is signed in or not
  ignoredRoutes: [
    "/api/health", 
    "/health"
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 