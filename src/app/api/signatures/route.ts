import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSignature, getSignatures, getSignatureByEmail, verifySignature } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import type { Signature } from '@/app/types';

// API request/response types
interface CreateSignatureRequest {
  name: string;
  email: string;
  position?: string;
  honors?: string;
  isNotable?: boolean;
}

interface CreateSignatureResponse {
  message: string;
  id: number;
}

interface ErrorResponse {
  error: string;
}

// Rate limiting setup
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestCounts = new Map<string, { count: number; timestamp: number }>();

function getRateLimitInfo(ip: string): { isLimited: boolean; remaining: number } {
  const now = Date.now();
  const requestInfo = ipRequestCounts.get(ip);

  if (!requestInfo) {
    return { isLimited: false, remaining: MAX_REQUESTS_PER_WINDOW };
  }

  if (now - requestInfo.timestamp > RATE_LIMIT_WINDOW) {
    // Reset if window has passed
    ipRequestCounts.delete(ip);
    return { isLimited: false, remaining: MAX_REQUESTS_PER_WINDOW };
  }

  const remaining = MAX_REQUESTS_PER_WINDOW - requestInfo.count;
  return {
    isLimited: remaining <= 0,
    remaining: Math.max(0, remaining)
  };
}

function updateRateLimit(ip: string): void {
  const now = Date.now();
  const requestInfo = ipRequestCounts.get(ip);

  if (!requestInfo) {
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
    return;
  }

  if (now - requestInfo.timestamp > RATE_LIMIT_WINDOW) {
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
  } else {
    ipRequestCounts.set(ip, {
      count: requestInfo.count + 1,
      timestamp: requestInfo.timestamp
    });
  }
}

// Input validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateCreateSignatureRequest(data: unknown): data is CreateSignatureRequest {
  if (!data || typeof data !== 'object') return false;
  
  const { name, email, position, honors, isNotable } = data as Record<string, unknown>;
  
  return (
    typeof name === 'string' && name.length > 0 &&
    typeof email === 'string' && validateEmail(email) &&
    (position === undefined || typeof position === 'string') &&
    (honors === undefined || typeof honors === 'string') &&
    (isNotable === undefined || typeof isNotable === 'boolean')
  );
}

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search') || '';
    console.log('Fetching signatures with search:', search);
    
    const signatures = await getSignatures(search);
    console.log('Retrieved signatures count:', signatures.length);
    
    // Convert dates to ISO strings
    const formattedSignatures = signatures.map(sig => ({
      ...sig,
      created_at: sig.created_at ? new Date(sig.created_at).toISOString() : null,
      verified_at: sig.verified_at ? new Date(sig.verified_at).toISOString() : null
    }));
    
    return NextResponse.json(formattedSignatures);
  } catch (error) {
    console.error('Detailed error in GET signatures:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch signatures' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { isLimited, remaining } = getRateLimitInfo(ip);
    
    if (isLimited) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': RATE_LIMIT_WINDOW.toString(),
            'X-RateLimit-Remaining': remaining.toString()
          }
        }
      );
    }

    const body = await request.json();
    
    // Validate request body
    if (!validateCreateSignatureRequest(body)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { name, email, position, honors, isNotable } = body;

    // Check for existing signature
    const existingSignature = await getSignatureByEmail(email);
    if (existingSignature) {
      return NextResponse.json<ErrorResponse>(
        { error: 'This email has already been used to sign' },
        { status: 400 }
      );
    }

    // Create signature
    const verificationToken = uuidv4();
    const signature = await createSignature({
      name,
      email,
      position,
      honors,
      is_notable: isNotable || false,
      verification_token: verificationToken,
      status: 'pending'
    } satisfies Omit<Signature, 'id' | 'created_at' | 'verified_at'>);

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    // Update rate limit after successful request
    updateRateLimit(ip);

    return NextResponse.json<CreateSignatureResponse>({
      message: 'Signature submitted successfully',
      id: signature.id,
    });
  } catch (error) {
    console.error('Error creating signature:', error);
    return NextResponse.json<ErrorResponse>(
      { error: 'Failed to submit signature' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const verified = await verifySignature(token);
    if (!verified) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Signature verified successfully'
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json<ErrorResponse>(
      { error: 'Failed to verify signature' },
      { status: 500 }
    );
  }
}