'use client';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

interface Message {
  user: string;
  text: string;
}

type ChatProps = {

  currentUser: string;

  messages: Message[];

};


const Chat: React.FC<ChatProps> = ({ currentUser, messages }) => {

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('chat message', (msg: Message) => {
      setChatMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = () => {
    if (message) {
      const msg = { user: currentUser, text: message };
      socket.emit('chat message', msg);
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-0 right-0 w-1/3 p-4 bg-gray-800">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 ${
                msg.user === currentUser ? 'text-blue-500' : 'text-white'
              }`}
            >
              <strong>{msg.user}: </strong>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 text-black"
          />
          <button onClick={sendMessage} className="p-2 bg-blue-500">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;