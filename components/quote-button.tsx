"use client";

import { useState } from "react";
import { ContactModal } from "@/components/contact-modal";
import { Button } from "@/components/site/core";

export function QuoteButton({ variant = "ember" }: { variant?: "ember" | "solid" | "outline" | "outlineLight" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size="lg" onClick={() => setOpen(true)}>
        Solicitar cotización
      </Button>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
