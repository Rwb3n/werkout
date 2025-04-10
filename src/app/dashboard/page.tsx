'use client';

import React, { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Container } from '@/components/layout/Container';
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Define the expected shape of the profile data from the API
interface UserProfileData {
  dbId: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: 'seeker' | 'provider';
  profileComplete: boolean;
  // Optional fields based on userType
  location?: { // Assuming location is an object
    city: string;
    state: string;
    zip: string;
  };
  // Provider specific (adjust based on actual ProviderProfile schema)
  bio?: string;
  specialties?: string[];
  // Seeker specific (adjust based on actual SeekerProfile schema)
  goals?: string[];
}

const fetcher = async (url: string): Promise<UserProfileData> => {
  const res = await fetch(url);
  if (!res.ok) {
    // Define a more specific error structure if possible, or use unknown
    let errorInfo: unknown = null;
    try {
      errorInfo = await res.json();
    } catch {
      // Ignore if response isn't JSON 
    }

    // Create a custom error class or add properties to a standard Error
    class FetchError extends Error {
        info: unknown;
        status: number;
        constructor(message: string, status: number, info: unknown) {
            super(message);
            this.name = 'FetchError';
            this.status = status;
            this.info = info;
        }
    }

    const error = new FetchError(
        'An error occurred while fetching the data.', 
        res.status,
        errorInfo
    );

    throw error;
  }
  return res.json();
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Fetch profile data using SWR once user is loaded
  const { data: profile, error: swrError, isLoading: swrLoading } = useSWR<UserProfileData>(
    isLoaded && user ? '/api/profile' : null,
    fetcher
  );

  // --- Client-side Onboarding Check --- 
  // DESIGN NOTE: This client-side check ensures the user is redirected if they land here 
  // before their profile is marked complete. This is necessary because the middleware 
  // might allow access based on a stale session token immediately after profile creation.
  // KNOWN UX ISSUE: There might still be a brief moment where `useUser()` hasn't 
  // fully updated after the redirect from /profile/complete. This could cause a quick, 
  // unnecessary redirect back to /profile/create before that page redirects back here.
  // Future refinement could involve a more sophisticated state sync mechanism or 
  // potentially making the loading state handle this intermediate step better.
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        // Should be handled by middleware, but double-check
        console.warn("[Dashboard] User not logged in, redirecting to sign-in.");
        router.replace('/sign-in');
      } else {
        // Check profile completion status from the Clerk user object
        const isComplete = user.publicMetadata?.profileComplete === true;
        const userType = user.publicMetadata?.userType as string | undefined;

        if (!isComplete) {
          console.warn("[Dashboard] Profile incomplete. Redirecting to onboarding.");
          if (!userType) {
            router.replace('/profile/select-type');
          } else {
            router.replace('/profile/create');
          }
        }
        // If complete, do nothing and let the dashboard render
      }
    }
  }, [isLoaded, user, router]);

  // Show loading state while Clerk or SWR is loading, or if redirecting
  if (!isLoaded || swrLoading || (isLoaded && user && user.publicMetadata?.profileComplete !== true) ) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Handle SWR Error
  if (swrError) {
    console.error("Dashboard SWR Error:", swrError);
    return (
        <Container className="py-12">
             <Card className="max-w-2xl mx-auto bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Could not load your profile data. Please try refreshing the page.</p>
                    {swrError.info && <pre className="mt-2 text-xs bg-muted p-2 rounded">{JSON.stringify(swrError.info, null, 2)}</pre>}
                    <p className="text-xs mt-1">Status: {swrError.status}</p>
                </CardContent>
            </Card>
        </Container>
    );
  }

  // Handle case where profile data is somehow missing after loading
  if (!profile) {
    return (
      <Container className="py-12">
        <p>Profile data not available.</p>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-4">Your Dashboard</h1>
      
      <p className="text-muted-foreground mb-6">
        Welcome back, {profile.firstName || 'User'}!
        {!profile.profileComplete && (
           <span className="ml-2 text-sm text-yellow-600">(Profile setup incomplete)</span>
        )}
      </p>
      <div className="space-y-6">
        <Card className="bg-card rounded-lg shadow">
          <CardHeader>
             <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
            <p><strong>User Type:</strong> <span className="capitalize">{profile.userType || 'N/A'}</span></p>
            <p><strong>Location:</strong> {
                profile.location 
                ? `${profile.location.city || ''}, ${profile.location.state || ''}, ${profile.location.zip || ''}` 
                : 'N/A'
            }</p>
            
            {profile.userType === 'seeker' && (
                <>
                    {profile.goals && profile.goals.length > 0 && <p><strong>Goals:</strong> {profile.goals.join(', ')}</p>}
                </>
            )}

            {profile.userType === 'provider' && (
                <>
                    {profile.specialties && profile.specialties.length > 0 && (
                         <p><strong>Specialties:</strong> {profile.specialties.join(', ')}</p>
                    )}
                </>
            )}

          </CardContent>
           <CardFooter>
              <Button variant="outline" size="sm">Edit Profile</Button>
           </CardFooter>
        </Card>
        
        {/* External Connections Section */}
        <Card className="bg-card rounded-lg shadow">
            <CardHeader>
                <CardTitle>External Connections</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Strava Connection */}
                <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                        <h3 className="font-medium">Strava</h3>
                        {/* Strava Connection */}
                    </div>
                    <Button variant="outline" size="sm">Connect Strava</Button>
                </div>
                {/* --- Add other platforms below --- */} 
                {/* Example Placeholder for Instagram */}
                <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                     <div>
                        <h3 className="font-medium text-muted-foreground">Instagram (Coming Soon)</h3>
                         <p className="text-sm text-muted-foreground">Connect your Instagram account.</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>Connect Instagram</Button>
                </div>
            </CardContent>
        </Card>

        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Activity Feed (Placeholder)</h2>
          <p className="text-muted-foreground">Recent activity, connections, or messages will appear here.</p>
        </div>
      </div>
    </Container>
  );
} 