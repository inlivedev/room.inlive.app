'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';
import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

const defaultData = {
  host: {
    clientIDs: [] as string[],
  },
  layout: 'speaker' as 'speaker' | 'presentation',
  speakers: [] as string[],
};

const MetadataContext = createContext(defaultData);

export const useMetadataContext = () => {
  return useContext(MetadataContext);
};

export function MetadataProvider({
  children,
  roomID,
}: {
  roomID: string;
  children: React.ReactNode;
}) {
  const [metadataState, setMetadataState] = useState(defaultData);
  const { peer } = usePeerContext();

  useEffect(() => {
    clientSDK.on(RoomEvent.META_CHANGED, (event: any) => {
      setMetadataState((prevData) => {
        const metadata = {
          ...prevData,
          [event.key]: event.data[event.key],
        };

        return metadata;
      });
    });
  }, []);

  useEffect(() => {
    if (!peer) return;

    clientSDK.on(
      RoomEvent.STREAM_AVAILABLE,
      ({ stream }: { stream: ParticipantStream }) => {
        if (stream.source === 'screen' && stream.origin === 'local') {
          const screens = peer.getAllStreams().filter((stream) => {
            return stream.source === 'screen';
          });

          if (screens.length === 0) {
            clientSDK.setMetadata(roomID, {
              layout: 'presentation',
            });
          }
        }
      }
    );

    clientSDK.on(
      RoomEvent.STREAM_REMOVED,
      ({ stream }: { stream: ParticipantStream }) => {
        if (stream.source === 'screen' && stream.origin === 'local') {
          const screens = peer.getAllStreams().filter((stream) => {
            return stream.source === 'screen';
          });

          if (screens.length === 0) {
            clientSDK.setMetadata(roomID, {
              layout: 'speaker',
            });
          }
        }
      }
    );
  }, [roomID, peer]);

  return (
    <MetadataContext.Provider value={metadataState}>
      {children}
    </MetadataContext.Provider>
  );
}
