import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /studio/[slug] routes
  if (pathname.startsWith('/studio/')) {
    const slug = pathname.split('/')[2] || 'home';
    const roleCookie = request.cookies.get('user-role');
    const role = roleCookie?.value || 'viewer'; // Default to viewer for safety

    if (role !== 'editor' && role !== 'publisher') {
      // Redirect to preview with an unauthorized message query param
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
  matcher: ['/studio/:path*'],
};
