import { useState, useEffect, useRef } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PIN, ADMIN_PIN_KEY } from "@/lib/config";

interface AdminPinGateProps {
  children: React.ReactNode;
}

export function AdminPinGate({ children }: AdminPinGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PIN_KEY);
    if (saved === "1") setUnlocked(true);
  }, []);

  useEffect(() => {
    if (!unlocked) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [unlocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(ADMIN_PIN_KEY, "1");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 2000);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-lg"
            style={{ background: "#EE4C9F" }}
          >
            <Lock className="w-9 h-9 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Admin Area</h1>
          <p className="text-muted-foreground text-sm">Enter your PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              ref={inputRef}
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className={`rounded-2xl border-2 h-14 text-center text-xl font-display tracking-[0.4em] pr-12 transition-colors ${
                error
                  ? "border-red-400 bg-red-50 dark:bg-red-950/20 animate-[shake_0.3s_ease-in-out]"
                  : "border-border focus:border-[#EE4C9F]"
              }`}
              data-testid="input-admin-pin"
            />
            <button
              type="button"
              onClick={() => setShowPin((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-semibold">
              Incorrect PIN. Try again.
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl font-display font-bold text-lg border-0 shadow-md"
            style={{ background: "#EE4C9F", color: "#fff" }}
            disabled={pin.length < 1}
            data-testid="btn-admin-unlock"
          >
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}
