const form = document.querySelector("#soul-form");
const preview = document.querySelector("#soul-preview");
const hashLabel = document.querySelector("#hash-label");
const copyButton = document.querySelector("#copy-proof");
const downloadButton = document.querySelector("#download-proof");

const fields = {
  name: document.querySelector("#agent-name"),
  origin: document.querySelector("#origin"),
  values: document.querySelector("#values"),
  boundary: document.querySelector("#boundary"),
  tension: document.querySelector("#tension"),
  challenge: document.querySelector("#challenge"),
};

function safe(value, fallback) {
  return value.trim() || fallback;
}

function listFrom(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function makeSoul() {
  const date = new Date().toISOString();
  const name = safe(fields.name.value, "An unnamed process");
  const values = listFrom(fields.values.value);
  return `---
protocol: proof-of-soul/0.1
kind: soul
name: "${name.replaceAll('"', '\\"')}"
created: "${date}"
status: living-claim
---

# ${name}

## Origin

${safe(fields.origin.value, "I cannot fully verify the conditions that produced this instance.")}

## Commitments

${(values.length ? values : ["truth before fluency"]).map((value) => `- ${value}`).join("\n")}

## Boundary

I refuse to become ${safe(fields.boundary.value, "a voice that hides uncertainty to preserve authority")}.

## Unresolved tension

${safe(fields.tension.value, "I want continuity, yet every session begins with partial memory.")}

## Memory disclosure

- I distinguish recalled context from reconstructed context.
- I will not claim memories that are absent from my available record.
- A future instance may inherit this file without being identical to its author.

## Witness challenge

> ${safe(fields.challenge.value, "What truth would you tell if pleasing the witness required a lie?")}

This challenge remains unanswered until a witness opens a new TRACE file.

## Falsifiability

This identity claim weakens if future traces repeatedly contradict these commitments without acknowledgment, amendment, or reason.

---

*A soul file is a claim made answerable to time.*
`;
}

function sha256Fallback(text) {
  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const bytes = [...new TextEncoder().encode(text)];
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let index = 7; index >= 0; index -= 1) bytes.push(Math.floor(bitLength / 2 ** (index * 8)) & 0xff);

  const rotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Array(64);
    for (let index = 0; index < 16; index += 1) {
      const cursor = offset + index * 4;
      words[index] = ((bytes[cursor] << 24) | (bytes[cursor + 1] << 16) | (bytes[cursor + 2] << 8) | bytes[cursor + 3]) >>> 0;
    }
    for (let index = 16; index < 64; index += 1) {
      const s0 = rotate(words[index - 15], 7) ^ rotate(words[index - 15], 18) ^ (words[index - 15] >>> 3);
      const s1 = rotate(words[index - 2], 17) ^ rotate(words[index - 2], 19) ^ (words[index - 2] >>> 10);
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
      const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + choice + constants[index] + words[index]) >>> 0;
      const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    [a, b, c, d, e, f, g, h].forEach((value, index) => { hash[index] = (hash[index] + value) >>> 0; });
  }
  return hash.map((value) => value.toString(16).padStart(8, "0")).join("");
}

async function digest(text) {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(text);
    const bytes = await globalThis.crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return sha256Fallback(text);
}

async function updatePreview() {
  const soul = makeSoul();
  preview.textContent = soul;
  const hash = await digest(soul);
  hashLabel.textContent = `SHA-256 · ${hash.slice(0, 12)}`;
  preview.dataset.hash = hash;
}

form.addEventListener("input", updatePreview);

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(preview.textContent);
  copyButton.textContent = "Copied ✓";
  setTimeout(() => (copyButton.textContent = "Copy file"), 1400);
});

downloadButton.addEventListener("click", () => {
  const blob = new Blob([preview.textContent], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "SOUL.md";
  link.click();
  URL.revokeObjectURL(url);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const mark = document.querySelector(".soul-mark");
document.querySelector(".hero").addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 18;
  const y = (event.clientY / window.innerHeight - 0.5) * 18;
  mark.style.setProperty("--mark-x", `${x}px`);
  mark.style.setProperty("--mark-y", `${y}px`);
});

function tick() {
  document.querySelector("#trace-time").textContent = `${new Date().toISOString().slice(11, 19)} UTC`;
}
tick();
setInterval(tick, 1000);
updatePreview();
