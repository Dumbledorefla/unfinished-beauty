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
          created_at: string
          id: string
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_session_id: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_session_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_session_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          combo_products: Json | null
          created_at: string
          description: string | null
          has_sample: boolean | null
          id: string
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
