import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Banknote } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiGetAll } from "@/lib/api-client";

export const Route = createFileRoute("/_authenticated/kepegawaian")({
  head: () => ({ meta: [{ title: "Kepegawaian — SIM Pesantren" }] }),
  component: KepegawaianComponent,
});

function KepegawaianComponent() {
  const { data: pegawais } = useQuery({
    queryKey: ["pegawai"],
    queryFn: () => apiGetAll("pegawai"),
  });

  const pegawaiOptions = pegawais?.map((p: any) => ({
    label: `${p.nama} (${p.jabatan || 'Staf'})`,
    value: p.id,
  })) || [];

  const bulanOptions = [
    { label: "Januari", value: "Januari" },
    { label: "Februari", value: "Februari" },
    { label: "Maret", value: "Maret" },
    { label: "April", value: "April" },
    { label: "Mei", value: "Mei" },
    { label: "Juni", value: "Juni" },
    { label: "Juli", value: "Juli" },
    { label: "Agustus", value: "Agustus" },
    { label: "September", value: "September" },
    { label: "Oktober", value: "Oktober" },
    { label: "November", value: "November" },
    { label: "Desember", value: "Desember" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kepegawaian & Penggajian</h1>
        <p className="text-muted-foreground">Manajemen data ustadz, ustadzah, staf pesantren, serta riwayat penggajian.</p>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Data Pegawai
          </TabsTrigger>
          <TabsTrigger value="gaji" className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            Penggajian
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="data">
          <CrudTable
            title="Daftar Pegawai"
            description="Manajemen biodata ustadz, ustadzah, dan staf"
            icon={Briefcase}
            table="pegawai"
            fields={[
              { name: "nik", label: "NIK", required: true },
              { name: "nama", label: "Nama Lengkap", required: true },
              { name: "gender", label: "Gender", required: true, type: "select", options: [
                {label: "Laki-laki (L)", value: "L"},
                {label: "Perempuan (P)", value: "P"}
              ] },
              { name: "tempat_lahir", label: "Tempat Lahir" },
              { name: "tanggal_lahir", label: "Tanggal Lahir", type: "date" },
              { name: "alamat", label: "Alamat", type: "textarea" },
              { name: "telepon", label: "No. Telepon" },
              { name: "email", label: "Email" },
              { name: "jabatan", label: "Jabatan" },
              { name: "pendidikan_terakhir", label: "Pendidikan Terakhir" },
              { name: "tanggal_masuk", label: "Tanggal Masuk", type: "date" },
              { name: "gaji_pokok", label: "Gaji Pokok Default (Rp)", type: "number" },
              { name: "no_rekening", label: "No. Rekening" },
              { name: "status", label: "Status Pegawai", type: "select", options: [
                {label: "Aktif", value: "aktif"},
                {label: "Nonaktif", value: "nonaktif"},
                {label: "Cuti", value: "cuti"},
                {label: "Pensiun", value: "pensiun"}
              ] },
              { name: "keterangan", label: "Keterangan", type: "textarea" },
            ]}
            columns={[
              { key: "nik", label: "NIK" },
              { key: "nama", label: "Nama" },
              { key: "jabatan", label: "Jabatan" },
              { key: "telepon", label: "Telepon" },
              { key: "status", label: "Status" },
            ]}
          />
        </TabsContent>

        <TabsContent value="gaji">
          <CrudTable
            title="Riwayat Penggajian"
            description="Pencatatan pembayaran gaji bulanan pegawai"
            icon={Banknote}
            table="penggajian_pegawai"
            fields={[
              { name: "pegawai_id", label: "Pilih Pegawai", required: true, type: "select", options: pegawaiOptions },
              { name: "bulan", label: "Bulan Gaji", required: true, type: "select", options: bulanOptions },
              { name: "tahun", label: "Tahun", required: true },
              { name: "gaji_pokok", label: "Gaji Pokok (Rp)", required: true, type: "number" },
              { name: "tunjangan", label: "Tunjangan (Rp)", required: true, type: "number" },
              { name: "potongan", label: "Potongan (Rp)", required: true, type: "number" },
              { name: "total_gaji", label: "Total Gaji Bersih (Rp)", required: true, type: "number" },
              { name: "tanggal_bayar", label: "Tanggal Bayar", required: true, type: "date" },
              { name: "status", label: "Status", required: true, type: "select", options: [
                {label: "Dibayar", value: "dibayar"},
                {label: "Pending", value: "pending"}
              ] },
              { name: "keterangan", label: "Keterangan", type: "textarea" },
            ]}
            columns={[
              { key: "pegawai_id", label: "ID Pegawai" },
              { key: "bulan", label: "Bulan" },
              { key: "tahun", label: "Tahun" },
              { key: "total_gaji", label: "Total Dibayar" },
              { key: "tanggal_bayar", label: "Tgl Bayar" },
              { key: "status", label: "Status" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
