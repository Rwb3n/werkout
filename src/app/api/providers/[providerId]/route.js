import { NextResponse } from 'next/server';

// Completely untyped JavaScript version
export async function GET(request, { params }) {
  // Extract providerId from params
  const providerId = params.providerId;
  
  // Minimal response
  return NextResponse.json({ id: providerId });
} 