/**
 * High-performance, lightweight canvas confetti for sales celebration.
 * Zero external dependencies. Uses requestAnimationFrame with physics.
 */
export function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ["#10b981", "#34d399", "#f97316", "#fbbf24", "#0284c7", "#ec4899", "#8b5cf6"];
  const particleCount = 75;
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRotation: number;
    opacity: number;
  }> = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: window.innerWidth * (0.2 + Math.random() * 0.6),
      y: window.innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.9) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  let animationFrameId: number;
  const gravity = 0.45;
  const drag = 0.985;
  let remainingTime = 120; // ~2 seconds

  function frame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let activeParticles = 0;
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.rotation += p.vRotation;

      if (remainingTime < 40) {
        p.opacity = Math.max(0, p.opacity - 0.025);
      }

      if (p.opacity > 0 && p.y < window.innerHeight) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    remainingTime--;
    if (activeParticles > 0 && remainingTime > 0) {
      animationFrameId = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(animationFrameId);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  frame();
}
