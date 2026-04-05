"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  onAuth: (login: string, password: string) => boolean;
};

export default function PasswordScreen({ onAuth }: Props) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const loginRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loginRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuth(login.trim(), password);
    if (!success) {
      setShaking(true);
      setError(true);
      setTimeout(() => {
        setShaking(false);
        setPassword("");
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-8">
      <div className={`flex flex-col items-center gap-8 w-full max-w-[320px] ${shaking ? "animate-bounce" : ""}`}>
        {/* Icon */}
        <div className="w-20 h-20 bg-[#007AFF] rounded-[22px] flex items-center justify-center shadow-lg">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-[28px] font-semibold text-[#1C1C1E]">Контакты</h1>
          <p className="text-[15px] text-[#8E8E93] mt-1">Войдите для доступа</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className={`bg-white rounded-[10px] overflow-hidden ${error ? "border border-[#FF3B30]" : ""}`}>
            <input
              ref={loginRef}
              type="text"
              placeholder="Логин"
              value={login}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username"
              onChange={(e) => { setLogin(e.target.value); setError(false); }}
              className="w-full px-4 py-4 text-[17px] text-[#1C1C1E] placeholder-[#C7C7CC] bg-transparent outline-none border-b border-[#C6C6C8]"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full px-4 py-4 text-[17px] text-[#1C1C1E] placeholder-[#C7C7CC] bg-transparent outline-none"
            />
          </div>

          {error && (
            <p className="text-[#FF3B30] text-[14px] font-medium text-center animate-pulse">
              Неверный логин или пароль
            </p>
          )}

          <button
            type="submit"
            disabled={!login.trim() || !password}
            className="w-full bg-[#007AFF] text-white text-[17px] font-semibold py-4 rounded-[10px] touchable disabled:opacity-40"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
