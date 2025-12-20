export interface SupplementItem {
  item_id: string
  name: string
  dosage_display: string
  form: string
  is_completed: boolean
  notes: string
  critical_instruction: string | null
}

export interface TimelineBlock {
  block_id: string
  title: string
  subtitle: string
  icon_key: string
  ui_color_hex: string
  suggested_time: string
  items: SupplementItem[]
}

export interface ProgressMetrics {
  total_tasks: number
  completed_tasks: number
  completion_percentage: number
  streak_days: number
}

export interface WhatDoseData {
  user_id: string
  goal_profile: string
  current_date: string
  progress_metrics: ProgressMetrics
  timeline_blocks: TimelineBlock[]
}

export const initialData: WhatDoseData = {
  user_id: "user_12345",
  goal_profile: "muscle_hypertrophy",
  current_date: "2023-11-09",
  progress_metrics: {
    total_tasks: 8,
    completed_tasks: 2,
    completion_percentage: 25,
    streak_days: 9,
  },
  timeline_blocks: [
    {
      block_id: "morning_routine",
      title: "Morgonrutin",
      subtitle: "Med frukost",
      icon_key: "sunrise",
      ui_color_hex: "#E09F3E",
      suggested_time: "08:00",
      items: [
        {
          item_id: "sup_001",
          name: "Multivitamin",
          dosage_display: "1 tablett",
          form: "pill",
          is_completed: true,
          notes: "Basförsäkring.",
          critical_instruction: "Ta med mat (fett) för upptag.",
        },
        {
          item_id: "sup_002",
          name: "Omega-3",
          dosage_display: "2 g",
          form: "softgel",
          is_completed: true,
          notes: "Anti-inflammation.",
          critical_instruction: null,
        },
      ],
    },
    {
      block_id: "pre_workout",
      title: "Före Träning",
      subtitle: "30-60 min innan passet",
      icon_key: "dumbbell",
      ui_color_hex: "#D62828",
      suggested_time: "16:30",
      items: [
        {
          item_id: "sup_010",
          name: "L-Citrullin",
          dosage_display: "6 g",
          form: "powder",
          is_completed: false,
          notes: "För pump.",
          critical_instruction: "Blanda med vatten.",
        },
      ],
    },
    {
      block_id: "bedtime",
      title: "Kvällsrutin",
      subtitle: "Nedvarvning",
      icon_key: "moon",
      ui_color_hex: "#8338EC",
      suggested_time: "22:00",
      items: [
        {
          item_id: "sup_003",
          name: "Magnesium Glycinat",
          dosage_display: "400 mg",
          form: "pill",
          is_completed: false,
          notes: "Sömnkvalitet.",
          critical_instruction: "Undvik kalcium.",
        },
      ],
    },
  ],
}
