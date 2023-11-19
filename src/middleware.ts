import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      console.log('entrou');

      const adminToken = request.headers.get('admin-token') as string;

      if (adminToken) {
        if (adminToken !== process.env.APP_ADMIN_TOKEN) {
          return NextResponse.json(
            {
              errorMessage: 'Invalid admin token',
            },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          {
            errorMessage: 'Admin token not defined',
          },
          { status: 401 }
        );
      }
    } else {
      const bearerToken = request.headers.get('authorization') as string;

      if (!bearerToken) {
        return NextResponse.json(
          {
            errorMessage: 'Bearer token not defined',
          },
          { status: 401 }
        );
      }

      const token = bearerToken.split(' ')[1];

      if (!token) {
        return NextResponse.json(
          {
            errorMessage: 'Token not defined',
          },
          { status: 401 }
        );
      }

      const signature = new TextEncoder().encode(process.env.JWT_SECRET);

      try {
        await jose.jwtVerify(token, signature);
      } catch (error) {
        return NextResponse.json(
          {
            errorMessage: 'Unauthorized request',
          },
          { status: 401 }
        );
      }
    }
  }
}
