'use client';

import React from 'react';
import { Container } from '@/components/layout/Container';
import useSWR from 'swr';
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

// Re-use the fetcher function
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    return res.text().then(text => { 
        throw new Error(text || 'Failed to fetch provider data.') 
    });
  }
  return res.json();
});

// Define expected profile shape (based on API projection)
// TODO: Keep this in sync with the API response
interface PublicProviderProfile {
    dbId: string;
    firstName?: string;
    lastName?: string;
    location?: { city?: string; state?: string; country?: string; };
    userType?: 'provider'; // Should always be provider
    bio?: string;
    specialties?: string[];
    experience?: number;
    credentials?: { title: string; organization: string; year?: number; }[];
    services?: { title: string; description: string; type?: string; }[];
    languages?: string[];
    responseTime?: string;
    providerType?: string;
    verificationStatus?: string;
}

interface ProviderProfilePageProps {
  params: { providerId: string; };
}

export default function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  const { providerId } = params;
  const apiUrl = providerId ? `/api/providers/${providerId}` : null;

  const { data: profile, error, isLoading } = useSWR<PublicProviderProfile>(apiUrl, fetcher);

  return (
    <Container className="py-8">
      {/* Loading State */}
      {isLoading && (
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3 mb-2" /></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
           {/* Add more skeleton loaders as needed */}
        </div>
      )}

      {/* Error State */}
      {error && (
         <div className="max-w-2xl mx-auto bg-destructive/10 border border-destructive text-destructive p-4 rounded">
           <h2 className="font-semibold mb-2">Error Loading Profile</h2>
           <p>{error.message || "Could not load provider profile."}</p>
         </div>
      )}

      {/* Success State */}
      {!isLoading && !error && profile && (
        <div className="max-w-2xl mx-auto">
          {/* Basic Info Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{profile.firstName || 'Provider'} {profile.lastName || ''}</h1>
            {profile.providerType && (
                <p className="text-lg text-muted-foreground capitalize">
                    {profile.providerType.replace('_',' ')}
                    {profile.verificationStatus === 'verified' && <Badge variant="default" className="ml-2 text-xs">Verified</Badge>}
                </p>
            )}
            {profile.location && (
                <p className="text-sm text-muted-foreground mt-1">
                    {profile.location.city}, {profile.location.state}
                </p>
            )}
          </div>
          
          {/* Profile Details Card */}
          <Card>
            {/* Bio Section */}
            {profile.bio && (
                 <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-2">About</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                 </CardContent>
            )}

            {/* Specialties Section */}
            {profile.specialties && profile.specialties.length > 0 && (
                <CardContent className="pt-4 border-t">
                    <h2 className="text-xl font-semibold mb-3">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((spec, index) => (
                            <Badge key={index} variant="secondary">{spec}</Badge>
                        ))}
                    </div>
                </CardContent>
            )}

            {/* Services Section (Optional) */}
            {profile.services && profile.services.length > 0 && (
                <CardContent className="pt-4 border-t">
                    <h2 className="text-xl font-semibold mb-3">Services</h2>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {profile.services.map((service, index) => (
                             <li key={index}>{service.title}{service.type ? ` (${service.type})` : ''}</li>
                        ))}
                    </ul>
                </CardContent>
            )}
            
            {/* Credentials Section (Optional) */}
            {profile.credentials && profile.credentials.length > 0 && (
                 <CardContent className="pt-4 border-t">
                    <h2 className="text-xl font-semibold mb-3">Credentials</h2>
                     <ul className="list-none space-y-1 text-muted-foreground">
                        {profile.credentials.map((cred, index) => (
                             <li key={index}>{cred.title} - {cred.organization}{cred.year ? ` (${cred.year})` : ''}</li>
                        ))}
                    </ul>
                 </CardContent>
            )}
            
            {/* Add more sections for experience, languages etc. if desired */}
          </Card>
        </div>
      )}

      {/* Handle case where profile is null after loading (e.g., 404) */}
      {!isLoading && !error && !profile && (
         <div className="max-w-2xl mx-auto text-center text-muted-foreground">
            <p>Provider profile not found.</p>
         </div>
      )}

    </Container>
  );
}

// Optional: Add generateStaticParams if needed for SSG, but likely SSR/ISR is better here
// export async function generateStaticParams() {
//   // Fetch a list of provider IDs
//   return [{ providerId: '...' }, { providerId: '...' }];
// } 