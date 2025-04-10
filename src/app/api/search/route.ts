import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDb from '@/lib/db';
import User from '@/models/User';
// We might need ProviderProfile later to populate results
import ProviderProfile from '@/models/ProviderProfile'; 
// import { getCoordinates } from '@/lib/geocoder';
import mongoose, { PipelineStage } from 'mongoose'; // Import PipelineStage

// Define interfaces for clarity
interface AggregationPipelineStage {
  [key: string]: any; // Define stage structure more specifically if possible
}

interface LocationFilter {
  $geoWithin?: { $centerSphere: [[number, number], number] };
}

interface UserQuery {
  userType: string;
  location?: LocationFilter;
  isActive: boolean;
}

interface ProviderProfileQuery {
  specialties?: { $in: string[] };
  providerType?: { $in: string[] };
}

// Define interface for the shape after projection
interface ProjectedProviderResult {
  _id: any; // or specific type like mongoose.Types.ObjectId
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: any; // Define more specific location type if needed
  userType?: string;
  distance: number; // In meters from $geoNear
  bio?: string;
  specialties?: string[];
  experience?: number;
  providerType?: string;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius'); // Radius in miles
  const specialtiesParam = searchParams.get('specialties'); // Comma-separated string
  const providerTypesParam = searchParams.get('providerTypes'); // Comma-separated string
  const pageParam = searchParams.get('page') || '1';
  const limitParam = searchParams.get('limit') || '10';

  // Basic input validation
  if (!lat || !lng || !radius) {
    return new NextResponse("Missing latitude, longitude, or radius parameters", { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusMiles = parseFloat(radius);
  const page = parseInt(pageParam, 10);
  const limit = parseInt(limitParam, 10);

  if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMiles) || isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    return new NextResponse("Invalid numeric parameters for lat, lng, radius, page, or limit", { status: 400 });
  }

  // Convert radius from miles to radians for MongoDB $centerSphere
  const radiusRadians = radiusMiles / 3963.2; // Earth's radius in miles approx

  try {
    await connectDb();

    // --- Build Aggregation Pipeline --- 

    // 1. Initial Match (User collection)
    const initialMatchStage: PipelineStage.Match = { // Use PipelineStage.Match
      $match: {
        userType: 'provider',
        isActive: true,
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radiusRadians]
          }
        }
      }
    };

    const pipeline: PipelineStage[] = [initialMatchStage]; // Use Mongoose PipelineStage[]

    // 2. Lookup ProviderProfile
    const lookupStage: PipelineStage.Lookup = { // Use PipelineStage.Lookup
      $lookup: {
        from: 'providerprofiles', 
        localField: '_id', 
        foreignField: 'userId', 
        as: 'providerProfileInfo'
      }
    };
    pipeline.push(lookupStage);

    // 3. Unwind the providerProfileInfo array
    const unwindStage: PipelineStage.Unwind = { $unwind: '$providerProfileInfo' }; // Use PipelineStage.Unwind
    pipeline.push(unwindStage);

    // 4. Match based on ProviderProfile filters
    const profileMatchFilter: Record<string, any> = {}; // Build the filter object
    if (specialtiesParam) {
      profileMatchFilter['providerProfileInfo.specialties'] = { $in: specialtiesParam.split(',').map(s => s.trim()) };
    }
    if (providerTypesParam) {
      profileMatchFilter['providerProfileInfo.providerType'] = { $in: providerTypesParam.split(',').map(t => t.trim()) };
    }
    
    if (Object.keys(profileMatchFilter).length > 0) {
        const profileMatchStage: PipelineStage.Match = { $match: profileMatchFilter }; // Use PipelineStage.Match
        pipeline.push(profileMatchStage);
    }

    // 5. Projection
    const projectStage: PipelineStage.Project = { // Use PipelineStage.Project
      $project: {
        _id: 0, 
        userId: '$_id', 
        clerkId: 1,
        firstName: 1,
        lastName: 1,
        email: 1, 
        location: {
          city: '$location.city',
          state: '$location.state'
        },
        providerProfile: {
          bio: '$providerProfileInfo.bio',
          specialties: '$providerProfileInfo.specialties',
          providerType: '$providerProfileInfo.providerType',
          experience: '$providerProfileInfo.experience'
        }
      }
    };
    pipeline.push(projectStage);

    // 6. Pagination
    const skip = (page - 1) * limit;
    const skipStage: PipelineStage.Skip = { $skip: skip }; // Use PipelineStage.Skip
    const limitStage: PipelineStage.Limit = { $limit: limit }; // Use PipelineStage.Limit
    pipeline.push(skipStage);
    pipeline.push(limitStage);

    // --- Execute Pipeline --- 
    console.log("Executing aggregation pipeline:", JSON.stringify(pipeline, null, 2));
    const results = await User.aggregate(pipeline).exec(); // Add .exec()

    // --- Get total count --- 
    const countPipeline = pipeline.slice(0, -2); // Remove $skip and $limit
    const countStage: PipelineStage.Count = { $count: 'totalCount' }; // Use PipelineStage.Count
    countPipeline.push(countStage);
    console.log("Executing count pipeline:", JSON.stringify(countPipeline, null, 2));
    const countResult = await User.aggregate(countPipeline).exec(); // Add .exec()
    const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

    return NextResponse.json({
      data: results,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error during provider search:", error);
    const typedError = error as Error;
    return new NextResponse(typedError.message || "Internal Server Error", { status: 500 });
  }
} 