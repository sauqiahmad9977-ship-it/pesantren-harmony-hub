import { createFileRoute } from "@tanstack/react-router";
import { School } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/_authenticated/kelas")({
  head: () => ({ meta: [{ title: "Kelas — SIM Pesantren" }] }),
  component: () => (
    <CrudTable
      title="Kelas"
      description="Kelola daftar kelas dan rombongan belajar"
      icon={School}
      table="kelas"
      fields={[
        { name: "nama", label: "Nama Kelas", required: true },
        { name: "tingkat", label: "Tingkat" },
        { name: "wali_kelas", label: "Wali Kelas" },
        { name: "kapasitas", label: "Kapasitas", type: "number" },
      ]}
      columns={[
        { key: "nama", label: "Nama" },
        { key: "tingkat", label: "Tingkat" },
        { key: "wali_kelas", label: "Wali Kelas" },
        { key: "kapasitas", label: "Kapasitas" },
      ]}
    />
  ),
});
