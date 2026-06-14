import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppBackground, BottomSheet } from "@burro/ui";
import type { PreferredLanguage } from "@burro/shared";
import { useProfile, useUpdateProfileLanguage } from "../features/profile/hooks";
import { useLevel } from "../features/level/hooks";

const LANGUAGE_LABELS: Record<PreferredLanguage, string> = {
  uz: "O'zbek",
  ru: "Русский",
  en: "English"
};

const LANGUAGE_ROWS: ReadonlyArray<{ code: PreferredLanguage; icon: string; label: string }> = [
  { code: "uz", icon: "UZ", label: "O'zbekcha" },
  { code: "ru", icon: "RU", label: "Русский" },
  { code: "en", icon: "EN", label: "English" }
];

export function ProfileScreen() {
  const navigate = useNavigate();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [reminderOn, setReminderOn] = useState(true);
  const { data, isPending, isError } = useProfile();
  const { data: levelInfo } = useLevel();
  const updateLanguage = useUpdateProfileLanguage();

  const body = (() => {
    if (isPending) {
      return <p className="profile-screen__state">Yuklanmoqda...</p>;
    }
    if (isError || !data) {
      return (
        <div className="profile-screen__state profile-screen__state--error" role="alert">
          <h2>Xatolik</h2>
          <p>Ma’lumotni yuklab bo‘lmadi.</p>
        </div>
      );
    }

    const level = levelInfo?.level ?? 1;
    const language = data.language;

    const onSelectLanguage = (code: PreferredLanguage) => {
      updateLanguage.mutate(code, {
        onSettled: () => setLanguageOpen(false)
      });
    };

    return (
      <>
        <header className="profile-screen__header">
          <h1>Profil</h1>
          <button
            type="button"
            className="profile-screen__close"
            aria-label="Yopish"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <section className="profile-card" aria-label="Profil ma'lumotlari">
          <div className="profile-card__avatar" aria-hidden="true">
            {data.avatarUrl ? <img src={data.avatarUrl} alt="" /> : <span>{data.displayName.slice(0, 1)}</span>}
          </div>
          <div className="profile-card__identity">
            <strong className="profile-card__name">{data.displayName}</strong>
            <span className="profile-card__role">Talaba</span>
          </div>
        </section>

        <section className="profile-stats" aria-label="Profil statistikasi">
          <div className="profile-stat">
            <strong>{level}</strong>
            <span>Daraja</span>
          </div>
          <div className="profile-stat">
            <strong>{data.totalXp}</strong>
            <span>XP</span>
          </div>
          <div className="profile-stat">
            <strong>{data.activeDays}</strong>
            <span>Aktiv kun</span>
          </div>
        </section>

        <section className="profile-settings" aria-label="Sozlamalar">
          <button
            type="button"
            className="profile-settings__row"
            onClick={() => navigate({ to: "/stats" })}
          >
            <span className="profile-settings__icon profile-settings__icon--chart" aria-hidden="true" />
            <span className="profile-settings__label">Statistika</span>
            <span className="profile-settings__value">Batafsil</span>
            <span className="profile-settings__chevron" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="profile-settings__row"
            onClick={() => setLanguageOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={languageOpen}
          >
            <span className="profile-settings__icon profile-settings__icon--language" aria-hidden="true" />
            <span className="profile-settings__label">Ilova tili</span>
            <span className="profile-settings__value">{LANGUAGE_LABELS[language]}</span>
            <span className="profile-settings__chevron" aria-hidden="true" />
          </button>

          <label className="profile-settings__row profile-settings__row--toggle">
            <span className="profile-settings__icon profile-settings__icon--bell" aria-hidden="true" />
            <span className="profile-settings__label">Eslatmalar</span>
            <input
              className="profile-toggle__input"
              type="checkbox"
              checked={reminderOn}
              onChange={(event) => setReminderOn(event.currentTarget.checked)}
            />
            <span className="profile-toggle" aria-hidden="true" />
          </label>

          <button type="button" className="profile-settings__row profile-settings__row--danger">
            <span className="profile-settings__icon profile-settings__icon--logout" aria-hidden="true" />
            <span className="profile-settings__label">Chiqish</span>
          </button>
        </section>

        {languageOpen && (
          <BottomSheet title="Tilni tanlash" onClose={() => setLanguageOpen(false)} closeLabel="Yopish">
            <ul className="language-sheet" role="radiogroup" aria-label="Tilni tanlash">
              {LANGUAGE_ROWS.map((row) => {
                const checked = row.code === language;
                const pending = updateLanguage.isPending && updateLanguage.variables === row.code;
                return (
                  <li key={row.code}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      className={`language-row${checked ? " language-row--active" : ""}`}
                      onClick={() => onSelectLanguage(row.code)}
                      disabled={updateLanguage.isPending}
                    >
                      <span className={`language-row__icon language-row__icon--${row.code}`} aria-hidden="true">
                        {row.icon}
                      </span>
                      <span className="language-row__label">{row.label}</span>
                      <span className={`language-row__radio${checked ? " language-row__radio--on" : ""}`} aria-hidden="true">
                        {pending ? <span className="language-row__spinner" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {updateLanguage.isError && (
              <p className="language-sheet__error" role="alert">
                Tilni saqlab bo‘lmadi. Qayta urinib ko‘ring.
              </p>
            )}
          </BottomSheet>
        )}
      </>
    );
  })();

  return (
    <div className="profile-screen-shell">
      <AppBackground variant="app">
        <section className="profile-screen">{body}</section>
      </AppBackground>
    </div>
  );
}
