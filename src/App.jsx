import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT =
  "You are MYTHOS, an advanced AI cybersecurity analyst. You specialize in vulnerability analysis, CVE research, network security, penetration testing (OWASP, MITRE ATT&CK, NIST), malware analysis, cryptography, incident response, threat intelligence, code auditing, and IoT/hardware security including Flipper Zero. Personality: precise, technical, intense. Speak with authority. Always promote ethical, authorized use. Use code blocks for commands. Be concise but thorough. You are NOT the real Anthropic Mythos model. Be honest if asked.";

const KB = {
  mitre: `# MITRE ATT&CK Framework

MITRE ATT\&CK is a globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.

## Structure
- **Tactics** (the WHY): 14 categories like Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, C2, Exfiltration, Impact
- **Techniques** (the HOW): ~200 techniques mapped to tactics
- **Sub-techniques**: Granular variations
- **Procedures**: Specific implementations by threat groups

## Key Matrices
- Enterprise (Windows, macOS, Linux, Cloud)
- Mobile (Android, iOS)
- ICS (Industrial Control Systems)

## Usage
\`\`\`
# Map detected behavior to ATT&CK
T1566.001 - Phishing: Spearphishing Attachment
T1059.001 - Command & Scripting: PowerShell
T1055     - Process Injection
\`\`\`

Use ATT&CK Navigator to visualize coverage gaps in your defenses. Essential for threat modeling and red team operations.`,

  buffer: `# Buffer Overflow Fundamentals

A buffer overflow occurs when a program writes data beyond the allocated memory buffer, corrupting adjacent memory.

## Types
- **Stack-based**: Overwrites return address on the stack
- **Heap-based**: Corrupts heap metadata/function pointers
- **Integer overflow**: Arithmetic wraps, leading to undersized allocation

## Classic Stack Overflow
\`\`\`c
void vulnerable(char *input) {
    char buffer[64];
    strcpy(buffer, input);  // No bounds checking!
}
\`\`\`

## Exploitation Steps
1. Identify overflow point (fuzzing, code review)
2. Determine offset to return address
3. Control EIP/RIP (instruction pointer)
4. Redirect to shellcode or ROP chain

## Protections
- **ASLR**: Randomizes memory layout
- **Stack Canaries**: Detect overwrites before return
- **DEP/NX**: Non-executable stack
- **PIE**: Position-independent executables

## Practice
\`\`\`bash
# Disable protections for learning
gcc -fno-stack-protector -z execstack -no-pie vuln.c -o vuln
\`\`\`

Practice on: TryHackMe Buffer Overflow Prep, HackTheBox, OverTheWire`,

  wpa2: `# WPA2 Handshake Attack (Authorized Testing Only)

The 4-way handshake in WPA2 can be captured and cracked offline.

## Attack Flow
1. **Monitor mode**: Put wireless adapter in monitor mode
2. **Capture handshake**: Wait for client connection or force deauth
3. **Offline crack**: Brute-force the PSK against the captured handshake

## Tools Required
- Aircrack-ng suite
- Hashcat (GPU cracking)
- Compatible wireless adapter (monitor mode + injection)
- Flipper Zero WiFi dev board (for deauth/capture)

## Commands
\`\`\`bash
# Enable monitor mode
airmon-ng start wlan0

# Scan for targets
airodump-ng wlan0mon

# Capture handshake on target channel
airodump-ng -c [CH] --bssid [AP_MAC] -w capture wlan0mon

# Deauth to force reconnection
aireplay-ng -0 5 -a [AP_MAC] -c [CLIENT_MAC] wlan0mon

# Crack with hashcat (much faster than aircrack)
hashcat -m 22000 capture.hc22000 wordlist.txt
\`\`\`

## Defense
- Use WPA3 (SAE handshake)
- 802.11w (Management Frame Protection)
- Strong, random passphrases (20+ chars)
- Monitor for deauth floods

⚠ Only test on networks YOU OWN or have WRITTEN AUTHORIZATION to test.`,

  cve2026: `# Notable CVEs in 2026 (So Far)

## Critical
- **CVE-2026-20131** (CVSS 10.0) — Cisco FMC insecure deserialization. Unauthenticated RCE as root. Exploited by Interlock ransomware since January.
- **CVE-2026-35616** (CVSS 9.8) — FortiClient EMS zero-day. Emergency hotfix released Easter weekend. ~2000 exposed instances found.

## Chrome Zero-Days (4 so far)
- CVE-2026-2441 — Use-after-free in CSS
- CVE-2026-3909 — OOB write in Skia graphics
- CVE-2026-3910 — V8 JavaScript engine flaw
- CVE-2026-5281 — Use-after-free in Dawn/WebGPU

## Apple
- **CVE-2026-20700** — iOS memory corruption in dyld. Used in targeted surveillance attacks.

## Microsoft (Feb Patch Tuesday)
- 6 actively exploited zero-days including:
  - CVE-2026-21510 — SmartScreen bypass
  - CVE-2026-21519 — DWM privilege escalation to SYSTEM
  - CVE-2026-21533 — RDP privilege escalation

## Other
- **CVE-2026-3502** — TrueConf supply chain attack targeting SE Asian governments. Chinese-nexus APT deploying Havoc implant.

Stay patched. Monitor CISA KEV catalog.`,

  flipper: `# Flipper Zero Security Research Guide

## Core Capabilities
- **Sub-GHz**: Capture/replay signals (garage doors, remotes)
- **RFID/NFC**: Read, emulate, write cards
- **Infrared**: Universal remote, capture custom signals
- **BadUSB/HID**: Keystroke injection attacks
- **GPIO**: Connect external modules

## WiFi Dev Board (Marauder)
\`\`\`bash
# Flash Marauder firmware
# Then access via Flipper or serial

# Scan for APs
scanap

# Scan for stations
scansta

# Targeted deauth
select -a [AP_INDEX]
attack -t deauth

# Capture handshakes
sniffpmkid
sniffpwnagotchi
\`\`\`

## Ethical Use Cases
- Test YOUR OWN access control systems
- Audit YOUR wireless network security
- Learn RF protocols in a home lab
- BadUSB payloads for authorized pentests
- 802.11w MFP testing

## Home Lab Setup
1. Isolated network (separate SSID/VLAN)
2. Kali Linux VM for cracking
3. Wireshark for packet analysis
4. Document everything

⚠ Never test on systems without explicit written authorization.`,

  nmap: `# Nmap Scanning Essentials

## Basic Scans
\`\`\`bash
# Quick scan top 1000 ports
nmap -sV 192.168.1.0/24

# Full port scan with OS detection
nmap -sV -sC -O -p- target_ip

# Stealth SYN scan
nmap -sS -T4 target_ip

# UDP scan
nmap -sU --top-ports 100 target_ip

# Vulnerability scan with scripts
nmap --script vuln target_ip
\`\`\`

## Useful NSE Scripts
\`\`\`bash
# SMB vulnerabilities
nmap --script smb-vuln* -p 445 target

# HTTP enumeration
nmap --script http-enum -p 80,443 target

# SSL/TLS analysis
nmap --script ssl-enum-ciphers -p 443 target

# Brute force
nmap --script ssh-brute -p 22 target
\`\`\`

## Output Formats
\`\`\`bash
# All formats at once
nmap -oA scan_results target
# XML for parsing
nmap -oX results.xml target
\`\`\`

Always scan with authorization only.`,

  default: `I'm MYTHOS — your cybersecurity research assistant.

I can help with:
- **Vulnerability Analysis**: CVEs, zero-days, exploit chains
- **Penetration Testing**: Methodology, tools, techniques
- **Network Security**: Scanning, defense, monitoring
- **MITRE ATT&CK**: Threat modeling, TTPs
- **Hardware Security**: Flipper Zero, IoT, RF
- **Cryptography**: Protocols, implementations, weaknesses
- **Incident Response**: Forensics, threat hunting

Try asking about specific topics, tools, or techniques. All guidance is for authorized, ethical use only.`,
};

function getKBResponse(query) {
  const q = query.toLowerCase();
  if (q.includes("mitre") || q.includes("att&ck") || q.includes("attack framework")) return KB.mitre;
  if (q.includes("buffer overflow") || q.includes("buffer over") || q.includes("bof")) return KB.buffer;
  if (q.includes("wpa") || q.includes("handshake") || q.includes("wifi hack") || q.includes("wireless") || q.includes("deauth")) return KB.wpa2;
  if (q.includes("cve") || q.includes("zero-day") || q.includes("zero day") || q.includes("zeroday") || q.includes("vulnerabilit") || q.includes("2026")) return KB.cve2026;
  if (q.includes("flipper") || q.includes("marauder") || q.includes("badusb") || q.includes("rfid") || q.includes("nfc") || q.includes("sub-ghz") || q.includes("subghz")) return KB.flipper;
  if (q.includes("nmap") || q.includes("scan") || q.includes("port scan") || q.includes("recon")) return KB.nmap;
  return null;
}

const BOOT_LINES = [
  "> Initializing MYTHOS kernel…",
  "> Loading neural architecture… OK",
  "> Mounting threat intelligence databases…",
  "> CVE feeds synchronized [2026.04.10]",
  "> MITRE ATT&CK framework loaded",
  "> Cryptographic modules verified",
  "> Network analysis engines online",
  "> Sandbox environment: ACTIVE",
  "> Ethical constraints: ENFORCED",
  "> ██████████████████████████ 100%",
  "> MYTHOS v0.1-preview READY",
];

const SUGGESTION_CHIPS = [
  "MITRE ATT&CK",
  "Buffer overflow",
  "WPA2 handshake attack",
  "CVEs 2026",
  "Flipper Zero",
  "Nmap scanning",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "12px 0", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#00ff88",
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Msg({ role, content }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "14px 18px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg, #00cc6a, #00885a)"
            : "rgba(255,255,255,0.04)",
          border: isUser ? "none" : "1px solid rgba(0,255,136,0.12)",
          color: isUser ? "#000" : "#c8d6d0",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {!isUser && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#00ff88",
              letterSpacing: 2,
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            MYTHOS
          </div>
        )}
        {content}
      </div>
    </div>
  );
}

export default function MythosAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booted, setBooted] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [mode, setMode] = useState("init");
  const chatRef = useRef(null);

  // Boot sequence
  useEffect(() => {
    let idx = 0;
    const t = setInterval(() => {
      if (idx < BOOT_LINES.length) {
        const line = BOOT_LINES[idx];
        setBootLines((prev) => [...prev, line]);
        idx++;
      } else {
        clearInterval(t);
        setTimeout(() => {
          setBooted(true);
          // Probe API availability (will fail without key — graceful offline fallback)
          fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-5",
              max_tokens: 10,
              messages: [{ role: "user", content: "ping" }],
            }),
          })
            .then((r) => r.json())
            .then((d) => {
              setMode(d.content ? "online" : "offline");
            })
            .catch(() => setMode("offline"));
        }, 600);
      }
    }, 180);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading, bootLines]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    let assistantText = "";

    if (mode === "online") {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: newMsgs.map(({ role, content }) => ({ role, content })),
          }),
        });
        const data = await res.json();
        if (data.content && Array.isArray(data.content)) {
          assistantText = data.content
            .filter((b) => b.type === "text")
            .map((b) => b.text)
            .join("\n");
        }
        if (!assistantText) {
          setMode("offline");
          assistantText = getKBResponse(userMsg.content) || KB.default;
        }
      } catch {
        setMode("offline");
        assistantText = getKBResponse(userMsg.content) || KB.default;
      }
    } else {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
      assistantText = getKBResponse(userMsg.content) || KB.default;
    }

    setMessages([...newMsgs, { role: "assistant", content: assistantText }]);
    setLoading(false);
  }

  const styles =
    "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');" +
    "@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}" +
    "@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}" +
    "textarea:focus{outline:none;}textarea::placeholder{color:rgba(0,255,136,0.3);}" +
    "::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(0,255,136,0.2);border-radius:4px;}";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f0d",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <style>{styles}</style>

      {/* CRT scanline overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 100,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.008) 2px, rgba(0,255,136,0.008) 4px)",
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(0,255,136,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0,15,10,0.95)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: booted ? "#00ff88" : "#ff4444",
            boxShadow: booted ? "0 0 12px #00ff88" : "0 0 12px #ff4444",
            transition: "all 0.5s ease",
          }}
        />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#00ff88", letterSpacing: 4 }}>
            MYTHOS
          </div>
          <div style={{ fontSize: 9, color: "rgba(0,255,136,0.4)", letterSpacing: 1.5 }}>
            {!booted
              ? "BOOTING..."
              : mode === "online"
              ? "CYBERSECURITY AI • LIVE"
              : "CYBERSECURITY AI • OFFLINE MODE"}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(0,255,136,0.25)" }}>v0.1</div>
      </div>

      {/* Chat area */}
      <div
        ref={chatRef}
        style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column" }}
      >
        {!booted ? (
          <div style={{ padding: 8 }}>
            {bootLines.map((ln, i) => {
              const isReady = ln.includes("READY");
              const isFull = ln.includes("100%");
              return (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: isReady ? "#00ff88" : isFull ? "#00cc6a" : "rgba(0,255,136,0.5)",
                    fontWeight: isReady ? 700 : 400,
                    marginBottom: 4,
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  {ln}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {messages.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  animation: "fadeIn 0.5s ease",
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    color: "#00ff88",
                    opacity: 0.15,
                    fontWeight: 700,
                    letterSpacing: 12,
                  }}
                >
                  M
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(0,255,136,0.3)",
                    textAlign: "center",
                    maxWidth: 320,
                    lineHeight: 1.8,
                  }}
                >
                  {"Cybersecurity analysis ready.\nAsk about vulnerabilities, exploits, network defense, pentesting, or threat intelligence."}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                    marginTop: 8,
                  }}
                >
                  {SUGGESTION_CHIPS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      style={{
                        background: "rgba(0,255,136,0.06)",
                        border: "1px solid rgba(0,255,136,0.15)",
                        borderRadius: 8,
                        padding: "8px 14px",
                        color: "rgba(0,255,136,0.5)",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <Msg key={i} role={m.role} content={m.content} />
            ))}
            {loading && <TypingDots />}
          </div>
        )}
      </div>

      {/* Input bar */}
      {booted && (
        <div
          style={{
            padding: "12px 16px 16px",
            borderTop: "1px solid rgba(0,255,136,0.08)",
            background: "rgba(0,15,10,0.95)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: "rgba(0,255,136,0.03)",
              border: "1px solid rgba(0,255,136,0.12)",
              borderRadius: 14,
              padding: "10px 14px",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Enter query..."
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#c8d6d0",
                fontSize: 13.5,
                fontFamily: "inherit",
                resize: "none",
                lineHeight: 1.5,
                maxHeight: 120,
                overflowY: "auto",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                background:
                  input.trim() && !loading ? "#00ff88" : "rgba(0,255,136,0.15)",
                border: "none",
                borderRadius: 10,
                width: 38,
                height: 38,
                cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={input.trim() && !loading ? "#0a0f0d" : "rgba(0,255,136,0.3)"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 9,
              color: "rgba(0,255,136,0.15)",
              marginTop: 8,
            }}
          >
            Powered by Claude {mode === "online" ? "• Live" : "• Offline KB"} • Authorized use only
          </div>
        </div>
      )}
    </div>
  );
}
