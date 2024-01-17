import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || '';

    if (!token) {
      return NextResponse.json(
        {
          code: 401,
          message:
            'Unauthorized. Credential is needed to continue proceed with the request.',
          ok: false,
          data: null,
        },
        {
          status: 401,
        }
      );
    }

    const response = await getCurrentAuthenticated(token);

    if (response.code === 403) {
      return NextResponse.json(
        {
          code: response.code,
          message: 'Forbidden. Credential is invalid',
          ok: false,
          data: null,
        },
        {
          status: response.code,
        }
      );
    }

    if (!response.ok) {
      throw new Error(`Unexpected error occurred. ${response.message || ''}}`);
    }

    return NextResponse.json(response, {
      status: response.code,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: 500,
        message: `Server cannot retrieve the auth data. ${error.message || ''}`,
        ok: false,
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}
