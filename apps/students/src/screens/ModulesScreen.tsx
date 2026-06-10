import { Link } from "@tanstack/react-router";
import { ModuleCard } from "../components";

export function ModulesScreen() {
  return <>
    <h2>Modullar</h2>
    <div className="grid">
      <Link to="/modules/$moduleId" params={{ moduleId: "module-letters-1" }}><ModuleCard title="Alif" subtitle="Ochiq"/></Link>
      <ModuleCard title="Ba" subtitle="Premium"/>
      <ModuleCard title="Jim" subtitle="Quiz"/>
      <ModuleCard title="Dal" subtitle="Yangi"/>
    </div>
  </>;
}
