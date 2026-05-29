import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/_authenticated/kitab")({
  head: () => ({ meta: [{ title: "Kitab — SIM Pesantren" }] }),
  component: () => (
    <CrudTable
      title="Kitab"
      description="Koleksi kitab kuning dan referensi"
      icon={BookOpen}
      table="kitab"
      fields={[
        { name: "judul", label: "Judul Kitab", required: true },
        { name: "pengarang", label: "Pengarang" },
        { name: "kategori", label: "Kategori" },
        { name: "stok", label: "Stok", type: "number" },
      ]}
      columns={[
        { key: "judul", label: "Judul" },
        { key: "pengarang", label: "Pengarang" },
        { key: "kategori", label: "Kategori" },
        { key: "stok", label: "Stok" },
      ]}
    />
  ),
});
