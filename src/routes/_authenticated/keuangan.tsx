import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/keuangan")({
  head: () => ({ meta: [{ title: "Keuangan — SIM Pesantren" }] }),
  component: () => (
    <ModulePlaceholder
      title="Keuangan"
      description="Tagihan SPP, pembayaran, dan kas pondok"
      icon={Wallet}
      features={[
        "Tagihan SPP & iuran",
        "Riwayat pembayaran santri",
        "Kas masuk & keluar",
        "Laporan keuangan bulanan",
      ]}
    />
  ),
});
