import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/models/User';
// We might need ProviderProfile later to populate results
import ProviderProfile from '@/models/ProviderProfile'; 
import { getCoordinates } from '@/lib/geocoder';

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
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  // Radius in miles, default to 10 miles
  const radius = searchParams.get('radius') || '10'; 
  const specialtiesParam = searchParams.get('specialties');
  const providerTypeParam = searchParams.get('providerType');
  const pageParam = searchParams.get('page') || '1';
  const limitParam = searchParams.get('limit') || '10'; // Default limit

  if (!lat || !lng) {
    return new NextResponse("Missing latitude or longitude parameters", { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const searchRadiusMiles = parseFloat(radius);

  // Parse pagination params
  const page = parseInt(pageParam, 10);
  const limit = parseInt(limitParam, 10);
  const skip = (page - 1) * limit;

  if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadiusMiles) || isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return new NextResponse("Invalid latitude, longitude, radius, page, or limit", { status: 400 });
  }

  // Convert radius from miles to meters for MongoDB ($geoNear uses meters)
  const radiusInMeters = searchRadiusMiles * 1609.34;

  // Prepare filter stages
  const filterMatchStage: any = {};
  if (specialtiesParam) {
    const specialtiesArray = specialtiesParam.split(',').map(s => s.trim()).filter(s => s);
    if(specialtiesArray.length > 0) {
        filterMatchStage['providerDetails.specialties'] = { $in: specialtiesArray };
    }
  }
  if (providerTypeParam) {
    const providerTypeArray = providerTypeParam.split(',').map(s => s.trim()).filter(s => s);
     if(providerTypeArray.length > 0) {
        filterMatchStage['providerDetails.providerType'] = { $in: providerTypeArray };
     }
  }

  try {
    await connectDb();

    // Build the base pipeline stages (before pagination and projection)
    const basePipeline: any[] = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: radiusInMeters,
          query: { userType: 'provider', isActive: true },
          spherical: true
        }
      },
      {
        $lookup: {
          from: ProviderProfile.collection.name,
          localField: "_id",
          foreignField: "userId",
          as: "providerDetails"
        }
      },
      {
        $unwind: { path: "$providerDetails", preserveNullAndEmptyArrays: true }
      }
    ];

    // Conditionally add the filter $match stage
    if (Object.keys(filterMatchStage).length > 0) {
      basePipeline.push({ $match: filterMatchStage });
    }

    // Use $facet to get paginated results and total count in one query
    const aggregationResult = await User.aggregate([
      ...basePipeline,
      {
        $facet: {
          // Branch 1: Get total count matching the filters
          metadata: [
            { $count: 'total' }
          ],
          // Branch 2: Get the actual paginated data
          data: [
            { $sort: { distance: 1 } }, // Sort before skip/limit
            { $skip: skip },
            { $limit: limit },
            { // Project fields for the final results
              $project: {
                clerkId: 0, contactPreferences: 0, isActive: 0,
                createdAt: 0, updatedAt: 0, __v: 0,
                _id: 1, firstName: 1, lastName: 1, email: 1, 
                location: 1, userType: 1, distance: 1,
                bio: "$providerDetails.bio",
                specialties: "$providerDetails.specialties",
                experience: "$providerDetails.experience",
                providerType: "$providerDetails.providerType",
              }
            }
          ]
        }
      }
    ]);

    // Type the results based on the $project stage
    const results: ProjectedProviderResult[] = aggregationResult[0].data;
    const totalDocuments = aggregationResult[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalDocuments / limit);

    // Convert distance from meters back to miles for frontend display
    const resultsWithMiles = results.map(p => ({
      ...p,
      distanceMiles: parseFloat((p.distance / 1609.34).toFixed(2))
    }));

    // Return paginated results and metadata
    return NextResponse.json({
        results: resultsWithMiles,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalDocuments,
            limit: limit
        }
    });

  } catch (error) {
    console.error("Error performing provider search:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 