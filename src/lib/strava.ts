import ExternalProfile, { IExternalProfile } from '@/models/ExternalProfile';
import connectDb from '@/lib/db';

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

/**
 * Refreshes an expired or expiring Strava access token using the refresh token.
 * Updates the ExternalProfile document in the database with the new token info.
 *
 * @param externalProfile - The ExternalProfile document (Mongoose document instance or plain object with necessary fields).
 * @returns The updated ExternalProfile document if successful, otherwise null.
 * @throws Error if configuration is missing or Strava API returns an error.
 */
export const refreshStravaToken = async (
  externalProfile: Pick<IExternalProfile, 'platform' | 'refreshToken' | 'userId' | '_id'>
): Promise<IExternalProfile | null> => {

  if (externalProfile.platform !== 'strava' || !externalProfile.refreshToken) {
    console.error('Invalid profile provided for Strava token refresh.');
    return null;
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Strava environment variables (CLIENT_ID, CLIENT_SECRET) not set for token refresh.");
  }

  console.log(`Attempting to refresh Strava token for user ${externalProfile.userId}...`);

  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: externalProfile.refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Strava token refresh failed:", errorData);
      // Handle specific errors, e.g., invalid refresh token might require re-authentication
      if (response.status === 400 || response.status === 401) {
        // Potentially mark the profile as inactive or requiring re-auth
        await connectDb();
        await ExternalProfile.updateOne({ _id: externalProfile._id }, { $set: { isActive: false, refreshToken: null, accessToken: null } });
        console.warn(`Marked Strava profile ${externalProfile._id} as inactive due to refresh failure.`);
        return null; 
      }
      throw new Error(`Strava API error during refresh: ${errorData.message || 'Refresh failed'}`);
    }

    const tokenData = await response.json();

    const { 
        access_token: newAccessToken,
        refresh_token: newRefreshToken, // Strava might return a new refresh token
        expires_at: newExpiresAtTimestamp 
    } = tokenData;

     if (!newAccessToken || !newRefreshToken || !newExpiresAtTimestamp) {
        throw new Error('Incomplete token data received from Strava during refresh.');
    }

    // Convert expires_at to Date object
    const newTokenExpiry = new Date(newExpiresAtTimestamp * 1000);

    // TODO: Encrypt newAccessToken and newRefreshToken before saving
    const encryptedNewAccessToken = newAccessToken; // Placeholder
    const encryptedNewRefreshToken = newRefreshToken; // Placeholder

    // Update the ExternalProfile in the database
    await connectDb();
    const updatedProfile = await ExternalProfile.findByIdAndUpdate(
      externalProfile._id,
      {
        $set: {
          accessToken: encryptedNewAccessToken,
          refreshToken: encryptedNewRefreshToken,
          tokenExpiry: newTokenExpiry,
          isActive: true, // Ensure it's marked active if refresh succeeds
          // Optionally update lastSyncedAt or add a lastRefreshedAt field
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedProfile) {
        throw new Error(`Failed to find and update ExternalProfile ${externalProfile._id} after token refresh.`);
    }

    console.log(`Successfully refreshed Strava token for user ${externalProfile.userId}. New expiry: ${newTokenExpiry}`);
    return updatedProfile;

  } catch (error) {
    console.error("Error during Strava token refresh process:", error);
    // Depending on the error, you might want to retry or mark as inactive
    return null; 
  }
}; 

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

// Define a basic structure for Strava activity data (add more fields as needed)
interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  type: string; // e.g., Run, Ride
  start_date: string; // ISO 8601
  start_date_local: string; // ISO 8601
  timezone: string;
  start_latlng: [number, number] | null;
  end_latlng: [number, number] | null;
  map: {
    id: string;
    summary_polyline: string | null;
    resource_state: number;
  };
  // ... add other relevant fields
}

/**
 * Fetches recent activities for a user from the Strava API.
 * Handles token expiry and attempts to refresh the token if necessary.
 *
 * @param externalProfile - The ExternalProfile document containing Strava credentials.
 * @param options - Optional parameters like `limit`, `before`, `after`.
 * @returns A promise resolving to an array of Strava activities or null if fetching fails.
 */
export const getStravaActivities = async (
  externalProfile: IExternalProfile, // Pass the full document now
  options: { limit?: number; before?: number; after?: number } = {}
): Promise<StravaActivity[] | null> => {

  if (externalProfile.platform !== 'strava' || !externalProfile.accessToken) {
    console.error('Invalid profile provided for fetching Strava activities.');
    return null;
  }

  let currentAccessToken = externalProfile.accessToken;
  let profileToUse: IExternalProfile | null = externalProfile;

  // Check if token is expired or close to expiring (e.g., within 1 hour)
  const oneHourFromNow = new Date();
  oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

  if (!externalProfile.tokenExpiry || externalProfile.tokenExpiry <= oneHourFromNow) {
    console.log(`Strava token for user ${externalProfile.userId} expired or expiring soon. Attempting refresh...`);
    const refreshedProfile = await refreshStravaToken(externalProfile);
    if (!refreshedProfile || !refreshedProfile.accessToken) {
      console.error(`Failed to refresh Strava token for user ${externalProfile.userId}. Cannot fetch activities.`);
      // Profile might have been marked inactive by refreshStravaToken
      return null;
    }
    currentAccessToken = refreshedProfile.accessToken;
    profileToUse = refreshedProfile; // Use the potentially updated profile
    console.log(`Token refreshed. Proceeding to fetch activities for user ${externalProfile.userId}.`);
  } else {
      console.log(`Strava token for user ${externalProfile.userId} is valid. Proceeding to fetch activities.`);
  }

  // Construct API URL
  const apiUrl = new URL(`${STRAVA_API_BASE}/athlete/activities`);
  apiUrl.searchParams.append('per_page', (options.limit || 30).toString()); // Default to 30 activities
  if (options.before) apiUrl.searchParams.append('before', options.before.toString());
  if (options.after) apiUrl.searchParams.append('after', options.after.toString());

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    });

    if (!response.ok) {
      // If unauthorized, maybe the refreshed token was still bad? Or scope issues?
      if (response.status === 401) {
          console.error(`Strava API unauthorized (401) fetching activities for user ${externalProfile.userId}. Token might be invalid or scope insufficient.`);
          // Potentially try another refresh or mark as inactive
          if (profileToUse) { // Check if profile exists
             await ExternalProfile.updateOne({ _id: profileToUse._id }, { $set: { isActive: false } });
             console.warn(`Marked Strava profile ${profileToUse._id} as inactive due to 401 on activity fetch.`);
          }
          return null;
      }
      const errorData = await response.json();
      console.error("Strava API error fetching activities:", errorData);
      throw new Error(`Strava API error: ${errorData.message || 'Failed to fetch activities'}`);
    }

    const activities: StravaActivity[] = await response.json();
    console.log(`Fetched ${activities.length} activities for user ${externalProfile.userId}.`);
    
    // Optionally update lastSyncedAt on the profile document here if needed
    // await ExternalProfile.updateOne({ _id: profileToUse._id }, { $set: { lastSyncedAt: new Date() } });

    return activities;

  } catch (error) {
    console.error(`Error fetching Strava activities for user ${externalProfile.userId}:`, error);
    return null;
  }
}; 