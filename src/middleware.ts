import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip auth check for login and register routes
  if (
    request.nextUrl.pathname === '/api/auth/login' ||
    request.nextUrl.pathname === '/api/auth/register'
  ) {
    return NextResponse.next();
  }

  // Get token from Authorization header or cookie
  const token = request.headers.get('Authorization')?.split(' ')[1] || 
                request.cookies.get('auth-token')?.value;

  // Check if the request is for a protected API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  // Check if the request is for a protected page
  const protectedPages = ['/dashboard', '/profile', '/settings'];
  if (protectedPages.some(page => request.nextUrl.pathname.startsWith(page))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/profile/:path*', '/settings/:path*'],
}; 