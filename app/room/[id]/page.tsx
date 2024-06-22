"use client";

import Video from "@/components/Video";
import { Button } from "@/components/ui/button";
import useRoomHandler from "@/hooks/useRoomHandler";

const Room = ({ params }: { params: { id: string } }) => {
  const {
    micActive,
    cameraActive,
    toggleMic,
    toggleCamera,
    leaveRoom,
    userVideoRef,
    peerVideoRef,
  } = useRoomHandler(params.id);

  return (
    <>
      <section className="flex flex-col justify-center items-center gap-6 sm:flex-row">
        <Video ref={userVideoRef} muted={true} />
        <Video ref={peerVideoRef} />
      </section>
      <div className="flex space-x-4">
        <Button onClick={toggleMic} className="px-4 py-2 rounded-lg">
          {micActive ? "Mute Mic" : "Unmute Mic"}
        </Button>
        <Button
          onClick={leaveRoom}
          variant="destructive"
          className="px-4 py-2 rounded-lg"
        >
          Leave
        </Button>
        <Button onClick={toggleCamera} className="px-4 py-2 rounded-lg">
          {cameraActive ? "Stop Camera" : "Start Camera"}
        </Button>
      </div>
    </>
  );
};

export default Room;
