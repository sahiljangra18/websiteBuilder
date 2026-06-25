import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get('user-role');
  const role = roleCookie?.value;

  // 1. If not authenticated, redirect all preview and studio paths to /login
  if (!role && (pathname.startsWith('/studio/') || pathname.startsWith('/preview/'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Protect /studio/[slug] routes (editors and publishers only)
  if (pathname.startsWith('/studio/')) {
    const slug = pathname.split('/')[2] || 'home';
    if (role !== 'editor' && role !== 'publisher') {
      const url = request.nextUrl.clone();
      url.pathname = `/preview/${slug}`;
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Config to specify which routes this middleware runs on
export const config = {
  matcher: ['/studio/:path*', '/preview/:path*'],
};
