-- Quartet Member Finder demo seed data.
--
-- Intended for local development and safe staging/preview validation only.
-- Do not run this against production data.

begin;

delete from public.contact_requests
where sender_user_id in (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000103',
  '00000000-0000-4000-8000-000000000104',
  '00000000-0000-4000-8000-000000000105',
  '00000000-0000-4000-8000-000000000106'
)
or recipient_user_id in (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000103',
  '00000000-0000-4000-8000-000000000104',
  '00000000-0000-4000-8000-000000000105',
  '00000000-0000-4000-8000-000000000106'
);

delete from auth.users
where id in (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000103',
  '00000000-0000-4000-8000-000000000104',
  '00000000-0000-4000-8000-000000000105',
  '00000000-0000-4000-8000-000000000106'
);

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    'authenticated',
    'authenticated',
    'demo.avery.tenor@example.invalid',
    crypt('quartet-demo-password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Avery Demo"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'authenticated',
    'authenticated',
    'demo.morgan.lead@example.invalid',
    crypt('quartet-demo-password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Morgan Demo"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    'authenticated',
    'authenticated',
    'demo.priya.bari@example.invalid',
    crypt('quartet-demo-password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Priya Demo"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    'authenticated',
    'authenticated',
    'demo.noah.bass@example.invalid',
    crypt('quartet-demo-password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Noah Demo"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000105',
    'authenticated',
    'authenticated',
    'demo.hidden.singer@example.invalid',
    crypt('quartet-demo-password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Hidden Demo"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000106',
    'authenticated',
    'authenticated',
    'demo.quartet.owner@example.invalid',
    crypt('quartet-demo-password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Quartet Owner Demo"}'::jsonb
  );

insert into public.account_profiles (
  user_id,
  display_name,
  onboarding_completed_at,
  onboarding_last_choice,
  preferred_distance_unit
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    'Avery Demo',
    now(),
    'my-singer-profile',
    'mi'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'Morgan Demo',
    now(),
    'find-quartet-openings',
    'km'
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    'Priya Demo',
    now(),
    'my-singer-profile',
    'km'
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    'Noah Demo',
    now(),
    'find-singers-as-singer',
    'mi'
  ),
  (
    '00000000-0000-4000-8000-000000000105',
    'Hidden Demo',
    now(),
    'browse-for-now',
    'km'
  ),
  (
    '00000000-0000-4000-8000-000000000106',
    'Quartet Owner Demo',
    now(),
    'quartet-mode-listing',
    'km'
  );

insert into public.singer_profiles (
  id,
  user_id,
  display_name,
  bio,
  goals,
  experience_level,
  availability,
  travel_radius_km,
  preferred_distance_unit,
  is_visible,
  is_active,
  country_code,
  country_name,
  region,
  locality,
  postal_code_private,
  location_label_public,
  location_precision
)
values
  (
    '10000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000101',
    'Avery Demo',
    'Demo tenor who likes casual tags, pickup singing, and helping quartets test contact flows.',
    array['pickup', 'casual'],
    'Experienced chorus singer',
    'Weeknights and occasional convention weekends',
    80,
    'mi',
    true,
    true,
    'US',
    'United States',
    'Colorado',
    'Fort Collins',
    '80521-DEMO',
    'Fort Collins, CO area',
    'postal_code'
  ),
  (
    '10000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000102',
    'Morgan Demo',
    'Demo lead open to regular rehearsals and contest preparation.',
    array['regular_rehearsal', 'contest'],
    'Chapter quartet experience',
    'Sunday afternoons or Tuesday evenings',
    60,
    'km',
    true,
    true,
    'CA',
    'Canada',
    'Ontario',
    'Toronto',
    'M5V-DEMO',
    'Toronto, Ontario area',
    'postal_code'
  ),
  (
    '10000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000103',
    'Priya Demo',
    'Demo baritone with flexible goals for learning, pickup singing, and coaching weekends.',
    array['learning', 'pickup'],
    'Returning singer',
    'Monthly rehearsals and festival weekends',
    40,
    'km',
    true,
    true,
    'GB',
    'United Kingdom',
    'England',
    'Manchester',
    'M1-DEMO',
    'Manchester, UK area',
    'postal_code'
  ),
  (
    '10000000-0000-4000-8000-000000000104',
    '00000000-0000-4000-8000-000000000104',
    'Noah Demo',
    'Demo bass comfortable with casual singing, afterglows, and short-notice fill-ins.',
    array['casual', 'paid_gigs'],
    'Gig-ready bass',
    'Most weekends with notice',
    120,
    'mi',
    true,
    true,
    'AU',
    'Australia',
    'Victoria',
    'Melbourne',
    '3000-DEMO',
    'Melbourne, Victoria area',
    'postal_code'
  ),
  (
    '10000000-0000-4000-8000-000000000105',
    '00000000-0000-4000-8000-000000000105',
    'Hidden Singer Demo',
    'Hidden demo profile for visibility-filter testing.',
    array['contest'],
    'Hidden profile',
    'Not publicly visible',
    25,
    'km',
    false,
    true,
    'IE',
    'Ireland',
    'Leinster',
    'Dublin',
    'D02-DEMO',
    'Dublin, Ireland area',
    'postal_code'
  );

insert into public.singer_profile_parts (singer_profile_id, part)
values
  ('10000000-0000-4000-8000-000000000101', 'tenor'),
  ('10000000-0000-4000-8000-000000000102', 'lead'),
  ('10000000-0000-4000-8000-000000000103', 'baritone'),
  ('10000000-0000-4000-8000-000000000103', 'lead'),
  ('10000000-0000-4000-8000-000000000104', 'bass'),
  ('10000000-0000-4000-8000-000000000105', 'lead');

insert into public.quartet_listings (
  id,
  owner_user_id,
  name,
  description,
  goals,
  experience_level,
  availability,
  travel_radius_km,
  preferred_distance_unit,
  is_visible,
  is_active,
  country_code,
  country_name,
  region,
  locality,
  postal_code_private,
  location_label_public,
  location_precision
)
values
  (
    '20000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000106',
    'Demo Front Range Pickup',
    'Visible demo quartet opening seeking a lead for pickup singing and local events.',
    array['pickup', 'casual'],
    'Friendly chapter-level quartet',
    'Two weeknight rehearsals per month',
    100,
    'mi',
    true,
    true,
    'US',
    'United States',
    'Colorado',
    'Denver',
    '80202-DEMO',
    'Denver, CO area',
    'postal_code'
  ),
  (
    '20000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000102',
    'Demo Harbour Chords',
    'Visible Canadian demo listing looking for a bass and baritone for regular rehearsals.',
    array['regular_rehearsal', 'contest'],
    'Contest-curious quartet',
    'Weekly Sunday rehearsals',
    90,
    'km',
    true,
    true,
    'CA',
    'Canada',
    'British Columbia',
    'Vancouver',
    'V6B-DEMO',
    'Vancouver, BC area',
    'postal_code'
  ),
  (
    '20000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000103',
    'Demo Liffey Tags',
    'Visible Irish demo quartet opening for a tenor, useful for non-US map and search checks.',
    array['learning', 'pickup'],
    'Developing quartet',
    'Monthly Saturday rehearsals',
    50,
    'km',
    true,
    true,
    'IE',
    'Ireland',
    'Leinster',
    'Dublin',
    'D02-DEMO',
    'Dublin, Ireland area',
    'postal_code'
  ),
  (
    '20000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000104',
    'Hidden Demo Quartet',
    'Hidden demo listing for visibility-filter testing.',
    array['contest'],
    'Hidden listing',
    'Not publicly visible',
    30,
    'km',
    false,
    true,
    'NZ',
    'New Zealand',
    'Auckland',
    'Auckland',
    '1010-DEMO',
    'Auckland, New Zealand area',
    'postal_code'
  );

insert into public.quartet_listing_parts (quartet_listing_id, part, status)
values
  ('20000000-0000-4000-8000-000000000201', 'tenor', 'covered'),
  ('20000000-0000-4000-8000-000000000201', 'baritone', 'covered'),
  ('20000000-0000-4000-8000-000000000201', 'bass', 'covered'),
  ('20000000-0000-4000-8000-000000000201', 'lead', 'needed'),
  ('20000000-0000-4000-8000-000000000202', 'tenor', 'covered'),
  ('20000000-0000-4000-8000-000000000202', 'lead', 'covered'),
  ('20000000-0000-4000-8000-000000000202', 'baritone', 'needed'),
  ('20000000-0000-4000-8000-000000000202', 'bass', 'needed'),
  ('20000000-0000-4000-8000-000000000203', 'lead', 'covered'),
  ('20000000-0000-4000-8000-000000000203', 'baritone', 'covered'),
  ('20000000-0000-4000-8000-000000000203', 'bass', 'covered'),
  ('20000000-0000-4000-8000-000000000203', 'tenor', 'needed'),
  ('20000000-0000-4000-8000-000000000204', 'lead', 'covered'),
  ('20000000-0000-4000-8000-000000000204', 'tenor', 'needed');

insert into public.contact_requests (
  id,
  sender_user_id,
  singer_profile_id,
  message_body,
  status
)
values (
  '30000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000106',
  '10000000-0000-4000-8000-000000000101',
  'Demo contact request for a visible singer profile. This message uses fake data only.',
  'pending'
);

insert into public.contact_requests (
  id,
  sender_user_id,
  quartet_listing_id,
  message_body,
  status
)
values (
  '30000000-0000-4000-8000-000000000302',
  '00000000-0000-4000-8000-000000000101',
  '20000000-0000-4000-8000-000000000203',
  'Demo contact request for a visible quartet listing. This message uses fake data only.',
  'delivered'
);

commit;
