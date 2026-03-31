"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  onAuth: (password: string) => boolean;
};

export default function PasswordScreen({ onAuth }: Props) {
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError(false);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== "")) {
      const password = newCode.join("");
      const success = onAuth(password);
      if (!success) {
        setShaking(true);
        setError(true);
        setTimeout(() => {
          setCode(["", "", "", ""]);
          setShaking(false);
          inputs.current[0]?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-8">
      <div className="flex flex-col items-center gap-8">
        {/* Lock icon */}
        <div className="w-20 h-20 bg-[#007AFF] rounded-[22px] flex items-center justify-center shadow-lg">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-[28px] font-semibold text-[#1C1C1E]">Контакты</h1>
          <p className="text-[15px] text-[#8E8E93] mt-1">Введите код доступа</p>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-4 ${shaking ? "animate-bounce" : ""}`}>
          {code.map((digit, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[24px] font-semibold transition-all duration-150 ${
                error
                  ? "bg-[#FF3B30]/10 border-2 border-[#FF3B30]"
                  : digit
                  ? "bg-[#007AFF]/10 border-2 border-[#007AFF]"
                  : "bg-white border-2 border-[#C6C6C8]"
              }`}
            >
              <input
                ref={(el) => { inputs.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-full h-full text-center bg-transparent outline-none text-[24px] font-semibold text-[#1C1C1E] caret-transparent"
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="text-[#FF3B30] text-[14px] font-medium animate-pulse">
            Неверный код. Попробуйте снова.
          </p>
        )}
      </div>
    </div>
  );
}
