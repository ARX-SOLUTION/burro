import { useNavigate } from "@tanstack/react-router";
import { GlassCard, GradientButton, ModuleCard } from "../components";

export function DashboardScreen() {
  const navigate = useNavigate();

  return <>
    <GlassCard><h2>Assalomu alaykum, Amina!</h2><p>Bugun arab tovushlarini mashq qilamiz.</p><GradientButton onClick={() => navigate({ to: "/modules/$moduleId/practice", params: { moduleId: "module-letters-1" } })}>Boshlash</GradientButton></GlassCard>
    <div className="grid"><ModuleCard title="Harflar" subtitle="8/12 yakunlandi"/><ModuleCard title="Talaffuz" subtitle="3 kun streak"/></div>
  </>;
}
