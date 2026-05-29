import {
  LayoutDashboard, Users, Home, BookOpen, HeartPulse, MessageCircle,
  LogOut as IconLogOut, Plane, Briefcase, GraduationCap, Wallet, FileBarChart, Settings, School,
} from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: any;
}
export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const menu: MenuGroup[] = [
  {
    label: "Utama",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Kesantrian",
    items: [
      { title: "Kelas", url: "/kelas", icon: School },
      { title: "Kamar", url: "/kamar", icon: Home },
      { title: "Santri", url: "/santri", icon: Users },
      { title: "Kitab", url: "/kitab", icon: BookOpen },
      { title: "Kesehatan", url: "/kesehatan", icon: HeartPulse },
      { title: "Konseling", url: "/konseling", icon: MessageCircle },
      { title: "Izin Keluar", url: "/izin-keluar", icon: IconLogOut },
      { title: "Izin Pulang", url: "/izin-pulang", icon: Plane },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { title: "Kepegawaian", url: "/kepegawaian", icon: Briefcase },
      { title: "Akademik", url: "/akademik", icon: GraduationCap },
      { title: "Keuangan", url: "/keuangan", icon: Wallet },
      { title: "Laporan", url: "/laporan", icon: FileBarChart },
      { title: "Pengaturan", url: "/pengaturan", icon: Settings },
    ],
  },
];
