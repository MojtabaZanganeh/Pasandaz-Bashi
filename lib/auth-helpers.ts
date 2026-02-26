import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export function getUserFromRequest(request: NextRequest): { userId: string; username: string } | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}
