export const profileLanguages = ['en', 'mr', 'hi'] as const
export type ProfileLanguage = (typeof profileLanguages)[number]

export const farmerTypes = ['small', 'marginal', 'medium', 'large', 'tenant'] as const
export type FarmerType = (typeof farmerTypes)[number]

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
}

export interface ProfileFormValues {
  full_name: string
  phone: string
  preferred_language: ProfileLanguage
  village: string
  taluka: string
  district: string
  state: string
  farmer_type: FarmerType | null
  years_farming: number | null
  primary_crops: string
  voice_first: boolean
  low_literacy_mode: boolean
}

export function profileCompleteness(profile: ProfileFormValues): number {
  const values = [
    profile.full_name,
    profile.phone,
    profile.village,
    profile.taluka,
    profile.district,
    profile.state,
    profile.farmer_type,
    profile.years_farming,
    profile.primary_crops,
  ]
  return Math.round((values.filter((value) => value !== null && value !== '' && value !== undefined).length / values.length) * 100)
}
