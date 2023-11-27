import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import supabase from '@/app/api/supabase';

export default async function middleware(request: NextRequest) {
  const errorMessages = {
    invalidAdminToken: 'Invalid admin token',
    adminTokenNotDefined: 'Admin token not defined',
    bearerTokenNotDefined: 'Bearer token not defined',
    tokenNotDefined: 'Token not defined',
    emailNotDefined: 'Email not defined',
    userNotFound: 'User not found',
    signatureVerificationFailed: 'Signature verification failed',
    unauthorizedRequest: 'Unauthorized request',
  }

  if (request.nextUrl.pathname.startsWith('/api')) {
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      const adminToken = request.headers.get('admin-token') as string;

      if (adminToken) {
        if (adminToken !== process.env.APP_ADMIN_TOKEN) {
          return NextResponse.json(
            {
              errorMessage: errorMessages.invalidAdminToken,
            },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          {
            errorMessage: errorMessages.adminTokenNotDefined,
          },
          { status: 401 }
        );
      }
    } else {
      const bearerToken = request.headers.get('authorization') as string;

      if (!bearerToken) {
        return NextResponse.json(
          {
            errorMessage: errorMessages.bearerTokenNotDefined,
          },
          { status: 401 }
        );
      }

      const token = bearerToken.split(' ')[1];

      if (!token) {
        return NextResponse.json(
          {
            errorMessage: errorMessages.tokenNotDefined,
          },
          { status: 401 }
        );
      }

      const signature = new TextEncoder().encode(process.env.JWT_SECRET);

      try {
        const jwt = await jose.jwtVerify(token, signature);

        if (jwt) {
          const email = jwt.payload.email;

          if (!email) {
            return NextResponse.json(
              {
                errorMessage: errorMessages.emailNotDefined,
              },
              { status: 401 }
            );
          }

          const user = await supabase
            .from('apiauth')
            .select('id, email')
            .eq('email', email);

          if (user.data && user.data.length > 0) {
            return NextResponse.next();
          } else {
            return NextResponse.json(
              {
                errorMessage: errorMessages.userNotFound,
              },
              { status: 401 }
            );
          }
        }
      } catch (error: any) {
        // Verificar se o erro é de assinatura inválida
        if (error.message === 'signature verification failed') {
          return NextResponse.json(
            {
              errorMessage: errorMessages.signatureVerificationFailed,
            },
            { status: 401 }
          );
        }

        return NextResponse.json(
          {
            errorMessage: errorMessages.unauthorizedRequest,
          },
          { status: 401 }
        );
      }
    }
  }
}
