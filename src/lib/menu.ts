import {
  LayoutDashboard, Users, Home, BookOpen, HeartPulse, MessageCircle,
  LogOut as IconLogOut, Plane, Briefcase, GraduationCap, Wallet, FileBarChart, Settings, School, HeartHandshake, Calculator, BookDown
} from "lucide-react";

export type Role = "admin" | "ustadz" | "staff";

export interface MenuItem {
  title: string;
  url: string;
  icon: any; // Can be a Lucide component or a string URL for an image
  allowedRoles?: Role[];
}
export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

// Windows 11 Fluent 3D Emoji base URL
const fluentBase = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

export const menu: MenuGroup[] = [
  {
    label: "Utama",
    items: [{ title: "Dashboard", url: "/dashboard", icon: `${fluentBase}/Desktop%20computer/3D/desktop_computer_3d.png`, allowedRoles: ["admin", "ustadz", "staff"] }],
  },
  {
    label: "Kesantrian",
    items: [
      { title: "Kelas", url: "/kelas", icon: `${fluentBase}/School/3D/school_3d.png`, allowedRoles: ["admin", "ustadz"] },
      { title: "Kamar", url: "/kamar", icon: `${fluentBase}/Bed/3D/bed_3d.png`, allowedRoles: ["admin", "ustadz"] },
      { title: "Santri", url: "/santri", icon: `${fluentBase}/Family/3D/family_3d.png`, allowedRoles: ["admin", "ustadz", "staff"] },
      { title: "Kitab", url: "/kitab", icon: `${fluentBase}/Open%20book/3D/open_book_3d.png`, allowedRoles: ["admin", "ustadz"] },
      { title: "Kesehatan", url: "/kesehatan", icon: `${fluentBase}/Stethoscope/3D/stethoscope_3d.png`, allowedRoles: ["admin", "ustadz"] },
      { title: "Konseling", url: "/konseling", icon: `${fluentBase}/Speech%20balloon/3D/speech_balloon_3d.png`, allowedRoles: ["admin", "ustadz"] },
      { title: "Izin Keluar", url: "/izin-keluar", icon: `${fluentBase}/Door/3D/door_3d.png`, allowedRoles: ["admin", "ustadz"] },
      { title: "Izin Pulang", url: "/izin-pulang", icon: `${fluentBase}/Airplane/3D/airplane_3d.png`, allowedRoles: ["admin", "ustadz"] },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { title: "Kepegawaian", url: "/kepegawaian", icon: `${fluentBase}/Briefcase/3D/briefcase_3d.png`, allowedRoles: ["admin", "staff"] },
      { title: "Akademik", url: "/akademik", icon: `${fluentBase}/Graduation%20cap/3D/graduation_cap_3d.png`, allowedRoles: ["admin", "ustadz"] },
      { title: "Keuangan", url: "/keuangan", icon: `${fluentBase}/Money%20bag/3D/money_bag_3d.png`, allowedRoles: ["admin", "staff"] },
      { title: "Donatur", url: "/donatur", icon: `${fluentBase}/Handshake/3D/handshake_3d.png`, allowedRoles: ["admin", "staff"] },
      { title: "Buku Kas", url: "/buku-kas", icon: `${fluentBase}/Ledger/3D/ledger_3d.png`, allowedRoles: ["admin", "staff"] },
      { title: "Akuntansi", url: "/akuntansi", icon: `${fluentBase}/Abacus/3D/abacus_3d.png`, allowedRoles: ["admin", "staff"] },
      { title: "Laporan", url: "/laporan", icon: `${fluentBase}/Chart%20increasing/3D/chart_increasing_3d.png`, allowedRoles: ["admin", "staff"] },
      { title: "Pengaturan", url: "/pengaturan", icon: `${fluentBase}/Gear/3D/gear_3d.png`, allowedRoles: ["admin"] },
    ],
  },
];
