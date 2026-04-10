import { KB } from "../data/knowledgeBase";

const RULES = [
  { keywords: ["mitre", "att&ck", "attack framework"], key: "mitre" },
  { keywords: ["buffer overflow", "buffer over", "bof"], key: "buffer" },
  { keywords: ["wpa", "handshake", "wifi hack", "wireless", "deauth"], key: "wpa2" },
  {
    keywords: ["cve", "zero-day", "zero day", "zeroday", "vulnerabilit", "2026"],
    key: "cve2026",
  },
  {
    keywords: ["flipper", "marauder", "badusb", "rfid", "nfc", "sub-ghz", "subghz"],
    key: "flipper",
  },
  { keywords: ["nmap", "scan", "port scan", "recon"], key: "nmap" },
];

export const getResponse = (query) => {
  const q = query.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => q.includes(kw))) {
      return KB[rule.key];
    }
  }
  return null;
};
