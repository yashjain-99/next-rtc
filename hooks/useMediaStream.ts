import { getUpdatedMediaStream } from "@/lib/utils";
import { useState, useRef, useCallback, MutableRefObject } from "react";

interface UseMediaStream {
  micActive: boolean;
  cameraActive: boolean;
  userStreamRef: MutableRefObject<MediaStream | null>;
  userVideoRef: MutableRefObject<HTMLVideoElement | null>;
  getUserMediaStream: () => Promise<void>;
  toggleMic: () => void;
  toggleCamera: () => void;
}

const useMediaStream = (): UseMediaStream => {
  const [micActive, setMicActive] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const userStreamRef = useRef<MediaStream | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);

  const getUserMediaStream = useCallback(async (): Promise<void> => {
    try {
      const stream = await getUpdatedMediaStream(micActive, cameraActive);
      userStreamRef.current = stream;
      userVideoRef.current!.srcObject = stream;
      userVideoRef.current!.onloadedmetadata = () => {
        if (userVideoRef.current) {
          userVideoRef.current.play();
        }
      };
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  }, [micActive, cameraActive]);

  const toggleStream = async (micActive: boolean, cameraActive: boolean) => {
    const stream = await getUpdatedMediaStream(micActive, cameraActive);
    userStreamRef.current = stream;
    userVideoRef.current!.srcObject = stream;
  };

  const toggleMic = useCallback(async (): Promise<void> => {
    setMicActive((prev) => !prev);
    await toggleStream(!micActive, cameraActive);
  }, [toggleStream]);

  const toggleCamera = useCallback(async (): Promise<void> => {
    setCameraActive((prev) => !prev);
    await toggleStream(micActive, !cameraActive);
  }, [toggleStream]);

  return {
    micActive,
    cameraActive,
    userStreamRef,
    userVideoRef,
    getUserMediaStream,
    toggleMic,
    toggleCamera,
  };
};

export default useMediaStream;
