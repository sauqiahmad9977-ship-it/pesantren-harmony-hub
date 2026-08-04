import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Users, Book, Building, Briefcase, DoorOpen, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CrudTable } from "@/components/CrudTable";
import { apiCount, apiGetAll } from "@/lib/api-client";

export const Route = createFileRoute("/_authenticated/laporan")({
  head: () => ({ meta: [{ title: "Laporan — SIM Pesantren" }] }),
  component: LaporanModule,
});

function StatCard({ title, value, icon: Icon, description }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function LaporanModule() {
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [selectedSantriForHistory, setSelectedSantriForHistory] = useState<{id: string, name: string} | null>(null);
  const [selectedSantriForAbsensiHistory, setSelectedSantriForAbsensiHistory] = useState<{id: string, name: string} | null>(null);

  const { data: santriCount = 0 } = useQuery({
    queryKey: ["count", "santri"],
    queryFn: () => apiCount("santri"),
  });
  const { data: pegawaiCount = 0 } = useQuery({
    queryKey: ["count", "pegawai"],
    queryFn: () => apiCount("pegawai"),
  });
  const { data: kelasCount = 0 } = useQuery({
    queryKey: ["count", "kelas"],
    queryFn: () => apiCount("kelas"),
  });
  const { data: kitabCount = 0 } = useQuery({
    queryKey: ["count", "kitab"],
    queryFn: () => apiCount("kitab"),
  });

  const { data: santris } = useQuery({
    queryKey: ["santri"],
    queryFn: () => apiGetAll("santri"),
  });

  const { data: izinKeluarAll } = useQuery({
    queryKey: ["izin_keluar"],
    queryFn: () => apiGetAll("izin_keluar"),
  });

  const { data: absensiAll } = useQuery({
    queryKey: ["absensi_santri"],
    queryFn: () => apiGetAll("absensi_santri"),
  });

  const santriOptions = santris?.map((s: any) => ({
    label: s.nama_santri,
    value: s.id,
  })) || [];

  const selectedIzinHistory = izinKeluarAll?.filter((i: any) => i.santri_id === selectedSantriForHistory?.id) || [];
  const selectedAbsensiHistory = absensiAll?.filter((a: any) => a.santri_id === selectedSantriForAbsensiHistory?.id) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan & Statistik</h1>
        <p className="text-muted-foreground">Ringkasan data operasional pondok pesantren.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ringkasan" className="flex items-center gap-2">
            <FileBarChart className="w-4 h-4" />
            Ringkasan Umum
          </TabsTrigger>
          <TabsTrigger value="izin" className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4" />
            Rekap Izin Keluar
          </TabsTrigger>
          <TabsTrigger value="absensi" className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            Rekap Absensi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Santri" 
              value={santriCount} 
              icon={Users} 
              description="Santri terdaftar aktif" 
            />
            <StatCard 
              title="Total Pegawai" 
              value={pegawaiCount} 
              icon={Briefcase} 
              description="Guru & Staf terdaftar" 
            />
            <StatCard 
              title="Total Kelas" 
              value={kelasCount} 
              icon={Building} 
              description="Ruang kelas tersedia" 
            />
            <StatCard 
              title="Koleksi Kitab" 
              value={kitabCount} 
              icon={Book} 
              description="Buku & kitab di perpustakaan" 
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ekspor Laporan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Fitur ekspor PDF dan Excel untuk rekapitulasi data santri, keuangan, dan akademik.
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                    Export Data Santri (CSV)
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="izin">
          <CrudTable
            title="Laporan Riwayat Izin Keluar"
            description="Semua data perizinan santri untuk keluar pondok."
            icon={DoorOpen}
            table="izin_keluar"
            fields={[
              { name: "santri_id", label: "Santri", required: true, type: "select", searchable: true, options: santriOptions },
              { name: "keperluan", label: "Keperluan", required: true },
              { name: "tanggal_keluar", label: "Tgl Keluar", required: true, type: "date" },
              { name: "tanggal_kembali", label: "Tgl Kembali", required: true, type: "date" },
              { name: "status", label: "Status", required: true, type: "select", options: [{label:"Diizinkan", value:"diizinkan"}, {label:"Selesai/Kembali", value:"selesai"}] }
            ]}
            columns={[
              { key: "santri_id", label: "Santri", render: (val) => {
                const sName = santris?.find((s:any) => s.id === val)?.nama_santri || val;
                return (
                  <button 
                    onClick={() => setSelectedSantriForHistory({ id: val, name: sName })}
                    className="text-primary hover:underline font-medium text-left"
                  >
                    {sName}
                  </button>
                );
              }},
              { key: "tanggal_keluar", label: "Tgl Keluar", render: (val) => new Date(String(val)).toLocaleDateString('id-ID') },
              { key: "tanggal_kembali", label: "Tgl Kembali", render: (val) => new Date(String(val)).toLocaleDateString('id-ID') },
              { key: "keperluan", label: "Keperluan" },
              { key: "penjemput", label: "Penjemput" },
              { key: "status", label: "Status", render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${val === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {String(val).toUpperCase()}
                </span>
              )}
            ]}
          />
        </TabsContent>

        <TabsContent value="absensi">
          <CrudTable
            title="Laporan Rekap Absensi Santri"
            description="Seluruh data absensi harian santri (Hadir, Izin, Sakit, Alpa)."
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
              { name: "keterangan", label: "Keterangan" }
            ]}
            columns={[
              { key: "tanggal", label: "Tanggal", render: (val) => new Date(String(val)).toLocaleDateString('id-ID') },
              { key: "santri_id", label: "Santri", render: (val) => {
                const sName = santris?.find((s:any) => s.id === val)?.nama_santri || val;
                return (
                  <button 
                    onClick={() => setSelectedSantriForAbsensiHistory({ id: val, name: sName })}
                    className="text-primary hover:underline font-medium text-left"
                  >
                    {sName}
                  </button>
                );
              }},
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

      <Dialog open={!!selectedSantriForHistory} onOpenChange={(open) => !open && setSelectedSantriForHistory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Riwayat Izin Keluar - {selectedSantriForHistory?.name}</DialogTitle>
            <DialogDescription>
              Rincian semua catatan izin keluar untuk santri ini.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedIzinHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada riwayat izin keluar.</p>
            ) : (
              <div className="space-y-4">
                {selectedIzinHistory.sort((a:any, b:any) => new Date(b.tanggal_keluar).getTime() - new Date(a.tanggal_keluar).getTime()).map((izin: any) => (
                  <Card key={izin.id} className="overflow-hidden">
                    <div className={`h-1 w-full ${izin.status === 'selesai' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <CardContent className="p-4 grid gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{izin.keperluan}</p>
                          <p className="text-sm text-muted-foreground">Penjemput: {izin.penjemput || '-'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          izin.status === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {izin.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm bg-muted/50 p-2 rounded-md mt-2">
                        <div>
                          <span className="text-muted-foreground block text-xs">Tanggal Keluar</span>
                          {new Date(izin.tanggal_keluar).toLocaleDateString('id-ID')}
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Tanggal Kembali</span>
                          {new Date(izin.tanggal_kembali).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedSantriForAbsensiHistory} onOpenChange={(open) => !open && setSelectedSantriForAbsensiHistory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Riwayat Absensi - {selectedSantriForAbsensiHistory?.name}</DialogTitle>
            <DialogDescription>
              Rincian semua catatan absensi harian untuk santri ini.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedAbsensiHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada riwayat absensi.</p>
            ) : (
              <div className="space-y-4">
                {selectedAbsensiHistory.sort((a:any, b:any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((absen: any) => (
                  <Card key={absen.id} className="overflow-hidden">
                    <div className={`h-1 w-full ${
                      absen.status === 'hadir' ? 'bg-green-500' :
                      absen.status === 'izin' ? 'bg-blue-500' :
                      absen.status === 'sakit' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} />
                    <CardContent className="p-4 grid gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm text-muted-foreground">{new Date(absen.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-sm mt-1">{absen.keterangan || 'Tidak ada keterangan'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          absen.status === 'hadir' ? 'bg-green-100 text-green-700' :
                          absen.status === 'izin' ? 'bg-blue-100 text-blue-700' :
                          absen.status === 'sakit' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {absen.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
