export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      izin_keluar: {
        Row: {
          created_at: string
          id: string
          jam_keluar: string | null
          jam_kembali: string | null
          keperluan: string | null
          santri_id: string
          status: Database["public"]["Enums"]["izin_status"]
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jam_keluar?: string | null
          jam_kembali?: string | null
          keperluan?: string | null
          santri_id: string
          status?: Database["public"]["Enums"]["izin_status"]
          tanggal?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jam_keluar?: string | null
          jam_kembali?: string | null
          keperluan?: string | null
          santri_id?: string
          status?: Database["public"]["Enums"]["izin_status"]
          tanggal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "izin_keluar_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
        ]
      }
      izin_pulang: {
        Row: {
          created_at: string
          id: string
          keperluan: string | null
          santri_id: string
          status: Database["public"]["Enums"]["izin_status"]
          tanggal_kembali: string | null
          tanggal_pulang: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          keperluan?: string | null
          santri_id: string
          status?: Database["public"]["Enums"]["izin_status"]
          tanggal_kembali?: string | null
          tanggal_pulang?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          keperluan?: string | null
          santri_id?: string
          status?: Database["public"]["Enums"]["izin_status"]
          tanggal_kembali?: string | null
          tanggal_pulang?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "izin_pulang_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
        ]
      }
      kamar: {
        Row: {
          created_at: string
          gedung: string | null
          id: string
          kapasitas: number
          nomor: string
          pengasuh: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gedung?: string | null
          id?: string
          kapasitas?: number
          nomor: string
          pengasuh?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gedung?: string | null
          id?: string
          kapasitas?: number
          nomor?: string
          pengasuh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kelas: {
        Row: {
          created_at: string
          id: string
          kapasitas: number
          nama: string
          tingkat: string | null
          updated_at: string
          wali_kelas: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kapasitas?: number
          nama: string
          tingkat?: string | null
          updated_at?: string
          wali_kelas?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kapasitas?: number
          nama?: string
          tingkat?: string | null
          updated_at?: string
          wali_kelas?: string | null
        }
        Relationships: []
      }
      kesehatan: {
        Row: {
          created_at: string
          diagnosa: string | null
          id: string
          keluhan: string | null
          santri_id: string
          tanggal: string
          tindakan: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          diagnosa?: string | null
          id?: string
          keluhan?: string | null
          santri_id: string
          tanggal?: string
          tindakan?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          diagnosa?: string | null
          id?: string
          keluhan?: string | null
          santri_id?: string
          tanggal?: string
          tindakan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kesehatan_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
        ]
      }
      kitab: {
        Row: {
          created_at: string
          id: string
          judul: string
          kategori: string | null
          pengarang: string | null
          stok: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          judul: string
          kategori?: string | null
          pengarang?: string | null
          stok?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          judul?: string
          kategori?: string | null
          pengarang?: string | null
          stok?: number
          updated_at?: string
        }
        Relationships: []
      }
      konseling: {
        Row: {
          created_at: string
          id: string
          konselor: string | null
          masalah: string | null
          santri_id: string
          solusi: string | null
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          konselor?: string | null
          masalah?: string | null
          santri_id: string
          solusi?: string | null
          tanggal?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          konselor?: string | null
          masalah?: string | null
          santri_id?: string
          solusi?: string | null
          tanggal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "konseling_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      santri: {
        Row: {
          alamat: string | null
          created_at: string
          foto_url: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          kamar_id: string | null
          kelas_id: string | null
          nama: string
          nama_wali: string | null
          nis: string
          status: Database["public"]["Enums"]["santri_status"]
          tanggal_lahir: string | null
          tanggal_masuk: string
          telepon_wali: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          foto_url?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          kamar_id?: string | null
          kelas_id?: string | null
          nama: string
          nama_wali?: string | null
          nis: string
          status?: Database["public"]["Enums"]["santri_status"]
          tanggal_lahir?: string | null
          tanggal_masuk?: string
          telepon_wali?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          foto_url?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          kamar_id?: string | null
          kelas_id?: string | null
          nama?: string
          nama_wali?: string | null
          nis?: string
          status?: Database["public"]["Enums"]["santri_status"]
          tanggal_lahir?: string | null
          tanggal_masuk?: string
          telepon_wali?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "santri_kamar_id_fkey"
            columns: ["kamar_id"]
            isOneToOne: false
            referencedRelation: "kamar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santri_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "ustadz" | "staff"
      gender_type: "L" | "P"
      izin_status: "menunggu" | "disetujui" | "ditolak" | "kembali"
      santri_status: "aktif" | "alumni" | "keluar" | "cuti"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "ustadz", "staff"],
      gender_type: ["L", "P"],
      izin_status: ["menunggu", "disetujui", "ditolak", "kembali"],
      santri_status: ["aktif", "alumni", "keluar", "cuti"],
    },
  },
} as const
