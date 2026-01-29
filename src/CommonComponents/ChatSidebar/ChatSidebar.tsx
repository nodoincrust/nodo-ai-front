import React, { useState, useEffect, useMemo, useRef } from "react";
import { notification } from "antd";
import "./chatSidebar.scss";
import { AuthData } from "../../types/common";
import TypingDots from "../Threedots/TypingDots";

interface ChatMessage {
  id: number;
  sender: "assistant" | "user";
  text?: string;
  time?: string;
  senderName?: string;
  isTyping?: boolean
}
interface AiChatResult {
  text: string;
  sessionId: string;
  citations: any[];
}

interface ChatSidebarProps {
  title?: string;
  contextLabel?: string;
  contextValue?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  documentId?: number;
  initialMessages?: ChatMessage[];
onSendMessage?: (
  message: string,
  documentId: number
) => Promise<AiChatResult>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  title = "Ask NODO AI",
  contextLabel = "Context",
  contextValue = "",
  isOpen = true,
  onToggle,
  documentId,
  initialMessages = [],
  onSendMessage,
}) => {
  // Get user info from localStorage
  const authData: AuthData = JSON.parse(
    localStorage.getItem("authData") || "{}"
  );
  const loggedInUserName = authData.user?.name
    ? authData.user.name
        .split(" ")
        .map((w: any) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "User";
  const userInitials = authData.user?.name
    ? authData.user.name
        .split(" ")
        .slice(0, 2)
        .map((word: any) => word.charAt(0).toUpperCase())
        .join("")
    : "U";

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Update messages when initialMessages prop changes
  useEffect(() => {
    setMessages(initialMessages);
    setInput("");
  }, [initialMessages, documentId]);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const autoScrollEnabledRef = useRef(true);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  const isEffectivelyAtBottom = (el: HTMLDivElement) => {
    const thresholdPx = 40; // WhatsApp-like: near bottom still counts
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom <= thresholdPx;
  };

 const handleSend = async () => {
  const trimmed = input.trim();
  if (!trimmed || isSending) return;

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const userMessage: ChatMessage = {
    id: Date.now(),
    sender: "user",
    text: trimmed,
    time: timeString,
    senderName: loggedInUserName,
  };

  const typingMessageId = Date.now() + 1;

  const typingMessage: ChatMessage = {
    id: typingMessageId,
    sender: "assistant",
    senderName: "NODO AI",
    isTyping: true, // 👈 typing state
  };

  setMessages((prev) => [...prev, userMessage, typingMessage]);
  setInput("");
  setIsSending(true);

  try {
    if (onSendMessage && documentId) {
      const result = await onSendMessage(trimmed, documentId);

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingMessageId) // ❌ remove typing
          .concat({
            id: Date.now() + 2,
            sender: "assistant",
            text: result?.text || "No response received.",
            time: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            senderName: "NODO AI",
          })
      );
    }
  } catch (error) {
    notification.error({
      message: "Failed to send message",
      description: "Please try again later.",
    });
  } finally {
    setIsSending(false);
  }
};

  const messagesSignature = useMemo(() => {
    const last = messages[messages.length - 1];
    return `${messages.length}:${last?.id ?? "none"}`;
  }, [messages]);

  useEffect(() => {
    // When sidebar opens, always jump to the latest message
    if (isOpen) {
      // allow DOM to paint first
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll only if the user is already near the bottom (so they can scroll up)
    if (!isOpen) return;
    if (!autoScrollEnabledRef.current) return;
    requestAnimationFrame(() => scrollToBottom("auto"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesSignature, isOpen]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
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
            {isOpen ? (
              <img src="/assets/expand.svg" alt="" />
            ) : (
              <img src="/assets/collapse.svg" alt="" />
            )}
          </button>
        )}
      </div>

      {!isOpen && (
        <button
          type="button"
          className="chat-icon-btn"
          onClick={onToggle}
          title="Open Chat"
        >
          <img src="/assets/chat.svg" alt="Chat" />
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="chat-messages"
            ref={messagesContainerRef}
            onScroll={() => {
              const el = messagesContainerRef.current;
              if (!el) return;
              autoScrollEnabledRef.current = isEffectivelyAtBottom(el);
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message chat-message--${msg.sender}`}
              >
                <div className="chat-message-header">
                  {msg.sender === "assistant" ? (
                    <>
                      <img
                        src="/assets/Main-Logo.svg"
                        alt="NODO AI"
                        className="chat-avatar chat-avatar--assistant"
                      />
                      <div className="chat-sender-info">
                        <span className="chat-sender-name">
                          {msg.senderName || "NODO AI"}
                        </span>
                        {msg.time && (
                          <span className="chat-time">{msg.time}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="chat-sender-info">
                       <span className="chat-sender-name">
                          {msg.senderName || loggedInUserName}
                        </span>
                        {msg.time && (
                          <span className="chat-time">{msg.time}</span>
                        )}
                       
                      </div>
                      <div className="chat-avatar chat-avatar--user">
                        {userInitials}
                      </div>
                    </>
                  )}
                </div>
                <div className="bubble">{msg.isTyping ? <TypingDots/> :msg.text}</div>
                
              </div>
            ))}
          </div>

          <div className="chat-input">
            <div className="chat-input-row">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this document"
                rows={1}
              />
              <button
                type="button"
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isSending}
              >
                <img src="/assets/uparrow.svg" alt="Send" />
              </button>
            </div>
            <p className="chat-input-hint">
              AI can make mistakes. Verify important info.
            </p>
          </div>
        </>
      )}
    </aside>
  );
};

export default ChatSidebar;
