create extension if not exists pgcrypto;

create type public.barbershop_part as enum (
  'tenor',
  'lead',
  'baritone',
  'bass'
);

create type public.distance_unit as enum (
  'km',
  'mi'
);

create type public.location_precision as enum (
  'unknown',
  'country',
  'region',
  'locality',
  'postal_code',
  'geocoded'
);

create type public.quartet_part_status as enum (
  'covered',
  'needed'
);

create type public.contact_request_status as enum (
  'pending',
  'delivered',
  'responded',
  'declined',
  'closed'
);

create table public.account_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.singer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  bio text check (bio is null or char_length(bio) <= 2000),
  goals text[] not null default '{}',
  experience_level text check (
    experience_level is null
    or char_length(experience_level) <= 120
  ),
  availability text check (availability is null or char_length(availability) <= 500),
  travel_radius_km integer check (travel_radius_km is null or travel_radius_km between 0 and 10000),
  preferred_distance_unit public.distance_unit not null default 'km',
  is_visible boolean not null default false,
  is_active boolean not null default true,
  country_code text check (
    country_code is null
    or country_code ~ '^[A-Z]{2}$'
  ),
  country_name text check (country_name is null or char_length(country_name) <= 120),
  region text check (region is null or char_length(region) <= 120),
  locality text check (locality is null or char_length(locality) <= 120),
  postal_code_private text check (
    postal_code_private is null
    or char_length(postal_code_private) <= 40
  ),
  formatted_address_private text check (
    formatted_address_private is null
    or char_length(formatted_address_private) <= 500
  ),
  location_label_public text check (
    location_label_public is null
    or char_length(location_label_public) <= 160
  ),
  location_precision public.location_precision not null default 'unknown',
  latitude_private numeric(9, 6) check (
    latitude_private is null
    or latitude_private between -90 and 90
  ),
  longitude_private numeric(9, 6) check (
    longitude_private is null
    or longitude_private between -180 and 180
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.singer_profile_parts (
  singer_profile_id uuid not null references public.singer_profiles (id) on delete cascade,
  part public.barbershop_part not null,
  created_at timestamptz not null default now(),
  primary key (singer_profile_id, part)
);

create table public.quartet_listings (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  description text check (description is null or char_length(description) <= 2400),
  goals text[] not null default '{}',
  experience_level text check (
    experience_level is null
    or char_length(experience_level) <= 120
  ),
  availability text check (availability is null or char_length(availability) <= 500),
  travel_radius_km integer check (travel_radius_km is null or travel_radius_km between 0 and 10000),
  preferred_distance_unit public.distance_unit not null default 'km',
  is_visible boolean not null default false,
  is_active boolean not null default true,
  country_code text check (
    country_code is null
    or country_code ~ '^[A-Z]{2}$'
  ),
  country_name text check (country_name is null or char_length(country_name) <= 120),
  region text check (region is null or char_length(region) <= 120),
  locality text check (locality is null or char_length(locality) <= 120),
  postal_code_private text check (
    postal_code_private is null
    or char_length(postal_code_private) <= 40
  ),
  formatted_address_private text check (
    formatted_address_private is null
    or char_length(formatted_address_private) <= 500
  ),
  location_label_public text check (
    location_label_public is null
    or char_length(location_label_public) <= 160
  ),
  location_precision public.location_precision not null default 'unknown',
  latitude_private numeric(9, 6) check (
    latitude_private is null
    or latitude_private between -90 and 90
  ),
  longitude_private numeric(9, 6) check (
    longitude_private is null
    or longitude_private between -180 and 180
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quartet_listing_parts (
  quartet_listing_id uuid not null references public.quartet_listings (id) on delete cascade,
  part public.barbershop_part not null,
  status public.quartet_part_status not null,
  created_at timestamptz not null default now(),
  primary key (quartet_listing_id, part)
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid not null references auth.users (id) on delete cascade,
  recipient_user_id uuid references auth.users (id) on delete set null,
  singer_profile_id uuid references public.singer_profiles (id) on delete set null,
  quartet_listing_id uuid references public.quartet_listings (id) on delete set null,
  message_body text not null check (char_length(message_body) between 1 and 2000),
  status public.contact_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    num_nonnulls(singer_profile_id, quartet_listing_id) = 1
  ),
  check (
    recipient_user_id is null
    or recipient_user_id <> sender_user_id
  )
);

create index singer_profiles_visible_idx
  on public.singer_profiles (is_visible, is_active, country_code, region, locality);

create index quartet_listings_visible_idx
  on public.quartet_listings (is_visible, is_active, country_code, region, locality);

create index contact_requests_sender_idx
  on public.contact_requests (sender_user_id, created_at desc);

create index contact_requests_recipient_idx
  on public.contact_requests (recipient_user_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger account_profiles_set_updated_at
before update on public.account_profiles
for each row execute function public.set_updated_at();

create trigger singer_profiles_set_updated_at
before update on public.singer_profiles
for each row execute function public.set_updated_at();

create trigger quartet_listings_set_updated_at
before update on public.quartet_listings
for each row execute function public.set_updated_at();

create trigger contact_requests_set_updated_at
before update on public.contact_requests
for each row execute function public.set_updated_at();

create function public.set_contact_request_recipient()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_recipient uuid;
begin
  if new.singer_profile_id is not null then
    select user_id
    into target_recipient
    from public.singer_profiles
    where id = new.singer_profile_id
      and is_visible = true
      and is_active = true;
  elsif new.quartet_listing_id is not null then
    select owner_user_id
    into target_recipient
    from public.quartet_listings
    where id = new.quartet_listing_id
      and is_visible = true
      and is_active = true;
  end if;

  if target_recipient is null then
    raise exception 'contact target is not available';
  end if;

  if target_recipient = new.sender_user_id then
    raise exception 'sender cannot contact their own listing';
  end if;

  new.recipient_user_id = target_recipient;
  return new;
end;
$$;

create trigger contact_requests_set_recipient
before insert or update of singer_profile_id, quartet_listing_id, sender_user_id
on public.contact_requests
for each row execute function public.set_contact_request_recipient();

alter table public.account_profiles enable row level security;
alter table public.singer_profiles enable row level security;
alter table public.singer_profile_parts enable row level security;
alter table public.quartet_listings enable row level security;
alter table public.quartet_listing_parts enable row level security;
alter table public.contact_requests enable row level security;

create policy "Users can read their own account profile"
on public.account_profiles
for select
using (auth.uid() = user_id);

create policy "Users can create their own account profile"
on public.account_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own account profile"
on public.account_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own account profile"
on public.account_profiles
for delete
using (auth.uid() = user_id);

create policy "Users can read their own singer profile"
on public.singer_profiles
for select
using (auth.uid() = user_id);

create policy "Users can create their own singer profile"
on public.singer_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own singer profile"
on public.singer_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own singer profile"
on public.singer_profiles
for delete
using (auth.uid() = user_id);

create policy "Users can read their singer profile parts"
on public.singer_profile_parts
for select
using (
  exists (
    select 1
    from public.singer_profiles
    where singer_profiles.id = singer_profile_parts.singer_profile_id
      and singer_profiles.user_id = auth.uid()
  )
);

create policy "Users can manage their singer profile parts"
on public.singer_profile_parts
for all
using (
  exists (
    select 1
    from public.singer_profiles
    where singer_profiles.id = singer_profile_parts.singer_profile_id
      and singer_profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.singer_profiles
    where singer_profiles.id = singer_profile_parts.singer_profile_id
      and singer_profiles.user_id = auth.uid()
  )
);

create policy "Users can read their own quartet listings"
on public.quartet_listings
for select
using (auth.uid() = owner_user_id);

create policy "Users can create their own quartet listings"
on public.quartet_listings
for insert
with check (auth.uid() = owner_user_id);

create policy "Users can update their own quartet listings"
on public.quartet_listings
for update
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "Users can delete their own quartet listings"
on public.quartet_listings
for delete
using (auth.uid() = owner_user_id);

create policy "Users can read their quartet listing parts"
on public.quartet_listing_parts
for select
using (
  exists (
    select 1
    from public.quartet_listings
    where quartet_listings.id = quartet_listing_parts.quartet_listing_id
      and quartet_listings.owner_user_id = auth.uid()
  )
);

create policy "Users can manage their quartet listing parts"
on public.quartet_listing_parts
for all
using (
  exists (
    select 1
    from public.quartet_listings
    where quartet_listings.id = quartet_listing_parts.quartet_listing_id
      and quartet_listings.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.quartet_listings
    where quartet_listings.id = quartet_listing_parts.quartet_listing_id
      and quartet_listings.owner_user_id = auth.uid()
  )
);

create policy "Contact participants can read requests"
on public.contact_requests
for select
using (
  auth.uid() = sender_user_id
  or auth.uid() = recipient_user_id
);

create policy "Authenticated users can create contact requests"
on public.contact_requests
for insert
with check (auth.uid() = sender_user_id);

create policy "Recipients can update contact request status"
on public.contact_requests
for update
using (auth.uid() = recipient_user_id)
with check (auth.uid() = recipient_user_id);

create view public.singer_discovery_profiles
as
select
  singer_profiles.id,
  singer_profiles.display_name,
  coalesce(
    array_agg(singer_profile_parts.part order by singer_profile_parts.part)
      filter (where singer_profile_parts.part is not null),
    '{}'
  ) as parts,
  singer_profiles.goals,
  singer_profiles.experience_level,
  singer_profiles.availability,
  singer_profiles.travel_radius_km,
  singer_profiles.preferred_distance_unit,
  singer_profiles.country_code,
  singer_profiles.country_name,
  singer_profiles.region,
  singer_profiles.locality,
  singer_profiles.location_label_public,
  singer_profiles.updated_at
from public.singer_profiles
left join public.singer_profile_parts
  on singer_profile_parts.singer_profile_id = singer_profiles.id
where singer_profiles.is_visible = true
  and singer_profiles.is_active = true
group by singer_profiles.id;

create view public.quartet_discovery_listings
as
select
  quartet_listings.id,
  quartet_listings.name,
  quartet_listings.description,
  coalesce(
    array_agg(quartet_listing_parts.part order by quartet_listing_parts.part)
      filter (
        where quartet_listing_parts.status = 'covered'
      ),
    '{}'
  ) as parts_covered,
  coalesce(
    array_agg(quartet_listing_parts.part order by quartet_listing_parts.part)
      filter (
        where quartet_listing_parts.status = 'needed'
      ),
    '{}'
  ) as parts_needed,
  quartet_listings.goals,
  quartet_listings.experience_level,
  quartet_listings.availability,
  quartet_listings.travel_radius_km,
  quartet_listings.preferred_distance_unit,
  quartet_listings.country_code,
  quartet_listings.country_name,
  quartet_listings.region,
  quartet_listings.locality,
  quartet_listings.location_label_public,
  quartet_listings.updated_at
from public.quartet_listings
left join public.quartet_listing_parts
  on quartet_listing_parts.quartet_listing_id = quartet_listings.id
where quartet_listings.is_visible = true
  and quartet_listings.is_active = true
group by quartet_listings.id;

revoke all on table public.account_profiles from anon, authenticated;
revoke all on table public.singer_profiles from anon, authenticated;
revoke all on table public.singer_profile_parts from anon, authenticated;
revoke all on table public.quartet_listings from anon, authenticated;
revoke all on table public.quartet_listing_parts from anon, authenticated;
revoke all on table public.contact_requests from anon, authenticated;

grant select, insert, update, delete on table public.account_profiles to authenticated;
grant select, insert, update, delete on table public.singer_profiles to authenticated;
grant select, insert, update, delete on table public.singer_profile_parts to authenticated;
grant select, insert, update, delete on table public.quartet_listings to authenticated;
grant select, insert, update, delete on table public.quartet_listing_parts to authenticated;
grant select, insert on table public.contact_requests to authenticated;
grant update (status) on table public.contact_requests to authenticated;

grant select on table public.singer_discovery_profiles to anon, authenticated;
grant select on table public.quartet_discovery_listings to anon, authenticated;

revoke all on function public.set_updated_at() from public;
revoke all on function public.set_contact_request_recipient() from public;
