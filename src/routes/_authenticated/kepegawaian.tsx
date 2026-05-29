import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/kepegawaian")({
  head: () => ({ meta: [{ title: "Kepegawaian — SIM Pesantren" }] }),
  component: () => (
    <ModulePlaceholder
      title="Kepegawaian"
      description="Manajemen data ustadz, ustadzah, dan staf"
      icon={Briefcase}
      features={[
        "Data induk pegawai (NIK, jabatan, pendidikan)",
        "Absensi & jadwal mengajar",
        "Kontrak & masa kerja",
        "Penggajian dasar",
      ]}
    />
  ),
});
