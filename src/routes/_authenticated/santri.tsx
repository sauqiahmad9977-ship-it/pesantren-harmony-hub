import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/_authenticated/santri")({
  head: () => ({ meta: [{ title: "Santri — SIM Pesantren" }] }),
  component: () => (
    <CrudTable
      title="Santri"
      description="Data induk santri pondok pesantren"
      icon={Users}
      table="santri"
      fields={[
        { name: "nis", label: "NIS", required: true },
        { name: "nama", label: "Nama Lengkap", required: true },
        { name: "gender", label: "Gender (L/P)", required: true },
        { name: "tanggal_lahir", label: "Tanggal Lahir", type: "date" },
        { name: "alamat", label: "Alamat" },
        { name: "nama_wali", label: "Nama Wali" },
        { name: "telepon_wali", label: "Telepon Wali" },
      ]}
      columns={[
        { key: "nis", label: "NIS" },
        { key: "nama", label: "Nama" },
        { key: "gender", label: "L/P" },
        { key: "status", label: "Status" },
        { key: "nama_wali", label: "Wali" },
      ]}
    />
  ),
});
