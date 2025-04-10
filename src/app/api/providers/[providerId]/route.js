import { NextResponse } from 'next/server';

// Minimal route handler for testing the signature
// Using non-destructured second argument
export async function GET(
  request: Request, 
  context: { params: { providerId: string } }
) {
  const { providerId } = context.params; // Destructure inside function body

  // Basic check
  if (!providerId) {
    return new NextResponse("Missing Provider ID", { status: 400 });
  }

  console.log(`API route received providerId: ${providerId}`);

  // Simple success response
  return NextResponse.json({ message: `Successfully received ID: ${providerId}` });
} 