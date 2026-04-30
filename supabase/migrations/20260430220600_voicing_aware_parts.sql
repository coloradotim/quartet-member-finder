drop view if exists public.quartet_discovery_listings;
drop view if exists public.singer_discovery_profiles;

alter table public.singer_profile_parts
  drop constraint singer_profile_parts_pkey;

alter table public.quartet_listing_parts
  drop constraint quartet_listing_parts_pkey;

alter table public.singer_profile_parts
  add column voicing text not null default 'TTBB';

alter table public.quartet_listing_parts
  add column voicing text not null default 'TTBB';

alter table public.singer_profile_parts
  alter column part type text
  using case part::text
    when 'tenor' then 'Tenor'
    when 'lead' then 'Lead'
    when 'baritone' then 'Baritone'
    when 'bass' then 'Bass'
    else part::text
  end;

alter table public.quartet_listing_parts
  alter column part type text
  using case part::text
    when 'tenor' then 'Tenor'
    when 'lead' then 'Lead'
    when 'baritone' then 'Baritone'
    when 'bass' then 'Bass'
    else part::text
  end;

alter table public.singer_profile_parts
  add constraint singer_profile_parts_voicing_part_check
  check (
    (voicing = 'TTBB' and part in ('Tenor', 'Lead', 'Baritone', 'Bass'))
    or (voicing = 'SATB' and part in ('Soprano', 'Alto', 'Tenor', 'Bass'))
    or (voicing = 'SSAA' and part in ('Soprano 1', 'Soprano 2', 'Alto 1', 'Alto 2'))
  ),
  add primary key (singer_profile_id, voicing, part);

alter table public.quartet_listing_parts
  add constraint quartet_listing_parts_voicing_part_check
  check (
    (voicing = 'TTBB' and part in ('Tenor', 'Lead', 'Baritone', 'Bass'))
    or (voicing = 'SATB' and part in ('Soprano', 'Alto', 'Tenor', 'Bass'))
    or (voicing = 'SSAA' and part in ('Soprano 1', 'Soprano 2', 'Alto 1', 'Alto 2'))
  ),
  add primary key (quartet_listing_id, voicing, part);

create view public.singer_discovery_profiles
as
select
  singer_profiles.id,
  singer_profiles.display_name,
  coalesce(
    array_agg(
      singer_profile_parts.voicing || ':' || singer_profile_parts.part
      order by singer_profile_parts.voicing, singer_profile_parts.part
    )
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
    array_agg(
      quartet_listing_parts.voicing || ':' || quartet_listing_parts.part
      order by quartet_listing_parts.voicing, quartet_listing_parts.part
    )
      filter (
        where quartet_listing_parts.status = 'covered'
      ),
    '{}'
  ) as parts_covered,
  coalesce(
    array_agg(
      quartet_listing_parts.voicing || ':' || quartet_listing_parts.part
      order by quartet_listing_parts.voicing, quartet_listing_parts.part
    )
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

grant select on table public.singer_discovery_profiles to anon, authenticated;
grant select on table public.quartet_discovery_listings to anon, authenticated;
