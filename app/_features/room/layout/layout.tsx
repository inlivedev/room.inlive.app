'use client';
import Lobby from '@/_features/room/lobby/lobby';
import LobbyHeader from '@/_features/room/lobby/lobby-header';
import LobbyInvite from '@/_features/room/lobby/lobby-invite';
import LobbyCTA from '@/_features/room/lobby/lobby-cta';
import Conference from '@/_features/room/conference/conference';
import { useToggle } from '@/_shared/hooks/use-toggle';

type RoomLayoutProps = {
  roomId: string;
  clientId: string;
  host: boolean;
  origin: string;
};

export default function Layout({
  roomId,
  clientId,
  host,
  origin,
}: RoomLayoutProps) {
  const { active: openConference, setActive: setOpenConference } =
    useToggle(host);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-200">
      {openConference ? (
        <Conference roomId={roomId} clientId={clientId} />
      ) : (
        <Lobby>
          <LobbyHeader roomId={roomId} />
          <LobbyInvite roomId={roomId} origin={origin} />
          <LobbyCTA openConferenceRoom={setOpenConference} />
        </Lobby>
      )}
    </div>
  );
}
