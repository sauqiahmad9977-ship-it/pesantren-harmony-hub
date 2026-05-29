import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/_authenticated/konseling")({
  head: () => ({ meta: [{ title: "Konseling — SIM Pesantren" }] }),
  component: () => (
    <CrudTable
      title="Konseling"
      description="Catatan sesi bimbingan dan konseling"
      icon={MessageCircle}
      table="konseling"
      fields={[
        { name: "santri_id", label: "ID Santri", required: true },
        { name: "tanggal", label: "Tanggal", type: "date" },
        { name: "masalah", label: "Masalah" },
        { name: "solusi", label: "Solusi" },
        { name: "konselor", label: "Konselor" },
      ]}
      columns={[
        { key: "tanggal", label: "Tanggal" },
        { key: "masalah", label: "Masalah" },
        { key: "solusi", label: "Solusi" },
        { key: "konselor", label: "Konselor" },
      ]}
    />
  ),
});
