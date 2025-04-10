import { NextResponse } from 'next/server';
// Rename clerkClient import again to indicate it's a factory function
import { auth, clerkClient as clerkClientFactory } from '@clerk/nextjs/server';
import connectDb from '@/lib/db'; // Import DB connection utility
import User from '@/models/User'; // Import User model
import ProviderProfile from '@/models/ProviderProfile'; // Import ProviderProfile model
import SeekerProfile from '@/models/SeekerProfile'; // Import SeekerProfile model
import { getCoordinates } from '@/lib/geocoder'; // Import geocoding utility

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let dbUser;
  try {
    const body = await request.json();
    // Destructure carefully based on expected wizard data
    const { 
      userType, 
      // User fields
      city, 
      state, 
      country,
      contactEmail,
      contactWhatsapp,
      contactPhone,
      // Seeker fields
      level,
      goals,
      interests,
      // Provider fields
      bio,
      specialties,
      experience,
      languages,
      responseTime,
      providerType,
      credentials,
      services 
    } = body;

    if (!userType) {
        return new NextResponse("Missing userType", { status: 400 });
    }

    // --- Step 2.3.1 - Geocoding --- 
    let coordinates = null;
    if (city && state && country) {
        try {
            console.log(`Attempting to geocode: ${city}, ${state}, ${country}`);
            coordinates = await getCoordinates({ city, state, country });
            if (coordinates) {
                console.log(`Geocoded location for ${clerkId}:`, coordinates);
            } else {
                // This case might happen if geocoder returns null/undefined without error
                console.warn(`Geocoder returned no coordinates for: ${city}, ${state}, ${country}. Using placeholder.`);
            }
        } catch (geoError) {
            // Log the specific geocoding error but allow execution to continue
            console.error(`Geocoding Error for user ${clerkId} (${city}, ${state}, ${country}):`, geoError);
            console.warn("Proceeding with placeholder coordinates due to geocoding error.");
            coordinates = null; // Ensure coordinates are null if error occurred
        }
    }

    // Ensure location data structure is always present, even if geocoding fails
    let locationData = null;
    if (city && state && country) {
        locationData = {
            city,
            state,
            country,
            coordinates: {
                type: 'Point',
                coordinates: coordinates ? [coordinates.longitude, coordinates.latitude] : [0, 0] // Use geocoded or placeholder
            }
        };
    } else {
        // If location is strictly required after wizard, return error
        console.error(`Missing location information for user ${clerkId}.`);
        return new NextResponse("Missing location information (city, state, country)", { status: 400 });
    }

    // --- Step 1: Update Clerk Metadata (as before) ---
    const metadataPayload = { userType, profileComplete: true, ...body }; 
    // Exclude userType from being spread again if already included
    delete metadataPayload.userType;
    
    // Call the factory function to get the actual client instance
    const clerk = await clerkClientFactory(); 
    
    // Use the obtained client instance
    await clerk.users.updateUserMetadata(clerkId, {
      publicMetadata: metadataPayload
    });
    console.log("Clerk metadata updated for user:", clerkId);

    // --- Step 2: Connect to DB ---
    await connectDb();
    console.log("Connected to DB for profile update.");

    // --- Step 3: Find or Create User in DB (Lazy Creation - Step 2.2.3) ---
    dbUser = await User.findOne({ clerkId: clerkId });
    
    if (!dbUser) {
      console.log(`User ${clerkId} not found in DB. Attempting lazy creation...`);
      // Fetch user details from Clerk to get email, name
      const clerkUser = await clerk.users.getUser(clerkId);
      if (!clerkUser || !clerkUser.emailAddresses.length) {
        throw new Error(`Failed to fetch user details from Clerk for ${clerkId}`);
      }
      const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
      if (!primaryEmail) {
        throw new Error(`Primary email not found for Clerk user ${clerkId}`);
      }
      
      // Create the base User document
      dbUser = new User({
        clerkId: clerkId,
        email: primaryEmail,
        firstName: clerkUser.firstName || '', // Use Clerk data or default
        lastName: clerkUser.lastName || '',
        userType: userType, // From request body
        location: locationData, // From request body (with placeholder coords)
        contactPreferences: { // From request body
          email: contactEmail === true,
          whatsapp: contactWhatsapp === true,
          phone: contactPhone === true,
        },
        isActive: true, // Default to active
      });
      await dbUser.save();
      console.log("Lazily created User in DB:", dbUser._id);
    } else {
        console.log("Found user in DB:", dbUser._id);
        // --- Step 4a: Update Existing User Document ---
        const userUpdateData: any = {
            location: locationData, // Update location
            contactPreferences: { // Update contact prefs
                email: contactEmail === true,
                whatsapp: contactWhatsapp === true,
                phone: contactPhone === true,
            },
            userType: userType // Ensure userType is set/updated
        };
        await User.updateOne({ _id: dbUser._id }, { $set: userUpdateData });
        console.log("Updated existing User document:", dbUser._id);
    }

    // --- Step 5: Prepare Profile-Specific Data ---
    const profileSpecificData: any = {};
    if (userType === 'seeker') {
        if(level) profileSpecificData.level = level;
        if(goals) profileSpecificData.goals = goals;
        if(interests) profileSpecificData.interests = interests;
    } else if (userType === 'provider') {
        if(bio) profileSpecificData.bio = bio;
        if(specialties) profileSpecificData.specialties = specialties;
        if(experience !== undefined) profileSpecificData.experience = experience;
        if(languages) profileSpecificData.languages = languages;
        if(responseTime) profileSpecificData.responseTime = responseTime;
        if(providerType) profileSpecificData.providerType = providerType;
        if(credentials) profileSpecificData.credentials = credentials;
        if(services) profileSpecificData.services = services;
    }

    // --- Step 6: Create/Update Specific Profile Document ---
    if (Object.keys(profileSpecificData).length > 0) {
      const profileUpdateOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
      if (userType === 'seeker') {
        await SeekerProfile.findOneAndUpdate(
          { userId: dbUser._id }, 
          { $set: profileSpecificData }, 
          profileUpdateOptions
        );
        console.log("Upserted SeekerProfile for user:", dbUser._id);
      } else if (userType === 'provider') {
        await ProviderProfile.findOneAndUpdate(
          { userId: dbUser._id }, 
          { $set: profileSpecificData }, 
          profileUpdateOptions
        );
        console.log("Upserted ProviderProfile for user:", dbUser._id);
      }
    }

    // --- Step 7: Return Success Response ---
    return NextResponse.json({ success: true, message: "User profile updated successfully (Clerk & DB)." });

  } catch (error) {
    console.error("Error updating user profile (API Route):", error);
    // Ensure response is sent even if dbUser was fetched before error
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 