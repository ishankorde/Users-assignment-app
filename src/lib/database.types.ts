export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apps: {
        Row: {
          id: string
          name: string
          category: string | null
          vendor: string | null
          tier: string | null
          owner_team: string | null
          sso_required: boolean
          data_sensitivity: string | null
          status: string
          website_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          vendor?: string | null
          tier?: string | null
          owner_team?: string | null
          sso_required?: boolean
          data_sensitivity?: string | null
          status?: string
          website_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          vendor?: string | null
          tier?: string | null
          owner_team?: string | null
          sso_required?: boolean
          data_sensitivity?: string | null
          status?: string
          website_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_app_assignments: {
        Row: {
          id: string
          user_id: string
          app_id: string
          role_in_app: string | null
          access_level: string | null
          license_type: string | null
          assigned_on: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          app_id: string
          role_in_app?: string | null
          access_level?: string | null
          license_type?: string | null
          assigned_on?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          app_id?: string
          role_in_app?: string | null
          access_level?: string | null
          license_type?: string | null
          assigned_on?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_app_assignments_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_app_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          job_role: string | null
          start_date: string | null
          group: string | null
          team: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          job_role?: string | null
          start_date?: string | null
          group?: string | null
          team?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          job_role?: string | null
          start_date?: string | null
          group?: string | null
          team?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      assignments_expanded: {
        Row: {
          assignment_id: string | null
          user_id: string | null
          user_name: string | null
          user_email: string | null
          user_team: string | null
          user_group: string | null
          app_id: string | null
          app_name: string | null
          app_category: string | null
          role_in_app: string | null
          license_type: string | null
          access_level: string | null
          assigned_on: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never