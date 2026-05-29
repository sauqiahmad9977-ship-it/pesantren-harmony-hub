import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/_authenticated/kesehatan")({
  head: () => ({ meta: [{ title: "Kesehatan — SIM Pesantren" }] }),
  component: () => (
    <CrudTable
      title="Kesehatan"
      description="Catatan layanan kesehatan santri"
      icon={HeartPulse}
      table="kesehatan"
      fields={[
        { name: "santri_id", label: "ID Santri", required: true },
        { name: "tanggal", label: "Tanggal", type: "date" },
        { name: "keluhan", label: "Keluhan" },
        { name: "diagnosa", label: "Diagnosa" },
        { name: "tindakan", label: "Tindakan" },
      ]}
      columns={[
        { key: "tanggal", label: "Tanggal" },
        { key: "keluhan", label: "Keluhan" },
        { key: "diagnosa", label: "Diagnosa" },
        { key: "tindakan", label: "Tindakan" },
      ]}
    />
  ),
});
