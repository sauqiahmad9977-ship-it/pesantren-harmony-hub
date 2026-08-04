import { useQuery } from "@tanstack/react-query";
import { apiGetAll } from "@/lib/api-client";

export interface SettingsData {
  id: string;
  app_name: string;
  logo_url: string;
  alamat: string;
  tahun_ajaran: string;
}

export function useSettings() {
  return useQuery({
    queryKey: ["pengaturan"],
    queryFn: async () => {
      const data = await apiGetAll("pengaturan");
      if (data && data.length > 0) {
        return data[0] as SettingsData;
      }
      return {
        id: "00000000-0000-0000-0000-000000000001",
        app_name: "SIM Pondok Pesantren",
        logo_url: "",
        alamat: "",
        tahun_ajaran: "2026/2027 - Ganjil",
      } as SettingsData;
    },
    staleTime: Infinity, // Cache forever until manually invalidated
  });
}
