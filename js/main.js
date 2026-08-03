/* ============================================================================
   A Birthday Surprise — main script
   No build step, no dependencies. Open index.html and it just works.
   Personal content lives in js/media.js.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.BIRTHDAY_CONFIG || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TOUCH   = window.matchMedia("(hover: none)").matches;

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var ICON = {
    photo: '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4V5Zm3.5 8.5 3 3 3.5-4.5 3.5 5.5H6l1.5-4Z"/></svg>',
    video: '<svg viewBox="0 0 24 24"><path d="M4 6h11v12H4V6Zm13 3 3.5-2.2v10.4L17 15V9Z"/></svg>',
    play:  '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12 8 5.2Z"/></svg>'
  };

  /* ==========================================================================
     1. Confetti engine (canvas)
     ========================================================================== */
  var Confetti = (function () {
    var canvas = $("#confetti-canvas");
    if (!canvas || REDUCED) {
      return { burst: function () {}, sprinkle: function () {},
               stopSprinkle: function () {}, setPalette: function () {} };
    }
    var ctx = canvas.getContext("2d");
    var ROSE  = ["#ff8ab8", "#e0568f", "#bda2f5", "#8f6be0",
                 "#dfb96f", "#f7e8c4", "#ffffff", "#ffd2e5", "#c79bf2"];
    var EARTH = ["#97735c", "#63483a", "#8a9c7c", "#5e7055",
                 "#d9b98a", "#e6cfa8", "#ffffff", "#dcc7b4", "#bfccb2"];
    /* ROSE is kept so page 1 can be reverted to the pink palette in one line */
    var COLORS = EARTH;
    var parts = [], raf = 0, w = 0, h = 0, sprinkleTimer = 0;
    var MAX = 460;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function spawn(p) {
      if (parts.length >= MAX) parts.shift();
      parts.push(p);
    }

    function make(x, y, angle, power) {
      var speed = rand(power * 0.45, power);
      return {
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        g: rand(0.14, 0.26),
        drag: rand(0.984, 0.995),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.22, 0.22),
        sw: rand(4, 11),
        sh: rand(6, 15),
        sway: rand(0.01, 0.035),
        phase: rand(0, Math.PI * 2),
        color: pick(COLORS),
        shape: Math.random() < 0.32 ? "circle" : (Math.random() < 0.5 ? "ribbon" : "rect"),
        life: 0,
        max: rand(150, 300)
      };
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.life++;
        p.vy += p.g;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.phase += p.sway;
        p.x += p.vx + Math.sin(p.phase) * 1.1;
        p.y += p.vy;
        p.rot += p.vr;

        if (p.y - 40 > h || p.life > p.max) { parts.splice(i, 1); continue; }

        var fade = p.life > p.max - 60 ? (p.max - p.life) / 60 : 1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, fade)) * 0.92;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.sw / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "ribbon") {
          ctx.scale(1, Math.max(0.15, Math.abs(Math.cos(p.phase * 1.6))));
          ctx.fillRect(-p.sw / 2, -p.sh / 2, p.sw, p.sh);
        } else {
          ctx.fillRect(-p.sw / 2, -p.sh / 2, p.sw, p.sh);
        }
        ctx.restore();
      }
      if (parts.length) { raf = requestAnimationFrame(loop); }
      else { raf = 0; ctx.clearRect(0, 0, w, h); }
    }
    function start() { if (!raf) raf = requestAnimationFrame(loop); }

    return {
      /* opts: {count, x, y, spread, power} — x/y are 0–1 fractions of the screen */
      burst: function (opts) {
        opts = opts || {};
        var count  = opts.count  || 90;
        var x      = (opts.x != null ? opts.x : 0.5) * w;
        var y      = (opts.y != null ? opts.y : 0.45) * h;
        var spread = opts.spread || Math.PI * 2;
        var base   = opts.angle != null ? opts.angle : -Math.PI / 2;
        var power  = opts.power || 16;
        for (var i = 0; i < count; i++) {
          spawn(make(x + rand(-14, 14), y + rand(-14, 14),
                     base + rand(-spread / 2, spread / 2), power));
        }
        start();
      },
      /* gentle, continuous fall from above the fold */
      sprinkle: function (everyMs) {
        this.stopSprinkle();
        sprinkleTimer = setInterval(function () {
          if (document.hidden) return;
          for (var i = 0; i < 3; i++) {
            var p = make(rand(0, w), rand(-60, -10), Math.PI / 2, 2.4);
            p.g = rand(0.02, 0.05);
            p.drag = 0.999;
            p.max = 900;
            spawn(p);
          }
          start();
        }, everyMs || 420);
      },
      stopSprinkle: function () {
        if (sprinkleTimer) { clearInterval(sprinkleTimer); sprinkleTimer = 0; }
      },
      /* "rose" for the hero, "earth" for the cedar/sage pages */
      setPalette: function (name) { COLORS = name === "earth" ? EARTH : ROSE; }
    };
  })();

  /* ==========================================================================
     2. Ambient decor — sparkles, balloons, hearts
     ========================================================================== */
  function buildSparkles() {
    var field = $("#sparkleField");
    if (!field || REDUCED) return;
    var n = window.innerWidth < 700 ? 16 : 30;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var s = el("span", "sparkle");
      s.style.left = rand(1, 98) + "%";
      s.style.top = rand(2, 96) + "%";
      s.style.setProperty("--s", rand(6, 16).toFixed(1) + "px");
      s.style.setProperty("--dur", rand(3.2, 7).toFixed(2) + "s");
      s.style.setProperty("--delay", rand(0, 7).toFixed(2) + "s");
      frag.appendChild(s);
    }
    field.appendChild(frag);
  }

  /* ---- Floral frame -------------------------------------------------------
     Hand-placed rather than random: a scattered frame reads as decoration,
     a random one reads as clutter. Sizes are in vmin so the whole arrangement
     scales with the screen instead of needing per-breakpoint rules.
     x/y are percentages of the page; blur + opacity fake depth of field.     */
  var GARDEN = [
    /* ── top-right corner, spilling along the top and right edges ── */
    { art: "rose",  x: 97,  y: 2,   size: 21, rot: -14, tone: "Lilac", sway: 1 },
    { art: "rose",  x: 87,  y: 10,  size: 16, rot: 22,  tone: "Pink",  sway: 1 },
    { art: "rose",  x: 99,  y: 18,  size: 13, rot: 6,   tone: "Pink",  op: .92 },
    { art: "rose",  x: 91,  y: 1,   size: 12, rot: 30,  tone: "Cream", op: .9,  minor: 1 },
    { art: "rose",  x: 79,  y: 4,   size: 11, rot: -8,  tone: "Pink",  op: .8, blur: .8, minor: 1 },
    { art: "rose",  x: 100, y: 30,  size: 11, rot: 16,  tone: "Lilac", op: .85, minor: 1 },
    { art: "petal", x: 79,  y: 2,   size: 8,  rot: 34,  tone: "Pink" },
    { art: "petal", x: 92,  y: 25,  size: 7,  rot: -26, tone: "Cream" },
    { art: "petal", x: 74,  y: 12,  size: 5.5,rot: 66,  tone: "Pink",  blur: 1.4, op: .75, minor: 1 },
    { art: "petal", x: 96,  y: 38,  size: 6,  rot: -50, tone: "Pink",  blur: 1.2, op: .7,  minor: 1 },
    { art: "sprig", x: 83,  y: 19,  size: 7,  rot: 12,  op: .85 },
    { art: "sprig", x: 94,  y: 8,   size: 6,  rot: -20, op: .8, minor: 1 },

    /* ── bottom-left corner, spilling along the bottom and left edges ── */
    { art: "rose",  x: 3,   y: 96,  size: 22, rot: 12,  tone: "Pink",  sway: 1 },
    { art: "rose",  x: 13,  y: 86,  size: 16, rot: -20, tone: "Lilac", sway: 1 },
    { art: "rose",  x: 1,   y: 77,  size: 14, rot: 28,  tone: "Lilac", op: .95 },
    { art: "rose",  x: 10,  y: 99,  size: 13, rot: -34, tone: "Cream", op: .9,  minor: 1 },
    { art: "rose",  x: 22,  y: 94,  size: 11, rot: 18,  tone: "Pink",  op: .82, blur: .8, minor: 1 },
    { art: "rose",  x: 0,   y: 87,  size: 12, rot: 4,   tone: "Pink",  op: .9,  minor: 1 },
    { art: "petal", x: 21,  y: 97,  size: 8,  rot: -40, tone: "Pink" },
    { art: "petal", x: 7,   y: 68,  size: 6.5,rot: 24,  tone: "Cream", blur: 1.2, op: .8 },
    { art: "petal", x: 24,  y: 80,  size: 5,  rot: 70,  tone: "Lilac", blur: 1.6, op: .7, minor: 1 },
    { art: "sprig", x: 9,   y: 79,  size: 7,  rot: -8,  op: .85 },
    { art: "sprig", x: 19,  y: 90,  size: 6,  rot: 26,  op: .8, minor: 1 },

    /* ── quieter accents so the other two corners aren't bare ── */
    { art: "rose",  x: 1,   y: 3,   size: 12, rot: 22,  tone: "Lilac", op: .75, blur: 1 },
    { art: "petal", x: 2,   y: 15,  size: 9,  rot: -34, tone: "Lilac", blur: 1.8, op: .68 },
    { art: "petal", x: 9,   y: 3,   size: 6.5,rot: 46,  tone: "Pink",  blur: 1,   op: .78, minor: 1 },
    { art: "rose",  x: 98,  y: 90,  size: 15, rot: 18,  tone: "Pink",  op: .92, sway: 1 },
    { art: "rose",  x: 92,  y: 99,  size: 12, rot: -12, tone: "Lilac", op: .85, minor: 1 },
    { art: "petal", x: 87,  y: 96,  size: 7.5,rot: -18, tone: "Lilac", op: .8 },
    { art: "petal", x: 93,  y: 74,  size: 5.5,rot: 52,  tone: "Cream", blur: 1.5, op: .7, minor: 1 }
  ];

  var ART_VIEWBOX = { rose: "-60 -60 120 120", petal: "-32 -50 64 100", sprig: "-22 -24 44 44" };

  function buildFloral(spec) {
    var node = el("span", "floral floral--" + spec.art +
                          (spec.sway ? " floral--sway" : "") +
                          (spec.x < 50 ? " floral--left" : ""));
    node.style.setProperty("--size", spec.size + "vmin");
    node.style.setProperty("--rot", (spec.rot || 0) + "deg");
    if (spec.blur) node.style.setProperty("--blur", spec.blur + "px");
    if (spec.op != null) node.style.setProperty("--op", spec.op);
    if (spec.sway) {
      node.style.setProperty("--swayDur", rand(11, 18).toFixed(1) + "s");
      node.style.setProperty("--swayDelay", (-rand(0, 8)).toFixed(1) + "s");
    }
    node.style.left = spec.x + "%";
    node.style.top = spec.y + "%";

    var fill = spec.art === "sprig" ? "" :
      ' fill="url(#g' + (spec.art === "rose" ? "Rose" : "Petal") + (spec.tone || "Pink") + ')"';
    node.innerHTML =
      '<svg viewBox="' + ART_VIEWBOX[spec.art] + '"><use href="#art-' + spec.art + '"' + fill + '/></svg>';
    return node;
  }

  function buildGarden() {
    var box = $("#garden");
    if (!box || CFG.floralFrame === false) return;
    var small = window.innerWidth < 700;
    var frag = document.createDocumentFragment();
    GARDEN.forEach(function (spec) {
      /* phones get the anchor blooms only — the filler would crowd the text */
      if (small && spec.minor) return;
      var s = spec;
      if (small) {
        s = {};
        for (var k in spec) { if (spec.hasOwnProperty(k)) s[k] = spec[k]; }
        s.size = spec.size * 1.1;
      }
      frag.appendChild(buildFloral(s));
    });
    box.appendChild(frag);
  }

  /* ---- Falling rose petals ---- */
  function buildPetals() {
    if (REDUCED || CFG.fallingPetals === false) return;
    var small = window.innerWidth < 700;
    var TONES = ["Pink", "Pink", "Lilac", "Cream"];

    function makePetal(opts) {
      var p = el("span", "petal");
      var px = heroX(0.3);          /* some still fall left, just fainter */
      p.style.setProperty("--x", px.toFixed(1) + "%");
      p.style.setProperty("--size", rand(opts.min, opts.max).toFixed(2) + "vmin");
      p.style.setProperty("--drift", rand(-90, 140).toFixed(0) + "px");
      p.style.setProperty("--dur", rand(opts.slow, opts.slow + 9).toFixed(1) + "s");
      /* negative delay: petals are already mid-fall when the page opens */
      p.style.setProperty("--delay", (-rand(0, opts.slow + 9)).toFixed(1) + "s");
      if (opts.blur) p.style.filter = "blur(" + rand(1.2, 2.6).toFixed(1) + "px)";
      p.style.opacity = (rand(opts.opMin, opts.opMax) * (px < 50 ? .45 : 1)).toFixed(2);

      var sway = el("span", "petal__sway");
      sway.style.setProperty("--sway", rand(14, 46).toFixed(0) + "px");
      sway.style.setProperty("--swayDur", rand(2.8, 6).toFixed(1) + "s");
      sway.style.setProperty("--swayDelay", (-rand(0, 5)).toFixed(1) + "s");

      var spin = el("span", "petal__spin");
      spin.style.setProperty("--spinDur", rand(4.5, 11).toFixed(1) + "s");
      spin.style.setProperty("--spinDelay", (-rand(0, 8)).toFixed(1) + "s");
      spin.style.setProperty("--r0", rand(0, 360).toFixed(0) + "deg");
      spin.innerHTML =
        '<svg viewBox="' + ART_VIEWBOX.petal + '">' +
        '<use href="#art-petal" fill="url(#gPetal' + pick(TONES) + ')"/></svg>';

      sway.appendChild(spin);
      p.appendChild(sway);
      return p;
    }

    var back = $("#petalsBack");
    if (back) {
      var n = small ? 10 : 16;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < n; i++) {
        frag.appendChild(makePetal({ min: 2.6, max: 5.4, slow: 13, opMin: .7, opMax: 1 }));
      }
      back.appendChild(frag);
    }

    /* a couple of big blurred ones in front of the text — pure depth cue */
    var front = $("#petalsFront");
    if (front) {
      var fn = small ? 2 : 3;
      var ffrag = document.createDocumentFragment();
      for (var j = 0; j < fn; j++) {
        ffrag.appendChild(makePetal({ min: 6.5, max: 10, slow: 9, blur: 1, opMin: .28, opMax: .45 }));
      }
      front.appendChild(ffrag);
    }
  }

  /* ---- Celebration scene -------------------------------------------------
     The headline lives on the left, so every ornament here is biased to the
     right. `heroX()` returns a position weighted toward the character side;
     a small slice still lands left, at low opacity, so it doesn't look masked.
     ---------------------------------------------------------------------- */
  function heroX(leftShare) {
    return Math.random() < (leftShare == null ? 0.1 : leftShare)
      ? rand(-2, 42)      /* occasional quiet accent on the copy side */
      : rand(56, 102);    /* the festive side */
  }

  function buildBokeh() {
    var box = $("#bokeh");
    if (!box || REDUCED || CFG.bokeh === false) return;
    var small = window.innerWidth < 700;
    var n = small ? 7 : 12;
    var TINTS = [
      "rgba(230,207,168,.8)",   /* wheat  */
      "rgba(255,253,246,.85)",  /* cream  */
      "rgba(200,168,140,.72)",  /* cedar  */
      "rgba(191,204,178,.72)"   /* sage   */
    ];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var far = Math.random() < 0.55;
      var d = el("span", "bokeh__dot");
      var x = heroX(0.08);
      d.style.left = x.toFixed(1) + "%";
      d.style.top = rand(-4, 102).toFixed(1) + "%";
      d.style.setProperty("--size", rand(far ? 40 : 90, far ? 110 : 210).toFixed(0) + "px");
      d.style.setProperty("--tint", pick(TINTS));
      d.style.setProperty("--blur", rand(far ? 8 : 2, far ? 18 : 7).toFixed(1) + "px");
      /* anything drifting over the copy stays barely there */
      d.style.setProperty("--op", (x < 50 ? rand(.08, .16) : rand(.3, .6)).toFixed(2));
      d.style.setProperty("--dur", rand(16, 30).toFixed(1) + "s");
      d.style.setProperty("--delay", (-rand(0, 20)).toFixed(1) + "s");
      d.style.setProperty("--dx", rand(-50, 60).toFixed(0) + "px");
      d.style.setProperty("--dy", rand(-70, 30).toFixed(0) + "px");
      d.style.setProperty("--sc", rand(1.05, 1.32).toFixed(2));
      frag.appendChild(d);
    }
    box.appendChild(frag);
  }

  function buildFairyLights() {
    var box = $("#fairy");
    if (!box || CFG.fairyLights === false) return;
    var small = window.innerWidth < 700;

    /* Each garland is a quadratic curve in a 0–100 space. The wire is an SVG
       path stretched to fit; the bulbs are separate absolutely-positioned
       elements sampled off the same curve, so they stay perfectly round
       instead of being squashed by the non-uniform scale. */
    var GARLANDS = small
      ? [{ p0: [30, 6], p1: [66, 20], p2: [102, 4], bulbs: 7 }]
      : [{ p0: [26, 4],  p1: [62, 19], p2: [102, 2],  bulbs: 11 },
         { p0: [56, -2], p1: [80, 12], p2: [103, 14], bulbs: 7 }];

    GARLANDS.forEach(function (g, gi) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "fairy__wire");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      svg.innerHTML = '<path d="M' + g.p0 + ' Q' + g.p1 + ' ' + g.p2 + '"/>';
      box.appendChild(svg);

      for (var i = 0; i < g.bulbs; i++) {
        var t = (i + 0.5) / g.bulbs;
        var mt = 1 - t;
        var x = mt * mt * g.p0[0] + 2 * mt * t * g.p1[0] + t * t * g.p2[0];
        var y = mt * mt * g.p0[1] + 2 * mt * t * g.p1[1] + t * t * g.p2[1];
        var b = el("span", "bulb");
        b.style.left = x.toFixed(2) + "%";
        b.style.top = y.toFixed(2) + "%";
        b.style.setProperty("--b", rand(9, 14).toFixed(1) + "px");
        b.style.setProperty("--tw", rand(2.4, 5).toFixed(1) + "s");
        b.style.setProperty("--twd", (-rand(0, 4)).toFixed(2) + "s");
        if (i % 4 === 1) {
          b.style.setProperty("--glow", "#e0c19c");          /* cedar-warm */
          b.style.setProperty("--halo", "rgba(190,150,110,.68)");
        } else if (i % 4 === 3) {
          b.style.setProperty("--glow", "#cfdcc0");          /* sage */
          b.style.setProperty("--halo", "rgba(150,175,135,.62)");
        }
        if (gi === 1) b.style.opacity = ".85";
        box.appendChild(b);
      }
    });
  }

  function buildCurls() {
    var box = $("#curls");
    if (!box || REDUCED || CFG.ribbonCurls === false) return;
    var small = window.innerWidth < 700;
    var SPEC = small
      ? [{ x: 88, y: 30, s: 70, r: -18, g: "gGold" },
         { x: 74, y: 78, s: 60, r: 140, g: "gRibbonPink" }]
      : [{ x: 92, y: 26, s: 104, r: -18, g: "gGold" },
         { x: 68, y: 16, s: 78,  r: 128, g: "gRibbonPink", op: .42, blur: .6 },
         { x: 82, y: 62, s: 92,  r: 44,  g: "gRibbonPink" },
         { x: 97, y: 78, s: 76,  r: -130, g: "gGold", op: .4 },
         { x: 58, y: 88, s: 66,  r: 18,  g: "gGold", op: .34, blur: .8 }];

    var frag = document.createDocumentFragment();
    SPEC.forEach(function (c) {
      var node = el("span", "curl");
      node.style.left = c.x + "%";
      node.style.top = c.y + "%";
      node.style.setProperty("--size", c.s + "px");
      node.style.setProperty("--rot", c.r + "deg");
      node.style.setProperty("--op", c.op != null ? c.op : .55);
      if (c.blur) node.style.setProperty("--blur", c.blur + "px");
      node.style.setProperty("--dur", rand(10, 17).toFixed(1) + "s");
      node.style.setProperty("--delay", (-rand(0, 9)).toFixed(1) + "s");
      node.innerHTML =
        '<svg viewBox="-40 -44 80 88"><use href="#art-curl" stroke="url(#' + c.g + ')"/></svg>';
      frag.appendChild(node);
    });
    box.appendChild(frag);
  }

  function buildHeroHearts() {
    var box = $("#heroHearts");
    if (!box || REDUCED || CFG.heartParticles === false) return;
    var FILLS = ["url(#gRibbonPink)", "url(#gRibbonPink)", "url(#gGold)", "url(#gPetalLilac)"];
    var n = window.innerWidth < 700 ? 6 : 10;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var x = heroX(0.1);
      var s = el("span", "pheart");
      s.style.left = x.toFixed(1) + "%";
      if (x < 50) s.style.filter = "drop-shadow(0 6px 14px rgba(224,86,143,.2))";
      s.style.setProperty("--sz", rand(12, 25).toFixed(0) + "px");
      s.style.setProperty("--dur", rand(12, 23).toFixed(1) + "s");
      s.style.setProperty("--delay", (-rand(0, 20)).toFixed(1) + "s");
      s.style.setProperty("--drift", rand(-60, 70).toFixed(0) + "px");
      s.innerHTML = '<svg viewBox="-28 -28 56 56"><use href="#art-heart" fill="' +
                    pick(FILLS) + '"/></svg>';
      frag.appendChild(s);
    }
    box.appendChild(frag);
  }

  /* Probes a path, or a list of candidates, and hands back the first that
     actually loads. Nothing is called if none do, so every caller is free to
     leave its drawn fallback standing rather than flashing a half-built layout
     or an empty veil. Lets "hero.png or hero.jpg, whichever you saved" work. */
  function firstImage(sources, onFound) {
    if (!sources) return;
    if (typeof sources === "string") sources = [sources];
    (function tryNext(i) {
      if (i >= sources.length) return;
      var probe = new Image();
      probe.onload = function () { onFound(sources[i]); };
      probe.onerror = function () { tryNext(i + 1); };
      probe.src = sources[i];
    })(0);
  }

  /* set directly, not through a custom property — see the note in the CSS */
  function setBackdrop(layer, src) {
    layer.style.backgroundImage = 'url("' + src.replace(/"/g, "%22") + '")';
  }

  /* Full-bleed photo hero for page 1. */
  function buildHeroPhoto() {
    var box = $("#heroPhoto");
    var layer = $("#heroPhotoImg");
    var page = $("#page-1");
    if (!box || !layer) return;

    firstImage(CFG.heroBackground, function (src) {
      setBackdrop(layer, src);
      if (CFG.heroBackgroundPosition) {
        layer.style.setProperty("--pos", CFG.heroBackgroundPosition);
      }
      if (CFG.heroBackgroundPositionMobile) {
        layer.style.setProperty("--posMobile", CFG.heroBackgroundPositionMobile);
      }
      page.classList.add("has-photo");
      /* a centred picture keeps the centred message; only a subject-on-the-right
         picture needs the copy pushed left and a scrim cut out for it */
      if (CFG.heroBackgroundLayout === "center") page.classList.add("photo-center");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { box.classList.add("is-in"); });
      });
    });
  }

  /* Page 2's backdrop. It lives in the fixed .bg layer so it holds still while
     the gallery scrolls; the stylesheet fades it in only on chapter two, and
     only once `is-ready` says the file is really there. */
  function buildGalleryPhoto() {
    var box = $("#bgPhoto");
    var layer = $("#bgPhotoImg");
    if (!box || !layer) return;

    firstImage(CFG.galleryBackground, function (src) {
      setBackdrop(layer, src);
      if (CFG.galleryBackgroundPosition) {
        layer.style.setProperty("--pos", CFG.galleryBackgroundPosition);
      }
      box.classList.add("is-ready");
    });
  }

  /* Page 3's backdrop. Its own layer, so pages 2 and 3 cross-fade between two
     pictures instead of sharing one that could never transition. */
  function buildFinalPhoto() {
    var box = $("#bgPhotoFinal");
    var layer = $("#bgPhotoFinalImg");
    if (!box || !layer) return;

    firstImage(CFG.finalBackground, function (src) {
      setBackdrop(layer, src);
      if (CFG.finalBackgroundPosition) {
        layer.style.setProperty("--pos", CFG.finalBackgroundPosition);
      }
      box.classList.add("is-ready");
    });
  }

  /* Character cut-out on the right. Absent or broken -> the page quietly
     stays in its centred layout rather than leaving a hole. */
  function buildHeroArt() {
    var fig = $("#heroArt");
    var img = $("#heroArtImg");
    var page = $("#page-1");
    var src = CFG.heroCharacter;
    if (!fig || !img || !src) return;
    /* the two hero modes are alternatives — a full-bleed photo wins */
    if (CFG.heroBackground) return;

    img.addEventListener("error", function () {
      fig.hidden = true;
      page.classList.remove("has-art");
    });
    img.addEventListener("load", function () {
      fig.hidden = false;
      page.classList.add("has-art");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { fig.classList.add("is-in"); });
      });
    });
    img.alt = CFG.heroCharacterAlt || "";
    img.src = src;
  }

  function buildBalloons() {
    var box = $("#balloons");
    if (!box || REDUCED || CFG.showBalloons === false) return;
    /* cedar bark / sage / wheat, light-to-deep pairs for the balloon shading */
    var palette = [
      ["#dcc7b4", "#97735c"], ["#cddabf", "#728468"], ["#f2e3c8", "#c9a874"],
      ["#e5d3c1", "#7a5a48"], ["#dbe5d1", "#5e7055"], ["#f6ead3", "#b3925f"]
    ];
    var n = window.innerWidth < 700 ? 4 : 7;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var c = palette[i % palette.length];
      var b = el("span", "balloon");
      var bx = heroX(0.16);
      b.style.left = bx.toFixed(1) + "%";
      if (bx < 48) b.style.opacity = ".3";
      b.style.setProperty("--c1", c[0]);
      b.style.setProperty("--c2", c[1]);
      b.style.setProperty("--w", rand(34, 76).toFixed(0) + "px");
      b.style.setProperty("--dur", rand(20, 38).toFixed(1) + "s");
      b.style.setProperty("--delay", (-rand(0, 30)).toFixed(1) + "s");
      b.style.setProperty("--drift", rand(-70, 70).toFixed(0) + "px");
      frag.appendChild(b);
    }
    box.appendChild(frag);
  }

  var heartsBuilt = false;
  function buildHearts() {
    var box = $("#hearts");
    if (!box || REDUCED || heartsBuilt) return;
    heartsBuilt = true;
    /* SVG rather than emoji: emoji hearts are locked to their own red/pink and
       would fight the cedar-and-sage palette this page runs on. */
    var FILLS = ["url(#gCedar)", "url(#gSage)", "url(#gSage)", "url(#gWheat)"];
    var n = window.innerWidth < 700 ? 12 : 22;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var s = el("span", "pheart");
      s.style.left = rand(2, 95) + "%";
      s.style.setProperty("--sz", rand(14, 34).toFixed(0) + "px");
      s.style.setProperty("--dur", rand(9, 19).toFixed(1) + "s");
      s.style.setProperty("--delay", (-rand(0, 14)).toFixed(1) + "s");
      s.style.setProperty("--drift", rand(-80, 80).toFixed(0) + "px");
      s.innerHTML = '<svg viewBox="-28 -28 56 56"><use href="#art-heart" fill="' +
                    pick(FILLS) + '"/></svg>';
      frag.appendChild(s);
    }
    box.appendChild(frag);
  }

  /* ==========================================================================
     3. Reveal-on-scroll
     ========================================================================== */
  var revealIO = null;
  if ("IntersectionObserver" in window) {
    var batch = 0, lastTick = 0;
    revealIO = new IntersectionObserver(function (entries) {
      var now = Date.now();
      if (now - lastTick > 300) { batch = 0; }
      lastTick = now;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target;
        node.style.transitionDelay = Math.min(batch * 70, 560) + "ms";
        node.classList.add("is-in");
        batch++;
        revealIO.unobserve(node);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  }

  function observeReveals(root) {
    var nodes = $$(".fade-up:not(.is-in), .card:not(.is-in)", root);
    if (!revealIO) { nodes.forEach(function (n) { n.classList.add("is-in"); }); return; }
    nodes.forEach(function (n) { revealIO.observe(n); });
  }

  function runTimedReveals(root) {
    $$("[data-delay]", root).forEach(function (n) {
      if (n.classList.contains("is-in")) return;
      setTimeout(function () { n.classList.add("is-in"); }, parseInt(n.dataset.delay, 10) || 0);
    });
  }

  /* ==========================================================================
     4. Music
     ========================================================================== */
  var Music = (function () {
    var audio = $("#bgMusic");
    var btn = $("#musicToggle");
    var ready = false, wanted = false, ducked = false, silent = false;
    var baseVol = typeof CFG.musicVolume === "number" ? CFG.musicVolume : 0.35;

    if (!audio || !btn || !CFG.music) {
      return { armAutoplay: function () {}, duck: function () {} };
    }

    /* "auto", not "metadata": the song should be buffered and ready to start
       the moment the page opens, and `canplay` — which both the button and the
       opening attempt below hang off — is not guaranteed to fire at all while
       preload is "metadata". */
    audio.preload = "auto";
    audio.volume = baseVol;
    audio.src = CFG.music;

    audio.addEventListener("canplay", function () {
      if (ready) return;
      ready = true;
      btn.hidden = false;
      openWithMusic();     /* second go, now that there is audio buffered */
    });
    audio.addEventListener("error", function () { btn.hidden = true; });
    audio.load();

    /* A first go before anything is buffered, for the case where the browser
       already trusts this site and will let the music open the page outright. */
    openWithMusic();

    function setState(playing) {
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      btn.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
      btn.title = playing ? "Pause music" : "Play music";
    }

    /* Resolves true when the song is actually playing out loud, "blocked" when
       the autoplay policy turned it down, false when the file itself is at
       fault — muting cannot rescue that one, so the two are worth telling
       apart rather than retrying blindly. */
    function play() {
      var p = audio.play();
      if (!p || !p.then) { setState(!audio.muted); return Promise.resolve(true); }
      return p.then(function () { setState(!audio.muted); return true; })
              .catch(function (err) {
                setState(false);
                return err && err.name === "NotAllowedError" ? "blocked" : false;
              });
    }

    /* Open the page with the song already running.
       Audible autoplay is refused until a site has been interacted with. When
       that happens the song is started MUTED instead — which every browser
       allows, including iOS, where an audio pipeline started cold outside a
       gesture will not run at all — and the first gesture then unmutes it.
       Rewound to the top on the way in, so nobody arrives mid-verse. */
    function openWithMusic() {
      if (wanted || !audio.paused) return;
      play().then(function (started) {
        if (started !== "blocked" || wanted || !audio.paused) return;
        silent = true;
        audio.muted = true;
        play();
      });
    }

    /* Bring a silent opening up to full volume, from the beginning. */
    function unmute() {
      silent = false;
      audio.muted = false;
      try { audio.currentTime = 0; } catch (e) { /* not seekable yet */ }
      if (audio.paused) { play(); } else { setState(true); }
    }

    btn.addEventListener("click", function () {
      wanted = true;
      /* mid-silent-open: the song is running but inaudible, so the first press
         has to bring the sound in rather than read as "pause" */
      if (audio.muted) { unmute(); return; }
      if (audio.paused) { play(); } else { audio.pause(); setState(false); }
    });

    /* A muted element is still "playing" as far as the events go — report it as
       paused, because that is what the visitor can hear. */
    audio.addEventListener("play", function () { setState(!audio.muted); });
    audio.addEventListener("pause", function () { setState(false); });

    /* One play-through, then quiet. `loop` is off on the element, so `ended` is
       the last word: put the button back to "play" and drop the silent-open
       flags, leaving the song ready to be started again from the top — play()
       on an ended element rewinds itself, so a press just works. */
    audio.addEventListener("ended", function () {
      silent = false;
      audio.muted = false;
      setState(false);
    });

    /* The moment the autoplay policy will grant anything is the visitor's first
       gesture, so take it: unmute a silent opening, or start the song outright
       if even the muted attempt did not take.
       If that gesture IS the music button, stand down — its own click handler
       owns the toggle, and acting here would make the first press read as
       "pause". Broad event list on purpose: any of these counts as activation
       in some browser, and the first one to arrive wins. */
    function armAutoplay() {
      var fired = false;
      var EVENTS = ["pointerdown", "pointerup", "mousedown", "touchstart",
                    "touchend", "keydown", "click"];

      function attempt(e) {
        if (fired) return;
        if (e && e.target && e.target.closest && e.target.closest("#musicToggle")) return;
        fired = true;
        EVENTS.forEach(function (ev) { document.removeEventListener(ev, attempt); });
        if (wanted) return;
        if (silent) { unmute(); }
        else if (audio.paused) { play(); }
      }

      EVENTS.forEach(function (ev) {
        document.addEventListener(ev, attempt, { passive: true });
      });
    }

    /* Lower the music while a video is playing, then bring it back. */
    function duck(on) {
      if (ducked === on) return;
      ducked = on;
      var target = on ? baseVol * 0.16 : baseVol;
      var from = audio.volume, steps = 14, i = 0;
      var t = setInterval(function () {
        i++;
        audio.volume = Math.max(0, Math.min(1, from + (target - from) * (i / steps)));
        if (i >= steps) clearInterval(t);
      }, 40);
    }

    return { armAutoplay: armAutoplay, duck: duck };
  })();

  /* ==========================================================================
     5. Page router
     ========================================================================== */
  var Router = (function () {
    var pages = $$(".page");
    var veil = $("#veil");
    var dotsBox = $("#dots");
    var current = 0;
    var busy = false;
    var LABELS = ["Welcome", "Memories", "Surprise"];
    var onEnter = {};

    pages.forEach(function (p, i) {
      var d = el("button", "dots__dot");
      d.type = "button";
      d.dataset.label = LABELS[i] || ("Page " + (i + 1));
      d.setAttribute("aria-label", "Go to " + (LABELS[i] || ("page " + (i + 1))));
      d.addEventListener("click", function () { go(i); });
      dotsBox.appendChild(d);
    });
    var dots = $$(".dots__dot", dotsBox);

    function paintDots() {
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === current);
        d.setAttribute("aria-current", i === current ? "true" : "false");
      });
    }

    /* Stamps the active page number on <body>. The stylesheet keys the whole
       colour palette off this, so pages 2 and 3 cross-fade to cedar/sage. */
    function paintTheme() {
      document.body.setAttribute("data-page", String(current + 1));
      /* the canvas can't read CSS variables, so it gets told directly */
      Confetti.setPalette("earth");   /* all three pages are cedar/sage now */
    }

    function swap(next) {
      var from = pages[current], to = pages[next];
      from.classList.remove("is-active");
      from.classList.add("is-leaving");
      from.setAttribute("aria-hidden", "true");
      setTimeout(function () { from.classList.remove("is-leaving"); }, 600);

      to.scrollTop = 0;
      to.classList.add("is-active");
      to.removeAttribute("aria-hidden");

      current = next;
      paintDots();
      paintTheme();
      runTimedReveals(to);
      observeReveals(to);
      if (onEnter[next]) onEnter[next](to);

      /* Move focus somewhere sensible for keyboard + screen readers. */
      to.setAttribute("tabindex", "-1");
      try { to.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
    }

    function go(next) {
      if (busy || next === current || next < 0 || next >= pages.length) return;
      busy = true;

      if (REDUCED || !veil) {
        swap(next);
        busy = false;
        return;
      }
      veil.classList.remove("is-sweeping");
      void veil.offsetWidth;              /* restart the animation */
      veil.classList.add("is-sweeping");
      setTimeout(function () { swap(next); }, 400);
      setTimeout(function () { veil.classList.remove("is-sweeping"); busy = false; }, 980);
    }

    paintTheme();   /* page 1's palette, set before the first paint */

    return {
      go: go,
      index: function () { return current; },
      onEnter: function (i, fn) { onEnter[i] = fn; },
      pages: pages
    };
  })();

  $$("[data-goto]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = parseInt(btn.dataset.goto, 10) - 1;
      if (!REDUCED) {
        var r = btn.getBoundingClientRect();
        /* colour the burst for where it's going — the particles outlive the
           transition, so matching the destination avoids a palette clash */
        Confetti.setPalette("earth");
        Confetti.burst({
          count: 60, power: 15, spread: Math.PI * 1.05, angle: -Math.PI / 2,
          x: (r.left + r.width / 2) / window.innerWidth,
          y: (r.top + r.height / 2) / window.innerHeight
        });
      }
      Router.go(target);
    });
  });

  /* ==========================================================================
     6. PAGE 1 — heading + rotating wishes
     ========================================================================== */
  function buildHeading() {
    var hb = $(".hb");
    var rows = [
      { node: $("#hbScript"), text: "Happy", start: 0.35 },
      { node: $("#hbDisplay"), text: "Birthday", start: 0.95 }
    ];
    var last = 0, k = 0;
    rows.forEach(function (row) {
      if (!row.node) return;
      row.text.split("").forEach(function (ch, i) {
        var span = el("span", "hb__ch", ch);
        var d = row.start + i * 0.075;
        span.style.setProperty("--d", d.toFixed(3) + "s");
        span.style.setProperty("--f", rand(0, 2.6).toFixed(2) + "s");
        /* negative delay = start mid-cycle, so the shimmer reads as one wave */
        span.style.setProperty("--sd", (k * -0.11).toFixed(2) + "s");
        row.node.appendChild(span);
        last = Math.max(last, d);
        k++;
      });
    });
    if (hb && !REDUCED) {
      setTimeout(function () { hb.classList.add("is-idle"); }, (last + 1.1) * 1000);
    }
  }

  function buildName() {
    var node = $("#welcomeName");
    if (!node) return;
    if (!CFG.name) { node.remove(); return; }
    node.appendChild(document.createTextNode((CFG.nameIntro || "For") + " "));
    node.appendChild(el("b", null, CFG.name));
  }

  function startWishes() {
    var box = $("#wishes");
    var pipsBox = $("#wishPips");
    if (!box) return;
    var list = (CFG.wishes && CFG.wishes.length) ? CFG.wishes : ["Happy Birthday! 🎂"];
    var slots = $$(".wishes__text", box);
    var i = 0, slot = 0, timer = 0;

    var pips = list.map(function (_, k) {
      var p = el("span", "wishes__pip" + (k === 0 ? " is-active" : ""));
      if (pipsBox) pipsBox.appendChild(p);
      return p;
    });

    slots[0].textContent = list[0];
    slots[0].classList.add("is-active");

    function show(next) {
      var outNode = slots[slot];
      slot = (slot + 1) % slots.length;
      var inNode = slots[slot];

      inNode.textContent = list[next];
      inNode.classList.remove("is-out");
      outNode.classList.remove("is-active");
      outNode.classList.add("is-out");
      /* force a reflow so the entry transition always plays */
      void inNode.offsetWidth;
      inNode.classList.add("is-active");

      pips.forEach(function (p, k) { p.classList.toggle("is-active", k === next); });
      i = next;
    }

    function tick() { show((i + 1) % list.length); }

    var every = Math.max(2000, CFG.wishInterval || 4200);
    function run() { timer = setInterval(function () { if (!document.hidden) tick(); }, every); }
    setTimeout(run, 1800);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { clearInterval(timer); }
      else if (Router.index() === 0) { clearInterval(timer); run(); }
    });
  }

  /* ==========================================================================
     7. PAGE 2 — gallery + lightbox
     ========================================================================== */
  var Gallery = (function () {
    var grid = $("#gallery");
    var items = (CFG.gallery || []).filter(function (it) { return it && it.src; });
    /* The centre tile plays its own footage, muted and looping, so on a page of
       stills it is the one thing that moves. Only while chapter two is on
       screen, never behind the lightbox, and never if less motion was asked
       for — a browser that blocks autoplay just shows the first frame. */
    var previews = [];
    var previewsWanted = false;

    function placeholder(item, cls) {
      var box = el("div", cls || "card__ph");
      box.appendChild(el("em", null, item.type === "video" ? "🎬" : "🖼️"));
      box.appendChild(el("span", null, item.type === "video" ? "Video goes here" : "Photo goes here"));
      box.appendChild(el("code", null, item.src));
      return box;
    }

    function buildThumb(item) {
      var media = el("div", "card__media");
      var missing = false;

      function fail() {
        if (missing) return;
        missing = true;
        /* a file that never loaded has nothing to preview */
        previews = previews.filter(function (v) { return v.parentNode !== media; });
        media.innerHTML = "";
        media.appendChild(placeholder(item));
        var card = media.parentNode;
        if (card && card.classList) card.classList.add("is-missing");
      }

      if (item.type === "video" && !item.poster) {
        var v = document.createElement("video");
        v.muted = true; v.defaultMuted = true;
        v.playsInline = true; v.preload = "metadata";
        v.setAttribute("aria-hidden", "true");
        v.src = item.src + "#t=0.1";
        v.addEventListener("error", fail);
        media.appendChild(v);
        if (!REDUCED) { v.loop = true; previews.push(v); }
      } else {
        var img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = item.caption || "";
        img.addEventListener("error", fail);
        img.src = item.type === "video" ? item.poster : item.src;
        media.appendChild(img);
      }
      return media;
    }

    function buildCard(item, index) {
      // the video is the centrepiece of the 3×3 grid — the modifier lets the
      // stylesheet give it a little more presence than the photos around it
      var card = el("div", item.type === "video" ? "card card--video" : "card");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label",
        "Open " + (item.type === "video" ? "video" : "photo") +
        (item.caption ? ": " + item.caption : " " + (index + 1)));

      card.appendChild(buildThumb(item));
      card.appendChild(el("div", "card__scrim"));

      var badge = el("span", "card__badge");
      badge.innerHTML = ICON[item.type === "video" ? "video" : "photo"];
      badge.appendChild(el("span", null, item.type === "video" ? "Video" : "Photo"));
      card.appendChild(badge);

      if (item.type === "video") {
        var play = el("div", "card__play");
        var ring = el("i");
        ring.innerHTML = ICON.play;
        play.appendChild(ring);
        card.appendChild(play);
      }

      if (item.caption || item.date) {
        var cap = el("div", "card__caption");
        if (item.caption) cap.appendChild(el("b", null, item.caption));
        if (item.date) cap.appendChild(el("small", null, item.date));
        card.appendChild(cap);
      }

      card.addEventListener("click", function () { Lightbox.open(index, card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          Lightbox.open(index, card);
        }
      });
      return card;
    }

    function render() {
      if (!grid) return;
      if (!items.length) {
        var empty = el("p", "gallery__hint",
          "Add your photos and videos in js/media.js to fill this gallery.");
        grid.appendChild(empty);
        return;
      }
      var frag = document.createDocumentFragment();
      items.forEach(function (item, i) { frag.appendChild(buildCard(item, i)); });
      grid.appendChild(frag);
    }

    /* `wanted` remembers whether chapter two is the page on screen, so the
       lightbox can hush the preview and hand it back on close without the
       router and the dialog fighting over it. */
    function playPreviews(wanted) {
      if (typeof wanted === "boolean") previewsWanted = wanted;
      if (!previewsWanted) return;
      previews.forEach(function (v) {
        var p = v.play();
        if (p && p.catch) p.catch(function () { /* blocked — the frame stays */ });
      });
    }

    function pausePreviews(forget) {
      if (forget) previewsWanted = false;
      previews.forEach(function (v) { try { v.pause(); } catch (e) { /* ignore */ } });
    }

    return {
      render: render, items: items, placeholder: placeholder,
      playPreviews: playPreviews, pausePreviews: pausePreviews
    };
  })();

  var Lightbox = (function () {
    var box = $("#lightbox");
    var mediaBox = $("#lbMedia");
    var capBox = $("#lbCaption");
    var closeBtn = $("#lbClose");
    var prevBtn = $("#lbPrev");
    var nextBtn = $("#lbNext");
    var index = 0, opener = null, isOpen = false;

    function clear() {
      var v = mediaBox.querySelector("video");
      if (v) { try { v.pause(); } catch (e) {} v.removeAttribute("src"); v.load(); }
      mediaBox.innerHTML = "";
    }

    function render(i) {
      var items = Gallery.items;
      if (!items.length) return;
      index = (i + items.length) % items.length;
      var item = items[index];
      clear();

      var missing = false;
      function fail() {
        if (missing) return;
        missing = true;
        clear();
        mediaBox.appendChild(Gallery.placeholder(item, "ph"));
      }

      if (item.type === "video") {
        var v = document.createElement("video");
        v.controls = true;
        v.playsInline = true;
        v.autoplay = true;
        v.preload = "auto";
        v.setAttribute("controlsList", "nodownload");
        if (item.poster) v.poster = item.poster;
        v.addEventListener("error", fail);
        v.addEventListener("play", function () { Music.duck(true); });
        v.addEventListener("pause", function () { Music.duck(false); });
        v.addEventListener("ended", function () { Music.duck(false); });
        v.src = item.src;
        mediaBox.appendChild(v);
        var p = v.play();
        if (p && p.catch) p.catch(function () { /* autoplay may be blocked — fine */ });
      } else {
        var img = document.createElement("img");
        img.alt = item.caption || "Photo " + (index + 1);
        img.addEventListener("error", fail);
        img.src = item.src;
        mediaBox.appendChild(img);
      }

      capBox.innerHTML = "";
      if (item.caption) capBox.appendChild(document.createTextNode(item.caption));
      if (item.date) capBox.appendChild(el("small", null, item.date));

      var multi = items.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
    }

    function open(i, from) {
      if (isOpen) { render(i); return; }
      opener = from || null;
      isOpen = true;
      box.hidden = false;
      Gallery.pausePreviews();        /* nothing playing behind the dialog */
      document.body.classList.add("is-locked");
      render(i);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { box.classList.add("is-open"); });
      });
      closeBtn.focus({ preventScroll: true });
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      box.classList.remove("is-open");
      Music.duck(false);
      Gallery.playPreviews();         /* back to life, if page 2 is still up */
      setTimeout(function () {
        clear();
        box.hidden = true;
        document.body.classList.remove("is-locked");
        if (opener) { try { opener.focus({ preventScroll: true }); } catch (e) {} }
      }, REDUCED ? 0 : 420);
    }

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { render(index - 1); });
    nextBtn.addEventListener("click", function () { render(index + 1); });
    $$("[data-close]", box).forEach(function (n) { n.addEventListener("click", close); });

    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); render(index - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); render(index + 1); }
      else if (e.key === "Tab") {
        /* keep focus inside the dialog */
        var focusables = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
        var i = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var nextI = e.shiftKey ? (i <= 0 ? focusables.length - 1 : i - 1)
                               : (i === focusables.length - 1 ? 0 : i + 1);
        focusables[nextI].focus();
      }
    });

    /* swipe between items on touch devices */
    var sx = 0, sy = 0;
    box.addEventListener("touchstart", function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (!isOpen || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        render(dx < 0 ? index + 1 : index - 1);
      }
    }, { passive: true });

    return { open: open, close: close };
  })();

  /* ==========================================================================
     8. PAGE 3 — the final surprise
     ========================================================================== */
  var Final = (function () {
    var wrap = $("#final");
    var stage = $("#videoStage");
    var frame = $("#videoFrame");
    var video = $("#finalVideo");
    var cue = $("#videoCue");
    var skipBtn = $("#skipVideo");
    var reveal = $("#finalReveal");
    var revealed = false;
    var skipTimer = 0;

    function buildLetter() {
      var L = CFG.letter || {};
      var title = $("#letterTitle");
      var body = $("#letterBody");
      var sign = $("#letterSign");

      if (title) title.textContent = L.title || "Happy Birthday";

      if (body) {
        (L.paragraphs || []).forEach(function (text) {
          var p = el("p", "fade-up");
          p.innerHTML = text;          /* your own config text — em/strong allowed */
          body.appendChild(p);
        });
      }

      if (sign) {
        if (L.signatureFrom) sign.appendChild(el("small", null, L.signatureFrom));
        sign.appendChild(document.createTextNode(L.signature || "Always"));
      }

      var strip = $("#polaroids");
      if (strip) {
        (CFG.letterPhotos || []).forEach(function (ph) {
          if (!ph || !ph.src) return;
          var card = el("div", "polaroid fade-up");
          var imgBox = el("div", "polaroid__img");
          var img = document.createElement("img");
          img.loading = "lazy";
          img.alt = ph.caption || "A memory";
          img.addEventListener("error", function () {
            imgBox.innerHTML = "";
            imgBox.appendChild(Gallery.placeholder({ type: "photo", src: ph.src }, "ph"));
          });
          img.src = ph.src;
          imgBox.appendChild(img);
          card.appendChild(imgBox);
          if (ph.caption) card.appendChild(el("p", "polaroid__cap", ph.caption));
          strip.appendChild(card);
        });
      }

      var fw = $("#finalWish");
      if (fw) fw.textContent = CFG.finalWish || "";
    }

    function setupVideo() {
      var v = CFG.finalVideo || {};
      if (!video) return;

      if (!v.src) { fallback("No video set — here's your letter 💌"); return; }
      if (v.poster) video.poster = v.poster;
      video.src = v.src;

      video.addEventListener("error", function () {
        fallback("The video couldn't load — but the letter is right here 💌");
      });
      video.addEventListener("ended", function () { Music.duck(false); doReveal(); });
      video.addEventListener("play", function () {
        Music.duck(true);
        if (cue) cue.textContent = "…";
      });
      video.addEventListener("pause", function () { Music.duck(false); });
    }

    function fallback(message) {
      if (frame) frame.hidden = true;
      if (cue) cue.textContent = message;
      if (skipBtn) {
        skipBtn.hidden = false;
        skipBtn.textContent = "Open the letter →";
      }
    }

    function doReveal() {
      if (revealed) return;
      revealed = true;
      clearTimeout(skipTimer);
      if (skipBtn) skipBtn.hidden = true;

      reveal.hidden = false;
      wrap.classList.add("is-revealed");
      buildHearts();

      requestAnimationFrame(function () {
        observeReveals(reveal);
        /* the letter is right below the fold — nudge it into view */
        setTimeout(function () {
          var page = $("#page-3");
          var letter = $("#letter");
          if (page && letter) {
            page.scrollTo({
              top: letter.offsetTop - window.innerHeight * 0.12,
              behavior: REDUCED ? "auto" : "smooth"
            });
          }
        }, 380);
      });

      if (!REDUCED) {
        Confetti.burst({ count: 130, power: 20, y: 0.62, spread: Math.PI * 1.2 });
        setTimeout(function () {
          Confetti.burst({ count: 70, power: 17, x: 0.14, y: 0.7, angle: -Math.PI / 2.6, spread: Math.PI * 0.7 });
          Confetti.burst({ count: 70, power: 17, x: 0.86, y: 0.7, angle: -Math.PI / 1.6, spread: Math.PI * 0.7 });
        }, 420);
      }
    }

    function onEnter() {
      if (revealed) return;
      if (CFG.skipAfterSeconds && skipBtn && skipBtn.hidden) {
        clearTimeout(skipTimer);
        skipTimer = setTimeout(function () {
          if (!revealed && frame && !frame.hidden) skipBtn.hidden = false;
        }, CFG.skipAfterSeconds * 1000);
      }
    }

    function init() {
      buildLetter();
      setupVideo();
      if (skipBtn) skipBtn.addEventListener("click", doReveal);

      var again = $("#celebrateBtn");
      if (again) {
        again.addEventListener("click", function () {
          Confetti.burst({ count: 140, power: 21, y: 0.55, spread: Math.PI * 1.4 });
          setTimeout(function () {
            Confetti.burst({ count: 80, power: 18, x: 0.2, y: 0.75 });
            Confetti.burst({ count: 80, power: 18, x: 0.8, y: 0.75 });
          }, 300);
        });
      }
    }

    return { init: init, onEnter: onEnter, pause: function () {
      if (video && !video.paused) { try { video.pause(); } catch (e) {} }
    } };
  })();

  /* ==========================================================================
     9. Boot
     ========================================================================== */
  function boot() {
    buildSparkles();
    buildBokeh();
    buildFairyLights();
    buildCurls();
    buildGarden();
    buildPetals();
    buildHeroHearts();
    buildBalloons();
    buildHeroPhoto();
    buildGalleryPhoto();
    buildFinalPhoto();
    buildHeroArt();
    buildHeading();
    buildName();
    startWishes();
    Gallery.render();
    Final.init();
    Music.armAutoplay();

    /* With petals already falling, a constant confetti drizzle just makes the
       scene noisy — keep the celebratory bursts, drop the steady stream. */
    var petalsOn = !REDUCED && CFG.fallingPetals !== false;

    Router.onEnter(0, function () {
      Confetti.setPalette("rose");
      if (!REDUCED && !petalsOn) Confetti.sprinkle(700);
      Final.pause();
      Gallery.pausePreviews(true);
    });
    Router.onEnter(1, function () {
      Confetti.setPalette("earth");
      Confetti.stopSprinkle();
      Final.pause();
      Gallery.playPreviews(true);
    });
    Router.onEnter(2, function () {
      Confetti.setPalette("earth");
      Confetti.stopSprinkle();
      Final.onEnter();
      Gallery.pausePreviews(true);
    });

    document.body.classList.remove("is-loading");

    var first = $("#page-1");
    runTimedReveals(first);
    observeReveals(first);

    if (!REDUCED) {
      /* Kept to the character side and deliberately small: the headline needs
         a calm left, and the scene already carries plenty of motion. */
      setTimeout(function () {
        Confetti.burst({ count: 55, power: 17, x: 0.78, y: 0.4, spread: Math.PI * 1.3 });
      }, 700);
      setTimeout(function () {
        Confetti.burst({ count: 35, power: 15, x: 0.93, y: 0.6, angle: -Math.PI / 1.6, spread: Math.PI * 0.8 });
      }, 1250);
      if (!petalsOn) Confetti.sprinkle(700);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
