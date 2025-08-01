import WebSocket, { WebSocketServer } from "ws";
import http, { IncomingMessage, ServerResponse } from "http";
import * as dotenv from "dotenv";

dotenv.config();

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200);
    res.end("WebSocket server is running");
  }
);

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ server });

interface Users {
  socket: WebSocket;
  room: string;
  username: string;
}

let all_sockets: Users[] = [];

wss.on("connection", (ws: WebSocket) => {
  ws.on("error", console.error);

  ws.on("message", (data: WebSocket.RawData) => {
    try {
      const parsed_data = JSON.parse(data.toString());

      if (parsed_data.type === "join") {
        all_sockets.push({
          socket: ws,
          room: parsed_data.payload.roomId,
          username: parsed_data.payload.username || "Anonymous",
        });

        const roomUsers = all_sockets.filter(
          (x) => x.room === parsed_data.payload.roomId
        );

        const userCountMessage = {
          type: "userCount",
          count: roomUsers.length,
        };

        roomUsers.forEach((user) => {
          if (user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify(userCountMessage));
          }
        });
      }

      if (parsed_data.type === "chat") {
        const current_user = all_sockets.find((x) => x.socket === ws);

        if (current_user) {
          const messageObject = {
            type: "message",
            payload: {
              id: Date.now().toString(),
              user: current_user.username,
              message: parsed_data.payload.message,
              timestamp: new Date().toISOString(),
            },
          };

          all_sockets
            .filter((x) => x.room === current_user.room)
            .forEach((x) => {
              if (x.socket.readyState === WebSocket.OPEN) {
                x.socket.send(JSON.stringify(messageObject));
              }
            });
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    const disconnectedUser = all_sockets.find((x) => x.socket === ws);

    if (disconnectedUser) {
      all_sockets = all_sockets.filter((x) => x.socket !== ws);

      const roomUsers = all_sockets.filter(
        (x) => x.room === disconnectedUser.room
      );

      const userCountMessage = {
        type: "userCount",
        count: roomUsers.length,
      };

      roomUsers.forEach((user) => {
        if (user.socket.readyState === WebSocket.OPEN) {
          user.socket.send(JSON.stringify(userCountMessage));
        }
      });
    }
  });
});

server.listen(Number(PORT), () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});
