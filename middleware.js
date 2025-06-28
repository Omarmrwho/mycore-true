
import { NextResponse } from 'next/server';
export function middleware(req) {
  const basicAuth = req.headers.get('authorization');
  const valid = 'Basic ' + Buffer.from('omar:elara2025').toString('base64');
  if (basicAuth === valid) return NextResponse.next();
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="MyCore"' }
  });
}
export const config = { matcher: ['/((?!_next|favicon.ico).*)'] };
