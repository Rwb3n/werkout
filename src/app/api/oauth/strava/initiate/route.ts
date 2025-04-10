import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(/*request: Request*/) { // Comment out unused request parameter
    const { userId } = await auth(); // Get Clerk user ID

    if (!userId) {
        console.error("Clerk user ID not found.");
        return new NextResponse("Clerk user ID not found.", { status: 500 });
    }

    const stravaClientId = process.env.STRAVA_CLIENT_ID;
    const redirectUri = process.env.STRAVA_REDIRECT_URI;

    if (!stravaClientId || !redirectUri) {
        console.error("Strava environment variables (CLIENT_ID, REDIRECT_URI) not set.");
        return new NextResponse("Strava integration not configured.", { status: 500 });
    }

    const stravaAuthUrl = new URL('https://www.strava.com/oauth/authorize');
    stravaAuthUrl.searchParams.append('client_id', stravaClientId);
    stravaAuthUrl.searchParams.append('redirect_uri', redirectUri);
    stravaAuthUrl.searchParams.append('response_type', 'code');
    // Request permissions (scope). Adjust as needed based on required data.
    // read_all: view private activities, profile:read_all: view private profile data
    // activity:read_all: view private activities
    stravaAuthUrl.searchParams.append('scope', 'profile:read_all,activity:read_all');
    // 'auto' forces approval prompt, 'force' forces re-approval
    stravaAuthUrl.searchParams.append('approval_prompt', 'auto');

    // Redirect the user to Strava's authorization page
    return NextResponse.redirect(stravaAuthUrl.toString());
} 