import { useEffect, useState } from "react";

export default function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log(`Connected`);
      ws.send("Hello Server!");
    };

    ws.onmessage = (msg) => {
      console.log(`Message: ${msg.data}`);
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  return socket;
}
