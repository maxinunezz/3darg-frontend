"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { BrandType } from "@/types/brands";
import { cloudinaryUrl, resolveMediaUrl } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

type Status = "idle" | "loading" | "success" | "error";

// Ícono oficial de WhatsApp (viñeta + auricular) — lucide-react no trae
// isotipos de marca, solo `MessageCircle` genérico sin el teléfono adentro.
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741 1.198 1.023-3.65-.235-.42a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.885 9.888-9.885 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.99c-.003 5.45-4.437 9.885-9.886 9.885zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

const DEFAULT_SEGMENTS = [{ value: "pasteleria", label: "Pastelería" }];

// Da tiempo a navegar un poco la página antes de pedir la suscripción — un
// popup instantáneo genera rechazo. El globo de WhatsApp aparece un toque
// antes (es menos invasivo, solo un mensaje con link directo) para no
// mostrar los dos elementos exactamente al mismo tiempo.
const DEFAULT_POPUP_DELAY_MS = 18000;
const DEFAULT_BUBBLE_DELAY_MS = 12000;

/**
 * Popup de suscripción al canal de WhatsApp de la marca + globo/botón
 * flotante permanente, ambos gateados por
 * `Brand.page_config.whatsapp_channel.channel_url` (vacío/sin cargar = los
 * dos quedan apagados para esa marca, no rompe nada).
 *
 * Una vez cerrado el popup o el globo (sin importar si se suscribió o no),
 * cada uno deja de mostrarse por separado — se guarda en localStorage
 * namespaceado por marca, igual patrón que el cart de invitado.
 */
export function WhatsappCommunityWidget({ brand }: { brand: BrandType }) {
  const config = brand.page_config?.whatsapp_channel;
  const channelUrl = config?.channel_url;
  const popupStorageKey = `wa_popup_dismissed__${brand.slug}`;
  const bubbleStorageKey = `wa_bubble_dismissed__${brand.slug}`;

  const [showPopup, setShowPopup] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [phone, setPhone] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!channelUrl) return;
    if (window.localStorage.getItem(popupStorageKey)) return;
    const delay = config?.popup_delay_ms ?? DEFAULT_POPUP_DELAY_MS;
    const timer = setTimeout(() => setShowPopup(true), delay);
    return () => clearTimeout(timer);
  }, [channelUrl, popupStorageKey, config?.popup_delay_ms]);

  useEffect(() => {
    if (!channelUrl) return;
    if (window.localStorage.getItem(bubbleStorageKey)) return;
    const timer = setTimeout(() => setShowBubble(true), DEFAULT_BUBBLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [channelUrl, bubbleStorageKey]);

  useEffect(() => {
    if (!showPopup) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup]);

  if (!channelUrl) return null;

  function handleDismiss() {
    window.localStorage.setItem(popupStorageKey, "1");
    setShowPopup(false);
  }

  function handleDismissBubble(e?: React.MouseEvent) {
    e?.stopPropagation();
    window.localStorage.setItem(bubbleStorageKey, "1");
    setShowBubble(false);
  }

  function toggleSegment(value: string) {
    setSelectedSegments((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/whatsapp/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          brand: brand.slug,
          segments: selectedSegments,
        }),
      });
      if (res.ok) {
        setStatus("success");
        window.localStorage.setItem(popupStorageKey, "1");
        window.open(channelUrl, "_blank", "noopener,noreferrer");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          data.phone?.[0] ?? data.detail ?? "No se pudo enviar. Intentá de nuevo."
        );
        setStatus("error");
      }
    } catch {
      setErrorMsg("Error de red. Verificá tu conexión.");
      setStatus("error");
    }
  }

  const segments = config?.segments ?? DEFAULT_SEGMENTS;
  const popupTitle = config?.popup_title ?? "Sumate a nuestra comunidad de WhatsApp";
  const popupSubtitle =
    config?.popup_subtitle ??
    "Recibí novedades, promos y lanzamientos antes que nadie.";
  const bubbleMessage =
    config?.bubble_message ??
    "¡Hola! 👋 Sumate a nuestra comunidad de WhatsApp y enterate primero de las novedades.";

  return (
    <>
      {showPopup && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && handleDismiss()}
        >
          <div className="w-full max-w-md sm:max-w-lg bg-card text-foreground border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-start justify-between gap-3 px-7 pt-7">
              <div className="flex items-center gap-2 !text-primary">
                <WhatsAppIcon className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  WhatsApp
                </span>
              </div>
              <button
                onClick={handleDismiss}
                aria-label="Cerrar"
                className="!text-muted-foreground hover:!text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {status === "success" ? (
              <div className="px-7 pb-9 pt-4 text-center">
                <p className="text-xl font-semibold mb-3">
                  ¡Listo! Te esperamos en el canal.
                </p>
                <p className="text-base !text-muted-foreground">
                  Si no se abrió solo,{" "}
                  <a
                    href={channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline !text-foreground"
                  >
                    tocá acá
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-7 pb-7 pt-3 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold leading-snug">{popupTitle}</h3>
                  <p className="text-base !text-muted-foreground mt-2">
                    {popupSubtitle}
                  </p>
                </div>

                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Tu número de WhatsApp"
                  className="w-full bg-background border border-border rounded-md px-4 py-3.5 text-base placeholder:!text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />

                {segments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium !text-muted-foreground">
                      Contanos qué tipo de cliente sos:
                    </p>
                    {segments.map((seg) => (
                      <label
                        key={seg.value}
                        className="flex items-center gap-3 text-base cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSegments.includes(seg.value)}
                          onChange={() => toggleSegment(seg.value)}
                          className="w-5 h-5 rounded border border-border bg-white accent-primary"
                          style={{ colorScheme: "light" }}
                        />
                        {seg.label}
                      </label>
                    ))}
                  </div>
                )}

                {status === "error" && (
                  <p className="text-sm text-red-500">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-primary !text-primary-foreground py-3.5 rounded-md font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {status === "loading" ? "Enviando..." : "Unirme al canal"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Globo flotante estilo chat de WhatsApp: ícono redondo siempre visible
          + un "mensaje" tipo viñeta que se despliega al lado, igual que una
          notificación de chat real, en vez de un botón pill aburrido. */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end gap-3">
        {showBubble && (
          <div className="relative max-w-[260px] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => window.localStorage.setItem(bubbleStorageKey, "1")}
              className="flex items-center gap-3 bg-card !text-foreground border border-border rounded-2xl rounded-br-sm shadow-2xl px-4 py-3 pr-7 hover:brightness-95 transition-[filter]"
            >
              {/* Logo de la marca, como si el mensaje lo mandara ella misma */}
              <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden border border-border bg-white flex items-center justify-center">
                {brand.logo ? (
                  <Image
                    src={cloudinaryUrl(resolveMediaUrl(brand.logo), 100)!}
                    alt={brand.name}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <WhatsAppIcon className="w-5 h-5 !text-[#25D366]" />
                )}
              </div>
              <span className="text-sm leading-snug">{bubbleMessage}</span>
            </a>
            <button
              onClick={handleDismissBubble}
              aria-label="Cerrar"
              className="absolute top-1.5 right-1.5 !text-muted-foreground hover:!text-foreground transition-colors rounded-full p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {/* Colita del globo, apuntando al ícono redondo de abajo */}
            <span
              aria-hidden
              className="absolute -bottom-1.5 right-6 w-3.5 h-3.5 bg-card border-r border-b border-border rotate-45"
            />
          </div>
        )}

        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Unirse a la comunidad de WhatsApp"
          onClick={() => handleDismissBubble()}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] !text-white shadow-lg hover:scale-105 transition-transform"
        >
          <WhatsAppIcon className="w-7 h-7" />
        </a>
      </div>
    </>
  );
}
