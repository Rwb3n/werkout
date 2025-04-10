import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDb from '@/lib/db';
import User from '@/models/User';
import Connection from '@/models/Connection';
import mongoose from 'mongoose';

/**
 * GET /api/connections
 * Retrieves connections for the currently logged-in user.
 */
export async function GET(request: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await connectDb();
    const dbUser = await User.findOne({ clerkId: clerkId });

    if (!dbUser) {
      console.error(`Get connections error: User with clerkId ${clerkId} not found in DB.`);
      return new NextResponse("User not found", { status: 404 });
    }

    // Find connections where the user is either the seeker or the provider
    const connections = await Connection.find({
      $or: [{ seekerId: dbUser._id }, { providerId: dbUser._id }],
    })
    .populate('seekerId', 'firstName lastName email userType') // Populate seeker details
    .populate('providerId', 'firstName lastName email userType') // Populate provider details
    .sort({ createdAt: -1 }); // Sort by most recent

    return NextResponse.json(connections);

  } catch (error) {
    console.error("Error fetching connections:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * POST /api/connections
 * Initiates a new connection request.
 */
export async function POST(request: Request) {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { targetUserId, message } = body;

        if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
             return new NextResponse("Missing or invalid targetUserId", { status: 400 });
        }

        await connectDb();
        const initiatorUser = await User.findOne({ clerkId: clerkId });
        const targetUser = await User.findById(targetUserId);

        if (!initiatorUser) {
            console.error(`Initiate connection error: Initiator with clerkId ${clerkId} not found in DB.`);
            return new NextResponse("Initiator user not found", { status: 404 });
        }
        if (!targetUser) {
            return new NextResponse("Target user not found", { status: 404 });
        }

        // Prevent connecting to self
        if (initiatorUser._id.equals(targetUser._id)) {
            return new NextResponse("Cannot connect with yourself", { status: 400 });
        }

        // Determine seeker and provider IDs based on user types
        let seekerId, providerId;
        if (initiatorUser.userType === 'seeker' && targetUser.userType === 'provider') {
            seekerId = initiatorUser._id;
            providerId = targetUser._id;
        } else if (initiatorUser.userType === 'provider' && targetUser.userType === 'seeker') {
            // Allow provider to initiate? Or enforce seeker-initiates? For now, allow.
            seekerId = targetUser._id;
            providerId = initiatorUser._id;
        } else {
            return new NextResponse("Connection must be between a Seeker and a Provider", { status: 400 });
        }

        // Check if a connection already exists (pending or otherwise)
        const existingConnection = await Connection.findOne({ seekerId, providerId });
        if (existingConnection) {
             return new NextResponse(`Connection already exists with status: ${existingConnection.status}`, { status: 409 }); // Conflict
        }

        // Create the new connection request
        const newConnection = new Connection({
            seekerId,
            providerId,
            status: 'pending', // Default status
            initiatedBy: initiatorUser.userType,
            message: message || undefined // Optional message
        });

        await newConnection.save();

        return NextResponse.json({ success: true, connection: newConnection }, { status: 201 });

    } catch (error) {
        console.error("Error initiating connection:", error);
        // Handle potential duplicate key error from the unique index
        if (error instanceof Error && (error as any).code === 11000) {
            return new NextResponse("Connection already exists", { status: 409 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 