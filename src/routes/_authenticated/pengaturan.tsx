import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan — SIM Pesantren" }] }),
  component: () => (
    <ModulePlaceholder
      title="Pengaturan"
      description="Konfigurasi sistem & manajemen pengguna"
      icon={Settings}
      features={[
        "Identitas pondok pesantren",
        "Manajemen pengguna & role (admin/ustadz/staff)",
        "Tahun ajaran aktif",
        "Backup data",
      ]}
    />
  ),
});
