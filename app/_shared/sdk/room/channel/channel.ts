export const createChannel = ({
  api,
  peer,
  streams,
}: RoomChannelType.ChannelDependencies) => {
  const Channel = class {
    _roomId = '';
    _clientId = '';
    _baseUrl;
    _api;
    _peer;
    _streams;
    _channel: EventSource | null = null;

    constructor(baseUrl: string) {
      this._baseUrl = baseUrl;
      this._api = api;
      this._peer = peer;
      this._streams = streams;
    }

    connect = (roomId: string, clientId: string) => {
      if (this._channel) return;

      this._roomId = roomId;
      this._clientId = clientId;

      this._channel = new EventSource(
        `${this._baseUrl}/rooms/${this._roomId}/events/${this._clientId}`
      );

      this._channel.addEventListener('candidate', this._onCandidate);
      this._channel.addEventListener('offer', this._onOffer);
      this._channel.addEventListener('tracks_added', this._onTracksAdded);
      this._channel.addEventListener(
        'tracks_available',
        this._onTracksAvailable
      );
      this._channel.addEventListener(
        'allowed_renegotation',
        this._onAllowedRenegotiation
      );

      this._channel.addEventListener('bitrate_changed', this._bitrateChanged);
    };

    _onCandidate = async (event: MessageEvent<any>) => {
      const peerConnection = this._peer.getPeerConnection();

      if (!peerConnection || !peerConnection.remoteDescription) {
        return;
      }

      const candidate = new RTCIceCandidate(JSON.parse(event.data));
      peerConnection.addIceCandidate(candidate);
    };

    _onOffer = async (event: MessageEvent<any>) => {
      if (!this._roomId || !this._clientId) return;

      const peerConnection = this._peer.getPeerConnection();

      if (!peerConnection) return;

      const offer = JSON.parse(event.data);
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (peerConnection.localDescription) {
        this._api.negotiateConnection(
          this._roomId,
          this._clientId,
          peerConnection.localDescription
        );
      }
    };

    _bitrateChanged = async (event: MessageEvent<any>) => {
      const data = JSON.parse(event.data);
      this._peer.adjustBitrate(data.min, data.max);
    };

    _onTracksAdded = async (event: MessageEvent<any>) => {
      const data = JSON.parse(event.data);
      const trackSources: RoomChannelType.TrackSource[] = [];

      for (const id of Object.keys(data.tracks)) {
        const track = data.tracks[id];
        const streamId = track.stream_id;
        const stream = this._peer.getStream(streamId);

        if (stream) {
          trackSources.push({
            track_id: id,
            source: stream.source,
          });
        }
      }

      this._api.setTrackSources(this._roomId, this._clientId, trackSources);
    };

    _onTracksAvailable = async (event: MessageEvent<any>) => {
      const data = JSON.parse(event.data);
      const subscribingTracks: RoomChannelType.SubscribingTrack[] = [];

      for (const id of Object.keys(data.tracks)) {
        const track = data.tracks[id];
        const streamId = track.stream_id;
        const clientId = track.client_id;
        const trackId = track.track_id;
        const source = track.source;

        subscribingTracks.push({
          client_id: clientId,
          stream_id: streamId,
          track_id: trackId,
        });

        this._streams.addDraft(streamId, {
          origin: 'remote',
          source: source,
        });
      }

      this._api.subscribeTracks(
        this._roomId,
        this._clientId,
        subscribingTracks
      );
    };

    _onAllowedRenegotiation = () => {
      // TODO: Handle allowed_renegotation event
    };
  };

  return {
    createInstance: (baseUrl: string) => {
      const channel = new Channel(baseUrl);

      return {
        connect: channel.connect,
      };
    },
  };
};
