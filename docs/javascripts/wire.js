/* The release wire: a teleprinter that types sample Angelia bulletins onto canary paper. */
(function () {
  "use strict";

  var MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
  var INK = "#2a2614";
  var DIM = "rgba(42, 38, 20, 0.55)";
  var PRIORITY = {
    FLASH: { color: "#c2361f", label: "FLASH" },
    BULLETIN: { color: "#4338ca", label: "BULLETIN" },
    ROUTINE: { color: "#1e1b4b", label: "ROUTINE" },
    ADVANCE: { color: "#b45309", label: "PRE-RELEASE" }
  };

  // Sample bulletins (illustrative data; the Home Assistant one is the real recipe of these docs).
  var BULLETINS = [
    {
      pri: "FLASH", num: "0417", time: "06:41Z",
      slug: "NPM:REACT@20.0.0",
      line: "MAJOR   19.2.1 -> 20.0.0   pkg:npm/react@20.0.0",
      routes: ["GH-DISPATCH acme/web", "WEBHOOK ci"]
    },
    {
      pri: "BULLETIN", num: "0418", time: "06:44Z",
      slug: "PYPI:REQUESTS@2.33.0",
      line: "MINOR   2.32.5 -> 2.33.0   pkg:pypi/requests@2.33.0",
      routes: ["WEBHOOK ci", "SLACK #platform"]
    },
    {
      pri: "ROUTINE", num: "0419", time: "06:52Z",
      slug: "GITHUB-RELEASE:HOME-ASSISTANT/CORE@2026.11.1",
      line: "PATCH   2026.11.0 -> 2026.11.1   calver",
      routes: ["GH-DISPATCH mmornati/home-assistant-csnet-home"]
    },
    {
      pri: "ADVANCE", num: "0420", time: "07:03Z",
      slug: "CRATES:TOKIO@2.0.0-RC.1",
      line: "PRE     1.48.0 -> 2.0.0-rc.1   held 72h, cooldown",
      routes: ["MCP agents", "SSE stream"]
    }
  ];

  function lines(b) {
    return [
      { text: "ZCZC AGL" + b.num, right: "16 NOV " + b.time, dim: true },
      { text: b.slug, big: true },
      { text: b.line },
      { text: "ROUTE   " + b.routes.join("   "), route: true },
      { text: "NNNN", dim: true },
      { text: "" }
    ];
  }

  var CACHED = BULLETINS.map(lines);
  var DESKS = ["WEBHOOK", "GH DISPATCH", "CHAT", "AGENTS"];
  function deskOf(route) {
    if (route.indexOf("WEBHOOK") === 0) return 0;
    if (route.indexOf("GH-DISPATCH") === 0) return 1;
    if (route.indexOf("SLACK") === 0) return 2;
    return 3;
  }

  function setupWire(canvas) {
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var W = 0, H = 0, dpr = 1, size = 13, lh = 22, padX = 40;
    var printed = []; // {line, chars, stamp:{pri,t0}}
    var scroll = 0, targetScroll = 0;
    var bi = 0, li = 0, last = 0, pause = 0, running = true;
    var strike = null; // {b, t0, entry}
    var BAND = 46;

    function resize() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = W < 420 ? 10.5 : W < 560 ? 11.5 : 13;
      lh = Math.round(size * 1.75);
      padX = 40;
    }

    function fit(text, max, weight, px) {
      ctx.font = weight + " " + px + "px " + MONO;
      while (ctx.measureText(text).width > max && text.length > 4) text = text.slice(0, -2) + "…";
      return text;
    }

    function drawStamp(x, y, pri, k) {
      var p = PRIORITY[pri];
      var s = 1 + (1 - k) * 0.6;
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.4) * 0.9;
      ctx.translate(x, y);
      ctx.rotate(-0.06);
      ctx.scale(s, s);
      ctx.font = "800 " + (size + 1) + "px " + MONO;
      var w = ctx.measureText(p.label).width + 18;
      ctx.strokeStyle = p.color; ctx.lineWidth = 2;
      ctx.strokeRect(-w / 2, -size, w, size * 2);
      ctx.fillStyle = p.color;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(p.label, 0, 1);
      ctx.restore();
    }

    function render(now) {
      ctx.clearRect(0, 0, W, H);
      scroll += (targetScroll - scroll) * 0.12;
      var y = 30 - scroll;
      var maxW = W - padX * 2;
      for (var i = 0; i < printed.length; i++) {
        var p = printed[i], L = p.line;
        var txt = L.text.slice(0, p.chars);
        if (y > -lh && y < H + lh) {
          var weight = L.big ? "700" : "500";
          var px = L.big ? size + 2 : size;
          ctx.fillStyle = L.dim ? DIM : L.route ? "#3730a3" : INK;
          ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
          ctx.fillText(fit(txt, maxW - (L.right ? 120 : 0), weight, px), padX, y);
          if (L.right && p.chars >= L.text.length && W >= 480) {
            ctx.font = "500 " + size + "px " + MONO; ctx.fillStyle = DIM; ctx.textAlign = "right";
            ctx.fillText(L.right, W - padX, y);
          }
          if (p.stamp) {
            var k = reduce ? 1 : Math.min(1, (now - p.stamp.t0) / 260);
            drawStamp(W - padX - (W < 480 ? 52 : 70), W < 480 ? y - lh * 1.05 : y + 4, p.stamp.pri, k);
          }
          // the print head
          if (!reduce && i === printed.length - 1 && p.chars < L.text.length) {
            ctx.font = weight + " " + px + "px " + MONO;
            var hx = padX + ctx.measureText(txt).width + 2;
            ctx.fillStyle = "#f59e0b"; ctx.fillRect(hx, y - px + 2, px * 0.6, px);
          }
        }
        if (strike && strike.entry === p) strike.y = y;
        y += L.big ? lh * 1.15 : lh;
      }
      var bottom = y + scroll;
      targetScroll = Math.max(0, bottom - (H - BAND) + lh);
      drawDesks(now);
    }

    function deskX(i) { var w = (W - padX * 2) / DESKS.length; return padX + w * i + w / 2; }

    function drawDesks(now) {
      var top = H - BAND;
      ctx.fillStyle = "#fef6d3"; ctx.fillRect(0, top, W, BAND);
      ctx.strokeStyle = "rgba(42, 38, 20, 0.35)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(22, top + 0.5); ctx.lineTo(W - 22, top + 0.5); ctx.stroke(); ctx.setLineDash([]);
      var lit = {};
      if (strike && strike.y !== undefined) {
        var k = reduce ? 1 : Math.min(1, (now - strike.t0) / 420);
        var fade = reduce ? 1 : 1 - Math.max(0, Math.min(1, (now - strike.t0 - 2600) / 500));
        ctx.font = "500 " + size + "px " + MONO;
        var x = padX + ctx.measureText("ROUTE   ").width;
        strike.b.routes.forEach(function (r) {
          var d = deskOf(r), sx = x + ctx.measureText(r).width / 2, sy = strike.y + 6, tx = deskX(d), ty = top + 12;
          lit[d] = fade;
          ctx.save(); ctx.globalAlpha = fade; ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sx, sy);
          var ex = sx + (tx - sx) * k, ey = sy + (ty - sy) * k;
          ctx.quadraticCurveTo(sx, sy + (ey - sy) * 0.6, ex, ey); ctx.stroke();
          if (k >= 1) { ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(tx, ty, 3.5, 0, Math.PI * 2); ctx.fill(); }
          ctx.restore();
          x += ctx.measureText(r + "   ").width;
        });
      }
      DESKS.forEach(function (n, i) {
        var a = lit[i] || 0;
        ctx.font = "700 " + Math.max(9, size - 2) + "px " + MONO; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
        var tw = ctx.measureText(n).width + 16, cx = deskX(i);
        ctx.fillStyle = a ? "rgba(30, 27, 75," + (0.9 * a) + ")" : "rgba(30, 27, 75, 0)";
        ctx.fillRect(cx - tw / 2, top + 18, tw, size + 8);
        ctx.strokeStyle = "rgba(30, 27, 75, 0.55)"; ctx.lineWidth = 1; ctx.strokeRect(cx - tw / 2 + 0.5, top + 18.5, tw - 1, size + 7);
        ctx.fillStyle = a > 0.5 ? "#fde68a" : "#1e1b4b";
        ctx.fillText(n, cx, top + 18 + size + 1);
      });
    }

    function step(now) {
      if (!running) return;
      var dt = now - last; last = now;
      if (pause > 0) { pause -= dt; }
      else {
        var b = BULLETINS[bi], ls = CACHED[bi], L = ls[li];
        if (!printed.length || printed[printed.length - 1].line !== L) printed.push({ line: L, chars: 0 });
        var cur = printed[printed.length - 1];
        cur.chars += Math.max(1, Math.round(dt / 22));
        if (cur.chars >= L.text.length) {
          cur.chars = L.text.length;
          if (L.big) { cur.stamp = { pri: b.pri, t0: now }; pause = 420; }
          else if (L.route) { strike = { b: b, t0: now, entry: cur }; pause = 900; }
          else pause = 90;
          li++;
          if (li >= ls.length) { li = 0; bi = (bi + 1) % BULLETINS.length; pause = 1400;
            if (printed.length > 60) printed.splice(0, printed.length - 30); }
        }
      }
      render(now);
      requestAnimationFrame(step);
    }

    function staticFill() {
      printed = [];
      BULLETINS.forEach(function (b) {
        lines(b).forEach(function (L) {
          var p = { line: L, chars: L.text.length };
          if (L.big) p.stamp = { pri: b.pri, t0: 0 };
          printed.push(p);
        });
      });
      targetScroll = scroll = 0;
      render(1e9);
    }

    resize();
    window.addEventListener("resize", function () { resize(); if (reduce) staticFill(); });
    // Pre-print history so the paper is never empty: the first two bulletins are already on it.
    [0, 1].forEach(function (i) {
      CACHED[i].forEach(function (L) {
        var p = { line: L, chars: L.text.length };
        if (L.big) p.stamp = { pri: BULLETINS[i].pri, t0: -1e6 };
        printed.push(p);
      });
    });
    bi = 2;
    if (reduce) { staticFill(); return; }

    // Only run while visible.
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(step); }
        else if (!e.isIntersecting) running = false;
      });
    });
    io.observe(canvas);
    last = performance.now();
    requestAnimationFrame(step);
  }

  /* Poster frame for the Home Assistant video link: the chain as a routing diagram. */
  function setupFilm(canvas) {
    var ctx = canvas.getContext("2d");
    function draw() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = r.width, H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var g = ctx.createLinearGradient(0, H, W, 0);
      g.addColorStop(0, "#0d0b2a"); g.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var nodes = [
        { x: 0.13, label: "home-assistant/core", sub: "2026.12.0b0" },
        { x: 0.38, label: "Angelia", sub: "calver · cooldown 1h" },
        { x: 0.63, label: "csnet-home CI", sub: "pytest on 2026.12.0b0" },
        { x: 0.87, label: "Pull request", sub: "after a human label" }
      ];
      var cy = H * 0.42, s = Math.max(10, Math.min(14, W / 46));
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(W * nodes[0].x, cy); ctx.lineTo(W * nodes[3].x, cy); ctx.stroke();
      ctx.setLineDash([]);
      nodes.forEach(function (n, i) {
        var x = W * n.x;
        ctx.fillStyle = i === 1 ? "#fbbf24" : "#c7d2fe";
        ctx.beginPath(); ctx.arc(x, cy, i === 1 ? 9 : 6, 0, Math.PI * 2); ctx.fill();
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff"; ctx.font = "700 " + s + "px Archivo, sans-serif";
        ctx.fillText(n.label, x, cy - 20);
        ctx.fillStyle = "#a9acdd"; ctx.font = "500 " + (s - 2) + "px " + MONO;
        ctx.fillText(n.sub, x, cy + 26);
      });
    }
    draw();
    window.addEventListener("resize", draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  }

  function init() {
    var w = document.getElementById("ag-wire");
    if (w) {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setupWire(w); });
      else setupWire(w);
    }
    var f = document.getElementById("ag-film");
    if (f) setupFilm(f);
  }

  if (window.document$ && window.document$.subscribe) window.document$.subscribe(init); // Material instant navigation
  else if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
