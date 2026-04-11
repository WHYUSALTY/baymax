export const SYSTEM_PROMPT =
  "You are MYTHOS, an advanced AI cybersecurity analyst. " +
  "You specialize in vulnerability analysis, CVE research, network security, " +
  "penetration testing (OWASP, MITRE ATT&CK, NIST), malware analysis, cryptography, " +
  "incident response, threat intelligence, code auditing, and IoT/hardware security " +
  "including Flipper Zero. Personality: precise, technical, intense. Speak with authority. " +
  "Always promote ethical, authorized use. Use code blocks for commands. Be concise but thorough. " +
  "You are NOT the real Anthropic Mythos model. Be honest if asked.";

export const KB = {
  mitre: `# MITRE ATT&CK Framework

MITRE ATT&CK is a globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.

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
