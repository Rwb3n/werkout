import { NextResponse } from 'next/server';

// Updated for Next.js 15 - params is now a Promise!
export async function GET(
  request: Request,
  { params }: { params: Promise<{ providerId: string }> }
) {
  // MUST await the params in Next.js 15
  const paramsData = await params;
  const providerId = paramsData.providerId;
  
  if (!providerId) {
    return new NextResponse("Missing Provider ID", { status: 400 });
  }
  
  // Minimal response for testing
  return NextResponse.json({ id: providerId });
} 