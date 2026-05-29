import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/laporan")({
  head: () => ({ meta: [{ title: "Laporan — SIM Pesantren" }] }),
  component: () => (
    <ModulePlaceholder
      title="Laporan"
      description="Statistik dan laporan menyeluruh pondok"
      icon={FileBarChart}
      features={[
        "Laporan jumlah santri per periode",
        "Laporan kesehatan & konseling",
        "Rekap perizinan",
        "Ekspor PDF & Excel",
      ]}
    />
  ),
});
