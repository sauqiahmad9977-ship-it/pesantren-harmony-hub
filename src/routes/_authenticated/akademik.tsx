import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/akademik")({
  head: () => ({ meta: [{ title: "Akademik — SIM Pesantren" }] }),
  component: () => (
    <ModulePlaceholder
      title="Akademik"
      description="Kurikulum, jadwal, nilai, dan rapor santri"
      icon={GraduationCap}
      features={[
        "Mata pelajaran & kurikulum",
        "Jadwal pelajaran per kelas",
        "Input nilai & ujian",
        "Rapor & transkrip",
      ]}
    />
  ),
});
