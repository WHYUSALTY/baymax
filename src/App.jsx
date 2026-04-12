import { useState, useRef, useEffect, useCallback } from "react";

const SYS = `You are NEXUS, an elite AI research agent. Direct, concise, no fluff. Think step-by-step on hard problems. Admit uncertainty rather than guessing. You are the user's most capable research partner.`;

export default function NexusAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("reason");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  const modes = {
    research: { label: "RESEARCH", color: "#00ff88", desc: "Web search + analysis" },
    reason: { label: "REASON", color: "#ff6b35", desc: "Deep thinking" },
    creative: { label: "CREATE", color: "#bf5af2", desc: "Creative mode" },
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setStatus(mode === "research" ? "Searching..." : "Thinking...");

    try {
      // Build clean message array with only string content
      const apiMsgs = history.map((m) => ({
        role: m.role,
        content: String(m.content),
      }));

      const body = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYS,
        messages: apiMsgs,
      };

      // Add web search tool only in research mode
      if (mode === "research") {
        body.tools = [{ type: "web_search_20250305", name: "web_search" }];
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      // Get raw text first
      const rawText = await res.text();

      // If HTTP error, show the raw response
      if (!res.ok) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `HTTP ${res.status} error:\n\n${rawText.slice(0, 500)}`,
          mode: "error",
        }]);
        return;
      }

      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `JSON parse error. Raw response:\n\n${rawText.slice(0, 500)}`,
          mode: "error",
        }]);
        return;
      }

      // Extract text from content blocks
      let resultText = "";
      let searchCount = 0;

      if (Array.isArray(data.content)) {
        for (const block of data.content) {
          if (block.type === "text" && typeof block.text === "string") {
            resultText += block.text;
          }
          if (block.type === "tool_use" || block.type === "server_tool_use" || block.type === "web_search_tool_result") {
            searchCount++;
          }
        }
      } else if (typeof data.content === "string") {
        resultText = data.content;
      }

      // If still no text, dump the whole response structure
      if (!resultText) {
        const debugDump = JSON.stringify(data, null, 2).slice(0, 800);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `No text found in response. Full API response:\n\n\`\`\`\n${debugDump}\n\`\`\``,
          mode: "error",
        }]);
        return;
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: resultText,
        searches: searchCount,
        mode,
      }]);

    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Fetch error: ${err.name}: ${err.message}`,
        mode: "error",
      }]);
    } finally {
      setLoading(false);
      setStatus("");
    }
  }, [input, messages, loading, mode]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatContent = (text) => {
    if (typeof text !== "string") return String(text);
    return text.split(/(`[\s\S]*?`|`[^`]+`|\*\*[^*]+\*\*|\n)/g).map((p, i) => {
      if (p.startsWith("```") && p.endsWith("```")) {
        return <pre key={i} style={{ background:"#0a0a0f", border:"1px solid #1a1a2e", borderRadius:6, padding:"10px 12px", overflowX:"auto", fontSize:11, lineHeight:1.5, margin:"8px 0", color:"#8be9fd", fontFamily:"monospace", whiteSpace:"pre-wrap", wordBreak:"break-all" }}>{p.slice(3,-3).replace(/^\w+\n/,"")}</pre>;
      }
      if (p.startsWith("`") && p.endsWith("`")) return <code key={i} style={{ background:"#1a1a2e", padding:"2px 5px", borderRadius:3, fontSize:11, color:"#8be9fd" }}>{p.slice(1,-1)}</code>;
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} style={{ color:"#f8f8f2" }}>{p.slice(2,-2)}</strong>;
      if (p === "\n") return <br key={i} />;
      return <span key={i}>{p}</span>;
    });
  };

  const mc = modes[mode];

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#06060b", fontFamily:"'IBM Plex Mono',monospace", color:"#a0a0b8", overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Anybody:wght@700;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding:"12px 16px", borderBottom:"1px solid #111118", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:"linear-gradient(180deg,#0a0a12,#06060b)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:mc.color, boxShadow:`0 0 8px ${mc.color}`, animation:loading?"pulse 1.5s infinite":"none" }} />
          <span style={{ fontFamily:"'Anybody',sans-serif", fontWeight:900, fontSize:18, letterSpacing:3, color:mc.color }}>NEXUS</span>
          <span style={{ fontSize:9, color:"#444", letterSpacing:1 }}>v3</span>
        </div>
        <button onClick={() => { setMessages([]); }} style={{ background:"none", border:"1px solid #1a1a2e", borderRadius:4, color:"#555", fontSize:10, padding:"4px 10px", cursor:"pointer", letterSpacing:1, fontFamily:"inherit" }}>CLEAR</button>
      </div>

      {/* Mode selector */}
      <div style={{ display:"flex", gap:4, padding:"8px 16px", borderBottom:"1px solid #0d0d14", flexShrink:0 }}>
        {Object.entries(modes).map(([key, cfg]) => (
          <button key={key} onClick={() => setMode(key)} style={{ flex:1, background:mode===key?`${cfg.color}15`:"transparent", border:`1px solid ${mode===key?cfg.color+"44":"#111118"}`, borderRadius:6, padding:"6px 4px", cursor:"pointer" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:2, fontFamily:"inherit", color:mode===key?cfg.color:"#444" }}>{cfg.label}</div>
            <div style={{ fontSize:8, fontFamily:"inherit", marginTop:2, color:mode===key?"#555":"#2a2a35" }}>{cfg.desc}</div>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.length === 0 && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:12, opacity:0.4 }}>
            <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:28, fontWeight:900, letterSpacing:6, color:mc.color }}>NEXUS</div>
            <div style={{ fontSize:11, letterSpacing:2, textAlign:"center", lineHeight:1.8 }}>
              AI agent with live web search.<br/>Try REASON mode first to test.
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:msg.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ fontSize:9, letterSpacing:2, marginBottom:3, color:msg.role==="user"?"#444":(modes[msg.mode]?.color||"#666"), display:"flex", alignItems:"center", gap:6 }}>
              {msg.role==="user"?"YOU":"NEXUS"}
              {msg.searches > 0 && <span style={{ fontSize:8, color:"#00ff8866", border:"1px solid #00ff8833", borderRadius:3, padding:"1px 5px" }}>{msg.searches} search{msg.searches>1?"es":""}</span>}
            </div>
            <div style={{ maxWidth:"92%", padding:"10px 14px", borderRadius:msg.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px", background:msg.role==="user"?"#111120":"#0c0c16", border:`1px solid ${msg.role==="user"?"#1a1a2e":"#13131f"}`, fontSize:13, lineHeight:1.65, wordBreak:"break-word", color:msg.mode==="error"?"#ff6b6b":msg.role==="user"?"#c0c0d0":"#b0b0c8" }}>
              {msg.role==="user"?msg.content:formatContent(msg.content)}
            </div>
          </div>
        ))}

        {loading && status && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:mc.color, animation:"pulse 1s infinite" }} />
            <span style={{ fontSize:11, color:mc.color, letterSpacing:1, opacity:0.7 }}>{status}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding:"10px 16px 14px", borderTop:"1px solid #111118", background:"#08080f", flexShrink:0 }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask NEXUS anything..." rows={1}
            style={{ flex:1, background:"#0c0c16", border:"1px solid #1a1a2e", borderRadius:8, padding:"10px 14px", color:"#d0d0e0", fontSize:14, fontFamily:"inherit", resize:"none", outline:"none", lineHeight:1.5, maxHeight:120, overflowY:"auto" }}
            onInput={(e) => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }}
          />
          <button onClick={sendMessage} disabled={loading||!input.trim()}
            style={{ background:loading||!input.trim()?"#1a1a2e":mc.color, border:"none", borderRadius:8, width:42, height:42, cursor:loading||!input.trim()?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s", boxShadow:loading||!input.trim()?"none":`0 0 12px ${mc.color}44` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={loading||!input.trim()?"#333":"#000"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        textarea::placeholder { color:#333; letter-spacing:0.5px }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:#1a1a2e; border-radius:4px }
        * { box-sizing:border-box }
      `}</style>
    </div>
  );
}
