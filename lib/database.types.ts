// Database types generated from Supabase schema
// These match the database schema exactly

export type ResearchStatus = 'Green' | 'Blue' | 'Yellow' | 'Red'
export type RegulatoryType = 'Supplement' | 'Medicine' | 'Grey Zone' | 'Restricted'
export type UnitType = 'mg' | 'g' | 'IU' | 'mcg' | 'ml' | 'tabs' | 'caps' | 'cfu'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type ScheduleBlock = 'Morning' | 'Lunch' | 'Pre-Workout' | 'Post-Workout' | 'Dinner' | 'Bedtime'
export type SubscriptionTier = 'free' | 'pro' | 'creator'
export type SubstanceType = 'medicine' | 'supplement' | 'herb' | 'food' | 'enzyme'
export type ExperimentDesign = 'AB' | 'ABAB' | 'RCT' | 'Crossover'
export type ExperimentStatus = 'draft' | 'active' | 'completed' | 'paused'

// Database Tables
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          goal_profile: string | null
          experience_level: string | null
          onboarding_completed: boolean
          age: number | null
          weight_kg: number | null
          gender: string | null
          selected_goals: string[] | null
          username: string | null
          xp_total: number
          current_streak: number
          last_active_at: string | null
          subscription_tier: SubscriptionTier
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      supplements: {
        Row: {
          id: number
          name_sv: string | null
          name_en: string
          research_status: ResearchStatus
          regulatory_status: RegulatoryType
          dosing_base_val: number | null
          dosing_max_val: number | null
          unit: UnitType | null
          dosing_notes: string | null
          bioavailability_notes: string | null
          interaction_risk_text: string | null
          interaction_risk_level: RiskLevel
          is_base_health: boolean
          category_ids: number[] | null
          parent_id: number | null
          is_parent: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['supplements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['supplements']['Insert']>
      }
      substances: {
        Row: {
          id: number
          name: string
          name_aliases: string[] | null
          substance_type: SubstanceType
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['substances']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['substances']['Insert']>
      }
      interactions: {
        Row: {
          id: number
          substance_a_id: number
          substance_b_id: number
          severity: number
          mechanism: string | null
          description: string | null
          evidence_level: string | null
          source: string | null
          source_ref: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['interactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['interactions']['Insert']>
      }
      protocols: {
        Row: {
          id: number
          creator_id: string
          forked_from_id: number | null
          title: string
          description: string | null
          protocol_data: Record<string, any>
          version: number
          is_public: boolean
          fork_count: number
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['protocols']['Row'], 'id' | 'fork_count' | 'like_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['protocols']['Insert']>
      }
      experiments: {
        Row: {
          id: number
          user_id: string
          protocol_id: number | null
          title: string
          description: string | null
          intervention: Record<string, any>
          control: Record<string, any> | null
          metric: string
          metric_source: string | null
          design: ExperimentDesign
          block_duration_days: number
          start_date: string
          end_date: string | null
          status: ExperimentStatus
          results: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['experiments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['experiments']['Insert']>
      }
      health_metrics: {
        Row: {
          id: string
          user_id: string
          type: string
          value: number
          unit: string | null
          source: string
          recorded_at: string
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['health_metrics']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['health_metrics']['Insert']>
      }
    }
    Functions: {
      search_supplements: {
        Args: { search_term: string }
        Returns: {
          parent_id: number
          parent_name_en: string
          parent_name_sv: string | null
          parent_description: string | null
          parent_research_status: ResearchStatus
          variants: Array<{
            id: number
            name_en: string
            name_sv: string | null
            default_dosage_val: number | null
            max_dosage_val: number | null
            unit: UnitType | null
            dosing_notes: string | null
            bioavailability_notes: string | null
            interaction_risk_text: string | null
            interaction_risk_level: RiskLevel
            research_status: ResearchStatus
            category_ids: number[] | null
          }>
        }[]
      }
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Supplement = Database['public']['Tables']['supplements']['Row']
export type Substance = Database['public']['Tables']['substances']['Row']
export type Interaction = Database['public']['Tables']['interactions']['Row']
export type Protocol = Database['public']['Tables']['protocols']['Row']
export type Experiment = Database['public']['Tables']['experiments']['Row']
export type HealthMetric = Database['public']['Tables']['health_metrics']['Row']

export type SupplementSearchResult = Database['public']['Functions']['search_supplements']['Returns'][0]
