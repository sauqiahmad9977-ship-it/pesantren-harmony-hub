import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, DoorOpen, LogOut, CheckCircle, Clock, AlertTriangle, Loader2, CalendarCheck } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetAll, apiCreate, apiUpdate } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/santri")({
  head: () => ({ meta: [{ title: "Santri — SIM Pesantren" }] }),
  component: SantriComponent,
});

function SantriComponent() {
  const [activeTab, setActiveTab] = useState("data_santri");
  const [genderFilter, setGenderFilter] = useState<"Semua" | "L" | "P">("Semua");
  const qc = useQueryClient();

  const { data: santris } = useQuery({
    queryKey: ["santri"],
    queryFn: () => apiGetAll("santri"),
  });

  const { data: izinKeluar } = useQuery({
    queryKey: ["izin_keluar"],
    queryFn: () => apiGetAll("izin_keluar"),
  });

  const sedangIzin = izinKeluar?.filter((i: any) => i.status === "diizinkan") || [];
  const riwayatSelesai = izinKeluar?.filter((i: any) => i.status === "selesai") || [];

  const santriOptions = santris?.map((s: any) => ({
    label: s.nama_santri,
    value: s.id,
  })) || [];

  // Dialog Izin Keluar (Quick Action)
  const IzinKeluarDialog = ({ santriId, namaSantri, open, onOpenChange }: any) => {
    const [saving, setSaving] = useState(false);
    const [keperluan, setKeperluan] = useState("");
    const [penjemput, setPenjemput] = useState("");
    const [tanggalKembali, setTanggalKembali] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        await apiCreate("izin_keluar", {
          santri_id: santriId,
          keperluan,
          penjemput,
          tanggal_kembali: tanggalKembali,
          status: "diizinkan"
        });
        toast.success(`${namaSantri} berhasil diizinkan keluar.`);
        qc.invalidateQueries({ queryKey: ["izin_keluar"] });
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err.message || "Gagal mencatat izin.");
      } finally {
        setSaving(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beri Izin Keluar - {namaSantri}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Keperluan / Alasan</Label>
              <Input required placeholder="Misal: Sakit, Acara Keluarga, dll" value={keperluan} onChange={e => setKeperluan(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Penjemput / Wali</Label>
              <Input required placeholder="Nama pihak penjemput" value={penjemput} onChange={e => setPenjemput(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Estimasi Tanggal Kembali</Label>
              <Input type="date" required value={tanggalKembali} onChange={e => setTanggalKembali(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Catat Izin Keluar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const [izinDialogState, setIzinDialogState] = useState<{ open: boolean, santriId: string, namaSantri: string }>({ open: false, santriId: "", namaSantri: "" });

  const handleBeriIzin = (row: any) => {
    setIzinDialogState({ open: true, santriId: row.id, namaSantri: row.nama_santri });
  };

  const handleKonfirmasiKembali = async (row: any) => {
    if (!confirm(`Konfirmasi bahwa ${row.nama_santri} telah kembali ke pondok?`)) return;
    try {
      await apiUpdate("izin_keluar", row.id, {
        status: "selesai",
        waktu_aktual_kembali: new Date().toISOString()
      });
      toast.success("Terkonfirmasi kembali.");
      qc.invalidateQueries({ queryKey: ["izin_keluar"] });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengonfirmasi.");
    }
  };

  return (
    <div className="space-y-6">
      <IzinKeluarDialog 
        open={izinDialogState.open} 
        onOpenChange={(v: boolean) => setIzinDialogState(prev => ({...prev, open: v}))}
        santriId={izinDialogState.santriId}
        namaSantri={izinDialogState.namaSantri}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="data_santri" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Data Santri
          </TabsTrigger>
          <TabsTrigger value="perizinan" className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4" />
            Perizinan & Izin Keluar
          </TabsTrigger>
          <TabsTrigger value="absensi" className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            Absensi Harian
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data_santri">
          <CrudTable
            title="Santri"
            description="Data induk santri pondok pesantren"
            icon={Users}
            table="santri"
            fields={[
              { name: "no_induk", label: "No Induk", required: true },
              { name: "nama_santri", label: "Nama Santri", required: true },
              { name: "nik", label: "NIK", required: true },
              { name: "gender", label: "Jenis Kelamin", type: "select", options: [{label: "Laki-laki", value: "L"}, {label: "Perempuan", value: "P"}] },
              { name: "ttlh", label: "TTLH" },
              { name: "tamatan", label: "Asal Sekolah/Tamatan" },
              { name: "nama_ayah", label: "Nama Ayah" },
              { name: "nama_ibu", label: "Nama Ibu" },
              { name: "pekerjaan_ortu", label: "Pekerjaan" },
              { name: "alamat", label: "Alamat", type: "textarea" },
              { name: "no_wa", label: "No HP" },
            ]}
            columns={[
              { key: "no_induk", label: "No Induk" },
              { key: "nama_santri", label: "Nama Santri", render: (val, row) => {
                const isKeluar = sedangIzin.some((i: any) => i.santri_id === row.id);
                return (
                  <div className="flex flex-col">
                    <span className="font-medium">{String(val)}</span>
                    {isKeluar && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider bg-amber-100 w-fit px-1.5 py-0.5 rounded-sm mt-0.5">Sedang Izin</span>}
                  </div>
                );
              } },
              { key: "gender", label: "L/P" },
              { key: "ttlh", label: "TTLH" },
              { key: "tamatan", label: "Asal Sekolah" },
              { key: "nama_ayah", label: "Nama Ayah" },
              { key: "no_wa", label: "No HP" },
            ]}
            rowActions={[
              { label: "Beri Izin Keluar", icon: LogOut, color: "text-amber-500", onClick: handleBeriIzin }
            ]}
            filterFn={(row) => genderFilter === "Semua" ? true : row.gender === genderFilter}
            customAction={
              <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                <Button variant={genderFilter === "Semua" ? "default" : "ghost"} size="sm" className="h-7 px-3 text-xs" onClick={() => setGenderFilter("Semua")}>Semua</Button>
                <Button variant={genderFilter === "L" ? "default" : "ghost"} size="sm" className="h-7 px-3 text-xs" onClick={() => setGenderFilter("L")}>Laki-laki</Button>
                <Button variant={genderFilter === "P" ? "default" : "ghost"} size="sm" className="h-7 px-3 text-xs" onClick={() => setGenderFilter("P")}>Perempuan</Button>
              </div>
            }
            allowImport={true}
          />
        </TabsContent>

        <TabsContent value="perizinan" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sedang Berada di Luar</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{sedangIzin.length} Santri</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Telah Kembali (Riwayat)</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{riwayatSelesai.length} Riwayat</div>
              </CardContent>
            </Card>
          </div>

          <CrudTable
            title="Riwayat Izin Keluar"
            description="Pantau santri yang sedang keluar dan riwayat perizinan"
            icon={DoorOpen}
            table="izin_keluar"
            fields={[
              { name: "santri_id", label: "Santri", required: true, type: "select", searchable: true, options: santriOptions },
              { name: "keperluan", label: "Keperluan", required: true },
              { name: "tanggal_keluar", label: "Tgl Keluar", required: true, type: "date" },
              { name: "tanggal_kembali", label: "Est. Kembali", required: true, type: "date" },
              { name: "status", label: "Status", required: true, type: "select", options: [{label:"Diizinkan", value:"diizinkan"}, {label:"Selesai/Kembali", value:"selesai"}] }
            ]}
            columns={[
              { key: "santri_id", label: "Santri", render: (val) => santris?.find((s:any) => s.id === val)?.nama_santri || val },
              { key: "tanggal_keluar", label: "Tgl Keluar", render: (val) => new Date(String(val)).toLocaleDateString('id-ID') },
              { key: "tanggal_kembali", label: "Est. Kembali", render: (val) => new Date(String(val)).toLocaleDateString('id-ID') },
              { key: "keperluan", label: "Keperluan" },
              { key: "penjemput", label: "Penjemput" },
              { key: "status", label: "Status", render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${val === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {String(val).toUpperCase()}
                </span>
              )}
            ]}
            rowActions={[
              { label: "Konfirmasi Kembali", icon: CheckCircle, color: "text-green-600", onClick: handleKonfirmasiKembali }
            ]}
          />
        </TabsContent>

        <TabsContent value="absensi" className="space-y-6">
          <CrudTable
            title="Absensi Harian"
            description="Catat kehadiran, izin, sakit, dan alpa santri"
            icon={CalendarCheck}
            table="absensi_santri"
            fields={[
              { name: "tanggal", label: "Tanggal", required: true, type: "date" },
              { name: "santri_id", label: "Santri", required: true, type: "select", searchable: true, options: santriOptions },
              { name: "status", label: "Status Kehadiran", required: true, type: "select", options: [
                {label: "Hadir", value: "hadir"},
                {label: "Izin", value: "izin"},
                {label: "Sakit", value: "sakit"},
                {label: "Alpa", value: "alpa"}
              ] },
              { name: "keterangan", label: "Keterangan (Opsional)" }
            ]}
            columns={[
              { key: "tanggal", label: "Tanggal", render: (val) => new Date(String(val)).toLocaleDateString('id-ID') },
              { key: "santri_id", label: "Santri", render: (val) => santris?.find((s:any) => s.id === val)?.nama_santri || val },
              { key: "status", label: "Status", render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  val === 'hadir' ? 'bg-green-100 text-green-700' :
                  val === 'izin' ? 'bg-blue-100 text-blue-700' :
                  val === 'sakit' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {String(val).toUpperCase()}
                </span>
              )},
              { key: "keterangan", label: "Keterangan" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
