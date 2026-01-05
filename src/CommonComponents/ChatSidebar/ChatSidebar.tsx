import React, { useState } from "react";
import { DoubleRightOutlined, DoubleLeftOutlined } from "@ant-design/icons";
import "./chatSidebar.scss";

interface ChatMessage {
  id: number;
  sender: "assistant" | "user";
  text: string;
  time?: string;
}

interface ChatSidebarProps {
  title?: string;
  contextLabel?: string;
  contextValue?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  title = "Ask NODO AI",
  contextLabel = "Context",
  contextValue = "Q3 Financial Report",
  isOpen = true,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "assistant",
      text:
        "Hello! I’ve analyzed the Q3 Financial Report. I can help you summarize key metrics, extract revenue data, or compare this quarter to previous ones. What would you like to know?",
      time: "10:23 AM",
    },
    {
      id: 2,
      sender: "user",
      text: "What is the total revenue for this quarter and how does it compare to Q2?",
      time: "10:23 AM",
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: trimmed, time: "Now" },
    ]);
    setInput("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className={`chat-sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="chat-sidebar-header">
        <div>
          <h3 className="chat-title">{title}</h3>
          {isOpen && (
            <p className="chat-subtitle">
              <span className="chat-context-label">{contextLabel}:</span>{" "}
              <span className="chat-context-value">{contextValue}</span>
            </p>
          )}
        </div>
        {onToggle && (
          <button
            type="button"
            className="chat-toggle-btn"
            onClick={onToggle}
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message chat-message--${msg.sender}`}
          >
            <div className="bubble">{msg.text}</div>
            {msg.time && <span className="time">{msg.time}</span>}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <label className="chat-input-label">Ask a question about this document</label>
        <div className="chat-input-row">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
          />
          <button
            type="button"
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <img src="/assets/send.svg" alt="Send" />
          </button>
        </div>
        <p className="chat-input-hint">AI can make mistakes. Verify important info.</p>
      </div>
        </>
      )}
    </aside>
  );
};

export default ChatSidebar;


