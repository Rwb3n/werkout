import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDb from '@/lib/db';
import User from '@/models/User';
import ExternalProfile from '@/models/ExternalProfile';

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

export async function GET(request: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    console.error("Strava callback error: User not authenticated.");
    // Redirect to login or an error page
    return NextResponse.redirect(new URL('/sign-in?error=unauthorized', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const scope = searchParams.get('scope');

  // Handle authorization denial or other errors from Strava
  if (error) {
    console.error(`Strava OAuth error: ${error}`);
    return NextResponse.redirect(new URL('/dashboard?error=strava_auth_failed', request.url));
  }

  if (!code) {
    console.error("Strava callback error: No authorization code received.");
    return NextResponse.redirect(new URL('/dashboard?error=strava_missing_code', request.url));
  }

  // Check if the required scope was granted (adjust required scope string as needed)
  const requiredScope = 'profile:read_all,activity:read_all';
  if (!scope || !scope.split(',').every(s => requiredScope.includes(s))) {
      console.error(`Strava callback error: Required scope not granted. Granted: ${scope}`);
      return NextResponse.redirect(new URL('/dashboard?error=strava_scope_mismatch', request.url));
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Strava environment variables (CLIENT_ID, CLIENT_SECRET) not set.");
    return NextResponse.redirect(new URL('/dashboard?error=strava_config_error', request.url));
  }

  try {
    // --- Step 4.2.1.3: Exchange code for tokens ---
    const tokenResponse = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Strava token exchange failed:", errorData);
      throw new Error(`Strava API error: ${errorData.message || 'Token exchange failed'}`);
    }

    const tokenData = await tokenResponse.json();

    // Extract necessary data
    const { 
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAtTimestamp, // Unix timestamp (seconds)
        athlete // Contains basic athlete info
     } = tokenData;

    if (!accessToken || !refreshToken || !expiresAtTimestamp || !athlete) {
        throw new Error('Incomplete token data received from Strava.');
    }

    // Convert expires_at to Date object (timestamp is in seconds)
    const tokenExpiry = new Date(expiresAtTimestamp * 1000);

    // --- Step 4.2.1.4 & 4.2.1.5: Store connection details in DB ---
    await connectDb();
    const dbUser = await User.findOne({ clerkId: clerkId });

    if (!dbUser) {
      // This shouldn't happen if the user is logged in and exists in Clerk,
      // but handle it defensively. Might indicate an issue with lazy user creation.
      console.error(`Strava callback error: User with clerkId ${clerkId} not found in DB.`);
      return NextResponse.redirect(new URL('/dashboard?error=user_not_found', request.url));
    }

    // TODO: Encrypt accessToken and refreshToken before saving
    const encryptedAccessToken = accessToken; // Placeholder
    const encryptedRefreshToken = refreshToken; // Placeholder

    const externalProfileData = {
      userId: dbUser._id,
      platform: 'strava',
      username: athlete.username || `strava_${athlete.id}`, // Use username or fallback
      profileUrl: `https://www.strava.com/athletes/${athlete.id}`,
      accessToken: encryptedAccessToken, 
      refreshToken: encryptedRefreshToken,
      tokenExpiry: tokenExpiry,
      lastSyncedAt: new Date(), // Mark initial sync time
      isActive: true,
      metadata: { // Store raw athlete data if needed
        stravaId: athlete.id,
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        profileImage: athlete.profile,
        city: athlete.city,
        state: athlete.state,
        country: athlete.country
      }
    };

    // Upsert the profile based on userId and platform
    await ExternalProfile.findOneAndUpdate(
      { userId: dbUser._id, platform: 'strava' },
      externalProfileData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Successfully connected Strava for user ${clerkId} (DB ID: ${dbUser._id})`);

    // Redirect to a success page or dashboard
    return NextResponse.redirect(new URL('/dashboard?success=strava_connected', request.url));

  } catch (error) {
    console.error("Error during Strava OAuth callback processing:", error);
    return NextResponse.redirect(new URL('/dashboard?error=strava_callback_failed', request.url));
  }
} 