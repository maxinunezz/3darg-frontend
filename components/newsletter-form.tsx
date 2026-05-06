"use client";

export function NewsletterForm({ cta }: { cta?: string }) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    // TODO: conectar con endpoint backend POST /api/newsletter/subscribe/
    alert(`¡Gracias! Te avisamos a ${email} cuando haya novedades.`);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        name="email"
        placeholder="tu@email.com"
        required
        className="flex-1 border border-input rounded-full px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
      >
        {cta ?? "Suscribirme"}
      </button>
    </form>
  );
}
