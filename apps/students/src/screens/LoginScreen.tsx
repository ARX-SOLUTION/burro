import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppBackground, PrimaryGlowButton } from "@burro/ui";

/**
 * Login screen (doc 12 §9.2). Visual shell only — production uses Telegram OTP.
 * Mosque background (variant="app"), logo + "Kirish" h1, two white input cards
 * (login + password), "Esda saqlash" checkbox, full-width cyan CTA. On submit
 * we navigate to /dashboard; dev-auth bypass runs server-side via x-student-id.
 */
export function LoginScreen() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = login.trim().length > 0 && password.trim().length > 0 && !submitting;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setSubmitting(true);
    // Production auth is Telegram OTP (doc 12 §9.2). For dev the bypass runs
    // server-side via x-student-id, so we navigate straight to /dashboard.
    // A real submission failure (network / 401) would set `error` here.
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="login-screen">
      <AppBackground variant="welcome" overlay="heavy" scroll={false}>
        <form aria-label="Kirish" className="login-screen__content" onSubmit={handleSubmit}>
          <header className="login-hero">
            <img
              alt=""
              className="login-logo"
              height={64}
              src="/assets/brand/logo-mark.png"
              width={64}
            />
            <h1 className="login-title">Kirish</h1>
          </header>

          <div className="login-form">
            <label className="login-field">
              <span className="login-field__label">Foydalanuvchi nomi</span>
              <span className="login-field__shell">
                <span aria-hidden="true" className="login-field__icon login-field__icon--user" />
                <input
                  autoComplete="username"
                  className="login-field__input"
                  inputMode="text"
                  onChange={(event) => setLogin(event.target.value)}
                  placeholder="login"
                  value={login}
                />
              </span>
            </label>

            <label className="login-field">
              <span className="login-field__label">Parol</span>
              <span className="login-field__shell">
                <span aria-hidden="true" className="login-field__icon login-field__icon--lock" />
                <input
                  autoComplete="current-password"
                  className="login-field__input"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  type="password"
                  value={password}
                />
              </span>
            </label>

            <label className="login-remember">
              <input
                checked={remember}
                className="login-remember__input"
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
              />
              <span aria-hidden="true" className="login-remember__box" />
              <span className="login-remember__label">Esda saqlash</span>
            </label>

            {error && (
              <p className="login-error" role="alert" aria-live="polite">
                {error}
              </p>
            )}
          </div>

          <div className="login-cta-wrap">
            <PrimaryGlowButton
              className="login-cta"
              disabled={!canSubmit}
              loading={submitting}
              type="submit"
            >
              <span aria-hidden="true" className="login-cta__icon" />
              Kirish
            </PrimaryGlowButton>
          </div>
        </form>
      </AppBackground>
    </div>
  );
}
