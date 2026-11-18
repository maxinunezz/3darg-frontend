"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Mini juego de tiro libre del home de MiniSlam: agarrás la pelota y la
// soltás deslizando hacia el aro. La velocidad del gesto (últimos ~120 ms)
// define dirección y fuerza; el resultado se decide al soltar y después se
// anima. Todo es client-side, sin backend. La mejor racha se guarda en
// localStorage (por navegador), el resto se reinicia en cada visita.

type Outcome = "in" | "glass" | "rim" | "short" | "long" | "wide";
type Phase = "idle" | "drag" | "fly" | "after" | "through";

interface Flight {
  x0: number; y0: number; xL: number; yL: number;
  t0: number; T: number; peak: number;
  out: Outcome; hx: number; ry: number; H: number; dir: 1 | -1;
  stage: "fly" | "after"; t1?: number; xs?: number; ys?: number; netDone?: boolean;
}

const K = 230; // px de recorrido por (px/ms) de velocidad del gesto
const RIM_Y = 0.3; // altura del aro (fracción del alto de la cancha)
const BALL_Y = 0.86; // posición inicial de la pelota
const BEST_KEY = "minislam_mejor_racha";

const MSGS: Record<Outcome, string[]> = {
  in: ["¡Cash!", "¡Swish!", "¡Splash!", "Nothing but net"],
  glass: ["¡Off the glass!", "¡Banco!"],
  rim: ["¡Clank!", "In and out", "¡La escupió!"],
  short: ["¡Airball!"],
  long: ["¡A la tribuna!", "¡Brick!"],
  wide: ["¡Airball!"],
};

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Ball({ x, y, scale, rot }: { x: string; y: string; scale: number; rot: number }) {
  return (
    <div className="ms-ball" style={{ left: x, top: y, transform: `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)` }}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#FF5B14" stroke="#1C130D" strokeWidth="2.5" />
        <path d="M2 32h60M32 2v60M11 11c10 9 10 33 0 42M53 11c-10 9-10 33 0 42" fill="none" stroke="#1C130D" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

const NET_D =
  "M2 2 L20 84 M26 2 L36 84 M50 2 L50 84 M74 2 L64 84 M98 2 L80 84 M2 2 L26 30 L50 2 L74 30 L98 2 M8 30 L92 30 M14 30 L36 58 L50 30 L64 58 L86 30 M18 58 L82 58 M20 84 L36 58 L50 84 L64 58 L80 84 M20 84 L80 84";

export function MiniSlamShotGame() {
  const courtRef = useRef<HTMLDivElement>(null);
  const samples = useRef<{ x: number; y: number; t: number }[]>([]);
  const fly = useRef<Flight | null>(null);
  const raf = useRef<number | null>(null);
  const resetT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [ball, setBall] = useState({ x: 0, y: 0, scale: 1, rot: 0 });
  const [size, setSize] = useState({ W: 0, H: 0 });
  const [score, setScore] = useState({ shots: 0, makes: 0, streak: 0, best: 0 });
  const [msg, setMsg] = useState<{ text: string; good: boolean; key: number } | null>(null);
  const [netFlip, setNetFlip] = useState<boolean | null>(null);
  const [rimFlip, setRimFlip] = useState<boolean | null>(null);

  useEffect(() => {
    // Se lee después del primer render (no en el estado inicial) para no
    // generar diferencias entre el HTML del server y el del navegador.
    const loadT = setTimeout(() => {
      try {
        const saved = parseInt(window.localStorage.getItem(BEST_KEY) || "0", 10);
        if (saved > 0) setScore((s) => ({ ...s, best: Math.max(s.best, saved) }));
      } catch {
        /* modo incógnito / storage bloqueado: el juego funciona igual */
      }
    }, 0);
    return () => {
      clearTimeout(loadT);
      if (raf.current) cancelAnimationFrame(raf.current);
      if (resetT.current) clearTimeout(resetT.current);
    };
  }, []);

  const showMsg = (text: string, good: boolean) => setMsg({ text, good, key: Date.now() });

  const rect = () => courtRef.current?.getBoundingClientRect();

  // Espejo del marcador para calcular el resultado sin efectos dentro de un updater de setState.
  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const registerResult = useCallback((f: Flight) => {
    const s = scoreRef.current;
    const made = f.out === "in" || f.out === "glass";
    const streak = made ? s.streak + 1 : 0;
    const best = Math.max(s.best, streak);
    if (best > s.best) {
      try { window.localStorage.setItem(BEST_KEY, String(best)); } catch { /* ignorar */ }
    }
    let text = pick(MSGS[f.out]);
    if (made && streak >= 3 && streak < 5) text = "Let him cook";
    if (made && streak >= 5) text = "¡GOAT!";
    const next = { shots: s.shots + 1, makes: s.makes + (made ? 1 : 0), streak, best };
    scoreRef.current = next;
    setScore(next);
    setMsg({ text, good: made, key: Date.now() });
    if (f.out === "rim") setRimFlip((v) => !v);
  }, []);

  const run = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const step = () => {
      const f = fly.current;
      if (!f) return;
      const now = performance.now();
      if (f.stage === "fly") {
        const p = Math.min(1, (now - f.t0) / f.T);
        const x = f.x0 + (f.xL - f.x0) * p;
        const y = f.y0 + (f.yL - f.y0) * p - f.peak * 4 * p * (1 - p);
        setBall({ x, y, scale: 1 - 0.45 * p, rot: p * 600 * f.dir });
        if (p >= 1) {
          f.stage = "after"; f.t1 = now; f.xs = x; f.ys = y;
          registerResult(f);
        }
      } else {
        const q = Math.min(1, (now - (f.t1 ?? now)) / 650);
        const xs = f.xs ?? 0, ys = f.ys ?? 0;
        let x = xs, y = ys, sc = 0.55, ph: Phase = "after";
        const swish = () => { if (!f.netDone) { f.netDone = true; setNetFlip((v) => !v); } };
        if (f.out === "in") { ph = "through"; y = ys + 110 * q; swish(); }
        else if (f.out === "glass") {
          if (q < 0.3) { const k = q / 0.3; x = xs + (f.hx - xs) * k; y = ys + (f.ry - 6 - ys) * k; }
          else { ph = "through"; x = f.hx; y = f.ry - 6 + 110 * ((q - 0.3) / 0.7); swish(); }
        } else if (f.out === "rim") { x = xs + f.dir * 150 * q; y = ys - 80 * q + 300 * q * q; sc = 0.55 + 0.25 * q; }
        else if (f.out === "short") { y = ys + 320 * q * q; sc = 0.55 + 0.3 * q; }
        else { y = ys + 40 * q + 260 * q * q; sc = 0.55 + 0.3 * q; }
        setBall((b) => ({ x, y: Math.min(y, f.H + 60), scale: sc, rot: b.rot + 8 * f.dir }));
        setPhase(ph);
        if (q >= 1) {
          fly.current = null; raf.current = null;
          resetT.current = setTimeout(() => setPhase("idle"), 450);
          return;
        }
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [registerResult]);

  const launch = useCallback((bx: number, by: number, W: number, H: number, vx: number, vy: number) => {
    const hx = W * 0.5, ry = H * RIM_Y;
    let xL = bx + vx * K, yL = by + vy * K;
    const dx = xL - hx, dy = yL - ry;
    let out: Outcome;
    if (Math.abs(dx) <= 24 && Math.abs(dy) <= 42) out = "in";
    else if (Math.abs(dx) <= 30 && dy < -42 && dy >= -130) out = "glass";
    else if (Math.abs(dx) <= 64 && Math.abs(dy) <= 85) out = "rim";
    else if (dy > 42) out = "short";
    else out = Math.abs(dx) > 130 ? "wide" : "long";
    if (out === "in") { xL = hx; yL = ry - 6; }
    if (out === "glass") { xL = hx + dx * 0.4; yL = ry - 75; }
    if (out === "rim") { xL = hx + (dx < 0 ? -50 : 50); yL = ry - 2; }
    if (out === "long" || out === "wide") { yL = Math.max(16, yL); xL = clamp(xL, 20, W - 20); }
    if (out === "short") xL = clamp(xL, 20, W - 20);
    const dist = Math.max(60, by - yL);
    fly.current = {
      x0: bx, y0: by, xL, yL, t0: performance.now(),
      T: Math.min(950, 520 + dist * 0.9), peak: 70 + dist * 0.38,
      out, hx, ry, H, dir: dx < 0 ? -1 : 1, stage: "fly",
    };
    setPhase("fly");
    run();
  }, [run]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (phase !== "idle") return;
    if ((e.target as HTMLElement).closest("button")) return;
    const r = rect();
    if (!r) return;
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (Math.hypot(x - r.width * 0.5, y - r.height * BALL_Y) > 90) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignorar */ }
    samples.current = [{ x, y, t: performance.now() }];
    setSize({ W: r.width, H: r.height });
    setMsg(null);
    setBall({ x: clamp(x, 40, r.width - 40), y: clamp(y, r.height * 0.62, r.height - 36), scale: 1, rot: 0 });
    setPhase("drag");
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (phase !== "drag") return;
    const r = rect();
    if (!r) return;
    const x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
    samples.current.push({ x, y, t: now });
    while (samples.current.length > 2 && now - samples.current[0].t > 120) samples.current.shift();
    setBall((b) => ({ ...b, x: clamp(x, 40, r.width - 40), y: clamp(y, r.height * 0.62, r.height - 36) }));
  }

  function onPointerUp() {
    if (phase !== "drag") return;
    const sm = samples.current, now = performance.now();
    while (sm.length > 2 && now - sm[0].t > 120) sm.shift();
    if (sm.length < 2) { setPhase("idle"); showMsg("Deslizá hacia el aro", false); return; }
    const a = sm[0], b = sm[sm.length - 1];
    const dt = Math.max(16, b.t - a.t);
    const vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt;
    if (vy > -0.35) { setPhase("idle"); showMsg("¿Eso fue un tiro?", false); return; }
    launch(ball.x, ball.y, size.W, size.H, vx, vy);
  }

  function autoShot() {
    if (phase !== "idle") return;
    const r = rect();
    if (!r) return;
    const W = r.width, H = r.height, bx = W * 0.5, by = H * BALL_Y;
    const need = (by - H * RIM_Y) / K;
    setSize({ W, H });
    setMsg(null);
    setBall({ x: bx, y: by, scale: 1, rot: 0 });
    launch(bx, by, W, H, (Math.random() - 0.5) * 0.24, -need * (0.9 + Math.random() * 0.2));
  }

  const idle = phase === "idle";
  const bx = idle ? "50%" : `${ball.x}px`;
  const by = idle ? `${BALL_Y * 100}%` : `${ball.y}px`;
  const bScale = idle ? 1 : ball.scale;
  const bRot = idle ? 0 : ball.rot;
  const netCls = netFlip === null ? "" : netFlip ? "ms-swish-a" : "ms-swish-b";
  const rimCls = rimFlip === null ? "" : rimFlip ? "ms-hit-a" : "ms-hit-b";

  return (
    <>
      <div className="ms-mono" aria-live="polite" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, fontSize: 12 }}>
        <span className="ms-chip">Tiros {score.shots}</span>
        <span className="ms-chip">Adentro {score.makes}</span>
        <span className="ms-chip" style={{ background: "var(--ms-accent)", color: "var(--ms-bg)" }}>Racha {score.streak}</span>
        <span className="ms-chip">Mejor {score.best}</span>
      </div>

      <div
        ref={courtRef}
        className="ms-court"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M250 600 L250 470 A 350 350 0 0 1 950 470 L950 600" fill="none" stroke="rgba(244,241,234,.10)" strokeWidth="4" />
          <rect x="480" y="380" width="240" height="220" fill="none" stroke="rgba(244,241,234,.10)" strokeWidth="4" />
          <circle cx="600" cy="380" r="110" fill="none" stroke="rgba(244,241,234,.10)" strokeWidth="4" />
        </svg>
        <div aria-hidden="true" style={{ position: "absolute", width: 420, height: 420, left: "50%", top: -160, marginLeft: -210, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,150,60,.22) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="ms-board" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- PNG chico y fijo dentro del tablero */}
          <img src="/minislam/logo-texto-blanco.png" alt="" className="ms-board-logo" />
          <div style={{ position: "absolute", left: "50%", bottom: 14, width: 84, height: 58, transform: "translateX(-50%)", border: "3px solid var(--ms-accent)" }} />
          <div style={{ position: "absolute", left: "50%", bottom: -14, width: 26, height: 18, transform: "translateX(-50%)", background: "var(--ms-paper)", borderRadius: 3 }} />
        </div>

        {phase === "through" && <Ball x={bx} y={by} scale={bScale} rot={bRot} />}

        {/* Red "impresa en 3D": eslabones con sombra, cuerpo, agujero y brillo. */}
        <svg className={`ms-net ${netCls}`} viewBox="-3 -3 106 92" aria-hidden="true">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={NET_D} stroke="#000" strokeOpacity=".55" strokeWidth="5.4" strokeDasharray="5 3.2" transform="translate(0.9 1.4)" />
            <path d={NET_D} stroke="#FF5B14" strokeWidth="4.4" strokeDasharray="5 3.2" />
            <path d={NET_D} stroke="#2A0E03" strokeOpacity=".8" strokeWidth="1.5" strokeDasharray="2.5 5.7" strokeDashoffset="-1.25" />
            <path d={NET_D} stroke="#fff" strokeOpacity=".45" strokeWidth=".9" strokeDasharray="1.6 6.6" strokeDashoffset="-0.4" transform="translate(-0.7 -0.9)" />
          </g>
        </svg>
        <div className={`ms-rim ${rimCls}`} aria-hidden="true" />

        {phase !== "through" && <Ball x={bx} y={by} scale={bScale} rot={bRot} />}

        {idle && <p className="ms-hint ms-mono">↑ Deslizá para tirar</p>}
        {msg && (
          <p key={msg.key} className="ms-msg ms-h" role="status" style={{ color: msg.good ? "var(--ms-accent)" : "var(--ms-paper)" }}>
            {msg.text}
          </p>
        )}

        <button type="button" className="ms-auto" onClick={autoShot}>
          Tirar sin deslizar
        </button>
      </div>
    </>
  );
}
