import { useNavigate } from "@tanstack/react-router";
import { GlassCard, GradientButton, ModuleCard } from "@burro/ui";
import { useDashboard } from "../features/dashboard/hooks";

export function DashboardScreen() {
  const navigate = useNavigate();
  const { data, isPending, isError } = useDashboard();

  if (isPending) {
    return <GlassCard><p>Yuklanmoqda...</p></GlassCard>;
  }
  if (isError || !data) {
    return <GlassCard><h2>Xatolik</h2><p>Ma’lumotni yuklab bo‘lmadi.</p></GlassCard>;
  }

  return <>
    <GlassCard><h2>Assalomu alaykum, {data.studentName}!</h2><p>Bugun arab tovushlarini mashq qilamiz.</p><GradientButton onClick={() => navigate({ to: "/modules/$moduleId/practice", params: { moduleId: data.primaryModuleId } })}>Boshlash</GradientButton></GlassCard>
    <div className="grid">{data.modules.map((module) => <ModuleCard key={module.id} title={module.title} subtitle={module.subtitle}/>)}</div>
  </>;
}
