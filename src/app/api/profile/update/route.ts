import { NextResponse } from 'next/server';
import { auth, clerkClient as clerkClientFactory } from '@clerk/nextjs/server';
import connectDb from '@/lib/db'; 
import User from '@/models/User'; 
import ProviderProfile from '@/models/ProviderProfile'; 
import SeekerProfile from '@/models/SeekerProfile'; 
import { getCoordinates } from '@/lib/geocoder'; 
import mongoose from 'mongoose';
// Import base interfaces and necessary enums
import { IUser, UserType } from '@/models/User'; 
import { ISeekerProfile, FitnessLevel } from '@/models/SeekerProfile';
import { IProviderProfile, ResponseTime } from '@/models/ProviderProfile';

// --- Define interfaces for update payloads ---
// Define IUserUpdatePayload based on fields actually updated in this route
interface IUserUpdatePayload {
  location?: {
    type: 'Point'; // Match the schema definition
    coordinates: [number, number];
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  };
  userType?: UserType;
  profileComplete?: boolean; // Add profileComplete here
  // Removed contactPreferences as it's not in the current User model
}

// Corrected field name (fitnessLevel), removed non-existent 'interests'
interface ISeekerProfileUpdatePayload extends Partial<Pick<ISeekerProfile, 'fitnessLevel' | 'goals' | 'preferences' | 'healthConditions'>> {}

// Corrected field name (yearsOfExperience), removed non-existent fields
interface IProviderProfileUpdatePayload extends Partial<Pick<IProviderProfile, 'bio' | 'specialties' | 'certifications' | 'yearsOfExperience' | 'servicesOffered' | 'availability' | 'responseTime' | 'websiteUrl'>> {}

// ---------------------------------------------

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let dbUser: IUser | null = null; // Explicitly type dbUser
  try {
    const body = await request.json();
    // Destructure all expected fields from body based on current models
    const { 
      userType, 
      // Location fields for User
      city, 
      state, 
      country,
      address,
      // Seeker fields
      fitnessLevel, // Corrected
      goals,
      preferences,
      healthConditions,
      // Provider fields
      bio,
      specialties,
      certifications,
      yearsOfExperience, // Corrected
      servicesOffered,
      availability,
      responseTime,
      websiteUrl,
    } = body;

    if (!userType || (userType !== 'seeker' && userType !== 'provider')) {
        return new NextResponse("Invalid or missing userType", { status: 400 });
    }

    // --- Step: Geocoding --- 
    let coordinates: { longitude: number; latitude: number } | null = null;
    let locationDataForUpdate: IUserUpdatePayload['location'] | undefined = undefined; // Use specific type

    if (city && state && country) {
        try {
            console.log(`Attempting to geocode: ${city}, ${state}, ${country}`);
            coordinates = await getCoordinates({ city, state, country });
            console.log(`Geocoded result:`, coordinates);
            locationDataForUpdate = {
                type: 'Point',
                coordinates: coordinates ? [coordinates.longitude, coordinates.latitude] : [0, 0],
                city: city,
                state: state,
                country: country,
                address: address || `${city}, ${state}, ${country}`
            };
        } catch (geoError) {
            console.error(`Geocoding Error for user ${clerkId} (${city}, ${state}, ${country}):`, geoError);
            locationDataForUpdate = {
                type: 'Point', 
                coordinates: [0, 0], 
                city: city, 
                state: state, 
                country: country, 
                address: address || `${city}, ${state}, ${country}` 
            }; 
            console.warn("Proceeding with placeholder coordinates due to geocoding error.");
        }
    } 
    // Decide if location is mandatory? If not, locationDataForUpdate remains undefined.
    // else {
    //     console.error(`Missing required location information (city, state, country) for user ${clerkId}.`);
    //     return new NextResponse("Missing required location information (city, state, country)", { status: 400 });
    // }

    // --- Step: Update Clerk Metadata --- 
    const publicMetadata = Object.fromEntries(
        Object.entries({ 
            userType, profileComplete: true, 
            city, state, country, address, fitnessLevel, goals, preferences, healthConditions, 
            bio, specialties, certifications, yearsOfExperience, servicesOffered, availability, responseTime, websiteUrl 
        }).filter(([/* _ */, v]) => v !== undefined)
    );
    
    // Await the Clerk client promise before accessing its methods
    const clerk = await clerkClientFactory(); 
    await clerk.users.updateUserMetadata(clerkId, { publicMetadata });
    console.log("Clerk metadata updated for user:", clerkId);

    // --- Step: Connect to DB ---
    await connectDb();
    console.log("Connected to DB for profile update.");

    // --- Step: Find or Create User in DB ---
    dbUser = await User.findOne({ clerkId: clerkId });
    let isNewUser = false;
    
    if (!dbUser) {
      isNewUser = true;
      console.log(`User ${clerkId} not found in DB. Attempting lazy creation...`);
      // Await the Clerk client promise here as well
      const clerkResolved = await clerkClientFactory();
      const clerkUser = await clerkResolved.users.getUser(clerkId);
      if (!clerkUser) throw new Error(`Failed to fetch user details from Clerk for ${clerkId}`);
      
      // Define type for email address object based on Clerk SDK (adjust if necessary)
      type ClerkEmailAddress = { id: string; emailAddress: string; }
      const primaryEmail = clerkUser.emailAddresses.find((e: ClerkEmailAddress) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
      if (!primaryEmail) throw new Error(`Primary email not found for Clerk user ${clerkId}`);
      
      dbUser = new User({
        clerkId: clerkId,
        email: primaryEmail,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        profileImageUrl: clerkUser.imageUrl || undefined,
        userType: userType as UserType, // Cast to enum
        profileComplete: false, // Will be set true after profile save
        isActive: true, 
        location: locationDataForUpdate, // Use prepared location data
      });
      await dbUser.save();
      console.log("Lazily created User in DB:", dbUser._id);
    } else {
        console.log("Found user in DB:", dbUser._id);
        // --- Step 4a: Update Existing User Document ---
        const userUpdateData: IUserUpdatePayload = {};
        if (locationDataForUpdate) userUpdateData.location = locationDataForUpdate;
        if (userType) userUpdateData.userType = userType as UserType; 
        userUpdateData.profileComplete = true; // Always mark complete on update call
        
        if (Object.keys(userUpdateData).length > 1) { // Check if more than just profileComplete is being updated
            await User.updateOne({ _id: dbUser._id }, { $set: userUpdateData });
            console.log("Updated existing User document:", dbUser._id);
        } else {
             // If only updating profileComplete status
             if (!dbUser.profileComplete) {
                 await User.updateOne({ _id: dbUser._id }, { $set: { profileComplete: true } });
                 console.log("Marked existing User profile as complete:", dbUser._id);
             }
        }
        // Reload dbUser to get updated state if needed, or assume update worked
        // dbUser = await User.findById(dbUser._id);
    }

    // Ensure dbUser has an _id before proceeding
    if (!dbUser?._id) {
        throw new Error("Failed to get User document ID after find/create.");
    }
    const userId = dbUser._id;

    // --- Step 5: Prepare Profile-Specific Data ---
    let profileSpecificData: ISeekerProfileUpdatePayload | IProviderProfileUpdatePayload = {};
    if (userType === 'seeker') {
        const seekerData: ISeekerProfileUpdatePayload = {};
        if(fitnessLevel !== undefined) seekerData.fitnessLevel = fitnessLevel as FitnessLevel;
        if(goals !== undefined) seekerData.goals = goals;
        if(preferences !== undefined) seekerData.preferences = preferences;
        if(healthConditions !== undefined) seekerData.healthConditions = healthConditions;
        profileSpecificData = seekerData;
    } else if (userType === 'provider') {
        const providerData: IProviderProfileUpdatePayload = {};
        if(bio !== undefined) providerData.bio = bio;
        if(specialties !== undefined) providerData.specialties = specialties;
        if(certifications !== undefined) providerData.certifications = certifications;
        if(yearsOfExperience !== undefined) providerData.yearsOfExperience = yearsOfExperience;
        if(servicesOffered !== undefined) providerData.servicesOffered = servicesOffered;
        if(availability !== undefined) providerData.availability = availability;
        if(responseTime !== undefined) providerData.responseTime = responseTime as ResponseTime;
        if(websiteUrl !== undefined) providerData.websiteUrl = websiteUrl;
        profileSpecificData = providerData;
    }

    // --- Step 6: Create/Update Specific Profile Document ---
    if (Object.keys(profileSpecificData).length > 0) {
      const profileUpdateOptions: mongoose.QueryOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
      if (userType === 'seeker') {
        await SeekerProfile.findOneAndUpdate(
          { userId: userId }, 
          { $set: profileSpecificData }, 
          profileUpdateOptions
        );
        console.log("Upserted SeekerProfile for user:", userId);
      } else if (userType === 'provider') {
        await ProviderProfile.findOneAndUpdate(
          { userId: userId }, 
          { $set: profileSpecificData }, 
          profileUpdateOptions
        );
        console.log("Upserted ProviderProfile for user:", userId);
      }
    }
    
    // --- Step 6b: Ensure User.profileComplete is true ---
    // This logic was complex and potentially redundant, simplifying it.
    // If we reached this point, the profile *should* be considered complete.
    const finalUserUpdate: { profileComplete: boolean; userType?: UserType } = { profileComplete: true };
    if (isNewUser && userType) { 
        finalUserUpdate.userType = userType as UserType; // Ensure userType is set for new users
    } else if (!isNewUser && dbUser && !dbUser.profileComplete && userType && dbUser.userType !== userType) {
        // If updating an existing user and changing type, make sure it's set
        finalUserUpdate.userType = userType as UserType;
    } else if (!isNewUser && dbUser && !dbUser.userType && userType) {
        // If existing user somehow didn't have type set
         finalUserUpdate.userType = userType as UserType;
    }

    // Update profileComplete and userType if necessary
    if (!dbUser.profileComplete || (finalUserUpdate.userType && dbUser.userType !== finalUserUpdate.userType) ) {
        await User.updateOne({ _id: userId }, { $set: finalUserUpdate });
        console.log(`Updated User ${userId} final status:`, finalUserUpdate);
    }
    
    // --- Step 7: Return Success Response ---
    return NextResponse.json({ success: true, message: "User profile updated successfully." });

  } catch (error) {
    console.error("Error updating user profile (API Route):", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Internal Server Error: ${errorMessage}`, { status: 500 });
  }
}