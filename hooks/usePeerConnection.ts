import { getUpdatedMediaStream } from "@/lib/utils";
import { useRef, useCallback, useEffect, MutableRefObject } from "react";
import { Socket } from "socket.io-client";

interface UsePeerConnectionParams {
  socketRef: MutableRefObject<Socket | null>;
  userStreamRef: MutableRefObject<MediaStream | null>;
  roomName: string;
  userVideoRef: MutableRefObject<HTMLVideoElement | null>;
  cameraActive: boolean;
  micActive: boolean;
}

interface UsePeerConnectionReturn {
  rtcConnectionRef: MutableRefObject<RTCPeerConnection | null>;
  peerVideoRef: MutableRefObject<HTMLVideoElement | null>;
  hostRef: MutableRefObject<boolean>;
  createPeerConnection: () => RTCPeerConnection;
  handleICECandidateEvent: (event: RTCPeerConnectionIceEvent) => void;
  handleTrackEvent: (event: RTCTrackEvent) => void;
  cleanupConnection: () => void;
  initiateCall: () => void;
  handleReceivedOffer: (offer: RTCSessionDescriptionInit) => void;
  handleAnswer: (answer: RTCSessionDescriptionInit) => void;
  handlerNewIceCandidateMsg: (incoming: RTCIceCandidateInit) => void;
  onPeerLeave: () => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
  ],
};

const usePeerConnection = ({
  socketRef,
  userStreamRef,
  roomName,
  userVideoRef,
  cameraActive,
  micActive,
}: UsePeerConnectionParams): UsePeerConnectionReturn => {
  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<boolean>(false);

  const createPeerConnection = useCallback((): RTCPeerConnection => {
    const connection = new RTCPeerConnection(ICE_SERVERS);
    connection.onicecandidate = handleICECandidateEvent;
    connection.ontrack = handleTrackEvent;
    return connection;
  }, []);

  const handleICECandidateEvent = useCallback(
    (event: RTCPeerConnectionIceEvent): void => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", event.candidate, roomName);
      }
    },
    [socketRef, roomName]
  );

  const handleTrackEvent = (event: RTCTrackEvent): void => {
    peerVideoRef.current!.srcObject = event.streams[0];
  };

  const cleanupConnection = useCallback((): void => {
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
  }, []);

  const setupVideoTrack = async (): Promise<void> => {
    const updatedStream = await getUpdatedMediaStream(micActive, cameraActive);
    const senders = rtcConnectionRef.current?.getSenders() || [];
    updatedStream.getTracks().forEach(async (track) => {
      const sender = senders.find((s) => s.track?.kind === track.kind);
      if (sender) {
        await sender.replaceTrack(track);
      } else {
        rtcConnectionRef.current?.addTrack(track, updatedStream);
      }
    });
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = updatedStream;
    }
    userStreamRef.current = updatedStream;
  };

  const initiateCall = (): void => {
    if (hostRef.current && userStreamRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      userStreamRef.current
        .getTracks()
        .forEach((track) =>
          rtcConnectionRef.current?.addTrack(track, userStreamRef.current!)
        );
      setupVideoTrack();
      rtcConnectionRef.current
        .createOffer()
        .then((offer) => {
          rtcConnectionRef.current?.setLocalDescription(offer);
          socketRef.current?.emit("offer", offer, roomName);
        })
        .catch((error) => console.error("Error creating offer", error));
    }
  };

  const handleReceivedOffer = (offer: RTCSessionDescriptionInit): void => {
    if (!hostRef.current && userStreamRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      userStreamRef.current
        .getTracks()
        .forEach((track) =>
          rtcConnectionRef.current?.addTrack(track, userStreamRef.current!)
        );
      setupVideoTrack();
      rtcConnectionRef.current.setRemoteDescription(offer);
      rtcConnectionRef.current
        .createAnswer()
        .then((answer) => {
          rtcConnectionRef.current?.setLocalDescription(answer);
          socketRef.current?.emit("answer", answer, roomName);
        })
        .catch((error) => console.error("Error creating answer", error));
    }
  };

  const handleAnswer = (answer: RTCSessionDescriptionInit): void => {
    rtcConnectionRef.current
      ?.setRemoteDescription(answer)
      .catch((err) => console.error("Error setting remote description", err));
    setupVideoTrack();
  };

  const handlerNewIceCandidateMsg = (incoming: RTCIceCandidateInit): void => {
    const candidate = new RTCIceCandidate(incoming);
    rtcConnectionRef.current
      ?.addIceCandidate(candidate)
      .catch((e) => console.error("Error adding received ICE candidate", e));
  };

  const onPeerLeave = useCallback((): void => {
    hostRef.current = true;
    if (peerVideoRef.current?.srcObject) {
      (peerVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    cleanupConnection();
  }, [cleanupConnection]);

  return {
    rtcConnectionRef,
    peerVideoRef,
    hostRef,
    createPeerConnection,
    handleICECandidateEvent,
    handleTrackEvent,
    cleanupConnection,
    initiateCall,
    handleReceivedOffer,
    handleAnswer,
    handlerNewIceCandidateMsg,
    onPeerLeave,
  };
};

export default usePeerConnection;
