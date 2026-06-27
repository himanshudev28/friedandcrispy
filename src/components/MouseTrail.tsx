import { useEffect, useRef } from "react";

/**
 * MouseTrail — soft glowing dots that follow the cursor and fade out.
 * Disabled on touch devices.
 */
const MouseTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const points: { x: number; y: number; life: number; hue: number }[] = [];
    let hue = 0;

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const onMove = (e: MouseEvent) => {
      hue = (hue + 4) % 360;
      points.push({ x: e.clientX, y: e.clientY, life: 1, hue });
      if (points.length > 80) points.shift();
    };

    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.life -= 0.025;
        if (p.life <= 0) continue;
        const radius = 14 * p.life + 2;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        // brand red + amber accent
        grad.addColorStop(0, `hsla(${p.hue % 30 + 0}, 90%, 60%, ${0.55 * p.life})`);
        grad.addColorStop(1, `hsla(35, 95%, 55%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      // connecting line
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "hsla(0, 80%, 55%, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 1; i < points.length; i++) {
        if (points[i].life <= 0 || points[i - 1].life <= 0) continue;
        ctx.moveTo(points[i - 1].x, points[i - 1].y);
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // drop dead points
      while (points.length && points[0].life <= 0) points.shift();
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden="true"
    />
  );
};

export default MouseTrail;
