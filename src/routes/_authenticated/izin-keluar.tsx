import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/_authenticated/izin-keluar")({
  head: () => ({ meta: [{ title: "Izin Keluar — SIM Pesantren" }] }),
  component: () => (
    <CrudTable
      title="Izin Keluar"
      description="Perizinan keluar harian santri"
      icon={LogOut}
      table="izin_keluar"
      fields={[
        { name: "santri_id", label: "ID Santri", required: true },
        { name: "tanggal", label: "Tanggal", type: "date" },
        { name: "keperluan", label: "Keperluan" },
      ]}
      columns={[
        { key: "tanggal", label: "Tanggal" },
        { key: "keperluan", label: "Keperluan" },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});
