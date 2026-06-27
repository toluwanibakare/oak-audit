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
      audit_answers: {
        Row: {
          audit_id: string
          auditee_name: string | null
          auditor_name: string | null
          clause: string
          id: string
          kind: string
          note: string | null
          process_id: string
          q_ref: string | null
          question_text: string | null
          severity: string | null
          status: string
          updated_at: string
        }
        Insert: {
          audit_id: string
          auditee_name?: string | null
          auditor_name?: string | null
          clause: string
          id?: string
          kind?: string
          note?: string | null
          process_id: string
          q_ref?: string | null
          question_text?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          audit_id?: string
          auditee_name?: string | null
          auditor_name?: string | null
          clause?: string
          id?: string
          kind?: string
          note?: string | null
          process_id?: string
          q_ref?: string | null
          question_text?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_answers_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_answers_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "org_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_licenses: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string
          id: string
          org_id: string
          pack: string
          paid_amount_ngn: number
          paystack_ref: string | null
          purchased_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          org_id: string
          pack: string
          paid_amount_ngn?: number
          paystack_ref?: string | null
          purchased_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          org_id?: string
          pack?: string
          paid_amount_ngn?: number
          paystack_ref?: string | null
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_licenses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_processes: {
        Row: {
          audit_id: string
          auditor_id: string | null
          created_at: string
          id: string
          process_id: string
        }
        Insert: {
          audit_id: string
          auditor_id?: string | null
          created_at?: string
          id?: string
          process_id: string
        }
        Update: {
          audit_id?: string
          auditor_id?: string | null
          created_at?: string
          id?: string
          process_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_processes_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_processes_auditor_id_fkey"
            columns: ["auditor_id"]
            isOneToOne: false
            referencedRelation: "auditors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_processes_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "org_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      auditors: {
        Row: {
          certifications: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          org_id: string
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          certifications?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          org_id: string
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          certifications?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          org_id?: string
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string
          criteria: string | null
          id: string
          lead_auditor_id: string | null
          object: string | null
          org_id: string
          scope: string | null
          standard: string
          start_date: string | null
          end_date: string | null
          started_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by: string
          criteria?: string | null
          id?: string
          lead_auditor_id?: string | null
          object?: string | null
          org_id: string
          scope?: string | null
          standard: string
          start_date?: string | null
          end_date?: string | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string
          criteria?: string | null
          id?: string
          lead_auditor_id?: string | null
          object?: string | null
          org_id?: string
          scope?: string | null
          standard?: string
          start_date?: string | null
          end_date?: string | null
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audits_lead_auditor_id_fkey"
            columns: ["lead_auditor_id"]
            isOneToOne: false
            referencedRelation: "auditors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          audit_license_id: string | null
          created_at: string
          created_by: string | null
          credits: number
          id: string
          kind: string
          naira_amount: number | null
          org_id: string
          pack: string | null
          reference: string | null
        }
        Insert: {
          audit_license_id?: string | null
          created_at?: string
          created_by?: string | null
          credits: number
          id?: string
          kind: string
          naira_amount?: number | null
          org_id: string
          pack?: string | null
          reference?: string | null
        }
        Update: {
          audit_license_id?: string | null
          created_at?: string
          created_by?: string | null
          credits?: number
          id?: string
          kind?: string
          naira_amount?: number | null
          org_id?: string
          pack?: string | null
          reference?: string | null
        }
        Relationships: []
      }
      credit_wallets: {
        Row: {
          balance: number
          created_at: string
          org_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          org_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_questions: {
        Row: {
          active: boolean
          clause: string
          created_at: string
          created_by: string
          evidence: string | null
          id: string
          kind: string
          org_id: string
          process_key: string
          reference: string | null
          standard: string
          text: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          clause: string
          created_at?: string
          created_by: string
          evidence?: string | null
          id?: string
          kind?: string
          org_id: string
          process_key: string
          reference?: string | null
          standard: string
          text: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          clause?: string
          created_at?: string
          created_by?: string
          evidence?: string | null
          id?: string
          kind?: string
          org_id?: string
          process_key?: string
          reference?: string | null
          standard?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_questions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      findings: {
        Row: {
          audit_id: string
          capa: string | null
          clause: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          org_id: string
          owner: string | null
          root_cause: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          audit_id: string
          capa?: string | null
          clause?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          org_id: string
          owner?: string | null
          root_cause?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          audit_id?: string
          capa?: string | null
          clause?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          org_id?: string
          owner?: string | null
          root_cause?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_processes: {
        Row: {
          created_at: string
          id: string
          is_custom: boolean
          key: string
          name: string
          org_id: string
          scope: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean
          key: string
          name: string
          org_id: string
          scope?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean
          key?: string
          name?: string
          org_id?: string
          scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_processes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_email: string | null
          org_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email?: string | null
          org_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string | null
          org_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string
          created_by: string
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
        }
        Relationships: []
      }
      paystack_transactions: {
        Row: {
          amount_ngn: number
          created_at: string
          id: string
          org_id: string
          pack: string
          raw_payload: Json | null
          reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_ngn: number
          created_at?: string
          id?: string
          org_id: string
          pack: string
          raw_payload?: Json | null
          reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_ngn?: number
          created_at?: string
          id?: string
          org_id?: string
          pack?: string
          raw_payload?: Json | null
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paystack_transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      process_assignments: {
        Row: {
          auditor_id: string
          created_at: string
          id: string
          org_id: string
          process_id: string
        }
        Insert: {
          auditor_id: string
          created_at?: string
          id?: string
          org_id: string
          process_id: string
        }
        Update: {
          auditor_id?: string
          created_at?: string
          id?: string
          org_id?: string
          process_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_assignments_auditor_id_fkey"
            columns: ["auditor_id"]
            isOneToOne: false
            referencedRelation: "auditors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_assignments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_assignments_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "org_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      grant_demo_credits: { Args: never; Returns: number }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      spend_credits_for_pack: {
        Args: { _org_id: string; _pack: string }
        Returns: string
      }
      topup_credits: {
        Args: {
          _credits: number
          _naira: number
          _org_id: string
          _reference: string
          _user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "lead_auditor"
        | "auditor"
        | "auditee"
        | "viewer"
      org_type: "individual" | "organization"
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
      app_role: [
        "owner",
        "admin",
        "lead_auditor",
        "auditor",
        "auditee",
        "viewer",
      ],
      org_type: ["individual", "organization"],
    },
  },
} as const
