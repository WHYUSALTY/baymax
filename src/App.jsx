import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import TypingDots from "./components/TypingDots";
import { getResponse } from "./utils/getResponse";
import { KB } from "./data/knowledgeBase";

const TYPING_DELAY_MS = 800;

const CODE_COMPONENTS = {
  code({ inline, className, children, ...props }) {
    const language = /language-(\w+)/.exec(className ?? "")?.[1];
    return !inline && language ? (
      <SyntaxHighlighter style={vscDarkPlus} language={language} PreTag="div" {...props}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: KB.default },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(text) ?? KB.default;
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, TYPING_DELAY_MS);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <span className="header-logo">⬡</span>
        <h1 className="header-title">MYTHOS</h1>
        <span className="header-tag">Cybersecurity AI</span>
      </header>

      <main className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message message--${msg.role}`}>
            <span className="message-label">{msg.role === "user" ? "YOU" : "MYTHOS"}</span>
            <div className="message-body">
              <ReactMarkdown components={CODE_COMPONENTS}>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message message--assistant">
            <span className="message-label">MYTHOS</span>
            <div className="message-body">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="input-bar">
        <textarea
          ref={inputRef}
          className="input-field"
          rows={1}
          placeholder="Ask about CVEs, nmap, buffer overflows, Flipper Zero…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          aria-label="Send"
        >
          ➤
        </button>
      </footer>
    </div>
  );
}
