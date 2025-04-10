import { NextResponse } from 'next/server';
import { auth, clerkClient as clerkClientFactory, EmailAddress } from '@clerk/nextjs/server';
import connectDb from '@/lib/db';
import User from '@/models/User';
import ProviderProfile from '@/models/ProviderProfile';
import SeekerProfile from '@/models/SeekerProfile';
// ExternalProfile import removed as it was unused
// import ExternalProfile from '@/models/ExternalProfile'; 

export async function GET(/*request: Request*/) { // Comment out unused request parameter
  console.log("[/api/profile/me] GET request received.");
  let clerkId: string | null = null;
  try {
    // 1. Authenticate the request
    console.log("[/api/profile/me] Calling auth()...");
    const authResult = await auth(); // Use clerkId from auth()
    clerkId = authResult.userId;
    console.log(`[/api/profile/me] auth() completed. userId: ${clerkId}`);

    if (!clerkId) {
      console.log("[/api/profile/me] No userId found, returning 401.");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Connect to DB
    console.log("[/api/profile/me] Connecting to DB...");
    await connectDb();
    console.log("[/api/profile/me] DB connected.");

    // 3. Fetch user from DB using Clerk ID
    console.log(`[/api/profile/me] Querying User collection for clerkId: ${clerkId}...`);
    const user = await User.findOne({ clerkId: clerkId })
                     .populate('externalProfiles');
    console.log(`[/api/profile/me] User query completed. Found user: ${!!user}`);

    if (!user) {
      console.log(`[/api/profile/me] User ${clerkId} not found in DB. Fetching info from Clerk...`);
      // Fetch basic info from Clerk but DO NOT create DB record here
      const clerk = await clerkClientFactory();
      const clerkUser = await clerk.users.getUser(clerkId);
      
      // Return minimal info indicating profile needs completion
      console.log("[/api/profile/me] Returning minimal profile (DB user not found).");
      return NextResponse.json({
        clerkId: clerkId, // Include clerkId
        email: clerkUser.emailAddresses.find((e: EmailAddress) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || 'N/A',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileComplete: false, // Indicate profile setup is needed
        dbUserExists: false, // Explicitly state DB user doesn't exist
        externalProfiles: [] // Empty array since no DB record exists
      });
    }
    // --- User Found in DB ---
    console.log(`[/api/profile/me] Found user in DB: ${user._id}. Checking userType...`);

    // If user exists but hasn't completed profile (no userType), return base data
    if (!user.userType) {
      console.log("[/api/profile/me] User exists but profile incomplete (no userType). Returning base data.");
      const userObject = user.toObject();
      delete userObject._id; // Remove mongoose _id
      // Include populated externalProfiles 
      return NextResponse.json({ 
          ...userObject, 
          dbId: user._id, // Use dbId alias
          profileComplete: false, 
          dbUserExists: true // Indicate DB user exists but is incomplete
      }); 
    }

    // 4. Fetch specific profile based on userType
    console.log(`[/api/profile/me] UserType is ${user.userType}. Fetching specific profile...`);
    let specificProfile = null;
    if (user.userType === 'provider') {
      specificProfile = await ProviderProfile.findOne({ userId: user._id });
    } else if (user.userType === 'seeker') {
      specificProfile = await SeekerProfile.findOne({ userId: user._id });
    }
    console.log(`[/api/profile/me] Specific profile query completed. Found profile: ${!!specificProfile}`);
    
    // 5. (Optional) Fetch fresh data from Clerk if needed (e.g., profile image)
    // const clerkUser = await clerkClient.users.getUser(clerkId);
    // const profileImageUrl = clerkUser.imageUrl;

    // 6. Combine data
    // Use .lean() or .toObject() AFTER population
    const userObject = user.toObject(); 
    const specificProfileObject = specificProfile ? specificProfile.toObject() : {};
    
    const combinedProfile = {
      ...userObject,            
      ...specificProfileObject, 
      dbId: user._id, 
      profileComplete: true,
      dbUserExists: true // Indicate DB user exists and is complete
    };
    
    // Remove potentially sensitive or redundant fields before sending
    delete combinedProfile._id; // Use dbId instead
    // delete combinedProfile.__v;
    // delete combinedProfile.clerkId; // May not need to send this back

    // 7. Return response
    console.log("[/api/profile/me] Returning combined profile data.");
    return NextResponse.json(combinedProfile);

  } catch (error) {
    console.error(`[/api/profile/me] Error fetching user profile (userId: ${clerkId}):`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 