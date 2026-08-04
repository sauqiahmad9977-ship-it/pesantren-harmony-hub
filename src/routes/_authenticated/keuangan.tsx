import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Receipt, CreditCard, AlertTriangle, Users, Loader2, Trash2, PlusCircle, MinusCircle, BookOpen, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetAll, apiCreate, apiDelete, apiUpdate } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/keuangan")({
  head: () => ({ meta: [{ title: "Keuangan — SIM Pesantren" }] }),
  component: KeuanganComponent,
});

function KeuanganComponent() {
  const [activeTab, setActiveTab] = useState("tagihan");
  const qc = useQueryClient();

  const { data: santris } = useQuery({
    queryKey: ["santri"],
    queryFn: () => apiGetAll("santri"),
  });

  const { data: tagihans } = useQuery({
    queryKey: ["tagihan"],
    queryFn: () => apiGetAll("tagihan"),
  });

  const { data: pembayarans } = useQuery({
    queryKey: ["pembayaran"],
    queryFn: () => apiGetAll("pembayaran"),
  });

  const { data: tabungan } = useQuery({
    queryKey: ["tabungan_santri"],
    queryFn: () => apiGetAll("tabungan_santri"),
  });

  const { data: bukuKas } = useQuery({
    queryKey: ["buku_kas"],
    queryFn: () => apiGetAll("buku_kas"),
  });

  const santriOptions = santris?.map((s: any) => ({
    label: s.nama_santri,
    value: s.id,
  })) || [];

  const tagihanOptions = tagihans?.map((t: any) => {
    const santri = santris?.find((s: any) => s.id === t.santri_id);
    const namaSantri = santri ? santri.nama_santri : "ID: " + String(t.santri_id || "").substring(0, 8);
    return {
      label: `${namaSantri} - ${t.jenis}`,
      value: t.id,
    };
  }) || [];

  const tunggakanData = tagihans?.filter((t: any) => t.status === "belum_lunas" || t.status === "cicilan") || [];
  const tunggakanMap = new Map<string, { santri_id: string; nama_santri: string; total_tagihan: number; rincian: string[]; nominal: number }>();

  tunggakanData.forEach((t: any) => {
    const sId = t.santri_id;
    if (!tunggakanMap.has(sId)) {
      const s = santris?.find((s: any) => s.id === sId);
      tunggakanMap.set(sId, {
        santri_id: sId,
        nama_santri: s ? s.nama_santri : "ID: " + String(sId || "").substring(0, 8),
        total_tagihan: 0,
        rincian: [],
        nominal: 0
      });
    }
    
    // Hitung total pembayaran untuk tagihan ini
    const totalDibayar = pembayarans
      ?.filter((p: any) => p.tagihan_id === t.id)
      .reduce((sum: number, p: any) => sum + Number(p.nominal_bayar), 0) || 0;
      
    const sisaTagihan = Number(t.nominal) - totalDibayar;
    
    // Hanya masukkan ke daftar tunggakan jika sisanya lebih dari 0
    if (sisaTagihan > 0) {
      const entry = tunggakanMap.get(sId)!;
      entry.total_tagihan += 1;
      
      const rincianText = t.status === "cicilan" ? `${t.jenis} (Sisa)` : t.jenis;
      entry.rincian.push(rincianText);
      entry.nominal += sisaTagihan;
    }
  });

  // Hapus entri yang ternyata nominal tunggakannya 0
  const tunggakanList = Array.from(tunggakanMap.values()).filter(t => t.nominal > 0);

  const saldoMap = new Map<string, { santri_id: string; nama_santri: string; total_setor: number; total_tarik: number; saldo: number }>();
  
  if (tabungan && santris) {
    tabungan.forEach((t: any) => {
      const sId = t.santri_id;
      if (!saldoMap.has(sId)) {
        const s = santris?.find((s: any) => s.id === sId);
        saldoMap.set(sId, {
          santri_id: sId,
          nama_santri: s ? s.nama_santri : "Unknown Santri",
          total_setor: 0,
          total_tarik: 0,
          saldo: 0
        });
      }
      const entry = saldoMap.get(sId)!;
      if (t.jenis === "setor") {
        entry.total_setor += Number(t.nominal);
        entry.saldo += Number(t.nominal);
      } else {
        entry.total_tarik += Number(t.nominal);
        entry.saldo -= Number(t.nominal);
      }
    });
  }
  
  const saldoList = Array.from(saldoMap.values());

  const RiwayatTabunganDialog = ({ santriId, namaSantri }: { santriId: string, namaSantri: string }) => {
    const history = tabungan?.filter((t: any) => t.santri_id === santriId).sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()) || [];
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
      if (!confirm("Yakin ingin menghapus riwayat transaksi ini? Saldo santri akan berubah menyesuaikan.")) return;
      setDeletingId(id);
      try {
        await apiDelete("tabungan_santri", id);
        toast.success("Transaksi dihapus");
        qc.invalidateQueries({ queryKey: ["tabungan_santri"] });
      } catch (err: any) {
        toast.error("Gagal menghapus: " + (err.message || String(err)));
      } finally {
        setDeletingId(null);
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Lihat Riwayat">
            <Receipt className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Riwayat Tabungan - {namaSantri}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-center w-12">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Belum ada riwayat</TableCell>
                </TableRow>
              ) : (
                history.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell>{new Date(h.tanggal).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${h.jenis === 'setor' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {h.jenis.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{new Intl.NumberFormat("id-ID").format(h.nominal)}</TableCell>
                    <TableCell className="text-muted-foreground">{h.keterangan || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(h.id)} disabled={deletingId === h.id}>
                        {deletingId === h.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    );
  };

  const QuickTabunganDialog = ({ santriId, namaSantri, type }: { santriId: string, namaSantri: string, type: 'setor' | 'tarik' }) => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [nominal, setNominal] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!nominal) return toast.error("Nominal wajib diisi");

      setSaving(true);
      try {
        await apiCreate("tabungan_santri", {
          santri_id: santriId,
          jenis: type,
          nominal: Number(nominal),
          tanggal: tanggal,
          keterangan: keterangan
        });
        toast.success(`Transaksi ${type} berhasil ditambahkan`);
        setOpen(false);
        setNominal("");
        setKeterangan("");
        qc.invalidateQueries({ queryKey: ["tabungan_santri"] });
      } catch (err: any) {
        toast.error(`Gagal melakukan transaksi: ` + (err.message || String(err)));
      } finally {
        setSaving(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={type === 'setor' ? "default" : "destructive"} size="sm" className={`h-8 w-8 p-0 ${type === 'setor' ? 'bg-green-600 hover:bg-green-700' : ''}`} title={type === 'setor' ? 'Setor Tabungan' : 'Tarik Tabungan'}>
            {type === 'setor' ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{type === 'setor' ? 'Setor' : 'Tarik'} Tabungan - {namaSantri}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nominal (Rp) *</Label>
              <Input type="number" required value={nominal} onChange={e => setNominal(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal *</Label>
              <Input type="date" required value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Keterangan</Label>
              <Input value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Catatan tambahan (opsional)" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving} className={type === 'setor' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive'}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const BayarTagihanDialog = ({ santriId, namaSantri }: { santriId: string, namaSantri: string }) => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tagihanId, setTagihanId] = useState("");
    const [nominal, setNominal] = useState("");
    const [metode, setMetode] = useState("cash");
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

    // Cari tagihan yang belum lunas untuk santri ini
    const unpaidTagihans = tagihans?.filter((t: any) => t.santri_id === santriId && t.status !== 'lunas').map((t: any) => {
      const terbayar = pembayarans?.filter((p: any) => p.tagihan_id === t.id).reduce((sum: number, p: any) => sum + Number(p.nominal_bayar), 0) || 0;
      const sisa = Number(t.nominal) - terbayar;
      return { ...t, terbayar, sisa };
    }).filter((t: any) => t.sisa > 0) || [];

    const handleSelectTagihan = (tId: string) => {
      setTagihanId(tId);
      const selected = unpaidTagihans.find((t: any) => t.id === tId);
      if (selected) {
        setNominal(String(selected.sisa));
      }
    };

    const handleBayar = (e: React.FormEvent) => {
      e.preventDefault();
      if (!tagihanId || !nominal) return toast.error("Pilih tagihan dan isi nominal");
      
      const selectedTagihan = unpaidTagihans.find((t: any) => t.id === tagihanId);
      const newSisa = (selectedTagihan?.sisa || 0) - Number(nominal);
      const newStatus = newSisa <= 0 ? "lunas" : "cicilan";

      // 1. Langsung tutup dialog agar UI terasa instan (tidak loading lama)
      setOpen(false);
      
      // 2. Tampilkan notifikasi loading
      const toastId = toast.loading("Sedang memproses pembayaran...");

      // 3. Jalankan penyimpanan ke database di latar belakang
      Promise.all([
        apiCreate("pembayaran", {
          tagihan_id: tagihanId,
          tanggal_bayar: tanggal,
          nominal_bayar: Number(nominal),
          metode_pembayaran: metode
        }),
        apiUpdate("tagihan", tagihanId, {
          status: newStatus
        }),
        apiCreate("buku_kas", {
          tanggal: tanggal,
          jenis: "pemasukan",
          kategori: selectedTagihan?.jenis || "Tagihan",
          nominal: Number(nominal),
          keterangan: `Pembayaran ${selectedTagihan?.jenis || 'Tagihan'} - ${namaSantri}`
        })
      ])
      .then(() => {
        toast.success(`Pembayaran berhasil dicatat dan disinkronkan ke Buku Kas!`, { id: toastId });
        setTagihanId("");
        setNominal("");
        qc.invalidateQueries({ queryKey: ["pembayaran"] });
        qc.invalidateQueries({ queryKey: ["tagihan"] });
        qc.invalidateQueries({ queryKey: ["buku_kas"] });
      })
      .catch((err: any) => {
        toast.error(`Gagal mencatat pembayaran: ` + (err.message || String(err)), { id: toastId });
      });
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">Bayar</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Pembayaran - {namaSantri}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBayar} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Pilih Tagihan Tertunggak *</Label>
              <select 
                required 
                value={tagihanId} 
                onChange={e => handleSelectTagihan(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>-- Pilih Tagihan --</option>
                {unpaidTagihans.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.jenis} (Sisa: Rp {new Intl.NumberFormat('id-ID').format(t.sisa)})
                  </option>
                ))}
              </select>
              {unpaidTagihans.length === 0 && <p className="text-xs text-red-500">Santri ini tidak memiliki tunggakan yang tersisa.</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Nominal Pembayaran (Rp) *</Label>
              <Input type="number" required value={nominal} onChange={e => setNominal(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Bayar *</Label>
              <Input type="date" required value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Metode Pembayaran *</Label>
              <select 
                required 
                value={metode} 
                onChange={e => setMetode(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving || unpaidTagihans.length === 0}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Proses Pembayaran
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const GenerateMassalDialog = () => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [jenis, setJenis] = useState("");
    const [nominal, setNominal] = useState("");
    const [tenggat, setTenggat] = useState("");

    const handleGenerate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!santris || santris.length === 0) return toast.error("Data santri masih kosong");
      
      const activeSantris = santris.filter((s: any) => s.status === 'aktif' || !s.status);
      if (activeSantris.length === 0) return toast.error("Tidak ada santri aktif");

      if (!jenis || !nominal) return toast.error("Jenis tagihan dan nominal wajib diisi");

      setSaving(true);
      try {
        const payloads = activeSantris.map((s: any) => ({
          santri_id: s.id,
          jenis: jenis,
          nominal: Number(nominal),
          tenggat_waktu: tenggat || null,
          status: "belum_lunas"
        }));

        await apiCreate("tagihan", payloads);
        toast.success(`Berhasil mencetak ${payloads.length} tagihan massal untuk santri aktif.`);
        setOpen(false);
        setJenis("");
        setNominal("");
        setTenggat("");
        qc.invalidateQueries({ queryKey: ["tagihan"] });
      } catch (err: any) {
        toast.error("Gagal generate massal: " + (err.message || String(err)));
      } finally {
        setSaving(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            <Users className="w-4 h-4 mr-1.5" />
            Generate Massal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Tagihan Massal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Jenis Tagihan (Contoh: SPP Agustus 2026) *</Label>
              <Input required value={jenis} onChange={e => setJenis(e.target.value)} placeholder="SPP Bulanan..." />
            </div>
            <div className="space-y-1.5">
              <Label>Nominal (Rp) *</Label>
              <Input type="number" required value={nominal} onChange={e => setNominal(e.target.value)} placeholder="500000" />
            </div>
            <div className="space-y-1.5">
              <Label>Tenggat Waktu</Label>
              <Input type="date" value={tenggat} onChange={e => setTenggat(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              Aksi ini akan membuatkan tagihan tersebut secara otomatis kepada <b>semua santri</b> yang berstatus aktif.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Generate Tagihan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const totalTagihanRp = tagihans?.reduce((sum: number, t: any) => sum + Number(t.nominal), 0) || 0;
  const totalPembayaranRp = pembayarans?.reduce((sum: number, p: any) => sum + Number(p.nominal_bayar), 0) || 0;
  const totalTunggakanRp = tunggakanList.reduce((sum: number, row: any) => sum + row.nominal, 0);
  const totalTabunganRp = saldoList.reduce((sum: number, row: any) => sum + row.saldo, 0);

  const totalPemasukanKas = bukuKas?.filter((b: any) => b.jenis === 'pemasukan').reduce((sum: number, b: any) => sum + Number(b.nominal), 0) || 0;
  const totalPengeluaranKas = bukuKas?.filter((b: any) => b.jenis === 'pengeluaran').reduce((sum: number, b: any) => sum + Number(b.nominal), 0) || 0;
  const saldoKas = totalPemasukanKas - totalPengeluaranKas;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Keuangan</h1>
        <p className="text-muted-foreground">Kelola tagihan dan pembayaran santri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {new Intl.NumberFormat('id-ID').format(totalTagihanRp)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rp {new Intl.NumberFormat('id-ID').format(totalPembayaranRp)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Tunggakan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rp {new Intl.NumberFormat('id-ID').format(totalTunggakanRp)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Tabungan</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Rp {new Intl.NumberFormat('id-ID').format(totalTabunganRp)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tagihan" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Tagihan
          </TabsTrigger>
          <TabsTrigger value="pembayaran" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pembayaran
          </TabsTrigger>
          <TabsTrigger value="tunggakan" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Tunggakan
          </TabsTrigger>
          <TabsTrigger value="tabungan" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Tabungan
          </TabsTrigger>
          <TabsTrigger value="buku_kas" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Buku Kas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tagihan">
          <CrudTable
            title="Daftar Tagihan"
            description="Tagihan SPP, uang gedung, dan lainnya"
            icon={Receipt}
            table="tagihan"
            customAction={<GenerateMassalDialog />}
            fields={[
              { name: "santri_id", label: "Pilih Santri", required: true, type: "select", searchable: true, options: santriOptions },
              { name: "jenis", label: "Jenis Tagihan (e.g. SPP Juli)", required: true },
              { name: "nominal", label: "Nominal (Rp)", required: true, type: "number" },
              { name: "tenggat_waktu", label: "Tenggat Waktu", type: "date" },
              { name: "status", label: "Status", type: "select", options: [
                {label: "Belum Lunas", value: "belum_lunas"},
                {label: "Cicilan", value: "cicilan"},
                {label: "Lunas", value: "lunas"}
              ] },
              { name: "keterangan", label: "Keterangan", type: "textarea" },
            ]}
            columns={[
              { key: "santri_id", label: "Nama Santri", render: (val) => {
                const opt = santriOptions.find((o: any) => o.value === val);
                return opt ? opt.label : val;
              }},
              { key: "jenis", label: "Jenis Tagihan" },
              { key: "nominal", label: "Nominal" },
              { key: "tenggat_waktu", label: "Tenggat" },
              { key: "status", label: "Status" },
            ]}
          />
        </TabsContent>
        
        <TabsContent value="pembayaran">
          <CrudTable
            title="Riwayat Pembayaran"
            description="Pencatatan pembayaran yang diterima"
            icon={CreditCard}
            table="pembayaran"
            fields={[
              { name: "tagihan_id", label: "Pilih Tagihan", required: true, type: "select", searchable: true, options: tagihanOptions },
              { name: "tanggal_bayar", label: "Tanggal Bayar", required: true, type: "date" },
              { name: "nominal_bayar", label: "Nominal (Rp)", required: true, type: "number" },
              { name: "metode_pembayaran", label: "Metode", type: "select", options: [
                {label: "Cash/Tunai", value: "Cash"},
                {label: "Transfer Bank", value: "Transfer"}
              ] },
              { name: "keterangan", label: "Keterangan", type: "textarea" },
            ]}
            columns={[
              { key: "tagihan_id", label: "Tagihan / Santri", render: (val) => {
                const opt = tagihanOptions.find((o: any) => o.value === val);
                return opt ? opt.label : val;
              }},
              { key: "tanggal_bayar", label: "Tanggal" },
              { key: "nominal_bayar", label: "Dibayar" },
              { key: "metode_pembayaran", label: "Metode" },
            ]}
          />
        </TabsContent>

        <TabsContent value="tunggakan">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="font-display">Daftar Tunggakan Santri</CardTitle>
                  <CardDescription>Rekap tagihan SPP dan lainnya yang belum lunas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">No.</TableHead>
                    <TableHead>Nama Santri</TableHead>
                    <TableHead className="text-center">Jumlah Tagihan Aktif</TableHead>
                    <TableHead>Rincian Tagihan</TableHead>
                    <TableHead className="text-right">Total Tunggakan (Rp)</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tunggakanList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada santri yang menunggak.</TableCell>
                    </TableRow>
                  ) : (
                    tunggakanList.map((row, idx) => (
                      <TableRow key={row.santri_id}>
                        <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{row.nama_santri}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                            {row.total_tagihan}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.rincian.join(", ")}
                        </TableCell>
                        <TableCell className="text-right font-bold text-destructive">
                          {new Intl.NumberFormat('id-ID').format(row.nominal)}
                        </TableCell>
                        <TableCell className="text-center">
                          <BayarTagihanDialog santriId={row.santri_id} namaSantri={row.nama_santri} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabungan" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="font-display">Rekap Saldo Tabungan</CardTitle>
                  <CardDescription>Sisa saldo uang titipan per santri</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">No.</TableHead>
                    <TableHead>Nama Santri</TableHead>
                    <TableHead className="text-right">Total Setor (Rp)</TableHead>
                    <TableHead className="text-right">Total Tarik (Rp)</TableHead>
                    <TableHead className="text-right font-bold">Sisa Saldo (Rp)</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saldoList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada data tabungan.</TableCell>
                    </TableRow>
                  ) : (
                    saldoList.map((row, idx) => (
                      <TableRow key={row.santri_id}>
                        <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{row.nama_santri}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {new Intl.NumberFormat('id-ID').format(row.total_setor)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {new Intl.NumberFormat('id-ID').format(row.total_tarik)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {new Intl.NumberFormat('id-ID').format(row.saldo)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <QuickTabunganDialog santriId={row.santri_id} namaSantri={row.nama_santri} type="setor" />
                            <QuickTabunganDialog santriId={row.santri_id} namaSantri={row.nama_santri} type="tarik" />
                            <RiwayatTabunganDialog santriId={row.santri_id} namaSantri={row.nama_santri} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <CrudTable
            title="Riwayat Transaksi Tabungan"
            description="Catat setoran dan penarikan tabungan santri"
            icon={Wallet}
            table="tabungan_santri"
            fields={[
              { name: "santri_id", label: "Pilih Santri", required: true, type: "select", options: santriOptions },
              { name: "jenis", label: "Jenis Transaksi", required: true, type: "select", options: [
                {label: "Setor", value: "setor"},
                {label: "Tarik", value: "tarik"}
              ] },
              { name: "nominal", label: "Nominal (Rp)", required: true, type: "number" },
              { name: "tanggal", label: "Tanggal Transaksi", required: true, type: "date" },
              { name: "keterangan", label: "Keterangan", type: "textarea" },
            ]}
            columns={[
              { key: "santri_id", label: "Nama Santri", render: (val) => {
                const opt = santriOptions.find((o: any) => o.value === val);
                return opt ? opt.label : val;
              }},
              { key: "jenis", label: "Jenis" },
              { key: "nominal", label: "Nominal" },
              { key: "tanggal", label: "Tanggal" },
            ]}
          />
        </TabsContent>

        <TabsContent value="buku_kas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Rp {new Intl.NumberFormat('id-ID').format(totalPemasukanKas)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">Rp {new Intl.NumberFormat('id-ID').format(totalPengeluaranKas)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Kas Pondok</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Rp {new Intl.NumberFormat('id-ID').format(saldoKas)}</div>
              </CardContent>
            </Card>
          </div>

          <CrudTable
            title="Buku Kas Operasional"
            description="Pencatatan uang masuk dan uang keluar pondok pesantren"
            icon={BookOpen}
            table="buku_kas"
            fields={[
              { name: "tanggal", label: "Tanggal", required: true, type: "date" },
              { name: "jenis", label: "Jenis Transaksi", required: true, type: "select", options: [
                {label: "Pemasukan", value: "pemasukan"},
                {label: "Pengeluaran", value: "pengeluaran"}
              ] },
              { name: "kategori", label: "Kategori", required: true, type: "text", placeholder: "Listrik, SPP, Gaji, dll" },
              { name: "nominal", label: "Nominal (Rp)", required: true, type: "number" },
              { name: "keterangan", label: "Keterangan Tambahan", type: "text" }
            ]}
            columns={[
              { key: "tanggal", label: "Tanggal" },
              { key: "jenis", label: "Jenis", render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${val === 'pemasukan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {String(val).toUpperCase()}
                </span>
              )},
              { key: "kategori", label: "Kategori" },
              { key: "nominal", label: "Nominal", render: (val) => `Rp ${new Intl.NumberFormat('id-ID').format(Number(val))}` },
              { key: "keterangan", label: "Keterangan" }
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
