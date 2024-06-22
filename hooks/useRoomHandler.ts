"use client";
import { useEffect, useRef, useCallback, MutableRefObject } from "react";
import { io, Socket } from "socket.io-client";
import useSocket from "@/hooks/useSocket";
import useMediaStream from "@/hooks/useMediaStream";
import usePeerConnection from "@/hooks/usePeerConnection";
import { useRouter } from "next/navigation";
import { getUpdatedMediaStream } from "@/lib/utils";

interface UseRoomHandlerReturn {
  micActive: boolean;
  cameraActive: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  leaveRoom: () => void;
  userVideoRef: MutableRefObject<HTMLVideoElement | null>;
  peerVideoRef: MutableRefObject<HTMLVideoElement | null>;
}

const useRoomHandler = (roomName: string): UseRoomHandlerReturn => {
  useSocket();
  const socketRef = useRef<Socket | null>(null);

  const {
    micActive,
    cameraActive,
    userStreamRef,
    userVideoRef,
    getUserMediaStream,
    toggleMic,
    toggleCamera,
  } = useMediaStream();

  const {
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
  } = usePeerConnection({
    socketRef,
    userStreamRef,
    roomName,
    userVideoRef,
    cameraActive,
    micActive,
  });

  const router = useRouter();

  const handleRoomJoined = useCallback(async () => {
    await getUserMediaStream();
    socketRef.current?.emit("ready", roomName);
  }, [getUserMediaStream, roomName]);

  const handleRoomCreated = useCallback(async () => {
    hostRef.current = true;
    await getUserMediaStream();
  }, [getUserMediaStream]);

  const leaveRoom = useCallback((): void => {
    socketRef.current?.emit("leave", roomName);
    if (userVideoRef.current?.srcObject) {
      (userVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (peerVideoRef.current?.srcObject) {
      (peerVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    cleanupConnection();
    router.push("/");
  }, [cleanupConnection, roomName, router]);

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

  useEffect(() => {
    setupVideoTrack();
  }, [micActive, cameraActive]);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit("join", roomName);

    socketRef.current.on("joined", handleRoomJoined);
    socketRef.current.on("created", handleRoomCreated);
    socketRef.current.on("ready", initiateCall);
    socketRef.current.on("leave", onPeerLeave);
    socketRef.current.on("full", () => {
      window.location.href = "/";
    });
    socketRef.current.on("offer", handleReceivedOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handlerNewIceCandidateMsg);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomName]);

  return {
    micActive,
    cameraActive,
    toggleMic,
    toggleCamera,
    leaveRoom,
    userVideoRef,
    peerVideoRef,
  };
};

export default useRoomHandler;
