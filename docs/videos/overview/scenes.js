/* Angelia in 90 seconds (see ../engine/engine.js and the canvas-video skill).
 * Scenes are pure functions of t; animations hang on the spoken sentences (at(cues, i)).
 * Versions shown in the "hook" and "event" scenes are illustrative sample data, labelled on screen.
 */
"use strict";

const STR = {
  en: {
    sample: "SAMPLE DATA",
    k_intro: "THE SELF-HOSTED RELEASE EVENT BUS",
    detect: "Detect", normalize: "Normalize", deliver: "Deliver",
    k_sources: "DETECT",
    h_sources: "Six sources, one way of looking.",
    coalesce: "50 watches → 1 request",
    k_policy: "NORMALIZE",
    h_policy: "Every new version, in its own scheme.",
    known: "known", fresh: "new", backport: "backport",
    k_event: "THE EVENT",
    h_event: "One CloudEvent. Same shape for everyone.",
    k_deliver: "DELIVER",
    h_deliver: "Push where you can. Pull where you can't.",
    retry: "retry → dead letter → replay",
    k_install: "RUN IT",
    h_install: "One binary. SQLite or Postgres.",
    tagline: "Hear about every release, before your users do.",
    url: "angelia-dev.github.io/docs",
  },
};

const GOLD = "#fbbf24", GOLD2 = "#f59e0b", CANARY = "#fde68a", INDIGO = "#4338ca", MID = "#14123a";

/* The Angelia mark: an A as a rising peak, three gold feathers, a spark. Drawn at (x, y) top-left, size s. */
function mark(x, y, s, k = 1) {
  if (k <= 0) return;
  const f = s / 420;
  ctx.save();
  ctx.globalAlpha *= clamp(k);
  ctx.translate(x, y); ctx.scale(f, f); ctx.translate(-80, -10);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 44;
  const p = partial([[112, 412], [256, 108], [400, 412]], outCubic(seg(k, 0, 0.7)));
  ctx.beginPath(); p.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
  const feathers = [
    ["M168 316 C246 318 330 298 418 236 C374 306 286 338 180 342 Z", GOLD2],
    ["M184 272 C254 270 330 246 404 186 C366 254 292 290 196 298 Z", GOLD],
    ["M202 228 C258 222 318 196 380 140 C352 206 296 240 214 254 Z", CANARY],
    ["M256 20 L266 48 L294 58 L266 68 L256 96 L246 68 L218 58 L246 48 Z", GOLD2],
  ];
  feathers.forEach(([d, c], i) => {
    ctx.save(); ctx.globalAlpha *= seg(k, 0.45 + i * 0.12, 0.7 + i * 0.12);
    ctx.fillStyle = c; ctx.fill(new Path2D(d)); ctx.restore();
  });
  ctx.restore();
}

/* Gold Baudot tape along y, scrolling with t. */
function tape(y, t, k = 1, h = 14) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= k;
  ctx.fillStyle = GOLD2; ctx.fillRect(0, y, W * outCubic(k), h);
  ctx.fillStyle = MID;
  const off = (t * 40) % 72;
  for (let x = -72 + off; x < W * outCubic(k); x += 12) {
    const col = Math.round((x - off) / 12);
    ctx.beginPath(); ctx.arc(x, y + h / 2, 1.3, 0, Math.PI * 2); ctx.fill();
    const bits = (col * 2654435761) >>> 0;
    if (bits & 1) { ctx.beginPath(); ctx.arc(x, y + h * 0.2, 1.9, 0, Math.PI * 2); ctx.fill(); }
    if (bits & 4) { ctx.beginPath(); ctx.arc(x, y + h * 0.8, 1.9, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

function bg(t) {
  const g = ctx.createLinearGradient(0, H, W, 0);
  g.addColorStop(0, "#0d0b2a"); g.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = "#c7d2fe";
  for (let y = 40; y < H; y += 40) for (let x = 40; x < W; x += 40) ctx.fillRect(x, y, 1.5, 1.5);
  ctx.restore();
}

/* 1. Releases everywhere */
const HOOK = [
  ["pypi", "requests 2.33.0"], ["npm", "react 20.0.0"], ["crates", "tokio 1.48.1"], ["github", "cli/cli v2.80.0"],
  ["pypi", "django 6.0.1"], ["npm", "@types/node 24.3.0"], ["gitlab", "gitlab-runner v18.5.0"], ["pypi", "pydantic 3.0.0b1"],
  ["github", "home-assistant 2026.11.1"], ["npm", "vite 8.1.0"], ["crates", "serde 1.0.230"], ["pypi", "fastapi 0.130.0"],
  ["github", "kubernetes v1.35.0"], ["npm", "next 16.2.0"], ["pypi", "numpy 2.4.0"],
];
function sHook(t, d, cues) {
  const R = rng(7);
  const a1 = at(cues, 1, 3.6);
  HOOK.forEach(([src, v], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 80 + col * 380 + (row % 2) * 40 + (R() - 0.5) * 20, y = 130 + row * 92 + (R() - 0.5) * 16;
    const show = 0.15 + i * (a1 / HOOK.length);
    const k = seg(t, show, show + 0.4);
    const drift = (t - show) * (R() - 0.5) * 4;
    const hot = i % 3 === 0;
    pill(`${src} · ${v}`, x + drift, y, { size: 17, align: "left", alpha: k * (t > a1 + 0.8 && !hot ? 0.45 : 1), fill: "#1e1b4b", stroke: hot ? GOLD : "#4f46e5", color: hot ? CANARY : "#c7d2fe" });
  });
  text(S.sample, 1200, 650, { size: 11, font: MONO, color: C.faint, align: "right", alpha: seg(t, 0.5, 1) });
}

/* 2. Angelia */
function sIntro(t, d, cues) {
  const a1 = at(cues, 1, 3.6), a2 = at(cues, 2, 8.4);
  mark(80, 150, 170, seg(t, 0.1, 1.4));
  text("Angelia", 290, 300, { size: 96, weight: 800, font: SORA, spacing: "-2px", alpha: seg(t, 0.3, 0.9) });
  text(S.k_intro, 294, 345, { size: 15, weight: 600, font: MONO, color: GOLD, spacing: "2px", alpha: seg(t, 0.8, 1.3) });
  // detect -> normalize -> deliver
  const words = [S.detect, S.normalize, S.deliver];
  words.forEach((w, i) => {
    const k = seg(t, a2 + i * 0.45, a2 + i * 0.45 + 0.4);
    const x = 300 + i * 300;
    dot(x, 470, 9, i === 1 ? GOLD : "#c7d2fe", k);
    text(w, x, 520, { size: 32, weight: 800, font: SORA, align: "center", alpha: k });
    if (i < 2) arrow(x + 24, 470, x + 276, 470, seg(t, a2 + i * 0.45 + 0.2, a2 + i * 0.45 + 0.6), GOLD);
  });
  tape(600, t, seg(t, a1, a1 + 1.2));
}

/* 3. Detect */
const SOURCES = ["PyPI", "npm", "crates.io", "GitHub releases", "GitHub tags", "GitLab releases"];
function sSources(t, d, cues) {
  const a1 = at(cues, 1, 4.5);
  kicker(S.k_sources, seg(t, 0.1, 0.5));
  headline(S.h_sources, seg(t, 0.2, 0.9));
  SOURCES.forEach((s, i) => {
    const k = seg(t, 0.6 + i * 0.35, 1.0 + i * 0.35);
    pill(s, 80, 220 + i * 56, { size: 18, font: INTER, alpha: k, fill: "#1e1b4b", stroke: "#6366f1", color: "#e0e7ff", align: "left" });
  });
  // coalescing: many watches, one fetch
  const k2 = seg(t, a1, a1 + 0.6);
  const cx = 820, cy = 360;
  for (let i = 0; i < 10; i++) {
    const y = 210 + i * 32;
    dot(640, y, 5, "#a5b4fc", k2);
    line(partial([[646, y], [cx - 40, cy]], seg(t, a1 + 0.1 + i * 0.05, a1 + 0.7 + i * 0.05)), "#6366f1", 1.5, 0.8);
  }
  panel(cx - 40, cy - 34, 80, 68, { r: 10, fill: "#14123a", stroke: GOLD, alpha: k2 });
  text("1", cx, cy + 14, { size: 38, weight: 800, font: SORA, color: GOLD, align: "center", alpha: k2 });
  arrow(cx + 44, cy, 1130, cy, seg(t, a1 + 0.9, a1 + 1.5), GOLD);
  text("pypi.org", 1140, cy + 6, { size: 18, font: MONO, color: "#c7d2fe", alpha: seg(t, a1 + 1.2, a1 + 1.6) });
  if (t > a1 + 1.5) packets(cx + 44, cy, 1130, cy, t, { n: 2, period: 1.4, color: CANARY });
  text(S.coalesce, cx, cy + 210, { size: 20, weight: 700, font: MONO, color: CANARY, align: "center", alpha: seg(t, a1 + 1, a1 + 1.5) });
}

/* 4. Normalize */
const VERS = [
  { v: "2.0.0", s: "known" }, { v: "1.9.3", s: "known" }, { v: "1.9.4", s: "backport" },
  { v: "2.1.0rc1", s: "pre" }, { v: "2.1.0", s: "new" },
];
function sPolicy(t, d, cues) {
  const a1 = at(cues, 1, 5.5);
  kicker(S.k_policy, seg(t, 0.1, 0.5));
  headline(S.h_policy, seg(t, 0.2, 0.9));
  VERS.forEach((r, i) => {
    const y = 230 + i * 62, k = seg(t, 0.8 + i * 0.4, 1.2 + i * 0.4);
    const isNew = r.s !== "known";
    panel(80, y - 24, 380, 48, { r: 8, fill: isNew ? "#2a2563" : "#17153f", stroke: isNew ? GOLD : "#3730a3", alpha: k });
    text(r.v, 104, y + 8, { size: 22, weight: 700, font: MONO, color: isNew ? CANARY : "#a5b4fc", alpha: k });
    const tag = r.s === "known" ? S.known : r.s === "backport" ? S.backport : r.s === "pre" ? "pre-release" : S.fresh;
    text(tag, 440, y + 6, { size: 14, font: MONO, color: isNew ? GOLD : C.faint, align: "right", alpha: k });
  });
  // policy filter
  const rules = ["prerelease: none", "constraint: \">=1.9 <3\"", "bump: [minor, patch]", "cooldown: 72h"];
  rules.forEach((r, i) => {
    const k = seg(t, a1 + i * 0.5, a1 + i * 0.5 + 0.4);
    text(r, 620, 250 + i * 46, { size: 20, font: MONO, color: "#e0e7ff", alpha: k });
  });
  const kOut = seg(t, a1 + 2.6, a1 + 3.2);
  arrow(520, 478, 600, 478, kOut, GOLD);
  pill("2.1.0 · minor", 620, 478, { size: 18, alpha: kOut, fill: GOLD, stroke: GOLD, color: MID, align: "left" });
  pill("1.9.4 · patch, backport", 820, 478, { size: 18, alpha: kOut, fill: "#1e1b4b", stroke: GOLD, color: CANARY, align: "left" });
  text("2.1.0rc1 dropped by prerelease: none", 620, 540, { size: 15, font: MONO, color: C.faint, alpha: kOut });
}

/* 5. The event */
const JSON_LINES = [
  ['"type": ', '"dev.angelia.release.published.v1"'],
  ['"id": ', '"01JBX2A7C8D9E0F1G2H3J4K5M6"'],
  ['"subject": ', '"pypi:requests@2.33.0"'],
  ['"data.version": ', '"2.33.0"'],
  ['"data.previous_version": ', '"2.32.5"'],
  ['"data.bump": ', '"minor"'],
  ['"data.purl": ', '"pkg:pypi/requests@2.33.0"'],
];
function sEvent(t, d, cues) {
  const a1 = at(cues, 1, 5);
  kicker(S.k_event, seg(t, 0.1, 0.5));
  headline(S.h_event, seg(t, 0.2, 0.9));
  panel(80, 190, 760, 360, { r: 6, fill: "#0d0b2a", stroke: "#3730a3" });
  ctx.fillStyle = GOLD2; ctx.fillRect(80, 190, 760 * seg(t, 0.3, 1), 4);
  JSON_LINES.forEach(([k, v], i) => {
    const kk = seg(t, 0.5 + i * 0.35, 0.9 + i * 0.35);
    const y = 245 + i * 42;
    text(k, 110, y, { size: 19, font: MONO, color: "#a5b4fc", alpha: kk });
    text(typed(v, kk), 110 + measure(k, 19, 400, MONO), y, { size: 19, font: MONO, color: CANARY, alpha: kk });
  });
  const hk = seg(t, 2.6, 3.2);
  highlight(104, 266, 520, 30, hk * seg(t, 2.6, 3.0), GOLD);
  // three consumers reading the same thing
  ["CI", "chat", "agent"].forEach((c, i) => {
    const k = seg(t, a1 + i * 0.3, a1 + i * 0.3 + 0.4);
    const y = 260 + i * 110;
    arrow(850, 370, 1010, y, k, "#6366f1");
    pill(c, 1030, y, { size: 20, font: INTER, alpha: k, fill: "#1e1b4b", stroke: GOLD, color: "#fff", align: "left" });
  });
  text(S.sample, 840, 575, { size: 11, font: MONO, color: C.faint, align: "right" });
}

/* 6. Deliver */
const SINKS = [
  { n: "Webhook", s: "Standard Webhooks, signed", y: 210 },
  { n: "GitHub Actions", s: "repository / workflow dispatch", y: 290 },
  { n: "Chat", s: "Slack · Discord · Telegram · ntfy · Gotify · Matrix", y: 370 },
];
const PULL = [
  { n: "Pull API · SSE", s: "named cursors, acknowledgements", y: 470 },
  { n: "MCP", s: "AI agents ask, with scoped tokens", y: 545 },
];
function sDeliver(t, d, cues) {
  const a1 = at(cues, 1, 4.5), a2 = at(cues, 2, 9.5);
  kicker(S.k_deliver, seg(t, 0.1, 0.5));
  headline(S.h_deliver, seg(t, 0.2, 0.9));
  // the bus
  const bx = 210, by = 380;
  panel(bx - 130, by - 48, 260, 96, { r: 10, fill: "#14123a", stroke: GOLD, alpha: seg(t, 0.3, 0.8) });
  mark(bx - 116, by - 32, 56, seg(t, 0.3, 1));
  text("angelia", bx - 40, by + 9, { size: 28, weight: 800, font: SORA, alpha: seg(t, 0.4, 0.9) });
  SINKS.forEach((s, i) => {
    const k = seg(t, 0.7 + i * 0.4, 1.2 + i * 0.4);
    arrow(bx + 132, by, 560, s.y, k, GOLD);
    if (k >= 1) packets(bx + 132, by, 560, s.y, t + i * 0.3, { n: 1, period: 1.6, color: CANARY });
    text(s.n, 580, s.y + 4, { size: 26, weight: 800, font: SORA, alpha: k });
    text(s.s, 580, s.y + 30, { size: 15, font: MONO, color: "#a5b4fc", alpha: k });
  });
  PULL.forEach((s, i) => {
    const k = seg(t, a1 + i * 0.6, a1 + i * 0.6 + 0.4);
    line(partial([[560, s.y - 6], [bx + 132, by + 30]], outCubic(k)), "#818cf8", 2, 0.9, [6, 6]);
    text(s.n, 580, s.y + 4, { size: 26, weight: 800, font: SORA, alpha: k, color: CANARY });
    text(s.s, 580, s.y + 30, { size: 15, font: MONO, color: "#a5b4fc", alpha: k });
  });
  const kr = seg(t, a2, a2 + 0.5);
  pill(S.retry, 1200, 160, { size: 15, alpha: kr, align: "right", fill: "#2a1630", stroke: "#f87171", color: "#fecaca" });
}

/* 7. Run it */
function sInstall(t, d, cues) {
  const a1 = at(cues, 1, 3);
  kicker(S.k_install, seg(t, 0.1, 0.5));
  headline(S.h_install, seg(t, 0.2, 0.9));
  terminal(80, 210, 1120, 300, t, [
    { p: "$ ", s: "cd angelia/deploy/compose/sqlite", a: a1, b: a1 + 0.8 },
    { p: "$ ", s: "docker run --rm ghcr.io/angelia-dev/angelia:0.2.0 token generate > bootstrap-token", a: a1 + 0.9, b: a1 + 2.0 },
    { p: "$ ", s: "docker compose up -d", a: a1 + 2.1, b: a1 + 2.6 },
    { p: "", s: "✔ Container sqlite-angelia-1  Healthy", a: a1 + 2.9, c: C.good },
  ], { title: "homelab", size: 18, lh: 34 });
  ["linux · macOS · windows", "amd64 · arm64", "cosign-signed, SBOMs"].forEach((s, i) => {
    pill(s, 80 + i * 320, 560, { size: 15, align: "left", alpha: seg(t, 0.8 + i * 0.25, 1.2 + i * 0.25), fill: "#1e1b4b", stroke: "#6366f1", color: "#c7d2fe" });
  });
}

/* 8. Outro */
function sOutro(t, d, cues) {
  mark(560, 110, 160, seg(t, 0.1, 1.3));
  text("Angelia", W / 2, 370, { size: 72, weight: 800, font: SORA, align: "center", spacing: "-2px", alpha: seg(t, 0.4, 1) });
  text(S.tagline, W / 2, 425, { size: 26, color: "#c7d2fe", align: "center", alpha: seg(t, 1.0, 1.6) });
  text(S.url, W / 2, 490, { size: 22, weight: 700, font: MONO, color: GOLD, align: "center", alpha: seg(t, 1.6, 2.2) });
  tape(560, t, seg(t, 1.2, 2.4));
}

VIDEO.create({
  title: { en: "Angelia in 90 seconds" },
  kicker: { en: "Angelia · narrated tour" },
  langs: ["en"],
  theme: {
    bg: "#0d0b2a", bg2: "#1e1b4b", panel: "#1e1b4b", panel2: "#262262", line: "#3730a3",
    ink: "#ffffff", soft: "#c7d2fe", faint: "#8587bd", accent: GOLD, accent2: "#a5b4fc",
    good: "#4ade80", warn: GOLD, bad: "#f87171", deep: "#14123a", term: "#0b0a24", termInk: "#e0e7ff",
  },
  strings: STR,
  background: bg,
  poster: "intro",
  scenes: { hook: sHook, intro: sIntro, sources: sSources, policy: sPolicy, event: sEvent, deliver: sDeliver, install: sInstall, outro: sOutro },
});
