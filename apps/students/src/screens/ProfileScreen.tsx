import { useState } from "react";
import { GlassCard, PrimaryGlowButton } from "@burro/ui";
import { LanguageModal } from "../components";
import { useProfile } from "../features/profile/hooks";
import { useLevel } from "../features/level/hooks";

export function ProfileScreen() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const { data, isPending, isError } = useProfile();
  const { data: levelInfo } = useLevel();

  if (isPending) {
    return <GlassCard><p>Yuklanmoqda...</p></GlassCard>;
  }
  if (isError || !data) {
    return <GlassCard><h2>Profile</h2><p>Ma’lumotni yuklab bo‘lmadi.</p></GlassCard>;
  }

  return <>
    <GlassCard><h2>Profile</h2><p>Daraja: {levelInfo?.level ?? 1} · Active days: {data.activeDays} · Achievements: {data.achievements}</p><PrimaryGlowButton onClick={() => setLanguageOpen(true)}>Til</PrimaryGlowButton></GlassCard>
    {languageOpen && <LanguageModal onClose={() => setLanguageOpen(false)}/>}
  </>;
}
