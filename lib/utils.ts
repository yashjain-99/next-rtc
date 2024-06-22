import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export const getUserMediaStream = async (audio: boolean, video: boolean) => {
  if (audio || video) {
    const userStream = await navigator.mediaDevices.getUserMedia({
      audio: audio,
      video: video,
    });
    return userStream;
  }
};

export const emptyVideoTrack = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const videoContext = canvas.getContext("2d");
  if (videoContext) {
    videoContext.fillStyle = "green";
    videoContext.fillRect(0, 0, canvas.width, canvas.height);
    const stream = canvas.captureStream(30);
    const videoTrack = stream.getVideoTracks()[0];
    return videoTrack;
  }
  // Fallback if video context is not available
  return new MediaStream().getVideoTracks()[0];
};

export const emptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  oscillator.frequency.value = 440;
  const destination = ctx.createMediaStreamDestination();
  oscillator.connect(destination);

  oscillator.start();
  const audioTrack = destination.stream.getAudioTracks()[0];
  audioTrack.enabled = false;

  return audioTrack;
};

export const getUpdatedMediaStream = async (
  micActive: boolean,
  videoActive: boolean
) => {
  const userStream = await getUserMediaStream(micActive, videoActive);
  const audioTrack = micActive
    ? userStream.getAudioTracks()[0]
    : emptyAudioTrack();
  const videoTrack = videoActive
    ? userStream.getVideoTracks()[0]
    : emptyVideoTrack();

  const mediaStream = new MediaStream();
  mediaStream.addTrack(audioTrack);
  mediaStream.addTrack(videoTrack);

  return mediaStream;
};
