"use client";

import { useState } from "react";
import { ContactModal } from "@/components/contact-modal";

export function QuoteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-white text-black px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-colors"
      >
        Solicitar cotización
      </button>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
