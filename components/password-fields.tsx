"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

const RULES = [
  { label: "Mínimo 8 caracteres",          test: (v: string) => v.length >= 8 },
  { label: "Una letra mayúscula (A–Z)",     test: (v: string) => /[A-Z]/.test(v) },
  { label: "Una letra minúscula (a–z)",     test: (v: string) => /[a-z]/.test(v) },
  { label: "Un número (0–9)",               test: (v: string) => /[0-9]/.test(v) },
  { label: "Un carácter especial (!@#$…)",  test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function strength(password: string) {
  const passed = RULES.filter((r) => r.test(password)).length;
  if (!password)   return { level: 0, label: "",        bar: "bg-border",      text: "" };
  if (passed <= 2) return { level: 1, label: "Débil",   bar: "bg-red-500",    text: "text-red-500" };
  if (passed <= 4) return { level: 2, label: "Media",   bar: "bg-yellow-400", text: "text-yellow-500" };
  return           { level: 3, label: "Fuerte",  bar: "bg-green-500",  text: "text-green-500" };
}

export function validatePassword(password: string, confirm: string): string | null {
  const failed = RULES.filter((r) => !r.test(password));
  if (failed.length > 0) return `La contraseña no cumple: ${failed[0].label.toLowerCase()}.`;
  if (password !== confirm) return "Las contraseñas no coinciden.";
  return null;
}

interface Props {
  password: string;
  confirm: string;
  onChangePassword: (v: string) => void;
  onChangeConfirm: (v: string) => void;
}

export function PasswordFields({ password, confirm, onChangePassword, onChangeConfirm }: Props) {
  const [showPass, setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touchedPass, setTouchedPass]  = useState(false);

  const str    = strength(password);
  const passed = RULES.filter((r) => r.test(password)).length;
  const confirmMatch = confirm.length > 0 && password === confirm;
  const confirmMismatch = confirm.length > 0 && password !== confirm;

  const inputCls = (error?: boolean) =>
    `w-full border rounded-xl px-4 py-3 pr-11 text-sm bg-background focus:outline-none focus:ring-2 transition-shadow ${
      error
        ? "border-red-400 focus:ring-red-300"
        : "border-input focus:ring-ring"
    }`;

  return (
    <div className="space-y-4">
      {/* ── Contraseña ─────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Contraseña</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => onChangePassword(e.target.value)}
            onBlur={() => setTouchedPass(true)}
            required
            autoComplete="new-password"
            className={inputCls(touchedPass && str.level < 3 && password.length > 0)}
            placeholder="Mínimo 8 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Barra de fuerza */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    str.level >= i ? str.bar : "bg-border"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${str.text}`}>{str.label}</p>
          </div>
        )}

        {/* Requisitos */}
        {password.length > 0 && passed < 5 && (
          <ul className="mt-3 space-y-1">
            {RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                  {ok
                    ? <Check className="w-3 h-3 shrink-0" />
                    : <X className="w-3 h-3 shrink-0 opacity-50" />
                  }
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}

        {/* Check de contraseña fuerte */}
        {password.length > 0 && passed === 5 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <Check className="w-3.5 h-3.5" /> Contraseña segura
          </p>
        )}
      </div>

      {/* ── Repetir contraseña ─────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Repetir contraseña</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => onChangeConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className={inputCls(confirmMismatch)}
            placeholder="Repetí tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {confirmMatch && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <Check className="w-3.5 h-3.5" /> Las contraseñas coinciden
          </p>
        )}
        {confirmMismatch && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <X className="w-3.5 h-3.5" /> Las contraseñas no coinciden
          </p>
        )}
      </div>
    </div>
  );
}
