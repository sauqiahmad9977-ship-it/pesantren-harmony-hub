import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Users, Home, School, BookOpen, HeartPulse, MessageCircle, Plane, LogOut,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SIM Pesantren" }] }),
  component: Dashboard,
});

function useCount(table: string) {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count, error } = await supabase.from(table as any).select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function StatCard({ title, value, icon: Icon, accent = "primary" }: { title: string; value: number | string; icon: any; accent?: "primary" | "accent" }) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold font-display mt-2">{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent === "primary" ? "bg-primary/10 text-primary" : "bg-accent/40 text-primary"}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user, roles } = useAuth();
  const santri = useCount("santri");
  const kelas = useCount("kelas");
  const kamar = useCount("kamar");
  const kitab = useCount("kitab");
  const kesehatan = useCount("kesehatan");
  const konseling = useCount("konseling");
  const izinKeluar = useCount("izin_keluar");
  const izinPulang = useCount("izin_pulang");

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Assalamu'alaikum, ${name}`}
        description={`Anda masuk sebagai ${roles[0] ?? "staff"}. Berikut ringkasan pondok.`}
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Santri" value={santri.data ?? "—"} icon={Users} />
        <StatCard title="Kelas" value={kelas.data ?? "—"} icon={School} accent="accent" />
        <StatCard title="Kamar" value={kamar.data ?? "—"} icon={Home} accent="accent" />
        <StatCard title="Kitab" value={kitab.data ?? "—"} icon={BookOpen} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Rekam Kesehatan" value={kesehatan.data ?? "—"} icon={HeartPulse} accent="accent" />
        <StatCard title="Sesi Konseling" value={konseling.data ?? "—"} icon={MessageCircle} accent="accent" />
        <StatCard title="Izin Keluar" value={izinKeluar.data ?? "—"} icon={LogOut} />
        <StatCard title="Izin Pulang" value={izinPulang.data ?? "—"} icon={Plane} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-display">Selamat datang</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Aplikasi ini membantu pengelolaan pondok pesantren secara terpadu — mulai dari data santri,
              kamar, kelas, kitab, kesehatan, konseling, hingga perizinan.
            </p>
            <p>
              Gunakan menu di samping untuk berpindah modul. Modul Kesantrian (Kelas, Kamar, Santri) sudah aktif
              untuk pengelolaan data dasar.
            </p>
          </CardContent>
        </Card>
        <Card style={{ background: "var(--gradient-forest)" }} className="text-primary-foreground border-0">
          <CardHeader><CardTitle className="font-display text-primary-foreground">Hari ini</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-display">
              {new Date().toLocaleDateString("id-ID", { weekday: "long" })}
            </p>
            <p className="opacity-80 mt-1">
              {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
