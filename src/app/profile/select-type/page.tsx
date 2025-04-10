'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SelectUserTypePage() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [selectedType, setSelectedType] = useState<'seeker' | 'provider' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelect = async () => {
        if (!selectedType) {
            setError('Please select a profile type.');
            return;
        }
        if (!user) {
            setError('User not available. Please try logging in again.');
            return;
        }

        try {
            console.log("[handleSelect] Setting isLoading=true");
            setIsLoading(true);
            setError(null);

            console.log("[handleSelect] Calling API /api/profile/set-type...");
            const response = await fetch('/api/profile/set-type', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userType: selectedType })
            });
            console.log(`[handleSelect] API response status: ${response.status}`);

            if (!response.ok) {
                let errorMsg = 'Failed to set user type.';
                try {
                    const resData = await response.json();
                    console.error("[handleSelect] API error response data:", resData);
                    errorMsg = resData.message || errorMsg;
                } catch (jsonError) {
                    console.error("[handleSelect] Failed to parse API error response:", jsonError);
                }
                throw new Error(errorMsg);
            }
            
            console.log("[handleSelect] API call successful. Calling user.reload()...");
            await user.reload(); 
            console.log("[handleSelect] user.reload() completed.");

            console.log(`[handleSelect] Attempting redirect to /profile/completing?next=create...`);
            router.push('/profile/completing?next=create');
            console.log("[handleSelect] router.push called (navigation might be async).");

        } catch (err) {
            console.error("[handleSelect] Caught error in try block:", err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            console.log("[handleSelect] Entering finally block.");
            setIsLoading(false);
            console.log("[handleSelect] setIsLoading(false) executed.");
        }
    };

    // Restore useEffect to handle cases where user lands here but should be elsewhere
    // (e.g., after profile completion but middleware token was stale)
    useEffect(() => {
        if (isLoaded && user) {
            if (user.publicMetadata?.profileComplete === true) {
                console.log("[Select Type Page] Profile already complete, redirecting to dashboard.");
                router.replace('/dashboard');
            } else if (user.publicMetadata?.userType) {
                // If type is set but profile not complete (e.g., browser back), redirect to create
                console.log(`[Select Type Page] User type already set (${user.publicMetadata.userType}), redirecting to wizard.`);
                router.replace('/profile/create');
            }
            // If type not set and profile not complete, stay on this page.
        }
    }, [isLoaded, user, router]);

    // Only show loading indicator while Clerk is loading
    if (!isLoaded) {
         return <Container className="py-8 text-center">Loading...</Container>;
    }

    return (
        <Container className="py-16 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Choose Your Profile Type</CardTitle>
                    <CardDescription>
                        Select whether you are looking for fitness services or providing them.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button 
                        variant={selectedType === 'seeker' ? 'default' : 'outline'}
                        className="w-full justify-start h-auto py-4 text-left"
                        onClick={() => setSelectedType('seeker')}
                        disabled={isLoading}
                    >
                        <div className="flex flex-col">
                            <span className="font-semibold">I&apos;m a Seeker</span>
                            <span className="text-sm text-muted-foreground">I&apos;m looking for trainers, classes, or groups.</span>
                        </div>
                    </Button>
                    <Button 
                        variant={selectedType === 'provider' ? 'default' : 'outline'}
                        className="w-full justify-start h-auto py-4 text-left"
                        onClick={() => setSelectedType('provider')}
                        disabled={isLoading}
                    >
                         <div className="flex flex-col">
                            <span className="font-semibold">I&apos;m a Provider</span>
                            <span className="text-sm text-muted-foreground">I offer training, coaching, or group fitness.</span>
                        </div>
                    </Button>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={handleSelect}
                        disabled={!selectedType || isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Continue'}
                    </Button>
                </CardFooter>
            </Card>
        </Container>
    );
} 