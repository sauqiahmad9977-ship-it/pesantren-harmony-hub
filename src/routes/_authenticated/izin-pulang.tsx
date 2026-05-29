import { createFileRoute } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/_authenticated/izin-pulang")({
  head: () => ({ meta: [{ title: "Izin Pulang — SIM Pesantren" }] }),
  component: () => (
    <CrudTable
      title="Izin Pulang"
      description="Perizinan pulang ke rumah / liburan"
      icon={Plane}
      table="izin_pulang"
      fields={[
        { name: "santri_id", label: "ID Santri", required: true },
        { name: "tanggal_pulang", label: "Tanggal Pulang", type: "date" },
        { name: "tanggal_kembali", label: "Tanggal Kembali", type: "date" },
        { name: "keperluan", label: "Keperluan" },
      ]}
      columns={[
        { key: "tanggal_pulang", label: "Pulang" },
        { key: "tanggal_kembali", label: "Kembali" },
        { key: "keperluan", label: "Keperluan" },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});
