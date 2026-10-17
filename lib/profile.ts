export const profileLanguages = ['en', 'mr', 'hi'] as const
export type ProfileLanguage = (typeof profileLanguages)[number]

export const farmerTypes = ['small', 'marginal', 'medium', 'large', 'tenant'] as const
export type FarmerType = (typeof farmerTypes)[number]

export const genders = ['male', 'female', 'other'] as const
export type Gender = (typeof genders)[number]

export const socialCategories = ['general', 'obc', 'sc', 'st'] as const
export type SocialCategory = (typeof socialCategories)[number]

export const farmingTypes = ['rainfed', 'irrigated', 'organic', 'natural', 'conventional'] as const
export type FarmingType = (typeof farmingTypes)[number]

export const storageFacilities = ['on_farm', 'warehouse', 'cold_storage', 'none'] as const
export type StorageFacility = (typeof storageFacilities)[number]

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  preferred_language: ProfileLanguage
  village: string | null
  taluka: string | null
  district: string | null
  state: string
  farmer_type: FarmerType | null
  years_farming: number | null
  primary_crops: string[] | null
  voice_first: boolean
  low_literacy_mode: boolean
  role: 'farmer' | 'expert' | 'worker' | 'seller' | 'admin'
  profile_completed: boolean
  created_at: string
  updated_at: string

  // Government & Identity Information
  farmer_id?: string | null
  aadhaar_last_four?: string | null
  gender?: Gender | null
  date_of_birth?: string | null
  social_category?: SocialCategory | null
  pincode?: string | null

  // Schemes & DBT Direct Benefit Transfer
  pm_kisan_id?: string | null
  kcc_holder?: boolean
  kcc_limit?: number | null
  pmfby_policy_number?: string | null
  ration_card_number?: string | null
  bank_name?: string | null
  account_number_last_four?: string | null
  ifsc_code?: string | null
  dbt_enabled?: boolean

  // Comprehensive Agricultural Operations
  farming_type?: FarmingType | null
  total_land_acres?: number | null
  primary_irrigation_source?: string | null
  machinery_owned?: string[] | null
  livestock_owned?: string[] | null
  storage_facility?: StorageFacility | null
  soil_health_card_number?: string | null
}

export interface ProfileFormValues {
  full_name: string
  phone: string
  preferred_language: ProfileLanguage
  village: string
  taluka: string
  district: string
  state: string
  pincode: string
  farmer_type: FarmerType | null
  years_farming: number | null
  primary_crops: string
  voice_first: boolean
  low_literacy_mode: boolean

  // Government & Identity
  farmer_id: string
  aadhaar_last_four: string
  gender: Gender | null
  date_of_birth: string
  social_category: SocialCategory | null

  // Bank & DBT
  bank_name: string
  account_number_last_four: string
  ifsc_code: string
  dbt_enabled: boolean

  // Schemes
  pm_kisan_id: string
  kcc_holder: boolean
  kcc_limit: number | null
  pmfby_policy_number: string
  ration_card_number: string
  soil_health_card_number: string

  // Agriculture
  farming_type: FarmingType | null
  total_land_acres: number | null
  primary_irrigation_source: string
  machinery_owned: string
  livestock_owned: string
  storage_facility: StorageFacility | null
}

export function profileCompleteness(profile: Partial<ProfileFormValues>): number {
  const essentialFields = [
    profile.full_name,
    profile.phone,
    profile.village,
    profile.taluka,
    profile.district,
    profile.state,
    profile.farmer_type,
    profile.years_farming,
    profile.primary_crops,
    profile.farmer_id || profile.aadhaar_last_four,
    profile.bank_name || profile.pm_kisan_id,
    profile.total_land_acres,
    profile.primary_irrigation_source,
  ]
  const filled = essentialFields.filter((value) => value !== null && value !== '' && value !== undefined).length
  return Math.min(100, Math.round((filled / essentialFields.length) * 100))
}
