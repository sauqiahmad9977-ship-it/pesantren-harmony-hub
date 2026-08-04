import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, BookOpen, FileSignature } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiGetAll } from "@/lib/api-client";

export const Route = createFileRoute("/_authenticated/akademik")({
  head: () => ({ meta: [{ title: "Akademik — SIM Pesantren" }] }),
  component: AkademikComponent,
});

function AkademikComponent() {
  const { data: pegawais } = useQuery({
    queryKey: ["pegawai"],
    queryFn: () => apiGetAll("pegawai"),
  });

  const { data: santris } = useQuery({
    queryKey: ["santri"],
    queryFn: () => apiGetAll("santri"),
  });

  const { data: mapels } = useQuery({
    queryKey: ["mata_pelajaran"],
    queryFn: () => apiGetAll("mata_pelajaran"),
  });

  const pegawaiOptions = pegawais?.map((p: any) => ({
    label: p.nama,
    value: p.id,
  })) || [];

  const santriOptions = santris?.map((s: any) => ({
    label: s.nama_santri,
    value: s.id,
  })) || [];

  const mapelOptions = mapels?.map((m: any) => ({
    label: m.nama,
    value: m.id,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Akademik</h1>
        <p className="text-muted-foreground">Kelola mata pelajaran dan nilai santri.</p>
      </div>

      <Tabs defaultValue="mapel" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mapel" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Mata Pelajaran
          </TabsTrigger>
          <TabsTrigger value="nilai" className="flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Nilai Santri
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mapel">
          <CrudTable
            title="Mata Pelajaran"
            description="Daftar mata pelajaran yang diajarkan"
            icon={BookOpen}
            table="mata_pelajaran"
            fields={[
              { name: "kode", label: "Kode Mapel", required: true },
              { name: "nama", label: "Nama Mata Pelajaran", required: true },
              { name: "tingkat", label: "Tingkat (e.g. 1 Wustho)" },
              { name: "pengajar_id", label: "Pilih Pengajar", type: "select", options: pegawaiOptions },
            ]}
            columns={[
              { key: "kode", label: "Kode" },
              { key: "nama", label: "Mata Pelajaran" },
              { key: "tingkat", label: "Tingkat" },
              { key: "pengajar_id", label: "Pengajar" },
            ]}
          />
        </TabsContent>
        
        <TabsContent value="nilai">
          <CrudTable
            title="Nilai Santri"
            description="Input dan rekap nilai per santri"
            icon={FileSignature}
            table="nilai_santri"
            fields={[
              { name: "santri_id", label: "Pilih Santri", required: true, type: "select", options: santriOptions },
              { name: "mata_pelajaran_id", label: "Pilih Mata Pelajaran", required: true, type: "select", options: mapelOptions },
              { name: "nilai", label: "Nilai", required: true, type: "number" },
              { name: "semester", label: "Semester", required: true, type: "select", options: [
                {label: "Ganjil", value: "ganjil"},
                {label: "Genap", value: "genap"}
              ] },
              { name: "tahun_ajaran", label: "Tahun Ajaran (e.g. 2026/2027)" },
            ]}
            columns={[
              { key: "santri_id", label: "Santri" },
              { key: "mata_pelajaran_id", label: "Mata Pelajaran" },
              { key: "nilai", label: "Nilai" },
              { key: "semester", label: "Semester" },
              { key: "tahun_ajaran", label: "Thn Ajaran" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
