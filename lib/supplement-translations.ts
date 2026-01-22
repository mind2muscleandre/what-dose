/**
 * Supplement Translation Helper
 * Provides i18n support for supplement names and metadata
 */

import type { Language } from './translations'

// Example supplement translations structure
// These should be added to the main translations.ts file
export interface SupplementTranslation {
  name: string
  effect?: string
  why_dosage?: string
  warning?: string
  cycling_instruction?: string
}

// Example translations (should be moved to translations.ts)
const supplementTranslations: Record<Language, Record<string, SupplementTranslation>> = {
  en: {
    vit_d3: {
      name: 'Vitamin D3',
      effect: 'Immune & Mood Support',
      why_dosage: 'Adjusted for your body weight to ensure optimal absorption.'
    },
    omega_3: {
      name: 'Omega-3',
      effect: 'Heart & Brain Health',
      why_dosage: 'Scaled based on your weight and activity level.'
    },
    magnesium: {
      name: 'Magnesium',
      effect: 'Sleep & Muscle Relaxation',
      why_dosage: 'Dosage adjusted for your body weight.'
    },
    zinc: {
      name: 'Zinc',
      effect: 'Immune Function & Testosterone',
      why_dosage: 'Gender-specific dosage for optimal benefits.'
    },
    iron: {
      name: 'Iron',
      effect: 'Energy & Red Blood Cell Production',
      why_dosage: 'Recommended for women of childbearing age.'
    },
    coq10: {
      name: 'CoQ10',
      effect: 'Cellular Energy & Heart Health',
      why_dosage: 'Recommended for age 40+ to support mitochondrial function.'
    },
    vit_k2: {
      name: 'Vitamin K2',
      effect: 'Bone & Cardiovascular Health',
      why_dosage: 'Recommended for age 40+ to work synergistically with Vitamin D3.'
    },
    turkesterone: {
      name: 'Turkesterone',
      warning: 'Experimental supplement. Limited human data available.',
      cycling_instruction: 'Cycle 8 weeks on, 4 weeks off.'
    }
  },
  sv: {
    vit_d3: {
      name: 'D-vitamin (D3)',
      effect: 'Stöd för immunförsvar och humör',
      why_dosage: 'Justerad efter din kroppsvikt för att säkerställa optimalt upptag.'
    },
    omega_3: {
      name: 'Omega-3',
      effect: 'Hjärta och hjärnhälsa',
      why_dosage: 'Skalad baserat på din vikt och aktivitetsnivå.'
    },
    magnesium: {
      name: 'Magnesium',
      effect: 'Sömn och muskelavslappning',
      why_dosage: 'Dosering justerad efter din kroppsvikt.'
    },
    zinc: {
      name: 'Zink',
      effect: 'Immunfunktion och testosteron',
      why_dosage: 'Könsspecifik dosering för optimala fördelar.'
    },
    iron: {
      name: 'Järn',
      effect: 'Energi och produktion av röda blodkroppar',
      why_dosage: 'Rekommenderas för kvinnor i fertil ålder.'
    },
    coq10: {
      name: 'CoQ10',
      effect: 'Cellulär energi och hjärthälsa',
      why_dosage: 'Rekommenderas för ålder 40+ för att stödja mitokondriefunktion.'
    },
    vit_k2: {
      name: 'K-vitamin (K2)',
      effect: 'Ben- och kardiovaskulär hälsa',
      why_dosage: 'Rekommenderas för ålder 40+ för att fungera synergistiskt med D-vitamin.'
    },
    turkesterone: {
      name: 'Turkesterone',
      warning: 'Experimentellt tillskott. Begränsad data på människor.',
      cycling_instruction: 'Cykla 8 veckor på, 4 veckor av.'
    }
  }
}

/**
 * Get supplement translation from i18n_key
 * Falls back to database name_en/name_sv if i18n_key not found
 */
export function getSupplementTranslation(
  i18nKey: string | null,
  lang: Language,
  fallbackNameEn: string,
  fallbackNameSv?: string | null
): {
  name: string
  effect?: string
  why_dosage?: string
  warning?: string
  cycling_instruction?: string
} {
  // Extract key from full i18n_key (e.g., "supplements.vit_d3" -> "vit_d3")
  const key = i18nKey?.replace('supplements.', '') || null

  if (key && supplementTranslations[lang]?.[key]) {
    return supplementTranslations[lang][key]
  }

  // Fallback to database names
  return {
    name: lang === 'sv' && fallbackNameSv ? fallbackNameSv : fallbackNameEn
  }
}

/**
 * Get supplement name (convenience function)
 */
export function getSupplementName(
  i18nKey: string | null,
  lang: Language,
  fallbackNameEn: string,
  fallbackNameSv?: string | null
): string {
  const translation = getSupplementTranslation(i18nKey, lang, fallbackNameEn, fallbackNameSv)
  return translation.name
}

/**
 * Get supplement effect/benefit description
 */
export function getSupplementEffect(
  i18nKey: string | null,
  lang: Language
): string | null {
  const key = i18nKey?.replace('supplements.', '') || null
  return key ? supplementTranslations[lang]?.[key]?.effect || null : null
}

/**
 * Get why dosage explanation
 */
export function getWhyDosage(
  i18nKey: string | null,
  lang: Language
): string | null {
  const key = i18nKey?.replace('supplements.', '') || null
  return key ? supplementTranslations[lang]?.[key]?.why_dosage || null : null
}

/**
 * Get warning text for experimental supplements
 */
export function getSupplementWarning(
  i18nKey: string | null,
  lang: Language
): string | null {
  const key = i18nKey?.replace('supplements.', '') || null
  return key ? supplementTranslations[lang]?.[key]?.warning || null : null
}

/**
 * Get cycling instruction
 */
export function getCyclingInstruction(
  i18nKey: string | null,
  lang: Language
): string | null {
  const key = i18nKey?.replace('supplements.', '') || null
  return key ? supplementTranslations[lang]?.[key]?.cycling_instruction || null : null
}
