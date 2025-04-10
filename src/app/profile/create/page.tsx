'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ProfileWizard } from '@/components/profile-wizard/ProfileWizard';
import { Container } from '@/components/layout/Container';
import type { SeekerWizardData, ProviderWizardData } from '@/lib/validations/profileWizard';
import { useRouter } from 'next/navigation';

export default function CreateProfilePage() {
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // DESIGN NOTE: This client-side check ensures that if a user lands here 
    // after their profile is actually complete (e.g., due to browser back or 
    // the brief redirect mentioned in dashboard/page.tsx), they are quickly 
    // sent to the dashboard.
    if (isLoaded && user?.publicMetadata?.profileComplete === true) {
        console.log("[Profile Create Page] User profile already complete, redirecting to dashboard.");
        router.replace('/dashboard');
    }
  }, [isLoaded, user, router]);

  const userType = user?.publicMetadata?.userType as 'seeker' | 'provider' || 'seeker';

  const handleWizardComplete = async (data: SeekerWizardData | ProviderWizardData) => {
    setIsSubmitting(true);
    console.log('--- Profile Wizard Completed ---');
    console.log('User Type:', userType);
    console.log('Submitted Data:', data);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userType: userType,
          ...data 
        }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to save profile data.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (parseError) {
          // Ignore if error response is not JSON
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log("API Response:", result);
      
      // DESIGN DECISION: Redirect to a simple confirmation page (/profile/complete)
      // instead of directly to /dashboard or using a complex polling page.
      // This introduces a fixed delay via the confirmation page's setTimeout,
      // allowing Clerk's backend metadata update (profileComplete: true) sufficient
      // time to propagate to the session token read by the middleware.
      // This mitigates race conditions where the middleware might redirect back to
      // onboarding due to reading a stale token immediately after the profile update.
      console.log("Redirecting to /profile/complete confirmation page...");
      router.push('/profile/complete'); 

    } catch (error) {
      console.error("Error saving profile data:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || user?.publicMetadata?.profileComplete === true) {
    return <Container className="py-8 text-center">Loading...</Container>;
  }

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Your {userType === 'seeker' ? 'Seeker' : 'Provider'} Profile</h1>
      <div className={`max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-md ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
        {userType ? (
            <ProfileWizard 
              userType={userType} 
              onComplete={handleWizardComplete} 
            />
        ) : (
            <p className="text-center text-red-500">Error: User type not determined.</p>
        )}
      </div>
    </Container>
  );
} 