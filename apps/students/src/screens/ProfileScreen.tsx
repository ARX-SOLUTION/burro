import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppBackground, BottomSheet } from "@burro/ui";
import type { PreferredLanguage } from "@burro/shared";
import { useProfile, useUpdateProfileLanguage } from "../features/profile/hooks";
import "./ProfileScreen.css";

const LANGUAGE_LABELS: Record<PreferredLanguage, string> = {
  uz: "O'zbek",
  ru: "Русский",
  en: "English"
};

const LANGUAGE_ROWS: ReadonlyArray<
  | { code: PreferredLanguage; icon: string; label: string; iconClass: string; selectable: true }
  | { icon: string; label: string; iconClass: string; selectable: false }
> = [
  { code: "uz", icon: "UZ", label: "O'zbekcha", iconClass: "uz", selectable: true },
  { code: "ru", icon: "RU", label: "Русский", iconClass: "ru", selectable: true },
  { code: "en", icon: "EN", label: "English", iconClass: "en", selectable: true },
  { icon: "AR", label: "العربية", iconClass: "ar", selectable: false }
];

export function ProfileScreen() {
  const navigate = useNavigate();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);
  const { data, isPending, isError } = useProfile();
  const updateLanguage = useUpdateProfileLanguage();

  const body = (() => {
    if (isPending) {
      return <p className="profile-replica-state">Yuklanmoqda...</p>;
    }
    if (isError || !data) {
      return (
        <div className="profile-replica-state profile-replica-state--error" role="alert">
          <h2>Xatolik</h2>
          <p>Ma’lumotni yuklab bo‘lmadi.</p>
        </div>
      );
    }

    const language = data.language;

    const onSelectLanguage = (code: PreferredLanguage) => {
      updateLanguage.mutate(code, {
        onSettled: () => setLanguageOpen(false)
      });
    };

    return (
      <>
        <section className="profile-replica-card" aria-label="Profil ma'lumotlari">
          <div className="profile-replica-avatar" aria-hidden="true">
            {data.avatarUrl ? <img src={data.avatarUrl} alt="" width={56} height={56} /> : <span>{data.displayName.slice(0, 1)}</span>}
          </div>
          <div className="profile-replica-identity">
            <strong className="profile-replica-name">{data.displayName}</strong>
            <span className="profile-replica-role">O’quvchi</span>
          </div>
          <button
            type="button"
            className="profile-replica-language-chip"
            aria-label="Tilni tanlash"
            aria-haspopup="dialog"
            aria-expanded={languageOpen}
            onClick={() => setLanguageOpen(true)}
          >
            <span className="profile-replica-language-chip__flag" aria-hidden="true" />
            <span className="profile-replica-language-chip__chevron" aria-hidden="true" />
          </button>
        </section>

        <section className="profile-replica-stats" aria-label="Profil statistikasi">
          <div className="profile-replica-stat profile-replica-stat--xp">
            <strong>{data.totalXp}</strong>
            <span>Jami XP</span>
          </div>
          <div className="profile-replica-stat profile-replica-stat--streak">
            <strong>{data.activeDays}</strong>
            <span>Kunlik streak</span>
          </div>
        </section>

        <section className="profile-replica-settings" aria-label="Sozlamalar">
          <button
            type="button"
            className="profile-replica-settings__row"
            onClick={() => navigate({ to: "/stats" })}
          >
            <span className="profile-replica-icon profile-replica-icon--chart" aria-hidden="true" />
            <span className="profile-replica-settings__label">Statistika</span>
            <span className="profile-replica-settings__value">Batafsil</span>
          </button>

          <button
            type="button"
            className="profile-replica-settings__row"
            onClick={() => setLanguageOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={languageOpen}
          >
            <span className="profile-replica-icon profile-replica-icon--language" aria-hidden="true" />
            <span className="profile-replica-settings__label">Ilova tili</span>
            <span className="profile-replica-settings__value">{LANGUAGE_LABELS[language]}</span>
          </button>

          <label className="profile-replica-settings__row profile-replica-settings__row--toggle">
            <span className="profile-replica-icon profile-replica-icon--bell" aria-hidden="true" />
            <span className="profile-replica-settings__label">Eslatmalar</span>
            <input
              className="profile-replica-toggle__input"
              type="checkbox"
              checked={reminderOn}
              onChange={(event) => setReminderOn(event.currentTarget.checked)}
            />
            <span className="profile-replica-toggle" aria-hidden="true" />
          </label>

          <button type="button" className="profile-replica-settings__row profile-replica-settings__row--danger">
            <span className="profile-replica-icon profile-replica-icon--logout" aria-hidden="true" />
            <span className="profile-replica-settings__label">Chiqish</span>
          </button>
        </section>

        {languageOpen && (
          <BottomSheet title="Tilni tanlash" onClose={() => setLanguageOpen(false)} closeLabel="Yopish">
            <ul className="language-sheet" role="radiogroup" aria-label="Tilni tanlash">
              {LANGUAGE_ROWS.map((row) => {
                const checked = row.selectable && row.code === language;
                return (
                  <li key={row.label}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      aria-disabled={!row.selectable || undefined}
                      className={`language-row${checked ? " language-row--active" : ""}`}
                      onClick={() => {
                        if (row.selectable) {
                          onSelectLanguage(row.code);
                        }
                      }}
                      disabled={updateLanguage.isPending || !row.selectable}
                    >
                      <span className={`language-row__icon language-row__icon--${row.iconClass}`} aria-hidden="true">
                        {row.icon}
                      </span>
                      <span className="language-row__label">{row.label}</span>
                      {row.selectable && <span className="language-row__radio" aria-hidden="true" />}
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
    <div className="profile-replica-shell">
      <AppBackground variant="app">
        <section className="profile-replica-screen">{body}</section>
      </AppBackground>
    </div>
  );
}
