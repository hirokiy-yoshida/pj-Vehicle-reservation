import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // API routes only
  if (req.nextUrl.pathname.startsWith('/api')) {
    if (!session) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'authentication failed' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // CSRF protection
    const csrfToken = req.cookies.get('next-auth.csrf-token');
    if (!csrfToken || csrfToken !== req.headers.get('x-csrf-token')) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'CSRF check failed' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};