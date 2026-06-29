// ChatBot.js
import { useState } from "react";
import { Input, Button, Spin } from "antd";
import { resolveIntent, executeIntent } from "./intentResolver";
import "./ChatBot.css";

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      type: "TEXT",
      data: "Szia! Kérdezz a készletekről. Pl: \"Mennyi diesel van?\"",
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg = { from: "user", type: "TEXT", data: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const intent = resolveIntent(input);
    const result = await executeIntent(intent);

    setMessages(prev => [...prev, { from: "bot", ...result }]);
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <div className="cb-shell">

      {/* HEADER */}
      <div className="cb-header">
        <span className="cb-dot" />
        <span className="cb-title">Debarro Asszisztens</span>
      </div>

      {/* ÜZENETEK */}
      <div className="cb-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`cb-msg cb-msg--${msg.from}`}>
            {msg.type === "TEXT" && (
              <span className="cb-bubble">{msg.data}</span>
            )}
            {msg.type === "KESZLET" && (
              <div className="cb-bubble cb-bubble--data">
                <span className="cb-data-title">Tartálykészletek:</span>
                {msg.data.map((t, j) => {
                  const pct = Math.round((t.aktualis / t.kapacitas) * 100);
                  const szin = pct < 10 ? "#ff4d4f" : pct < 30 ? "#faad14" : "#52c41a";
                  return (
                    <div key={j} className="cb-tank-row">
                      <span className="cb-tank-nev">{t.nev}</span>
                      <span className="cb-tank-anyag">{t.anyag}</span>
                      <span className="cb-tank-aktualis">{t.aktualis.toFixed(2)} L</span>
                      <span className="cb-tank-kapacitas">{t.kapacitas.toFixed(2)} L</span>
                        <span className="cb-tank-pct" style={{ color: szin }}>{pct}%</span>
                    </div>
                    );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* INPUT */}
      <div className="cb-input">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Írj ide..."
        />
        <Button type="primary" onClick={handleSend} disabled={loading}>
          {loading ? <Spin size="small" /> : "Küldés"}
        </Button>
      </div>
    </div>
  );
}

export default ChatBot;
