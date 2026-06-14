import { useNavigate } from "@tanstack/react-router";
import { AppBackground, PrimaryGlowButton } from "@burro/ui";

/**
 * Welcome screen (doc 12 §9.1). Full-bleed hero photo, cyan squircle logo + "Burro"
 * wordmark, subtitle, and a bottom "Boshlash" CTA. No bottom nav here (doc 13 §11).
 * CTA routes to the visual login for dev; the Telegram Mini App initData login path
 * is a later task (doc 12 §9.1 CTA behavior).
 */
export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <AppBackground variant="welcome" overlay="heavy" scroll={false}>
        <div className="welcome-screen__content">
          <div className="welcome-hero">
            <svg className="welcome-logo" viewBox="0 0 128 128" width="96" height="96" aria-hidden="true">
              <defs>
                <linearGradient id="welcome-logo-fill" x1="64" y1="0" x2="64" y2="128" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#5BC8FF" />
                  <stop offset="1" stopColor="#1E78E0" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="128" height="128" rx="22" ry="22" fill="url(#welcome-logo-fill)" />
              <path
                fill="#FFFFFF"
                d="M40 28h28a20 20 0 0 1 13 35.2A22 22 0 0 1 70 100H40Zm12 12v22h16a10 10 0 1 0 0-22Zm0 34v18h18a11 11 0 1 0 0-22H52Z"
              />
            </svg>
            <h1 className="welcome-wordmark">Burro</h1>
            <p className="welcome-subtitle">
              Arab tilini noldan boshlab, oson va qiziqarli o&rsquo;rganing.
            </p>
          </div>
          <PrimaryGlowButton className="welcome-screen__cta" onClick={() => navigate({ to: "/login" })}>
            <span className="welcome-cta-icon" aria-hidden="true" />
            Boshlash
          </PrimaryGlowButton>
        </div>
      </AppBackground>
    </div>
  );
}
