import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log("Socket is already attached");
    return res.end();
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Triggered when a peer hits the join room button.
    socket.on("join", (roomName: string) => {
      const { rooms } = io.sockets.adapter;
      const room = rooms.get(roomName);

      // room == undefined when no such room exists.
      if (room === undefined) {
        console.log("User created room", roomName);
        socket.join(roomName);
        socket.emit("created");
      } else if (room.size === 1) {
        console.log("User joined room", roomName);
        // room.size == 1 when one person is inside the room.
        socket.join(roomName);
        socket.emit("joined");
      } else {
        // when there are already two people inside the room.
        socket.emit("full");
      }
    });

    // Triggered when the person who joined the room is ready to communicate.
    socket.on("ready", (roomName: string) => {
      socket.broadcast.to(roomName).emit("ready"); // Informs the other peer in the room.
    });

    // Triggered when server gets an icecandidate from a peer in the room.
    socket.on(
      "ice-candidate",
      (candidate: RTCIceCandidateInit, roomName: string) => {
        socket.broadcast.to(roomName).emit("ice-candidate", candidate); // Sends Candidate to the other peer in the room.
      }
    );

    // Triggered when server gets an offer from a peer in the room.
    socket.on("offer", (offer: RTCSessionDescriptionInit, roomName: string) => {
      socket.broadcast.to(roomName).emit("offer", offer); // Sends Offer to the other peer in the room.
    });

    // Triggered when server gets an answer from a peer in the room.
    socket.on(
      "answer",
      (answer: RTCSessionDescriptionInit, roomName: string) => {
        socket.broadcast.to(roomName).emit("answer", answer); // Sends Answer to the other peer in the room.
      }
    );

    socket.on("leave", (roomName: string) => {
      socket.leave(roomName);
      socket.broadcast.to(roomName).emit("leave");
    });
  });

  return res.end();
};

export default SocketHandler;
