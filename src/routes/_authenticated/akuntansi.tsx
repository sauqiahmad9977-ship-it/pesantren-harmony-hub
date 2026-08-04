import { createFileRoute } from "@tanstack/react-router";
import { Calculator, ListTree, ScrollText, TableProperties } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/akuntansi")({
  head: () => ({ meta: [{ title: "Akuntansi — SIM Pesantren" }] }),
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Akuntansi (Jurnal Umum)</h1>
        <p className="text-muted-foreground">Kelola Chart of Accounts (COA) dan transaksi jurnal akuntansi berpasangan.</p>
      </div>

      <Tabs defaultValue="coa" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="coa" className="flex items-center gap-2">
            <ListTree className="w-4 h-4" />
            Akun Perkiraan (COA)
          </TabsTrigger>
          <TabsTrigger value="jurnal" className="flex items-center gap-2">
            <ScrollText className="w-4 h-4" />
            Jurnal Umum
          </TabsTrigger>
          <TabsTrigger value="detail" className="flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Detail Debit/Kredit
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="coa">
          <CrudTable
            title="Chart of Accounts (COA)"
            description="Daftar akun perkiraan standar (Kas, Piutang, Pendapatan, dll)"
            icon={ListTree}
            table="akun_perkiraan"
            fields={[
              { name: "kode", label: "Kode Akun (mis: 101, 401)", required: true },
              { name: "nama", label: "Nama Akun", required: true },
              { name: "tipe", label: "Tipe (aset/kewajiban/ekuitas/pendapatan/beban)", required: true },
              { name: "saldo_normal", label: "Saldo Normal (debit/kredit)", required: true },
            ]}
            columns={[
              { key: "kode", label: "Kode" },
              { key: "nama", label: "Nama Akun" },
              { key: "tipe", label: "Tipe" },
              { key: "saldo_normal", label: "Saldo Normal" },
            ]}
          />
        </TabsContent>
        
        <TabsContent value="jurnal">
          <CrudTable
            title="Header Jurnal Umum"
            description="Pencatatan tanggal dan keterangan transaksi jurnal"
            icon={ScrollText}
            table="jurnal_umum"
            fields={[
              { name: "tanggal", label: "Tanggal", required: true, type: "date" },
              { name: "keterangan", label: "Keterangan Transaksi", required: true },
              { name: "referensi", label: "No. Referensi / Bukti" },
            ]}
            columns={[
              { key: "id", label: "ID Jurnal" },
              { key: "tanggal", label: "Tanggal" },
              { key: "keterangan", label: "Keterangan" },
              { key: "referensi", label: "Ref" },
            ]}
          />
          
          <Card className="mt-4 border-l-4 border-l-amber-500">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Panduan Pencatatan</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Untuk mencatat jurnal berpasangan secara manual melalui sistem CRUD saat ini:
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Buat Header Jurnal terlebih dahulu pada tab ini.</li>
                <li>Salin <strong>ID Jurnal</strong> yang baru saja dibuat.</li>
                <li>Pindah ke tab <strong>Detail Debit/Kredit</strong> untuk menambahkan baris akun Debit dan Kredit (dengan ID Jurnal yang sama).</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="detail">
          <CrudTable
            title="Detail Jurnal (Debit / Kredit)"
            description="Input baris transaksi jurnal (Minimal 1 Debit dan 1 Kredit untuk setiap ID Jurnal)"
            icon={TableProperties}
            table="detail_jurnal"
            fields={[
              { name: "jurnal_id", label: "ID Jurnal Umum", required: true },
              { name: "akun_id", label: "ID Akun (COA)", required: true },
              { name: "debit", label: "Debit (Rp)", type: "number" },
              { name: "kredit", label: "Kredit (Rp)", type: "number" },
            ]}
            columns={[
              { key: "jurnal_id", label: "ID Jurnal" },
              { key: "akun_id", label: "ID Akun" },
              { key: "debit", label: "Debit" },
              { key: "kredit", label: "Kredit" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  ),
});
