import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const referer = request.headers.get('referer') || '';
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || '';
  const wwwVersion = allowedOrigin.includes('www.')
    ? allowedOrigin.replace('www.', '')
    : allowedOrigin.replace('https://', 'https://www.');

  const allowedOrigins = [allowedOrigin, wwwVersion];

  if (
    request.nextUrl.pathname.startsWith('/api/font') &&
    !allowedOrigins.some(origin => referer.startsWith(origin))
  ) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/font'],
};
