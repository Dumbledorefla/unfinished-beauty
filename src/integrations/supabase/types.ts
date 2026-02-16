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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_name: string | null
          admin_user_id: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          admin_name?: string | null
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          admin_name?: string | null
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          consultation_type: string
          created_at: string
          duration: number
          id: string
          notes: string | null
          paid_at: string | null
          price: number
          scheduled_at: string
          status: string
          taromante_id: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consultation_type?: string
          created_at?: string
          duration?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          price: number
          scheduled_at: string
          status?: string
          taromante_id: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consultation_type?: string
          created_at?: string
          duration?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          price?: number
          scheduled_at?: string
          status?: string
          taromante_id?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_taromante_id_fkey"
            columns: ["taromante_id"]
            isOneToOne: false
            referencedRelation: "taromantes"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          completed_lessons: number | null
          course_id: string
          enrolled_at: string
          id: string
          progress: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_lessons?: number | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_lessons?: number | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          enrollment_count: number | null
          id: string
          image_url: string | null
          instructor_name: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_free: boolean | null
          level: string | null
          price: number | null
          short_description: string | null
          slug: string
          title: string
          total_duration: number | null
          total_lessons: number | null
          total_modules: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          enrollment_count?: number | null
          id?: string
          image_url?: string | null
          instructor_name?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          level?: string | null
          price?: number | null
          short_description?: string | null
          slug: string
          title: string
          total_duration?: number | null
          total_lessons?: number | null
          total_modules?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          enrollment_count?: number | null
          id?: string
          image_url?: string | null
          instructor_name?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          level?: string | null
          price?: number | null
          short_description?: string | null
          slug?: string
          title?: string
          total_duration?: number | null
          total_lessons?: number | null
          total_modules?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          calendar_email: string | null
          created_at: string
          id: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_email?: string | null
          created_at?: string
          id?: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_email?: string | null
          created_at?: string
          id?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      oracle_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          name: string
          oracle_type: string
          preview_lines: number
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          name: string
          oracle_type: string
          preview_lines?: number
          price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          name?: string
          oracle_type?: string
          preview_lines?: number
          price?: number
        }
        Relationships: []
      }
      oracle_purchases: {
        Row: {
          id: string
          oracle_type: string
          order_id: string | null
          price: number
          purchased_at: string
          reading_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          oracle_type: string
          order_id?: string | null
          price?: number
          purchased_at?: string
          reading_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          oracle_type?: string
          order_id?: string | null
          price?: number
          purchased_at?: string
          reading_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracle_purchases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity?: number
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          discount_amount: number | null
          id: string
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_session_id: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_session_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_session_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_proofs: {
        Row: {
          file_path: string
          id: string
          note: string | null
          order_id: string
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          uploaded_at: string
        }
        Insert: {
          file_path: string
          id?: string
          note?: string | null
          order_id: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          uploaded_at?: string
        }
        Update: {
          file_path?: string
          id?: string
          note?: string | null
          order_id?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          order_id: string
          provider: string
          provider_charge_id: string | null
          provider_transaction_id: string | null
          raw_response: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string
          order_id: string
          provider?: string
          provider_charge_id?: string | null
          provider_transaction_id?: string | null
          raw_response?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          order_id?: string
          provider?: string
          provider_charge_id?: string | null
          provider_transaction_id?: string | null
          raw_response?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          combo_products: Json | null
          created_at: string
          description: string | null
          has_sample: boolean | null
          id: string
          image_path: string | null
          image_url: string | null
          is_active: boolean | null
          is_combo: boolean | null
          is_featured: boolean | null
          life_area: string | null
          name: string
          original_price: number | null
          price: number
          sample_description: string | null
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          category?: string
          combo_products?: Json | null
          created_at?: string
          description?: string | null
          has_sample?: boolean | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_combo?: boolean | null
          is_featured?: boolean | null
          life_area?: string | null
          name: string
          original_price?: number | null
          price?: number
          sample_description?: string | null
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          combo_products?: Json | null
          created_at?: string
          description?: string | null
          has_sample?: boolean | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_combo?: boolean | null
          is_featured?: boolean | null
          life_area?: string | null
          name?: string
          original_price?: number | null
          price?: number
          sample_description?: string | null
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          id: string
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          id?: string
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          id?: string
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          consultation_id: string | null
          created_at: string
          id: string
          rating: number
          taromante_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          consultation_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          taromante_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          consultation_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          taromante_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_taromante_id_fkey"
            columns: ["taromante_id"]
            isOneToOne: false
            referencedRelation: "taromantes"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          label: string | null
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label?: string | null
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      taromantes: {
        Row: {
          bio: string | null
          created_at: string
          experience: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          photo_url: string | null
          price_per_hour: number
          price_per_session: number | null
          rating: number | null
          short_bio: string | null
          slug: string
          specialties: Json | null
          title: string | null
          total_consultations: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          experience?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          photo_url?: string | null
          price_per_hour?: number
          price_per_session?: number | null
          rating?: number | null
          short_bio?: string | null
          slug: string
          specialties?: Json | null
          title?: string | null
          total_consultations?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          experience?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          photo_url?: string | null
          price_per_hour?: number
          price_per_session?: number | null
          rating?: number | null
          short_bio?: string | null
          slug?: string
          specialties?: Json | null
          title?: string | null
          total_consultations?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tarot_readings: {
        Row: {
          cards: Json
          created_at: string
          id: string
          interpretation: string | null
          reading_type: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          cards: Json
          created_at?: string
          id?: string
          interpretation?: string | null
          reading_type: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          cards?: Json
          created_at?: string
          id?: string
          interpretation?: string | null
          reading_type?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      user_products: {
        Row: {
          expires_at: string | null
          granted_at: string
          id: string
          order_id: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      check_rate_limit: {
        Args: { p_key: string; p_limit?: number; p_window_seconds?: number }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
