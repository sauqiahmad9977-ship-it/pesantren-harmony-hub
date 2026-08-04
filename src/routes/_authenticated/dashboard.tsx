import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiCount } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Users, Home, School, BookOpen, HeartPulse, MessageCircle, Plane, LogOut, Briefcase, Clock, CalendarDays
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SIM Pesantren" }] }),
  component: Dashboard,
});

function useCount(table: string) {
  return useQuery({
    queryKey: ["count", table],
    queryFn: () => apiCount(table),
  });
}

type ColorType = "blue" | "green" | "red" | "orange" | "purple" | "teal" | "indigo" | "pink" | "amber";

const colorClasses = {
  blue: "bg-blue-500/10 text-blue-600",
  green: "bg-green-500/10 text-green-600",
  red: "bg-red-500/10 text-red-600",
  orange: "bg-orange-500/10 text-orange-600",
  purple: "bg-purple-500/10 text-purple-600",
  teal: "bg-teal-500/10 text-teal-600",
  indigo: "bg-indigo-500/10 text-indigo-600",
  pink: "bg-pink-500/10 text-pink-600",
  amber: "bg-amber-500/10 text-amber-600",
};

function StatCard({ title, value, icon: Icon, color = "blue", isLoading = false, isError = false }: { title: string; value: number | string; icon: any; color?: ColorType; isLoading?: boolean; isError?: boolean }) {
  const iconClass = colorClasses[color] || colorClasses.blue;
  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-16 bg-muted animate-pulse rounded-md" />
            ) : isError ? (
              <p className="text-sm font-medium text-red-500 mt-2">{value}</p>
            ) : (
              <p className="text-3xl font-bold font-display mt-2">{value}</p>
            )}
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${iconClass}`}>
            <Icon className="w-5 h-5 animate-bounce group-hover:animate-spin" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClockAndDate() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'id';

  const hijriDate = new Intl.DateTimeFormat(`${currentLang}-u-ca-islamic`, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(time);

  const masehiDate = new Intl.DateTimeFormat(currentLang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(time);
  
  const hari = new Intl.DateTimeFormat(currentLang, { weekday: "long" }).format(time);
  const jam = time.toLocaleTimeString(currentLang, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <Card style={{ background: "var(--gradient-forest)" }} className="text-primary-foreground border-0 shadow-md relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10">
        <Clock className="w-32 h-32" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-primary-foreground/80 text-sm uppercase tracking-wider">
          {t("dashboard.current_time")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4 tabular-nums" style={{ direction: "ltr" }}>
          {jam}
        </p>
        <div className="space-y-1.5">
          <p className="font-medium text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-foreground"></span>
            {hari}, {masehiDate}
          </p>
          <p className="opacity-90 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-foreground/50"></span>
            {hijriDate} {currentLang !== 'ar' ? t("dashboard.hijri_suffix") : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user, roles } = useAuth();
  const { t, i18n } = useTranslation();
  
  const currentLang = i18n.language || 'id';
  const hijriDate = new Intl.DateTimeFormat(`${currentLang}-u-ca-islamic`, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  
  const santri = useCount("santri");
  const kelas = useCount("kelas");
  const kamar = useCount("kamar");
  const kitab = useCount("kitab");
  const kesehatan = useCount("kesehatan");
  const konseling = useCount("konseling");
  const izinKeluar = useCount("izin_keluar");
  const izinPulang = useCount("izin_pulang");
  const pegawai = useCount("pegawai");

  const name = user?.full_name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t("dashboard.greeting")}, ${name}`}
        description={`${t("dashboard.logged_in_as")} ${roles[0] ?? "staff"}. ${t("dashboard.summary_text")}`}
        icon={LayoutDashboard}
        action={
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-sm">
            <CalendarDays className="w-5 h-5 opacity-80" />
            <span className="font-medium font-display tracking-wide">{hijriDate} {currentLang !== 'ar' ? t("dashboard.hijri_suffix") : ''}</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title={t("dashboard.total_santri")} value={santri.isError ? (santri.error?.message?.slice(0,10) || "Err") : (santri.data ?? "—")} icon={Users} color="blue" isLoading={santri.isPending} isError={santri.isError} />
        <StatCard title={t("dashboard.kelas")} value={kelas.isError ? (kelas.error?.message?.slice(0,10) || "Err") : (kelas.data ?? "—")} icon={School} color="green" isLoading={kelas.isPending} isError={kelas.isError} />
        <StatCard title={t("dashboard.kamar")} value={kamar.isError ? (kamar.error?.message?.slice(0,10) || "Err") : (kamar.data ?? "—")} icon={Home} color="orange" isLoading={kamar.isPending} isError={kamar.isError} />
        <StatCard title={t("dashboard.kitab")} value={kitab.isError ? (kitab.error?.message?.slice(0,10) || "Err") : (kitab.data ?? "—")} icon={BookOpen} color="purple" isLoading={kitab.isPending} isError={kitab.isError} />
        <StatCard title={t("dashboard.pegawai")} value={pegawai.isError ? (pegawai.error?.message?.slice(0,10) || "Err") : (pegawai.data ?? "—")} icon={Briefcase} color="indigo" isLoading={pegawai.isPending} isError={pegawai.isError} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("dashboard.rekam_kesehatan")} value={kesehatan.isError ? "Err" : (kesehatan.data ?? "—")} icon={HeartPulse} color="red" isLoading={kesehatan.isPending} isError={kesehatan.isError} />
        <StatCard title={t("dashboard.sesi_konseling")} value={konseling.isError ? "Err" : (konseling.data ?? "—")} icon={MessageCircle} color="teal" isLoading={konseling.isPending} isError={konseling.isError} />
        <StatCard title={t("dashboard.izin_keluar")} value={izinKeluar.isError ? "Err" : (izinKeluar.data ?? "—")} icon={LogOut} color="amber" isLoading={izinKeluar.isPending} isError={izinKeluar.isError} />
        <StatCard title={t("dashboard.izin_pulang")} value={izinPulang.isError ? "Err" : (izinPulang.data ?? "—")} icon={Plane} color="pink" isLoading={izinPulang.isPending} isError={izinPulang.isError} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-display">{t("dashboard.welcome")}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{t("dashboard.desc_p1")}</p>
            <p>{t("dashboard.desc_p2")}</p>
          </CardContent>
        </Card>
        <ClockAndDate />
      </div>
    </div>
  );
}
