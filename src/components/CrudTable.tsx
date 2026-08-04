import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetAll, apiCreate, apiDelete, apiUpdate } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, Loader2, Upload, Download, Edit, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import * as XLSX from "xlsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  searchable?: boolean;
  options?: { label: string; value: string }[];
}

function ComboboxField({ f, form, setForm }: { f: FieldDef; form: any; setForm: any }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = f.options?.find((opt: any) => opt.value === form[f.name])?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedLabel || `Pilih ${f.label}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Cari ${f.label}...`} />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {f.options?.map((opt: any) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    setForm({ ...form, [f.name]: opt.value });
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      form[f.name] === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CrudTable({
  title, description, icon, table, fields, columns, allowImport, customAction, rowActions, filterFn
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  table: string;
  fields: FieldDef[];
  columns: { key: string; label: string; render?: (val: any, row: any) => React.ReactNode }[];
  allowImport?: boolean;
  customAction?: React.ReactNode;
  rowActions?: { label: string; icon: React.ElementType; onClick: (row: any) => void; color?: string }[];
  filterFn?: (row: any) => boolean;
}) {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headerRow: Record<string, string> = {};
    fields.forEach(f => {
      headerRow[f.label] = "";
    });
    
    const worksheet = XLSX.utils.json_to_sheet([headerRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `Template_${title}.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      if (rawData.length === 0) throw new Error("File Excel kosong");

      const labelToName: Record<string, string> = {};
      fields.forEach(f => { labelToName[f.label.toLowerCase().replace(/\s+/g, " ").trim()] = f.name; });
      
      // Tambahkan alias untuk format Excel milik user
      const customAliases: Record<string, string> = {
        "no induk": "no_induk", "nis": "no_induk",
        "nama santri": "nama_santri", "nama": "nama_santri",
        "nik": "nik",
        "ttlh": "ttlh", "tempat tanggal lahir": "ttlh", "tempat, tanggal lahir": "ttlh", "tempat/tgl lahir": "ttlh",
        "tamatan": "tamatan", "asal sekolah": "tamatan", "asal sekolah/tamatan": "tamatan",
        "nama ayah": "nama_ayah", "ayah": "nama_ayah", "bapak": "nama_ayah",
        "nama ibu": "nama_ibu", "ibu": "nama_ibu", "bunda": "nama_ibu", "umi": "nama_ibu",
        "pekerjaan ortu": "pekerjaan_ortu", "pekerjaan orang tua": "pekerjaan_ortu", "pekerjaan": "pekerjaan_ortu", "pekerjaan wali": "pekerjaan_ortu",
        "alamat": "alamat",
        "no wa": "no_wa", "nomor wa": "no_wa", "no hp": "no_wa", "nomor hp": "no_wa", "telepon": "no_wa", "no telepon": "no_wa"
      };
      Object.assign(labelToName, customAliases);

      const requiredFields = fields.filter(f => f.required);

      let rawPayload = rawData.map(row => {
        const mappedRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          const rawKey = key.toLowerCase().replace(/\s+/g, " ").trim();
          let fieldName = labelToName[rawKey];
          
          // Fuzzy fallback matching
          if (!fieldName) {
            if (rawKey.includes("ayah") || rawKey.includes("bapak") || rawKey.includes("abi")) fieldName = "nama_ayah";
            else if (rawKey.includes("ibu") || rawKey.includes("bunda") || rawKey.includes("umi")) fieldName = "nama_ibu";
            else if (rawKey.includes("ortu") || rawKey.includes("wali")) fieldName = "nama_ayah"; // Fallback to ayah if only 'ortu' is given
            else if (rawKey.includes("hp") || rawKey.includes("wa") || rawKey.includes("telepon")) fieldName = "no_wa";
            else if (rawKey.includes("lahir") || rawKey.includes("ttl")) fieldName = "ttlh";
            else if (rawKey.includes("sekolah") || rawKey.includes("lulus") || rawKey.includes("tamatan")) fieldName = "tamatan";
            else if (rawKey.includes("kelamin") || rawKey.includes("gender") || rawKey === "l/p") fieldName = "gender";
            else if (rawKey.includes("kerja") || rawKey.includes("profesi")) fieldName = "pekerjaan_ortu";
            else if (rawKey.includes("alamat") || rawKey.includes("tinggal")) fieldName = "alamat";
            else if (rawKey.includes("nik")) fieldName = "nik";
            else if (rawKey.includes("nama") && !rawKey.includes("ayah") && !rawKey.includes("ibu")) fieldName = "nama_santri";
            else if (rawKey.includes("induk") || rawKey.includes("nis")) fieldName = "no_induk";
          }

          if (fieldName) {
            let finalValue = value;
            if (fieldName === "gender") {
              const valStr = String(value || "").toLowerCase().trim();
              if (valStr.startsWith("p") || valStr === "putri" || valStr.startsWith("akhwat") || valStr.startsWith("banat")) finalValue = "P";
              else finalValue = "L"; // Default Laki-laki
            }
            mappedRow[fieldName] = finalValue;
          }
        }
        return mappedRow;
      });

      // Cari semua kolom unik yang terisi di setidaknya satu baris Excel
      const allKeys = new Set<string>();
      rawPayload.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));

      // Pad missing keys supaya Supabase array insert tidak skip kolom
      let payload = rawPayload.map(row => {
        const completeRow = { ...row };
        allKeys.forEach(k => {
          if (completeRow[k] === undefined || completeRow[k] === null) {
            if (k === "gender") completeRow[k] = "L";
            else if (completeRow[k] === undefined) completeRow[k] = null;
          }
        });
        return completeRow;
      }).filter(row => Object.keys(row).length > 0);

      // Hanya ambil baris data yang memiliki seluruh kolom wajib (misal: NIS dan Nama)
      // Hal ini berguna untuk membuang baris kosong atau baris data keluarga/orang tua di bawah nama santri
      const validPayload = payload.filter(row => {
        return requiredFields.every(f => {
          const val = row[f.name];
          return val !== undefined && val !== null && val !== "";
        });
      });

      if (validPayload.length === 0) {
        const detectedHeaders = rawData.length > 0 ? Object.keys(rawData[0]).join(", ") : "Tidak ada";
        throw new Error(`Tidak ada baris data yang valid.\nPastikan kolom wajib (${requiredFields.map(f => f.label).join(", ")}) terisi.\nKolom terbaca: [${detectedHeaders}]`);
      }

      await apiCreate(table, validPayload);
      toast.success(`${validPayload.length} data berhasil diimport`);
      qc.invalidateQueries({ queryKey: [table] });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengimport file");
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: [table],
    queryFn: () => apiGetAll(table),
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, any> = {};
    fields.forEach((f) => {
      const v = form[f.name];
      if (v === "" || v === null || v === undefined) return;
      payload[f.name] = f.type === "number" ? Number(v) : v;
    });
    try {
      if (editId) {
        await apiUpdate(table, editId, payload);
        toast.success("Data diperbarui");
      } else {
        await apiCreate(table, payload);
        toast.success("Data tersimpan");
      }
      setForm({});
      setEditId(null);
      setOpen(false);
      qc.invalidateQueries({ queryKey: [table] });
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(err.message || String(err) || "Terjadi kesalahan yang tidak diketahui");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row: any) => {
    setEditId(row.id);
    const formData: Record<string, any> = {};
    fields.forEach(f => {
      if (row[f.name] !== undefined && row[f.name] !== null) {
        formData[f.name] = row[f.name];
      }
    });
    setForm(formData);
    setOpen(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      await apiDelete(table, id);
      toast.success("Data dihapus");
      setSelectedIds(prev => prev.filter(selId => selId !== id));
      qc.invalidateQueries({ queryKey: [table] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Hapus ${selectedIds.length} data terpilih?`)) return;
    setSaving(true);
    try {
      await Promise.all(selectedIds.map(id => apiDelete(table, id)));
      toast.success(`${selectedIds.length} data berhasil dihapus`);
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: [table] });
    } catch (err: any) {
      toast.error("Gagal menghapus beberapa data: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Sort data descending by date/id
  const sortedData = Array.isArray(data) ? [...data].sort((a: any, b: any) => {
    if (a.tanggal && b.tanggal) return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    if (a.created_at && b.created_at) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (a.id && b.id) return a.id < b.id ? 1 : -1;
    return 0;
  }) : [];
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = sortedData.filter((row: any) => {
    if (filterFn && !filterFn(row)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return columns.some(c => {
      let val = row[c.key];
      if (c.render) {
        val = c.render(val, row);
      }
      if (typeof val === 'string' || typeof val === 'number') {
        return String(val).toLowerCase().includes(q);
      }
      return String(row[c.key] || "").toLowerCase().includes(q);
    });
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        action={
          isAdmin && (
            <div className="flex items-center gap-2">
              {customAction}
              {allowImport && (
                <>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImport}
                  />
                  <Button variant="outline" onClick={downloadTemplate} disabled={saving}>
                    <Download className="w-4 h-4 mr-1.5" />
                    Template
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={saving}>
                    <Upload className="w-4 h-4 mr-1.5" />
                    Import
                  </Button>
                </>
              )}
              <Dialog open={open} onOpenChange={(val) => {
                  setOpen(val);
                  if (!val) {
                    setForm({});
                    setEditId(null);
                  }
                }}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setForm({}); setEditId(null); }}><Plus className="w-4 h-4 mr-1.5" />Tambah</Button>
                </DialogTrigger>
                {selectedIds.length > 0 && (
                  <Button variant="destructive" onClick={handleDeleteSelected} disabled={saving}>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Hapus ({selectedIds.length})
                  </Button>
                )}
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display">{editId ? "Edit" : "Tambah"} {title}</DialogTitle>
                  <DialogDescription className="hidden">Dialog for {title}</DialogDescription>
                </DialogHeader>
                <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map((f) => (
                    <div key={f.name} className={`space-y-1.5 ${f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                      <Label htmlFor={f.name}>{f.label}{f.required && " *"}</Label>
                      {f.type === "select" ? (
                        f.searchable ? (
                          <ComboboxField f={f} form={form} setForm={setForm} />
                        ) : (
                          <select
                            id={f.name}
                            required={f.required}
                            value={form[f.name] ?? ""}
                            onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="" disabled>Pilih {f.label}</option>
                            {f.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        )
                      ) : f.type === "textarea" ? (
                        <textarea
                          id={f.name}
                          required={f.required}
                          value={form[f.name] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      ) : (
                        <Input
                          id={f.name}
                          type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                          required={f.required}
                          value={form[f.name] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                  <DialogFooter className="sm:col-span-2 pt-2">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Simpan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          )
        }
      />
      
      <div className="flex items-center px-1 mb-2">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari data..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && (
                  <TableHead className="w-10 text-center">
                    <Checkbox 
                      checked={filteredData?.length > 0 && selectedIds.length === filteredData?.length}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedIds(filteredData?.map((d: any) => d.id) || []);
                        else setSelectedIds([]);
                      }}
                    />
                  </TableHead>
                )}
                <TableHead className="w-12 text-center">No.</TableHead>
                {columns.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
                {isAdmin && <TableHead className="w-16"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={columns.length + (isAdmin ? 3 : 1)} className="text-center py-8 text-muted-foreground">Memuat…</TableCell></TableRow>
              )}
              {!isLoading && filteredData?.length === 0 && (
                <TableRow><TableCell colSpan={columns.length + (isAdmin ? 3 : 1)} className="text-center py-8 text-muted-foreground">Belum ada data</TableCell></TableRow>
              )}
              {filteredData?.map((row: any, index: number) => (
                <TableRow key={row.id}>
                  {isAdmin && (
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedIds([...selectedIds, row.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== row.id));
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "—")}
                    </TableCell>
                  ))}
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {rowActions?.map((action, i) => (
                          <Button key={i} variant="ghost" size="icon" onClick={() => action.onClick(row)} title={action.label}>
                            <action.icon className={`w-4 h-4 ${action.color || "text-muted-foreground"}`} />
                          </Button>
                        ))}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit">
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(row.id)} title="Hapus">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {!isAdmin && (
        <p className="text-xs text-muted-foreground text-center">Hanya admin yang dapat menambah/menghapus data.</p>
      )}
    </div>
  );
}
