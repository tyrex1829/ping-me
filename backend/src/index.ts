import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Users {
  socket: WebSocket;
  room: string;
}

let all_sockets: Users[] = [];

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data) => {
    const parsed_data = JSON.parse(data as unknown as string);

    if (parsed_data.type === "join") {
      all_sockets.push({
        socket: ws,
        room: parsed_data.payload.roomId,
      });
    }

    if (parsed_data.type === "chat") {
      const current_user_room = all_sockets.find((x) => x.socket === ws)?.room;

      if (current_user_room) {
        all_sockets
          .filter((x) => x.room === current_user_room)
          .forEach((x) => {
            if (x.socket.readyState === WebSocket.OPEN) {
              x.socket.send(parsed_data.payload.message);
            }
          });
      }
    }
  });
});
