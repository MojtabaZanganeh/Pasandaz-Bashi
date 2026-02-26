import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request: Request) {
  const referer = request.headers.get('referer') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';

  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || '';
  const wwwVersion = allowedOrigin.includes('www.')
    ? allowedOrigin.replace('www.', '')
    : allowedOrigin.replace('https://', 'https://www.');

  const allowedOrigins = [allowedOrigin, wwwVersion];

  const isBrowser = userAgent.includes('Mozilla');
  const isFromSite = allowedOrigins.some(origin => referer.startsWith(origin));

  if (!isBrowser || !isFromSite) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const prefersWoff2 = accept.includes('font/woff2');

  const fontFile = prefersWoff2
    ? 'YekanBakh-VF.woff2'
    : 'YekanBakh-VF.woff';

  const contentType = prefersWoff2
    ? 'font/woff2'
    : 'font/woff';

  const fontPath = path.resolve(process.cwd(), 'lib/fonts', fontFile);
  const fontBuffer = await fs.readFile(fontPath);
  const fontUint8 = new Uint8Array(fontBuffer);

  return new NextResponse(fontUint8, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
