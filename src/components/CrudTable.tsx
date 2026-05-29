import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea";
  required?: boolean;
}

export function CrudTable({
  title, description, icon, table, fields, columns,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  table: string;
  fields: FieldDef[];
  columns: { key: string; label: string }[];
}) {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, any> = {};
    fields.forEach((f) => {
      const v = form[f.name];
      if (v === "" || v == null) return;
      payload[f.name] = f.type === "number" ? Number(v) : v;
    });
    const { error } = await supabase.from(table as any).insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Data tersimpan");
    setForm({});
    setOpen(false);
    qc.invalidateQueries({ queryKey: [table] });
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Data dihapus");
    qc.invalidateQueries({ queryKey: [table] });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        action={
          isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-1.5" />Tambah</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Tambah {title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={create} className="space-y-3">
                  {fields.map((f) => (
                    <div key={f.name} className="space-y-1.5">
                      <Label htmlFor={f.name}>{f.label}{f.required && " *"}</Label>
                      <Input
                        id={f.name}
                        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                        required={f.required}
                        value={form[f.name] ?? ""}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      />
                    </div>
                  ))}
                  <DialogFooter>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Simpan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
                {isAdmin && <TableHead className="w-16"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">Memuat…</TableCell></TableRow>
              )}
              {!isLoading && data?.length === 0 && (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">Belum ada data</TableCell></TableRow>
              )}
              {data?.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((c) => <TableCell key={c.key}>{String(row[c.key] ?? "—")}</TableCell>)}
                  {isAdmin && (
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => remove(row.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
