create or replace function public.distance_between_coordinates_km(
  origin_latitude double precision,
  origin_longitude double precision,
  destination_latitude double precision,
  destination_longitude double precision
)
returns double precision
language sql
immutable
strict
as $$
  select 6371.0088 * 2 * atan2(
    sqrt(
      power(sin(radians(destination_latitude - origin_latitude) / 2), 2)
      + cos(radians(origin_latitude))
        * cos(radians(destination_latitude))
        * power(sin(radians(destination_longitude - origin_longitude) / 2), 2)
    ),
    sqrt(
      greatest(
        0,
        1 - (
          power(sin(radians(destination_latitude - origin_latitude) / 2), 2)
          + cos(radians(origin_latitude))
            * cos(radians(destination_latitude))
            * power(sin(radians(destination_longitude - origin_longitude) / 2), 2)
        )
      )
    )
  );
$$;

create index if not exists singer_profiles_radius_search_idx
  on public.singer_profiles (is_visible, is_active, latitude_private, longitude_private)
  where latitude_private is not null
    and longitude_private is not null;

create index if not exists quartet_listings_radius_search_idx
  on public.quartet_listings (is_visible, is_active, latitude_private, longitude_private)
  where latitude_private is not null
    and longitude_private is not null;

create or replace function public.search_singer_discovery_profiles(
  search_latitude double precision,
  search_longitude double precision,
  radius_km double precision,
  goal_filter text default null
)
returns table (
  id uuid,
  display_name text,
  parts text[],
  goals text[],
  experience_level text,
  availability text,
  travel_radius_km integer,
  preferred_distance_unit public.distance_unit,
  country_code text,
  country_name text,
  region text,
  locality text,
  location_label_public text,
  updated_at timestamptz,
  distance_km double precision
)
language sql
stable
security definer
set search_path = public
as $$
  with visible_profiles as (
    select
      singer_profiles.*,
      public.distance_between_coordinates_km(
        search_latitude,
        search_longitude,
        singer_profiles.latitude_private::double precision,
        singer_profiles.longitude_private::double precision
      ) as calculated_distance_km
    from public.singer_profiles
    where singer_profiles.is_visible = true
      and singer_profiles.is_active = true
      and singer_profiles.latitude_private is not null
      and singer_profiles.longitude_private is not null
      and radius_km > 0
      and search_latitude between -90 and 90
      and search_longitude between -180 and 180
      and (
        goal_filter is null
        or singer_profiles.goals @> array[goal_filter]
      )
  )
  select
    visible_profiles.id,
    visible_profiles.display_name,
    coalesce(
      array_agg(
        singer_profile_parts.voicing || ':' || singer_profile_parts.part
        order by singer_profile_parts.voicing, singer_profile_parts.part
      )
        filter (where singer_profile_parts.part is not null),
      '{}'
    ) as parts,
    visible_profiles.goals,
    visible_profiles.experience_level,
    visible_profiles.availability,
    visible_profiles.travel_radius_km,
    visible_profiles.preferred_distance_unit,
    visible_profiles.country_code,
    visible_profiles.country_name,
    visible_profiles.region,
    visible_profiles.locality,
    visible_profiles.location_label_public,
    visible_profiles.updated_at,
    visible_profiles.calculated_distance_km as distance_km
  from visible_profiles
  left join public.singer_profile_parts
    on singer_profile_parts.singer_profile_id = visible_profiles.id
  where visible_profiles.calculated_distance_km <= radius_km
  group by
    visible_profiles.id,
    visible_profiles.display_name,
    visible_profiles.goals,
    visible_profiles.experience_level,
    visible_profiles.availability,
    visible_profiles.travel_radius_km,
    visible_profiles.preferred_distance_unit,
    visible_profiles.country_code,
    visible_profiles.country_name,
    visible_profiles.region,
    visible_profiles.locality,
    visible_profiles.location_label_public,
    visible_profiles.updated_at,
    visible_profiles.calculated_distance_km
  order by visible_profiles.calculated_distance_km asc, visible_profiles.updated_at desc;
$$;

create or replace function public.search_quartet_discovery_listings(
  search_latitude double precision,
  search_longitude double precision,
  radius_km double precision,
  goal_filter text default null
)
returns table (
  id uuid,
  name text,
  description text,
  parts_covered text[],
  parts_needed text[],
  goals text[],
  experience_level text,
  availability text,
  travel_radius_km integer,
  preferred_distance_unit public.distance_unit,
  country_code text,
  country_name text,
  region text,
  locality text,
  location_label_public text,
  updated_at timestamptz,
  distance_km double precision
)
language sql
stable
security definer
set search_path = public
as $$
  with visible_listings as (
    select
      quartet_listings.*,
      public.distance_between_coordinates_km(
        search_latitude,
        search_longitude,
        quartet_listings.latitude_private::double precision,
        quartet_listings.longitude_private::double precision
      ) as calculated_distance_km
    from public.quartet_listings
    where quartet_listings.is_visible = true
      and quartet_listings.is_active = true
      and quartet_listings.latitude_private is not null
      and quartet_listings.longitude_private is not null
      and radius_km > 0
      and search_latitude between -90 and 90
      and search_longitude between -180 and 180
      and (
        goal_filter is null
        or quartet_listings.goals @> array[goal_filter]
      )
  )
  select
    visible_listings.id,
    visible_listings.name,
    visible_listings.description,
    coalesce(
      array_agg(
        quartet_listing_parts.voicing || ':' || quartet_listing_parts.part
        order by quartet_listing_parts.voicing, quartet_listing_parts.part
      )
        filter (where quartet_listing_parts.status = 'covered'),
      '{}'
    ) as parts_covered,
    coalesce(
      array_agg(
        quartet_listing_parts.voicing || ':' || quartet_listing_parts.part
        order by quartet_listing_parts.voicing, quartet_listing_parts.part
      )
        filter (where quartet_listing_parts.status = 'needed'),
      '{}'
    ) as parts_needed,
    visible_listings.goals,
    visible_listings.experience_level,
    visible_listings.availability,
    visible_listings.travel_radius_km,
    visible_listings.preferred_distance_unit,
    visible_listings.country_code,
    visible_listings.country_name,
    visible_listings.region,
    visible_listings.locality,
    visible_listings.location_label_public,
    visible_listings.updated_at,
    visible_listings.calculated_distance_km as distance_km
  from visible_listings
  left join public.quartet_listing_parts
    on quartet_listing_parts.quartet_listing_id = visible_listings.id
  where visible_listings.calculated_distance_km <= radius_km
  group by
    visible_listings.id,
    visible_listings.name,
    visible_listings.description,
    visible_listings.goals,
    visible_listings.experience_level,
    visible_listings.availability,
    visible_listings.travel_radius_km,
    visible_listings.preferred_distance_unit,
    visible_listings.country_code,
    visible_listings.country_name,
    visible_listings.region,
    visible_listings.locality,
    visible_listings.location_label_public,
    visible_listings.updated_at,
    visible_listings.calculated_distance_km
  order by visible_listings.calculated_distance_km asc, visible_listings.updated_at desc;
$$;

revoke all on function public.distance_between_coordinates_km(
  double precision,
  double precision,
  double precision,
  double precision
) from public;
revoke all on function public.search_singer_discovery_profiles(
  double precision,
  double precision,
  double precision,
  text
) from public;
revoke all on function public.search_quartet_discovery_listings(
  double precision,
  double precision,
  double precision,
  text
) from public;

grant execute on function public.search_singer_discovery_profiles(
  double precision,
  double precision,
  double precision,
  text
) to authenticated;
grant execute on function public.search_quartet_discovery_listings(
  double precision,
  double precision,
  double precision,
  text
) to authenticated;
