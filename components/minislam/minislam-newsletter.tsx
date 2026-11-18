"use client";

import { useState } from "react";

// Mismo criterio que components/newsletter-form.tsx: todavía no hay endpoint
// de newsletter en el backend, así que el mail NO se guarda en ningún lado.
// TODO: conectar con POST /api/newsletter/subscribe/ cuando exista.
export function MiniSlamNewsletter() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="ms-news-done" role="status">
        <span aria-hidden="true">🏀</span> ¡Adentro! Te avisamos cuando haya algo nuevo.
      </p>
    );
  }

  return (
    <>
      <form
        className="ms-news-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <label htmlFor="ms-mail" className="sr-only">Tu email</label>
        <input id="ms-mail" type="email" name="email" placeholder="tu@email.com" required />
        <button type="submit">Sumarme →</button>
      </form>
      <p className="ms-news-note">Sin spam. Te das de baja cuando quieras.</p>
    </>
  );
}
