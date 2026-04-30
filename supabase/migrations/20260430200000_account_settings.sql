alter table public.account_profiles
add column preferred_distance_unit public.distance_unit not null default 'km';
