import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { IUser } from '@/models/User';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
}

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

// Accept either NextRequest or standard Request
export function getTokenFromRequest(req: NextRequest | Request): string | null {
  // Handle NextRequest
  if ('headers' in req && typeof req.headers.get === 'function') {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') return null;

    return token;
  }
  
  // Handle standard Request
  if (req.headers instanceof Headers) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') return null;

    return token;
  }
  
  return null;
}

export function getUserFromRequest(req: NextRequest | Request): DecodedToken | null {
  try {
    // Get token from request
    const token = getTokenFromRequest(req);
    
    // Debug token extraction
    console.debug(`Auth: Token extracted from request: ${token ? 'Found' : 'Not found'}`);
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Debug token verification
    console.debug(`Auth: Token verification result: ${decoded ? 'Valid' : 'Invalid'}`);
    
    return decoded;
  } catch (error: unknown) {
    console.error("Error in getUserFromRequest:", error instanceof Error ? error.message : String(error));
    return null;
  }
} 