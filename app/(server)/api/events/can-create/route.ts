import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { whitelistFeature } from '@/_shared/utils/flag';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { eventRepo } from '@/(server)/api/_index';

const EVENT_TRIAL_COUNT = parseInt(process.env.EVENT_TRIAL_COUNT || '3');

export async function GET() {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  const getUserResp = await getCurrentAuthenticated(requestToken?.value || '');
  const user = getUserResp.data ? getUserResp.data : null;

  if (!user) {
    return NextResponse.json(
      {
        code: 401,
        ok: false,
        message: 'Please check if token is provided in the cookie',
      },
      { status: 401 }
    );
  }

  if (
    // Check if event feature is whitelist only
    !whitelistFeature.includes('event') === true
  ) {
    return NextResponse.json(
      {
        code: 200,
        ok: true,
        message: 'You are allowed to create event',
      },
      { status: 200 }
    );
  }

  if (!user.whitelistFeature.includes('event')) {
    // check if have created more than 3 events
    const { value } = await eventRepo.countDeleted(user.id);
    if (value > EVENT_TRIAL_COUNT) {
      return NextResponse.json(
        {
          code: 403,
          ok: false,
          message: 'You have reached the limit of creating events',
        },
        {
          status: 403,
        }
      );
    }
  }

  return NextResponse.json(
    {
      code: 200,
      ok: true,
      message: 'You are allowed to create event',
    },
    { status: 200 }
  );
}
