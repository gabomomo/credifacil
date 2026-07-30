"use client";

import { useState } from "react";
import { LogIn, MailCheck } from "lucide-react";
import { authErrorMessage } from "@/lib/admin/useAdminAuth";
import { Button } from "@/components/ui/Button";

const input =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition";

interface Props {
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function LoginForm({ signIn, resetPassword }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      // No hace falta hacer nada más: onAuthStateChanged cambia la pantalla.
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setError("Escribí tu correo y volvé a tocar “Olvidé mi contraseña”.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (resetSent) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <MailCheck className="mx-auto size-12 text-accent-500" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Revisá tu correo</h1>
        <p className="mt-3 text-ink-soft">
          Si <strong>{email.trim()}</strong> tiene una cuenta, le enviamos un enlace para
          crear una contraseña nueva.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setResetSent(false)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft"
    >
      <h1 className="text-center font-display text-2xl font-bold text-ink">
        Panel de administración
      </h1>
      <p className="mt-2 text-center text-ink-soft">
        Acceso restringido al personal de Credifácil.
      </p>

      <div className="mt-7 grid gap-4">
        <label className="text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Correo</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="tucorreo@credifacil.cr"
            required
            className={input}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className={input}
          />
        </label>
      </div>

      {error && (
        <p aria-live="polite" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
        <LogIn className="size-5" />
        {busy ? "Entrando…" : "Entrar"}
      </Button>

      <button
        type="button"
        onClick={handleReset}
        disabled={busy}
        className="mx-auto mt-4 block text-sm font-semibold text-brand-700 hover:underline disabled:opacity-60"
      >
        Olvidé mi contraseña
      </button>
    </form>
  );
}
