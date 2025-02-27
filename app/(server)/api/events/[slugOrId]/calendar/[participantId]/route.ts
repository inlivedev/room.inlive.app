import { eventRepo, eventService } from '@/(server)/api/_index';
import { isError } from 'lodash-es';
import { NextResponse } from 'next/server';
import { GenerateIcal } from '../../..';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slugOrId: string; participantId: number }> }
) {
  const slug = decodeURIComponent((await params).slugOrId);
  const participantId = (await params).participantId;

  try {
    const event = await eventRepo.getBySlugOrID(slug);
    if (!event) {
      return NextResponse.json({
        code: 404,
        message: 'Event not found',
      });
    }

    const host = await eventRepo.getEventHostByEventId(event.id);
    if (!host) {
      return NextResponse.json({
        code: 404,
        message: 'Host not found',
      });
    }

    const participant = await eventService.getParticipantByID(
      participantId,
      slug
    );
    if (!participant) {
      return NextResponse.json({
        code: 404,
        message: 'Participant not found',
      });
    }

    const icalString = GenerateIcal(event, 'meeting', 'Asia/Jakarta', host, {
      clientID: participant.clientID,
      name: participant.user.name,
      email: participant.user.email,
      updateCount: participant.updateCount,
    });
    const resp = new Response(icalString);
    resp.headers.set(
      'Content-Type',
      'text/calendar; charset=utf-8; name=invite.ics'
    );
    resp.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    resp.headers.set('Content-Transfer-Encoding', 'base64');

    return resp;
  } catch (error) {
    if (!isError(error)) {
      const response = {
        code: 500,
        message: 'an error has occured on our side please try again later',
      };
      return NextResponse.json(response, { status: 500 });
    }
    const response = {
      code: 500,
      message: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
