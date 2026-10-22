"use client";

import { useRef, useState } from "react";
import { CheckCircle, Loader2, FileText, Upload, XCircle } from "lucide-react";
import { getBrandUiClasses, type BrandUiClasses } from "@/lib/brand-ui-classes";

// Primer `<input type="file">` del proyecto — no hay componente ni patrón
// reusable previo, se construye de cero. Sube el comprobante de
// transferencia (foto o PDF) a `POST /api/payments/orders/<id>/transfer-receipt/`
// (ver `payments/views.py::TransferReceiptUploadAPIView` en el backend) para
// que el dueño pueda verificarlo antes de confirmar el pago a mano desde el
// admin. Vive dentro del bloque `{isPending && (...)}` de
// `app/(main)/checkout/transfer/page.tsx`.
//
// Usa `fetch()` crudo con `FormData`, NO `apiFetch` de `lib/api.ts` — esa
// helper fuerza `Content-Type: application/json`, lo que rompe el boundary
// de `multipart/form-data`. Sin header manual de `Content-Type`: el browser
// lo genera solo, con el boundary correcto.
//
// Re-subir REEMPLAZA el comprobante anterior (no se guarda historial) —
// mismo criterio que aplica el backend.

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";

// Espejo de `_TRANSFER_RECEIPT_ALLOWED_EXTENSIONS`/`MAX_TRANSFER_RECEIPT_BYTES`
// en `payments/views.py` — validación cliente para feedback inmediato, la
// validación real (la que importa) la sigue haciendo el backend.
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const ALLOWED_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

type Status = "idle" | "uploading" | "success" | "error";

function formatUploadedAt(iso: string) {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString("es-AR")} a las ${d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } catch {
    return iso;
  }
}

export function TransferReceiptUpload({
  orderId,
  initialHasReceipt = false,
  initialUploadedAt = null,
  onUploaded,
  ui = getBrandUiClasses("3darg"),
}: {
  orderId: string;
  initialHasReceipt?: boolean;
  initialUploadedAt?: string | null;
  // Este componente guarda `hasReceipt` en estado LOCAL (ver comentario de
  // abajo) — el `order` que vive en la página padre (`checkout/transfer` o
  // `my-order`) nunca se entera solo. `onUploaded` avisa para que el padre
  // actualice su copia de `order.has_receipt`/`receipt_uploaded_at`, que es
  // lo que lee `OrderStatusCard`/`headerFor` para decidir entre el ícono
  // gris ("falta adjuntar") y el reloj ámbar ("ya está, esperando
  // confirmación") — sin esto, subir el comprobante actualiza ESTE bloque
  // pero el encabezado de arriba queda mostrando el estado viejo.
  onUploaded?: (uploadedAt: string) => void;
  // Ver mismo comentario en `OrderStatusCard` — antes este componente
  // siempre se veía blanco/negro/gris sin importar la marca.
  ui?: BrandUiClasses;
}) {
  // `hasReceipt`/`uploadedAt` reflejan lo que YA hay guardado en el pedido
  // (viene de `reconcile/` al cargar la página, o se actualiza en vivo tras
  // subir uno nuevo) — independiente del `status` de la operación en curso.
  const [hasReceipt, setHasReceipt] = useState(initialHasReceipt);
  const [uploadedAt, setUploadedAt] = useState<string | null>(initialUploadedAt);
  // Si ya hay un comprobante al entrar, arrancamos mostrando ese estado en
  // vez del form — "reemplazar" lo vuelve a abrir.
  const [showForm, setShowForm] = useState(!initialHasReceipt);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function resetFileState() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus("idle");
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function validateFile(f: File): string | null {
    const extension = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return "Formato no permitido. Subí una imagen (JPG, PNG, WEBP) o un PDF.";
    }
    if (f.size > MAX_BYTES) {
      return "El archivo es muy grande (máx. 8MB).";
    }
    return null;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const validationError = validateFile(f);
    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    setErrorMessage("");
    setStatus("idle");
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  }

  async function handleUpload() {
    if (!file) return;
    setStatus("uploading");
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      const res = await fetch(`${API}/payments/orders/${orderId}/transfer-receipt/`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.detail || "No pudimos subir el comprobante. Probá de nuevo.");
        setStatus("error");
        return;
      }
      const data = await res.json();
      const newUploadedAt = data.uploaded_at ?? new Date().toISOString();
      setHasReceipt(true);
      setUploadedAt(newUploadedAt);
      setStatus("success");
      setShowForm(false);
      onUploaded?.(newUploadedAt);
    } catch {
      setErrorMessage("No pudimos subir el comprobante. Revisá tu conexión y probá de nuevo.");
      setStatus("error");
    }
  }

  // Estado "ya subiste un comprobante" — al recargar la página con uno
  // existente, o justo después de subir uno nuevo con éxito.
  if (hasReceipt && !showForm) {
    return (
      <div className="border border-green-300 bg-green-50 rounded-2xl p-5 text-left mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-black">
              {status === "success" ? "¡Recibimos tu comprobante!" : "Ya subiste un comprobante"}
            </p>
            <p className="text-sm text-gray-600">
              {status === "success"
                ? "Te confirmamos el pedido en breve."
                : uploadedAt
                  ? `Subido el ${formatUploadedAt(uploadedAt)}.`
                  : "Lo vamos a revisar antes de confirmar tu pedido."}
            </p>
            <button
              type="button"
              onClick={() => {
                resetFileState();
                setShowForm(true);
              }}
              className="mt-2 text-xs font-semibold underline text-green-700 hover:text-green-900"
            >
              Subir otro comprobante
            </button>
          </div>
        </div>
      </div>
    );
  }

  const strongTextClassName = ui.variant === "default" ? "text-black" : "text-foreground";
  const hoverSurfaceClassName = ui.variant === "default" ? "hover:bg-gray-50" : "hover:bg-muted";

  return (
    <div className={`border rounded-2xl p-5 text-left mb-6 ${ui.surfaceClassName}`}>
      <p className={`font-semibold mb-1 ${strongTextClassName}`}>Ayudanos a confirmar tu pedido más rápido</p>
      <p className={`text-sm mb-4 ${ui.mutedTextClassName}`}>
        Subí una foto o el PDF de tu comprobante de transferencia y te confirmamos el pedido antes.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_ACCEPT}
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id={`receipt-input-${orderId}`}
      />

      {!file ? (
        <label
          htmlFor={`receipt-input-${orderId}`}
          className={`flex items-center justify-center gap-2 border border-dashed rounded-xl py-6 cursor-pointer transition-colors text-sm font-medium ${ui.borderClassName} ${hoverSurfaceClassName} ${ui.mutedTextClassName}`}
        >
          <Upload className="w-4 h-4" />
          Elegir foto o PDF
        </label>
      ) : (
        <div className="space-y-3">
          <div className={`flex items-center gap-3 border rounded-xl p-3 ${ui.borderClassName}`}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Vista previa del comprobante" className="w-16 h-16 object-cover rounded-lg" />
            ) : (
              <FileText className="w-10 h-10 text-gray-400 shrink-0" />
            )}
            <div className="min-w-0">
              <p className={`text-sm font-medium truncate ${strongTextClassName}`}>{file.name}</p>
              <p className={`text-xs ${ui.subtleTextClassName}`}>{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={status === "uploading"}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-semibold transition-opacity text-sm disabled:opacity-60 ${ui.solidBtnSmallClassName}`}
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Subiendo…
                </>
              ) : (
                "Subir comprobante"
              )}
            </button>
            <button
              type="button"
              onClick={resetFileState}
              disabled={status === "uploading"}
              className={`border px-4 py-2.5 rounded-full font-semibold transition-colors text-sm ${ui.ghostBtnClassName}`}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="flex items-start gap-2 mt-3 text-sm text-red-600">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
