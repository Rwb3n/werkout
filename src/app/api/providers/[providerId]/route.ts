import { NextResponse } from 'next/server';

// Minimal route handler for testing the signature
export async function GET(
  request: Request, 
  { params }: { params: { providerId: string } }
) {
  const { providerId } = params; 

  // Basic check
  if (!providerId) {
    return new NextResponse("Missing Provider ID", { status: 400 });
  }

  console.log(`API route received providerId: ${providerId}`);

  // Simple success response
  return NextResponse.json({ message: `Successfully received ID: ${providerId}` });
} 