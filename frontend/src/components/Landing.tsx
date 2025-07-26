"use client";

import React, { useEffect, useState } from "react";

export default function Landing() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [generatedRoomId, setGeneratedRoomId] = useState("");
  const [roomCreated, setRoomCreated] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: string; user: string; message: string; timestamp: Date }>
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [userCount, setUserCount] = useState(1);

  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log(`Connected`);
    };

    ws.onmessage = (evt) => {
      try {
        const parsedMessage = JSON.parse(evt.data);

        if (parsedMessage.type === "message") {
          const newMessage = {
            id: parsedMessage.payload.id,
            user: parsedMessage.payload.user,
            message: parsedMessage.payload.message,
            timestamp: new Date(parsedMessage.payload.timestamp),
          };
          setMessages((prev) => [...prev, newMessage]);
        }

        if (parsedMessage.type === "userCount") {
          setUserCount(parsedMessage.count);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    setSocket(ws);

    return () => ws.close();
  }, []);

  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setGeneratedRoomId(newRoomId);
    console.log("Creating new room with ID:", newRoomId);
  };

  const handleJoinRoom = () => {
    if (socket) {
      const joinMessage = JSON.stringify({
        type: "join",
        payload: {
          roomId: roomCode,
          username: name || "Anonymous",
        },
      });

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(joinMessage);
      } else {
        socket.onopen = () => {
          socket.send(joinMessage);
        };
      }

      console.log("Joining room with:", { name, roomCode });
      setRoomCreated(true);
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    if (socket) {
      socket.send(
        JSON.stringify({
          type: "chat",
          payload: {
            message: currentMessage,
          },
        })
      );
    }

    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(generatedRoomId);
      console.log("Room ID copied to clipboard");
    } catch (err) {
      console.error("Failed to copy room ID:", err);
    }
  };

  const copyRoomCode = async () => {
    try {
      const codeToShare = generatedRoomId || roomCode;
      await navigator.clipboard.writeText(codeToShare);
      console.log("Room code copied to clipboard");
    } catch (err) {
      console.error("Failed to copy room code:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-jetbrains">
      {!roomCreated ? (
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="text-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M7 9a2 2 0 012-2h6a2 2 0 012 2v2.4a2 2 0 01-.6 1.4L13 16.2V19a1 1 0 01-2 0v-2.8L7.6 12.8A2 2 0 017 11.4V9z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white">Real Time Chat</h1>
            </div>
            <p className="text-gray-400 text-sm">
              temporary room that expires after all users exit
            </p>
          </div>

          <button
            onClick={handleCreateRoom}
            className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Create New Room
          </button>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white py-3 px-4 rounded-lg placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />

            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 text-white py-3 px-4 rounded-lg placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!name.trim() || !roomCode.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Join Room
              </button>
            </div>
          </div>

          {generatedRoomId && (
            <div className="bg-gray-800 rounded-lg p-6 text-center space-y-3">
              <p className="text-gray-400 text-sm">
                Share this code with your friend
              </p>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-white text-2xl font-bold tracking-wider">
                  {generatedRoomId}
                </span>
                <button
                  onClick={copyRoomId}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy room code"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-4xl h-screen flex flex-col">
          <div className="text-center py-6">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="text-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M7 9a2 2 0 012-2h6a2 2 0 012 2v2.4a2 2 0 01-.6 1.4L13 16.2V19a1 1 0 01-2 0v-2.8L7.6 12.8A2 2 0 017 11.4V9z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Real Time Chat</h1>
            </div>
            <p className="text-gray-400 text-sm">
              temporary room that expires after all users exit
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Room Code:</span>
              <span className="text-white font-bold">
                {generatedRoomId || roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy room code"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>
            </div>
            <div className="text-gray-400 text-sm">
              Users: <span className="text-white">{userCount}</span>
            </div>
          </div>

          <div className="flex-1 bg-gray-900 rounded-lg p-4 mb-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-blue-400 font-medium text-sm">
                        {msg.user}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-gray-900 border border-gray-700 text-white py-3 px-4 rounded-lg placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim()}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
