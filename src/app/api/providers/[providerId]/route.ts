import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/models/User';
import ProviderProfile from '@/models/ProviderProfile';
import mongoose from 'mongoose'; // Import mongoose to validate ObjectId

interface RouteParams {
  params: { 
    providerId: string 
  }
}

// Note: No auth() check here, this is a public endpoint
export async function GET(request: Request, { params }: RouteParams ) {
  const { providerId } = params;

  // Validate the providerId format
  if (!mongoose.Types.ObjectId.isValid(providerId)) {
    return new NextResponse("Invalid Provider ID format", { status: 400 });
  }

  try {
    await connectDb();

    // Use aggregation to fetch User and lookup ProviderProfile in one go
    const results = await User.aggregate([
      {
        // Match the specific User by _id
        $match: { 
          _id: new mongoose.Types.ObjectId(providerId), 
          userType: 'provider', // Ensure it's a provider
          isActive: true // Optional: Only show active users
        }
      },
      {
        // Limit to 1 result (should be unique by _id anyway)
        $limit: 1
      },
      {
        // Lookup ProviderProfile
        $lookup: {
          from: ProviderProfile.collection.name,
          localField: "_id",
          foreignField: "userId",
          as: "providerDetails"
        }
      },
      {
        // Unwind the providerDetails array
        $unwind: { path: "$providerDetails", preserveNullAndEmptyArrays: true } // Allow providers who haven't finished profile yet
      }, 
      {
        // Project the desired public fields
        $project: {
          // Exclude sensitive/internal fields
          _id: 0, // Exclude default _id, use providerId from URL if needed frontend
          clerkId: 0,
          email: 0, // Exclude email for public view
          contactPreferences: 0,
          isActive: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          "providerDetails._id": 0,
          "providerDetails.userId": 0,
          "providerDetails.createdAt": 0,
          "providerDetails.updatedAt": 0,
          "providerDetails.__v": 0,
          // Include public-safe fields
          dbId: "$_id", // Send the DB ID as dbId
          firstName: 1,
          lastName: 1,
          location: 1, // Contains city, state, country (coords are auto-excluded by $project if not specified)
          userType: 1,
          // Include fields from providerDetails
          bio: "$providerDetails.bio",
          specialties: "$providerDetails.specialties",
          experience: "$providerDetails.experience",
          credentials: "$providerDetails.credentials",
          services: "$providerDetails.services",
          languages: "$providerDetails.languages",
          responseTime: "$providerDetails.responseTime",
          providerType: "$providerDetails.providerType",
          verificationStatus: "$providerDetails.verificationStatus", // Maybe only show 'verified'?
        }
      }
    ]);

    // Check if a provider was found
    if (results.length === 0) {
      return new NextResponse("Provider not found or not active", { status: 404 });
    }

    const providerProfile = results[0];

    // Return the combined profile data
    return NextResponse.json(providerProfile);

  } catch (error) {
    console.error(`Error fetching provider profile (${providerId}):`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 