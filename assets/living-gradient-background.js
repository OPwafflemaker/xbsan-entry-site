const PALETTE = {
  background: [4, 5, 7],
  deepBase: [9, 8, 12],
  wine: [112, 22, 34],
  bruisedRose: [148, 52, 66],
  mutedPlum: [98, 44, 86],
  smokyPurple: [66, 40, 82],
  darkIndigo: [28, 38, 96],
  skinWarmth: [158, 104, 76],
  umber: [104, 52, 34],
};

const TUNING = {
  mobileQuality: 0.78,
  desktopQuality: 1.0,
  baseBlur: 96,
  globalDrift: 0.019,
  internalMotion: 0.031,
  breathAmplitude: 0.028,
  breathPeriod: 18.0,
  vignetteStrength: 0.28,
};

const BLOBS = [
  {
    color: PALETTE.wine,
    anchor: [0.26, 0.28],
    orbit: [0.16, 0.10],
    radius: [0.46, 0.62],
    phase: 0.0,
    alpha: 0.34,
  },
  {
    color: PALETTE.bruisedRose,
    anchor: [0.68, 0.32],
    orbit: [0.14, 0.12],
    radius: [0.38, 0.54],
    phase: 1.4,
    alpha: 0.3,
  },
  {
    color: PALETTE.mutedPlum,
    anchor: [0.50, 0.64],
    orbit: [0.18, 0.12],
    radius: [0.38, 0.56],
    phase: 2.7,
    alpha: 0.26,
  },
  {
    color: PALETTE.darkIndigo,
    anchor: [0.76, 0.68],
    orbit: [0.16, 0.14],
    radius: [0.32, 0.46],
    phase: 4.1,
    alpha: 0.22,
  },
  {
    color: PALETTE.umber,
    anchor: [0.24, 0.72],
    orbit: [0.14, 0.10],
    radius: [0.32, 0.46],
    phase: 5.2,
    alpha: 0.2,
  },
  {
    color: PALETTE.skinWarmth,
    anchor: [0.50, 0.18],
    orbit: [0.10, 0.08],
    radius: [0.22, 0.34],
    phase: 3.2,
    alpha: 0.16,
  },
  {
    color: PALETTE.smokyPurple,
    anchor: [0.14, 0.50],
    orbit: [0.1, 0.14],
    radius: [0.26, 0.38],
    phase: 4.8,
    alpha: 0.15,
  },
  {
    color: PALETTE.bruisedRose,
    anchor: [0.86, 0.48],
    orbit: [0.08, 0.12],
    radius: [0.24, 0.36],
    phase: 0.8,
    alpha: 0.14,
  },
];

function rgba(color, alpha) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function createCanvas(container) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);
  return canvas;
}

function drawBackground(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);

  const base = ctx.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, rgba(PALETTE.deepBase, 1));
  base.addColorStop(1, rgba(PALETTE.background, 1));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
}

function drawBlob(ctx, width, height, blob, time) {
  const breath = Math.sin(time / TUNING.breathPeriod * Math.PI * 2 + blob.phase) * TUNING.breathAmplitude;
  const driftX = Math.sin(time * TUNING.globalDrift + blob.phase) * blob.orbit[0];
  const driftY = Math.cos(time * TUNING.globalDrift * 1.13 + blob.phase * 1.18) * blob.orbit[1];
  const internalX = Math.sin(time * TUNING.internalMotion * 1.7 + blob.phase * 2.1) * 0.02;
  const internalY = Math.cos(time * TUNING.internalMotion * 1.33 + blob.phase * 1.7) * 0.02;

  const x = (blob.anchor[0] + driftX + internalX) * width;
  const y = (blob.anchor[1] + driftY + internalY) * height;
  const radius = (blob.radius[0] + (blob.radius[1] - blob.radius[0]) * (0.5 + breath)) * Math.max(width, height);

  const gradient = ctx.createRadialGradient(x, y, radius * 0.08, x, y, radius);
  gradient.addColorStop(0, rgba(blob.color, blob.alpha * 0.92));
  gradient.addColorStop(0.32, rgba(blob.color, blob.alpha * 0.55));
  gradient.addColorStop(0.68, rgba(blob.color, blob.alpha * 0.18));
  gradient.addColorStop(1, rgba(blob.color, 0));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawVeil(ctx, width, height, time) {
  const sweepX = width * (0.5 + Math.sin(time * 0.009) * 0.08);
  const sweepY = height * (0.48 + Math.cos(time * 0.007) * 0.06);
  const veil = ctx.createRadialGradient(sweepX, sweepY, 0, sweepX, sweepY, Math.max(width, height) * 0.74);
  veil.addColorStop(0, "rgba(136, 52, 56, 0.1)");
  veil.addColorStop(0.45, "rgba(88, 54, 86, 0.08)");
  veil.addColorStop(1, "rgba(6, 8, 12, 0)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, width, height);
}

function drawVignette(ctx, width, height) {
  const vignette = ctx.createRadialGradient(width * 0.5, height * 0.44, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.82);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.7, `rgba(0, 0, 0, ${TUNING.vignetteStrength * 0.42})`);
  vignette.addColorStop(1, `rgba(0, 0, 0, ${TUNING.vignetteStrength})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export function mountLivingGradientBackground(container, { forceMotion = false } = {}) {
  if (!container) return () => {};

  const canvas = createCanvas(container);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    return () => {
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = forceMotion ? false : mediaQuery.matches;
  let frameId = 0;
  let active = true;
  let startTime = performance.now();
  let width = 0;
  let height = 0;
  let scale = 1;

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  const resize = () => {
    scale = Math.min(window.devicePixelRatio || 1, isMobile() ? TUNING.mobileQuality : TUNING.desktopQuality);
    width = Math.max(1, Math.floor(container.clientWidth * scale));
    height = Math.max(1, Math.floor(container.clientHeight * scale));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${container.clientWidth}px`;
    canvas.style.height = `${container.clientHeight}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = `blur(${Math.round(TUNING.baseBlur * scale)}px)`;
    if (reducedMotion) render(8.6);
  };

  const render = (elapsed) => {
    drawBackground(ctx, width, height);

    ctx.globalCompositeOperation = "screen";
    for (const blob of BLOBS) {
      drawBlob(ctx, width, height, blob, elapsed);
    }
    drawVeil(ctx, width, height, elapsed);

    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    drawVignette(ctx, width, height);
    ctx.filter = `blur(${Math.round(TUNING.baseBlur * scale)}px)`;
  };

  const animate = () => {
    if (active) {
      const elapsed = (performance.now() - startTime) / 1000;
      render(elapsed);
    }
    frameId = requestAnimationFrame(animate);
  };

  const handleVisibility = () => {
    active = document.visibilityState === "visible";
  };

  const handleMotionChange = (event) => {
    reducedMotion = forceMotion ? false : event.matches;
    if (!reducedMotion && !frameId) {
      startTime = performance.now();
      frameId = requestAnimationFrame(animate);
    }
    if (reducedMotion) {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      render(8.6);
    }
  };

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", handleVisibility);
  mediaQuery.addEventListener("change", handleMotionChange);

  if (reducedMotion) {
    render(8.6);
  } else {
    frameId = requestAnimationFrame(animate);
  }

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", handleVisibility);
    mediaQuery.removeEventListener("change", handleMotionChange);
    if (canvas.parentNode === container) container.removeChild(canvas);
  };
}

let cleanup = null;

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("living-gradient-background");
    if (!container) return;
    cleanup = mountLivingGradientBackground(container, { forceMotion: true });
  });

  window.addEventListener("beforeunload", () => {
    if (cleanup) cleanup();
  });
}
