"use client";

import useSocket from "@/hooks/useSocket";
import React, { useState } from "react";

export default function Ping() {
  const [inputValue, setInputValue] = useState("");

  const socket = useSocket();

  function inputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function buttonClick() {
    socket?.send(inputValue);
  }

  return (
    <div className="flex flex-col gap-4 items-center mt-14">
      <h1 className=" text-6xl font-extrabold mb-20">Ping me</h1>
      <input
        className="border border-white rounded-xl min-w-[50%] px-8 py-4 text-xl mb-8 bg-gray-700"
        type="text"
        placeholder="message"
        value={inputValue}
        onChange={(e) => inputChange(e)}
      />
      <button
        className="text-2xl bg-amber-800 hover:bg-amber-700 font-bold px-8 py-4 rounded-2xl"
        onClick={() => buttonClick()}
      >
        Send
      </button>
    </div>
  );
}
