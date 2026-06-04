"use client";

import { useState, useRef, useEffect } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

const MAX_BODY = 2000;

type Status = "idle" | "loading" | "success" | "error";

interface ContactModalProps {
  /** Modo controlado: el padre maneja open/onClose */
  open?: boolean;
  onClose?: () => void;
}

function ContactOverlay({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const payload = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      body,
    };

    try {
      const res = await fetch(`${API_URL}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.detail ?? "No se pudo enviar. Intentá de nuevo.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Error de red. Verificá tu conexión.");
      setStatus("error");
    }
  }

  const inputCls =
    "w-full bg-transparent border border-white/12 px-4 py-3 font-mono text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/35 transition-colors";

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-[#0E0E0E] border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase">
            Contacto — 3DARG
          </p>
          <button
            onClick={onClose}
            className="font-mono text-white/25 hover:text-white/60 text-lg leading-none transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {status === "success" ? (
          <div className="px-8 py-12 text-center">
            <p className="font-mono text-[9px] tracking-[0.4em] text-white/25 uppercase mb-4">
              Mensaje enviado
            </p>
            <h2 className="font-bold text-white text-xl mb-4 leading-snug">
              Recibimos tu consulta.
            </h2>
            <p className="font-mono text-xs text-white/40 leading-relaxed mb-8">
              Te respondemos en menos de 24 hs hábiles.
              Revisá tu casilla — también te enviamos un mail de confirmación.
            </p>
            <button
              onClick={onClose}
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 hover:text-white/70 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.35em] text-white/25 uppercase mb-2">
                Tu email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="nombre@empresa.com"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block font-mono text-[9px] tracking-[0.35em] text-white/25 uppercase mb-2">
                Asunto
              </label>
              <input
                name="title"
                type="text"
                required
                maxLength={150}
                placeholder="Ej: Prototipo funcional en PETG-CF, 50 unidades"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block font-mono text-[9px] tracking-[0.35em] text-white/25 uppercase mb-2">
                Detalle de la consulta
              </label>
              <textarea
                name="body"
                required
                rows={7}
                maxLength={MAX_BODY}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Contanos en detalle lo que necesitás: material, dimensiones, tolerancias, cantidad, plazo de entrega, uso final del producto..."
                className={`${inputCls} resize-none leading-relaxed`}
              />
              <p className="font-mono text-[9px] text-white/20 text-right mt-1">
                {body.length}/{MAX_BODY}
              </p>
            </div>

            {status === "error" && (
              <p className="font-mono text-[10px] text-red-400/80 border border-red-500/20 px-4 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Enviando..." : "Enviar consulta"}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}

/** Modo no controlado: renderiza su propio botón trigger */
export function ContactModal({ open, onClose }: ContactModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const handleClose = isControlled ? (onClose ?? (() => {})) : () => setInternalOpen(false);

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setInternalOpen(true)}
          className="border border-white/15 text-white/50 px-10 py-4 font-bold uppercase tracking-widest text-xs hover:border-white/40 hover:text-white transition-all text-center"
        >
          Escribinos
        </button>
      )}
      {isOpen && <ContactOverlay onClose={handleClose} />}
    </>
  );
}
