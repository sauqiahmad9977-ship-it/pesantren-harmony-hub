import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Gift, Users } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/donatur")({
  head: () => ({ meta: [{ title: "Donatur — SIM Pesantren" }] }),
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Donatur & Donasi</h1>
        <p className="text-muted-foreground">Kelola data donatur dan riwayat donasi yang diterima.</p>
      </div>

      <Tabs defaultValue="donatur" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="donatur" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Data Donatur
          </TabsTrigger>
          <TabsTrigger value="donasi" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Riwayat Donasi
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="donatur">
          <CrudTable
            title="Daftar Donatur"
            description="Informasi kontak donatur pesantren"
            icon={HeartHandshake}
            table="donatur"
            fields={[
              { name: "nama", label: "Nama Donatur", required: true },
              { name: "kategori", label: "Kategori (individu/lembaga/alumni)", required: true },
              { name: "telepon", label: "Telepon" },
              { name: "email", label: "Email", type: "email" },
              { name: "alamat", label: "Alamat" },
            ]}
            columns={[
              { key: "nama", label: "Nama" },
              { key: "kategori", label: "Kategori" },
              { key: "telepon", label: "Telepon" },
            ]}
          />
        </TabsContent>
        
        <TabsContent value="donasi">
          <CrudTable
            title="Penerimaan Donasi"
            description="Pencatatan riwayat infak dan donasi"
            icon={Gift}
            table="donasi"
            fields={[
              { name: "donatur_id", label: "ID Donatur" },
              { name: "tanggal_donasi", label: "Tanggal", required: true, type: "date" },
              { name: "nominal", label: "Nominal (Rp)", required: true, type: "number" },
              { name: "peruntukan", label: "Peruntukan (Umum/Pembangunan/dll)" },
              { name: "metode_pembayaran", label: "Metode Pembayaran (Transfer/Tunai)" },
              { name: "keterangan", label: "Keterangan Tambahan" },
            ]}
            columns={[
              { key: "donatur_id", label: "ID Donatur" },
              { key: "tanggal_donasi", label: "Tanggal" },
              { key: "nominal", label: "Nominal" },
              { key: "peruntukan", label: "Peruntukan" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  ),
});
