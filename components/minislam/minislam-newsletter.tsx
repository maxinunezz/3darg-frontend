"use client";

import { useState } from "react";

// Mismo criterio que components/newsletter-form.tsx: todavía no hay endpoint
// de newsletter en el backend, así que el mail NO se guarda en ningún lado.
// TODO: conectar con POST /api/newsletter/subscribe/ cuando exista.
export function MiniSlamNewsletter() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return <p className="ms-mono" role="status">¡Listo! Te avisamos cuando haya algo nuevo.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 560, margin: "0 auto" }}
    >
      <label htmlFor="ms-mail" className="sr-only">Tu email</label>
      <input id="ms-mail" type="email" name="email" placeholder="tu@email.com" required />
      <button type="submit" className="ms-btn ms-btn-dark" style={{ border: 0, cursor: "pointer" }}>
        Sumarme
      </button>
    </form>
  );
}
