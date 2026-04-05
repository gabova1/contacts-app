"use client";

import { useEffect, useState } from "react";
import PasswordScreen from "@/components/PasswordScreen";
import ContactsApp from "@/components/ContactsApp";

const APP_LOGIN = "admin";
const APP_PASSWORD = "1234";
const SESSION_KEY = "contacts_auth";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem(SESSION_KEY);
    if (auth === "true") setAuthenticated(true);
    setChecking(false);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const handleAuth = (login: string, password: string) => {
    if (login === APP_LOGIN && password === APP_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      return true;
    }
    return false;
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <PasswordScreen onAuth={handleAuth} />;
  }

  return <ContactsApp />;
}
