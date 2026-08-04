import { createFileRoute } from "@tanstack/react-router";
import { BookDown, ArrowDownUp } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/buku-kas")({
  head: () => ({ meta: [{ title: "Buku Kas — SIM Pesantren" }] }),
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buku Kas</h1>
        <p className="text-muted-foreground">Pencatatan kas masuk dan keluar secara sederhana.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <ArrowDownUp className="w-5 h-5 text-primary" />
            Buku Kas Harian
          </CardTitle>
          <CardDescription>
            Input transaksi operasional harian yang tidak masuk dalam SPP atau tagihan besar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CrudTable
            title="Transaksi Kas"
            description="Riwayat kas masuk/keluar"
            icon={BookDown}
            table="buku_kas"
            fields={[
              { name: "tanggal", label: "Tanggal", required: true, type: "date" },
              { name: "tipe", label: "Tipe (pemasukan/pengeluaran)", required: true },
              { name: "nominal", label: "Nominal (Rp)", required: true, type: "number" },
              { name: "kategori", label: "Kategori (mis: Operasional, Konsumsi)" },
              { name: "keterangan", label: "Keterangan Lengkap" },
            ]}
            columns={[
              { key: "tanggal", label: "Tanggal" },
              { key: "tipe", label: "Tipe" },
              { key: "nominal", label: "Nominal" },
              { key: "kategori", label: "Kategori" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  ),
});
