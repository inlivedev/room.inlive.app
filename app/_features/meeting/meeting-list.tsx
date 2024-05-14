'use client';

import { selectEvent } from '@/(server)/_features/event/schema';
import { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { Button } from '@nextui-org/react';
import Link from 'next/link';

export default function MeetingList() {
  const events: EventType.Event[] = [];
  const now = new Date();

  InternalApiFetcher.get(
    `/api/events/not-started?&limit=${10}&type=${'webinar'}&start_is_before=${now.toISOString()}&end_is_after=${now.toISOString()}type=${'meeting'}`
  ).then((response: EventType.ListEventsResponse) => {
    if (response.data) {
      events.concat(response.data);
    }
  });

  return (
    <div>
      {(!events || events.length === 0) && (
        <div className="flex w-full flex-col">
          <Button
            disabled={true}
            className="z-10 -m-4 mt-2 items-center justify-center rounded-md bg-red-800 p-4 text-zinc-300 sm:min-h-16"
          >
            No meetings available
          </Button>

          <Button
            disabled={true}
            className="mt-2 flex  items-center justify-center  rounded-md bg-zinc-800 p-4 text-zinc-300 sm:min-h-16"
          >
            Your future meetings will appear here
          </Button>
        </div>
      )}

      {events &&
        events.map((event) => (
          <MeetingItem
            event={event}
            key={event.id}
            ongoing={new Date(event.startTime) < now}
          />
        ))}
    </div>
  );
}

function MeetingItem({
  event,
  ongoing = false,
}: {
  event: selectEvent;
  ongoing?: boolean;
}) {
  return (
    <Button
      as={Link}
      href={`/events/${event.slug}`}
      target="_blank"
      className={`mt-2 flex flex-row items-center justify-between gap-2 rounded-md bg-zinc-800 p-4 text-zinc-300 
        first:z-10  first:-m-2 first:bg-red-800
       first:shadow-md sm:min-h-16 sm:first:-mb-4`}
    >
      <p className="text-nowrap">{`${event.startTime.getHours()} : ${event.startTime.getMinutes()}`}</p>
      <h2 className="flex-1 truncate">{event.name}</h2>

      {ongoing && (
        <div className="inline-flex h-min items-center rounded-sm bg-zinc-950 px-2 py-0.5 text-xs font-medium tracking-[0.275px] text-zinc-300 outline outline-1 outline-zinc-800">
          now
        </div>
      )}
    </Button>
  );
}
