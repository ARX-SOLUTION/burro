import { useState } from "react";
import { GlassCard, GradientButton } from "@burro/ui";
import { LanguageModal } from "../components";
import { useProfile } from "../features/profile/hooks";

export function ProfileScreen() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const { data, isPending, isError } = useProfile();

  if (isPending) {
    return <GlassCard><p>Yuklanmoqda...</p></GlassCard>;
  }
  if (isError || !data) {
    return <GlassCard><h2>Profile</h2><p>Ma’lumotni yuklab bo‘lmadi.</p></GlassCard>;
  }

  return <>
    <GlassCard><h2>Profile</h2><p>Active days: {data.activeDays} · Achievements: {data.achievements}</p><GradientButton onClick={() => setLanguageOpen(true)}>Til</GradientButton></GlassCard>
    {languageOpen && <LanguageModal onClose={() => setLanguageOpen(false)}/>}
  </>;
}
