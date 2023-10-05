import { useEffect, useState, useCallback } from 'react';
import { usePeerContext } from '../contexts/peer-context';
import { Button } from '@nextui-org/react';

interface messageData {
  sender: string;
  message: string;
}

export default function Chat() {
  const { peer } = usePeerContext();
  const [isDisabled, setDisabled] = useState(true);
  const [chatChannel, setChatChannel] = useState<RTCDataChannel | undefined>();

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peerConnection) return;

    peerConnection.addEventListener('datachannel', (chEevent) => {
      const receiveChannel = chEevent.channel;
      receiveChannel.label;

      if (receiveChannel.label == 'chat') {
        setChatChannel(receiveChannel);
      }

      receiveChannel.addEventListener('message', (event) => {
        if (receiveChannel.label == 'chat') {
          receiveChannel.binaryType = 'arraybuffer';
          const decoder = new TextDecoder();
          const data = decoder.decode(event.data as ArrayBuffer);
          const message: messageData = JSON.parse(data);
          console.log(message);
        }
      });

      receiveChannel.addEventListener('open', () => {
        if (receiveChannel.label == 'chat') {
          setDisabled(false);
          console.log('chat channel open, ready to send message');
        }
      });

      receiveChannel.addEventListener('close', () => {
        if (receiveChannel.label == 'chat') {
          setDisabled(true);
          console.log('chat channel closed');
        }
      });
    });
  }, [peer]);

  const sendMessage = useCallback(() => {
    let num = 1;

    if (!chatChannel) {
      console.log('chat channel is not ready to send message');
      return;
    }

    chatChannel.send(
      JSON.stringify({
        sender: 'test',
        message: num.toString(),
      })
    );

    num++;
  }, [chatChannel]);

  return (
    <Button
      isIconOnly
      variant="flat"
      isDisabled={isDisabled}
      onClick={sendMessage}
      className="bg-green-500 hover:bg-green-600 focus:outline-zinc-100 active:bg-green-500 disabled:bg-red-600/70"
    ></Button>
  );
}
