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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          billing_address: Json | null
          created_at: string
          credit_limit: number
          discount_percentage: number
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          payment_terms: string
          phone: string | null
          shipping_addresses: Json
          siret: string | null
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          credit_limit?: number
          discount_percentage?: number
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          payment_terms?: string
          phone?: string | null
          shipping_addresses?: Json
          siret?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          credit_limit?: number
          discount_percentage?: number
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          payment_terms?: string
          phone?: string | null
          shipping_addresses?: Json
          siret?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          company_id: string | null
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          currency: string
          discount_amount: number
          id: string
          internal_notes: string | null
          metadata: Json
          notes: string | null
          order_number: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_address: Json | null
          shipping_amount: number
          shipping_method: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          company_id?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          id?: string
          internal_notes?: string | null
          metadata?: Json
          notes?: string | null
          order_number?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: Json | null
          shipping_amount?: number
          shipping_method?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          company_id?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          id?: string
          internal_notes?: string | null
          metadata?: Json
          notes?: string | null
          order_number?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: Json | null
          shipping_amount?: number
          shipping_method?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          name: string
          parent_slug: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          name: string
          parent_slug?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          name?: string
          parent_slug?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_slug_fkey"
            columns: ["parent_slug"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          brand: string
          category_slug: string
          compare_at_price: number | null
          created_at: string
          description: string
          documents: Json
          id: number
          image: string | null
          images: Json
          in_stock: boolean
          is_active: boolean
          is_featured: boolean
          is_new: boolean
          is_rentable: boolean
          name: string
          price: number
          related_product_ids: number[]
          rental_price_daily: number | null
          short_description: string
          sku: string
          slug: string
          source_url: string | null
          specs: Json
          stock_quantity: number
          subcategory_slug: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          brand: string
          category_slug: string
          compare_at_price?: number | null
          created_at?: string
          description?: string
          documents?: Json
          id?: number
          image?: string | null
          images?: Json
          in_stock?: boolean
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_rentable?: boolean
          name: string
          price: number
          related_product_ids?: number[]
          rental_price_daily?: number | null
          short_description?: string
          sku: string
          slug: string
          source_url?: string | null
          specs?: Json
          stock_quantity?: number
          subcategory_slug?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          brand?: string
          category_slug?: string
          compare_at_price?: number | null
          created_at?: string
          description?: string
          documents?: Json
          id?: number
          image?: string | null
          images?: Json
          in_stock?: boolean
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_rentable?: boolean
          name?: string
          price?: number
          related_product_ids?: number[]
          rental_price_daily?: number | null
          short_description?: string
          sku?: string
          slug?: string
          source_url?: string | null
          specs?: Json
          stock_quantity?: number
          subcategory_slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "products_subcategory_slug_fkey"
            columns: ["subcategory_slug"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          company_name: string | null
          created_at: string
          email: string | null
          email_notifications: boolean
          first_name: string | null
          id: string
          is_active: boolean
          job_title: string | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          email_notifications?: boolean
          first_name?: string | null
          id: string
          is_active?: boolean
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          email_notifications?: boolean
          first_name?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          company_id: string | null
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          currency: string
          discount_amount: number
          id: string
          internal_notes: string | null
          metadata: Json
          notes: string | null
          quote_number: string | null
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          company_id?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          id?: string
          internal_notes?: string | null
          metadata?: Json
          notes?: string | null
          quote_number?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          company_id?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          id?: string
          internal_notes?: string | null
          metadata?: Json
          notes?: string | null
          quote_number?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      catalog_products: {
        Row: {
          badge: string | null
          brand: string | null
          categoryName: string | null
          categorySlug: string | null
          compareAtPrice: number | null
          description: string | null
          id: number | null
          image: string | null
          images: Json | null
          inStock: boolean | null
          isFeatured: boolean | null
          isNew: boolean | null
          isRentable: boolean | null
          name: string | null
          price: number | null
          relatedProducts: number[] | null
          rentalPriceDaily: number | null
          shortDescription: string | null
          sku: string | null
          slug: string | null
          specs: Json | null
          stockQuantity: number | null
          subcategorySlug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["categorySlug"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "products_subcategory_slug_fkey"
            columns: ["subcategorySlug"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Functions: {
      admin_update_profile: {
        Args: {
          next_company_id?: string
          next_is_active?: boolean
          next_role?: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: {
          company_id: string | null
          company_name: string | null
          created_at: string
          email: string | null
          email_notifications: boolean
          first_name: string | null
          id: string
          is_active: boolean
          job_title: string | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      update_my_profile: {
        Args: {
          next_company_name: string
          next_email_notifications: boolean
          next_first_name: string
          next_job_title: string
          next_last_name: string
          next_phone: string
        }
        Returns: {
          company_id: string | null
          company_name: string | null
          created_at: string
          email: string | null
          email_notifications: boolean
          first_name: string | null
          id: string
          is_active: boolean
          job_title: string | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "member" | "admin" | "super_admin"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status: "pending" | "paid" | "failed" | "refunded" | "partial"
      quote_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "rejected"
        | "expired"
        | "converted"
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
      app_role: ["member", "admin", "super_admin"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: ["pending", "paid", "failed", "refunded", "partial"],
      quote_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "rejected",
        "expired",
        "converted",
      ],
    },
  },
} as const
