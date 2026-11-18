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
        {/* Living: pared al fondo, piso con perspectiva y alfombra donde está la pelota. */}
        <svg aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect x="0" y="372" width="1200" height="228" fill="#1b1612" />
          <path d="M-1000 600 L42 372 M-800 600 L112 372 M-600 600 L182 372 M-400 600 L251 372 M-200 600 L321 372 M0 600 L391 372 M200 600 L461 372 M400 600 L530 372 M600 600 L600 372 M800 600 L670 372 M1000 600 L739 372 M1200 600 L809 372 M1400 600 L879 372 M1600 600 L949 372 M1800 600 L1018 372 M2000 600 L1088 372 M2200 600 L1158 372" fill="none" stroke="rgba(244,241,234,.035)" strokeWidth="2" />
          <path d="M0 430 H1200 M0 505 H1200" fill="none" stroke="rgba(244,241,234,.04)" strokeWidth="2" />
          <path d="M0 358 H1200" fill="none" stroke="rgba(244,241,234,.08)" strokeWidth="3" />
          <path d="M0 372 H1200" fill="none" stroke="rgba(244,241,234,.16)" strokeWidth="3" />
          {/* Cancha real dibujada en el piso con perspectiva (pintura, línea de libre, círculo y triple). */}
          <path d="M453.0 372.0 L250.0 540.5 L950.0 540.5 L747.0 372.0 Z" fill="rgba(255,91,20,.07)" />
          <path d="M453.0 372.0 L250.0 540.5 L950.0 540.5 L747.0 372.0 M857.1 540.5 L862.7 547.1 L867.7 554.1 L872.2 561.4 L876.1 568.9 L879.4 576.7 L881.9 584.8 L883.6 593.2 L884.5 601.8 M315.5 601.8 L316.4 593.2 L318.1 584.8 L320.6 576.7 L323.9 568.9 L327.8 561.4 L332.3 554.1 L337.3 547.1 L342.9 540.5 L348.8 534.1 L355.2 528.0 L362.0 522.2 L369.1 516.7 L376.4 511.5 L384.0 506.5 L391.9 501.8 L400.0 497.4 L408.2 493.2 L416.6 489.2 L425.2 485.5 L433.8 482.0 L442.6 478.8 L451.5 475.7 L460.5 472.9 L469.5 470.3 L478.6 467.9 L487.8 465.7 L497.0 463.7 L506.2 461.8 L515.5 460.2 L524.8 458.7 L534.2 457.5 L543.5 456.4 L552.9 455.4 L562.3 454.7 L571.7 454.1 L581.2 453.7 L590.6 453.4 L600.0 453.3 L609.4 453.4 L618.8 453.7 L628.3 454.1 L637.7 454.7 L647.1 455.4 L656.5 456.4 L665.8 457.5 L675.2 458.7 L684.5 460.2 L693.8 461.8 L703.0 463.7 L712.2 465.7 L721.4 467.9 L730.5 470.3 L739.5 472.9 L748.5 475.7 L757.4 478.8 L766.2 482.0 L774.8 485.5 L783.4 489.2 L791.8 493.2 L800.0 497.4 L808.1 501.8 L816.0 506.5 L823.6 511.5 L830.9 516.7 L838.0 522.2 L844.8 528.0 L851.2 534.1 L857.1 540.5 M204.0 372.0 L35.1 424.0 L35.1 424.0 L29.5 426.3 L23.9 428.6 L18.3 431.0 L12.6 433.4 L7.0 435.8 L1.3 438.4 L-4.4 440.9 L-10.1 443.6 L-15.7 446.3 L-21.4 449.1 L-27.1 451.9 L-32.8 454.8 L-38.5 457.8 L-44.2 460.8 L-49.9 463.9 L-55.6 467.1 L-61.2 470.4 L-66.8 473.7 L-72.5 477.2 L-78.1 480.7 L-83.6 484.2 L-89.2 487.9 L-94.7 491.7 L-100.1 495.5 L-105.5 499.5 L-110.9 503.5 L-116.2 507.6 L-121.4 511.9 L-126.6 516.2 L-131.7 520.6 L-136.7 525.2 L-141.6 529.8 L-146.4 534.6 L-151.1 539.4 L-155.6 544.4 L-160.1 549.5 L-164.4 554.7 L-168.5 560.1 L-172.5 565.5 L-176.3 571.1 L-180.0 576.8 L-183.4 582.7 L-186.6 588.7 L-189.6 594.8 L-192.3 601.0 M1392.3 601.0 L1389.6 594.8 L1386.6 588.7 L1383.4 582.7 L1380.0 576.8 L1376.3 571.1 L1372.5 565.5 L1368.5 560.1 L1364.4 554.7 L1360.1 549.5 L1355.6 544.4 L1351.1 539.4 L1346.4 534.6 L1341.6 529.8 L1336.7 525.2 L1331.7 520.6 L1326.6 516.2 L1321.4 511.9 L1316.2 507.6 L1310.9 503.5 L1305.5 499.5 L1300.1 495.5 L1294.7 491.7 L1289.2 487.9 L1283.6 484.2 L1278.1 480.7 L1272.5 477.2 L1266.8 473.7 L1261.2 470.4 L1255.6 467.1 L1249.9 463.9 L1244.2 460.8 L1238.5 457.8 L1232.8 454.8 L1227.1 451.9 L1221.4 449.1 L1215.7 446.3 L1210.1 443.6 L1204.4 440.9 L1198.7 438.4 L1193.0 435.8 L1187.4 433.4 L1181.7 431.0 L1176.1 428.6 L1170.5 426.3 L1164.9 424.0 L1164.9 424.0 L996.0 372.0 M525.0 372.0 L511.0 394.8 L510.2 396.5 L510.0 398.2 L510.3 400.0 L511.3 401.8 L512.8 403.5 L515.0 405.3 L517.7 407.0 L521.1 408.6 L525.1 410.2 L529.7 411.8 L534.8 413.2 L540.5 414.6 L546.8 415.8 L553.4 416.9 L560.5 417.8 L568.0 418.6 L575.7 419.2 L583.7 419.7 L591.8 419.9 L600.0 420.0 L608.2 419.9 L616.3 419.7 L624.3 419.2 L632.0 418.6 L639.5 417.8 L646.6 416.9 L653.2 415.8 L659.5 414.6 L665.2 413.2 L670.3 411.8 L674.9 410.2 L678.9 408.6 L682.3 407.0 L685.0 405.3 L687.2 403.5 L688.7 401.8 L689.7 400.0 L690.0 398.2 L689.8 396.5 L689.0 394.8 L675.0 372.0" fill="none" stroke="rgba(244,241,234,.2)" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <LivingSofa />
        <LivingTv />
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

// Muebles del living (decorativos). SVGs aparte del fondo para que no se deformen
// al estirar el tablero: el sillón apoyado contra la pared a la izquierda y la tele
// sobre un mueble bajo a la derecha.
const FURN = { fill: "#221b16", stroke: "rgba(244,241,234,.24)", strokeWidth: 3, strokeLinejoin: "round" as const };

function LivingSofa() {
  return (
    <svg className="ms-sofa" viewBox="0 0 420 215" aria-hidden="true">
      {/* respaldo */}
      <rect x="44" y="22" width="332" height="104" rx="20" {...FURN} />
      <path d="M155 30 V118 M265 30 V118" fill="none" stroke="rgba(244,241,234,.12)" strokeWidth="2.5" />
      {/* almohadón suelto */}
      <rect x="70" y="58" width="74" height="58" rx="14" transform="rotate(-10 107 87)" fill="#ff5b14" fillOpacity=".55" stroke="rgba(244,241,234,.28)" strokeWidth="2.5" />
      {/* asiento */}
      <rect x="34" y="112" width="352" height="62" rx="14" {...FURN} />
      <path d="M152 118 V170 M268 118 V170" fill="none" stroke="rgba(244,241,234,.14)" strokeWidth="2.5" />
      {/* apoyabrazos */}
      <rect x="2" y="72" width="62" height="112" rx="22" {...FURN} />
      <rect x="356" y="72" width="62" height="112" rx="22" {...FURN} />
      {/* patas */}
      <path d="M34 184 L28 210 M386 184 L392 210 M150 176 V206 M270 176 V206" fill="none" stroke="rgba(244,241,234,.26)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function LivingTv() {
  return (
    <svg className="ms-tv" viewBox="0 0 380 265" aria-hidden="true">
      <defs>
        <radialGradient id="ms-tv-glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ff8a3d" stopOpacity=".55" />
          <stop offset="100%" stopColor="#ff5b14" stopOpacity=".05" />
        </radialGradient>
      </defs>
      {/* tele */}
      <rect x="28" y="4" width="324" height="186" rx="10" fill="#0d0b0a" stroke="rgba(244,241,234,.3)" strokeWidth="4" />
      <rect className="ms-tv-screen" x="40" y="16" width="300" height="162" rx="4" fill="url(#ms-tv-glow)" />
      {/* partido en la pantalla: líneas de cancha */}
      <path d="M190 16 V178 M40 150 H340" fill="none" stroke="rgba(255,236,220,.35)" strokeWidth="2" />
      <circle cx="190" cy="97" r="22" fill="none" stroke="rgba(255,236,220,.35)" strokeWidth="2" />
      <circle cx="150" cy="80" r="5" fill="rgba(255,236,220,.7)" />
      <circle cx="232" cy="112" r="5" fill="rgba(255,236,220,.7)" />
      {/* pie */}
      <path d="M175 190 L168 206 H212 L205 190" fill="#1c1714" stroke="rgba(244,241,234,.24)" strokeWidth="3" strokeLinejoin="round" />
      {/* mueble bajo */}
      <rect x="2" y="206" width="376" height="48" rx="6" {...FURN} />
      <path d="M127 210 V250 M253 210 V250" fill="none" stroke="rgba(244,241,234,.14)" strokeWidth="2.5" />
      <path d="M100 230 H110 M270 230 H280" fill="none" stroke="rgba(244,241,234,.3)" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 254 V263 M366 254 V263" fill="none" stroke="rgba(244,241,234,.26)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
