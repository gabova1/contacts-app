"use client";

import { useEffect } from "react";
import ContactsApp from "@/components/ContactsApp";

export default function Home() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <ContactsApp />;
}
