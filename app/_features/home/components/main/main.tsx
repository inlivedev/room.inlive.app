'use client';

import CreateRoom from '@/_features/home/components/create-room/create-room';
import JoinRoom from '@/_features/home/components/join-room/join-room';

export default function Main() {
  return (
    <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center">
      <div className="flex w-full flex-col gap-20 px-4 lg:flex-row">
        <div>
          <CreateRoom
            heading={
              <CreateRoom.Heading text="Conference room for real-time video and audio calls" />
            }
            subHeading={
              <CreateRoom.SubHeading
                text="The alternative for Google Meet and Zoom video and audio calls. Get
          started now by creating a room or join to other rooms with room code."
              />
            }
            actionButton={(handleCreateRoom) => (
              <CreateRoom.CreateButton
                text="Create a new room"
                handleCreateRoom={handleCreateRoom}
              />
            )}
          />
        </div>
        <div className="flex-1">
          <JoinRoom
            heading={<JoinRoom.Heading text="Join a room" />}
            subHeading={
              <JoinRoom.SubHeading text="Have a room code? Enter the code below in order to join to other rooms." />
            }
            inputRoom={(props: React.InputHTMLAttributes<HTMLInputElement>) => (
              <JoinRoom.InputRoom
                {...props}
                type="text"
                placeholder="Enter a room code"
              />
            )}
            actionButton={(handleJoinRoom) => (
              <JoinRoom.JoinButton
                text="Join"
                handleJoinRoom={handleJoinRoom}
              />
            )}
          />
        </div>
      </div>
    </main>
  );
}
