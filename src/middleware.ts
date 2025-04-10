import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define routes that should be publicly accessible
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/providers/(.*)',
  // Add other genuinely public routes here if needed
]);

// Simpler Middleware: Only handles public vs protected routes and auth page redirects
export default clerkMiddleware(async (auth, req) => { 
  const { userId } = await auth(); 
  const { pathname } = req.nextUrl;
  
  console.log(`[Middleware Simplified v2] Path: ${pathname}, UserID: ${userId}`);

  const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  // --- Handle Authenticated Users ---
  if (userId) {
      // If logged in, redirect away from auth pages
      if (isAuthRoute) {
          const redirectUrl = new URL('/dashboard', req.url);
          console.log(`[Middleware Auth] Redirecting logged-in user from auth page to ${redirectUrl}`);
          return NextResponse.redirect(redirectUrl);
      }
      // Allow access to all other routes for logged-in users.
      // Client-side checks within pages (e.g., /dashboard, /profile/*) 
      // will handle onboarding state redirects.
      console.log(`[Middleware Auth] Allowing access for logged-in user to: ${pathname}`);
      return NextResponse.next();
  }

  // --- Handle Unauthenticated Users ---
  if (!userId) {
      // Allow access to explicitly public routes
      if (isPublicRoute(req)) {
          console.log(`[Middleware Unauth] Allowing public route: ${pathname}`);
          return NextResponse.next();
      }
      // For all other routes, redirect to sign-in
      console.log(`[Middleware Unauth] Redirecting unauthenticated user to sign-in from: ${pathname}`);
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url); // Pass return URL
      return NextResponse.redirect(signInUrl);
      // Note: Using NextResponse.redirect instead of redirectToSignIn for potential clarity 
      // depending on Clerk version behavior. Adjust if needed.
  }

  // Fallback (should not typically be reached)
  console.warn(`[Middleware] Fallback: Allowing access to ${pathname}`);
  return NextResponse.next();
});

export const config = {
  matcher: [ 
    '/((?!.+\\.[\\w]+$|_next).*)', 
    '/', 
    '/(api|trpc)(.*)'
  ],
}; 