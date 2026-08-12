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

async function digest(text) {
  const data = new TextEncoder().encode(text);
  const bytes = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
