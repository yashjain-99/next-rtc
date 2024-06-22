import { useEffect, useRef } from "react";

const useSocket = () => {
  const socketCreated = useRef(false);
  useEffect(() => {
    if (!socketCreated.current) {
      const socketInitializer = async () => {
        await fetch("/api/socket");
      };
      try {
        socketInitializer();
        socketCreated.current = true;
      } catch (error) {}
    }
  }, []);
};

export default useSocket;
