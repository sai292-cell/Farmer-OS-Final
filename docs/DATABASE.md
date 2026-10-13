# FarmerOS Database

## `public.profiles`

The `profiles` table stores the farmer profile connected to a Supabase Auth user. A profile is created automatically when a new user signs up.

It stores the farmer's name, optional phone number, preferred language, location, farmer type, farming experience, primary crops, accessibility preferences, and profile completion status. The `role` is controlled by the application and is not editable by the farmer.

## Security rules

- Row Level Security is enabled.
- A signed-in user can read only the profile whose `id` matches their own Auth user ID.
- A signed-in user can update only their own profile.
- There is no public read policy.
- A database trigger rejects any attempt to change a profile role.
- Profile creation is performed by the protected signup trigger, not by a public insert policy.

Run `supabase/migrations/0002_profiles.sql` manually in the Supabase SQL Editor before testing signup or profile editing.
