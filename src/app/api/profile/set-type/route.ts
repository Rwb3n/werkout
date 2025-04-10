import { NextResponse } from 'next/server';
import { auth, clerkClient as clerkClientFactory } from '@clerk/nextjs/server';
import connectDb from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
    console.log("[/api/profile/set-type] POST request received.");
    let clerkId: string | null = null;
    try {
        console.log("[/api/profile/set-type] Calling auth()...");
        const authResult = await auth();
        clerkId = authResult.userId;
        console.log(`[/api/profile/set-type] auth() completed. userId: ${clerkId}`);

        if (!clerkId) {
            console.log("[/api/profile/set-type] No userId found, returning 401.");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // --- Body Parsing ---
        console.log("[/api/profile/set-type] Parsing request body...");
        const body = await request.json();
        const { userType } = body;
        console.log(`[/api/profile/set-type] Parsed body, userType: ${userType}`);

        if (!userType || (userType !== 'seeker' && userType !== 'provider')) {
            console.log("[/api/profile/set-type] Invalid userType, returning 400.");
            return new NextResponse("Invalid userType provided. Must be 'seeker' or 'provider'.", { status: 400 });
        }

        // --- Update Clerk Metadata --- 
        console.log(`[/api/profile/set-type] Updating Clerk metadata for userId: ${clerkId}...`);
        const clerk = await clerkClientFactory();
        await clerk.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                userType: userType,
            },
        });
        console.log(`[/api/profile/set-type] Clerk metadata updated successfully.`);

        // --- Optional: Update DB --- 
        try {
             console.log("[/api/profile/set-type] Connecting to DB...");
             await connectDb();
             console.log(`[/api/profile/set-type] Updating DB for clerkId: ${clerkId}...`);
             await User.updateOne(
                 { clerkId: clerkId }, 
                 { $set: { userType: userType } }
             );
             console.log(`[/api/profile/set-type] DB update successful (if user existed).`);
        } catch(dbError) {
            console.error(`[/api/profile/set-type] DB Error updating userType for ${clerkId}:`, dbError);
        }

        console.log("[/api/profile/set-type] Returning 200 OK response.");
        return NextResponse.json({ success: true, userType: userType });

    } catch (error) {
        console.error(`[/api/profile/set-type] Caught error in POST handler (userId: ${clerkId}):`, error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 