import { createFileRoute } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/_authenticated/kamar")({
  head: () => ({ meta: [{ title: "Kamar — SIM Pesantren" }] }),
  component: () => (
    <CrudTable
      title="Kamar"
      description="Data kamar asrama dan pengasuh"
      icon={Home}
      table="kamar"
      fields={[
        { name: "nomor", label: "Nomor Kamar", required: true },
        { name: "gedung", label: "Gedung" },
        { name: "kapasitas", label: "Kapasitas", type: "number" },
        { name: "pengasuh", label: "Pengasuh" },
      ]}
      columns={[
        { key: "nomor", label: "Nomor" },
        { key: "gedung", label: "Gedung" },
        { key: "kapasitas", label: "Kapasitas" },
        { key: "pengasuh", label: "Pengasuh" },
      ]}
    />
  ),
});
