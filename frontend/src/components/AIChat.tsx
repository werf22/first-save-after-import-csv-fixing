import React, { useState } from "react";
import axios from "axios";

interface ChatMessage {
  from: "user" | "ai";
  text: string;
}

interface AIChatProps {
  auth: { username: string; password: string };
}

export const AIChat: React.FC<AIChatProps> = ({ auth }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setLoading(true);
    try {
      const res = await axios.post("/chat", { message: input }, {
        headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
      });
      setMessages((msgs) => [...msgs, { from: "ai", text: res.data.response }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { from: "ai", text: "[Error contacting AI]" }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div className="ai-chat" aria-label="AI Chat" role="region" style={{ marginTop: "2em", padding: 16, border: "1px dashed #aaa", maxWidth: 500 }}>
      <strong>AI Chat</strong>
      <div role="log" aria-live="polite" style={{ minHeight: 80, margin: "1em 0" }}>
        {messages.length === 0 && <div style={{ color: "#777" }}>Chat with your AI assistant here to edit or plan your tasks.</div>}
        {messages.map((msg, i) => (
          <div key={i} style={{ color: msg.from === "user" ? "#333" : "#1976d2", textAlign: msg.from === "user" ? "right" : "left" }}>
            <b>{msg.from === "user" ? "You" : "AI"}:</b> {msg.text}
          </div>
        ))}
        {loading && <div style={{ color: "#aaa" }}>AI is typing...</div>}
      </div>
      <form onSubmit={sendMessage} aria-label="Send message to AI" style={{ display: "flex", gap: 8 }}>
        <input
          aria-label="Message to AI"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};
