import { useNavigate } from "@tanstack/react-router";
import { GradientButton, ModuleNode, ProgressHeader } from "../components";

export function ModulePathScreen({ moduleId }: { moduleId: string }) {
  const navigate = useNavigate();

  return <>
    <ProgressHeader title="Ba moduli" progress="4/8"/>
    <ModuleNode icon="ا"/><ModuleNode icon="ب"/><ModuleNode icon="ت"/><ModuleNode icon="★"/>
    <GradientButton onClick={() => navigate({ to: "/modules/$moduleId/practice", params: { moduleId } })}>Mashqni boshlash</GradientButton>
    <GradientButton onClick={() => navigate({ to: "/modules/$moduleId/quiz", params: { moduleId } })}>Final Quiz</GradientButton>
  </>;
}
