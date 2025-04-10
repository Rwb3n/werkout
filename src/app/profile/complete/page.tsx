'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

const REDIRECT_DELAY = 3000; // Delay in milliseconds (3 seconds)

export default function ProfileCompletePage() {
    const router = useRouter();

    // DESIGN DECISION: This page acts as a buffer after profile creation.
    // It uses a fixed setTimeout delay before redirecting to the dashboard.
    // This delay gives Clerk's session token time to update with the 
    // 'profileComplete: true' metadata, preventing middleware race conditions
    // where the user might be incorrectly redirected back to onboarding.
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("Profile complete page redirecting to /dashboard after delay...");
            router.replace('/dashboard');
        }, REDIRECT_DELAY);

        // Clear the timer if the component unmounts early
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <Container className="py-16 flex items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                         {/* Placeholder for checkmark */}
                         <span className="text-3xl">✅</span>
                    </div>
                    <CardTitle>Profile Updated!</CardTitle>
                    <CardDescription>
                        Your profile has been successfully saved.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Redirecting you to your dashboard shortly...
                    </p>
                     <div className="mt-4 flex justify-center">
                          {/* Placeholder for spinner */}
                          <span className="text-xl animate-spin">⏳</span> 
                     </div>
                </CardContent>
            </Card>
        </Container>
    );
} 