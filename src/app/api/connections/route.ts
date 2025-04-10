import { NextResponse } from 'next/server';
import { auth, clerkClient as clerkClientFactory } from '@clerk/nextjs/server';
import connectDb from '@/lib/db';
import User from '@/models/User';
import Connection from '@/models/Connection';
import mongoose from 'mongoose';

/**
 * GET /api/connections
 * Retrieves connections for the currently logged-in user.
 */
export async function GET(/*_request: Request*/) { // Keep request commented out if unused
    const { userId } = await auth();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // Placeholder logic: Return empty array
        // In a real implementation: Find User by clerkId, then find Connections where user is initiator or recipient, populate user details.
        console.log(`Placeholder: Fetching connections for user ${userId}`);
        
        // Example DB interaction (Uncomment and adapt when Connection model is ready)
        /* 
        await connectDb();
        const currentUser = await User.findOne({ clerkId: userId });
        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const connections = await Connection.find({
            $or: [
                { initiator: currentUser._id },
                { recipient: currentUser._id }
            ],
            status: 'accepted' // Example: only fetch accepted connections
        })
        .populate('initiator', 'firstName lastName userType location') // Populate basic details
        .populate('recipient', 'firstName lastName userType location');
        
        // Format connections to show the 'other' user
        const formattedConnections = connections.map(conn => {
             // Convert Mongoose doc to plain object if needed
            const connObj = conn.toObject ? conn.toObject() : conn;
            const otherUser = connObj.initiator._id.toString() === currentUser._id.toString() 
                              ? connObj.recipient 
                              : connObj.initiator;
            return {
                connectionId: connObj._id,
                status: connObj.status,
                connectedAt: connObj.updatedAt, // Or a dedicated acceptedAt field
                partner: {
                    userId: otherUser._id,
                    firstName: otherUser.firstName,
                    lastName: otherUser.lastName,
                    userType: otherUser.userType,
                    location: otherUser.location?.city ? `${otherUser.location.city}, ${otherUser.location.state}` : 'N/A'
                }
            };
        });

        return NextResponse.json({ connections: formattedConnections });
        */
       
        return NextResponse.json({ connections: [] }); // Placeholder response

    } catch (error) {
        console.error("Error fetching connections:", error);
        // Explicitly type error as Error or unknown
        const typedError = error as Error;
        const errorMessage = typedError?.message || "Internal Server Error";
        return new NextResponse(errorMessage, { status: 500 });
    }
}

/**
 * POST /api/connections
 * Initiates a new connection request.
 */
export async function POST(_request: Request) { // Rename to _request
    const { userId } = await auth();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await _request.json(); // Use _request here
        const { targetUserId } = body;

        if (!targetUserId) {
            return new NextResponse("Missing targetUserId in request body", { status: 400 });
        }

        // Basic Validation (add more robust checks later, e.g., is ObjectId valid?)
        if (typeof targetUserId !== 'string') {
            return new NextResponse("Invalid targetUserId format", { status: 400 });
        }

        // Prevent self-connection (optional, depending on requirements)
        // This requires fetching the initiator's DB ID based on clerkId
        // await connectDb();
        // const initiatorUser = await User.findOne({ clerkId: userId });
        // if (initiatorUser && initiatorUser._id.toString() === targetUserId) {
        //     return new NextResponse("Cannot connect with yourself", { status: 400 });
        // }

        // Placeholder logic: Log the request
        // In a real implementation: Create a Connection record in DB with status 'pending'
        console.log(`Placeholder: User ${userId} initiated connection request to user ${targetUserId}`);

        // Example DB interaction (Uncomment and adapt when Connection model is ready)
        /*
        await connectDb();
        const initiatorUser = await User.findOne({ clerkId: userId });
        const targetUser = await User.findById(targetUserId);

        if (!initiatorUser) {
            console.error(`Initiate connection error: Initiator with clerkId ${userId} not found in DB.`);
            return new NextResponse("Initiator user not found", { status: 404 });
        }
        if (!targetUser) {
            return new NextResponse("Target user not found", { status: 404 });
        }

        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { initiator: initiatorUser._id, recipient: targetUser._id },
                { initiator: targetUser._id, recipient: initiatorUser._id }
            ]
        });

        if (existingConnection) {
            return new NextResponse("Connection already exists or pending", { status: 409 });
        }

        // Create new connection
        const newConnection = new Connection({
            initiator: initiatorUser._id,
            recipient: targetUser._id,
            status: 'pending'
        });
        await newConnection.save();
        */

        return NextResponse.json({ success: true, message: "Connection request initiated (placeholder)." });

    } catch (error) {
        console.error("Error initiating connection:", error);
        if (error instanceof SyntaxError) { // Handle JSON parsing errors
            return new NextResponse("Invalid JSON in request body", { status: 400 });
        }
        // Explicitly type error as Error or unknown
        const typedError = error as Error;
        const errorMessage = typedError?.message || "Internal Server Error";
        return new NextResponse(errorMessage, { status: 500 });
    }
} 