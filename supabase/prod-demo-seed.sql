-- Quartet Member Finder production demo data.
--
-- Batch: QMF_PROD_DEMO_20260501
--
-- This file is intentionally for production manual QA. It only removes and
-- recreates users whose IDs and emails belong to this demo batch.

begin;

delete from public.contact_requests
where sender_user_id in (
  select id from auth.users where email like 'qmf-demo+%@example.invalid'
)
or recipient_user_id in (
  select id from auth.users where email like 'qmf-demo+%@example.invalid'
)
or message_body like 'QMF_PROD_DEMO_20260501:%';

delete from auth.users
where id in (
  '72000000-0000-4000-8000-000000000001',
  '72000000-0000-4000-8000-000000000002',
  '72000000-0000-4000-8000-000000000003',
  '72000000-0000-4000-8000-000000000004',
  '72000000-0000-4000-8000-000000000005',
  '72000000-0000-4000-8000-000000000006',
  '72000000-0000-4000-8000-000000000007',
  '72000000-0000-4000-8000-000000000008',
  '72000000-0000-4000-8000-000000000009',
  '72000000-0000-4000-8000-000000000010',
  '72000000-0000-4000-8000-000000000011',
  '72000000-0000-4000-8000-000000000012',
  '72000000-0000-4000-8000-000000000013',
  '72000000-0000-4000-8000-000000000014',
  '72000000-0000-4000-8000-000000000015',
  '72000000-0000-4000-8000-000000000016',
  '72000000-0000-4000-8000-000000000017',
  '72000000-0000-4000-8000-000000000018'
)
or email like 'qmf-demo+%@example.invalid';

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
  ('72000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'qmf-demo+fort-collins-tenor@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Avery Tenor", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'qmf-demo+denver-lead@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Jordan Lead", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'qmf-demo+chicago-bari@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Casey Bari", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'qmf-demo+boston-bass@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Riley Bass", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'qmf-demo+toronto-lead@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Morgan Lead", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'qmf-demo+vancouver-tenor@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Harper Tenor", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'qmf-demo+manchester-bass@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Ellis Bass", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'qmf-demo+dublin-bari@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Rowan Bari", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000009', 'authenticated', 'authenticated', 'qmf-demo+melbourne-satb-soprano@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Taylor Soprano", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000010', 'authenticated', 'authenticated', 'qmf-demo+auckland-ssaa-alto@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Quinn Alto", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000011', 'authenticated', 'authenticated', 'qmf-demo+berlin-satb-alto@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Alex Alto", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000012', 'authenticated', 'authenticated', 'qmf-demo+stockholm-hidden@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Hidden Singer", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000013', 'authenticated', 'authenticated', 'qmf-demo+front-range-owner@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Front Range Owner", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000014', 'authenticated', 'authenticated', 'qmf-demo+great-lakes-owner@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Great Lakes Owner", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000015', 'authenticated', 'authenticated', 'qmf-demo+uk-owner@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo UK Owner", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000016', 'authenticated', 'authenticated', 'qmf-demo+anz-owner@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo ANZ Owner", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000017', 'authenticated', 'authenticated', 'qmf-demo+satb-owner@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo SATB Owner", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb),
  ('72000000-0000-4000-8000-000000000018', 'authenticated', 'authenticated', 'qmf-demo+hidden-listing-owner@example.invalid', crypt('qmf-production-demo-password', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb, '{"name": "QMF Demo Hidden Listing Owner", "test_batch_id": "QMF_PROD_DEMO_20260501"}'::jsonb);

insert into public.account_profiles (
  user_id,
  display_name,
  onboarding_completed_at,
  onboarding_last_choice,
  preferred_distance_unit
)
select
  id,
  raw_user_meta_data->>'name',
  now(),
  case
    when email like '%owner@example.invalid' then 'quartet-profile-first'
    else 'singer-profile-first'
  end,
  case
    when email like '%fort-collins%' or email like '%denver%' or email like '%chicago%' or email like '%boston%' then 'mi'::public.distance_unit
    else 'km'::public.distance_unit
  end
from auth.users
where email like 'qmf-demo+%@example.invalid';

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
  location_precision,
  latitude_private,
  longitude_private
)
values
  ('72000000-1000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001', 'QMF Demo Avery Tenor', 'QMF_PROD_DEMO_20260501: Visible TTBB tenor near Fort Collins for pickup and local search testing.', array['pickup', 'casual'], 'Experienced chorus singer', 'Weeknights and convention weekends', 80, 'mi', true, true, 'US', 'United States', 'Colorado', 'Fort Collins', '80521-DEMO', 'Fort Collins, CO area', 'postal_code', 40.585300, -105.084400),
  ('72000000-1000-4000-8000-000000000002', '72000000-0000-4000-8000-000000000002', 'QMF Demo Jordan Lead', 'QMF_PROD_DEMO_20260501: Visible lead near Denver for Front Range distance and map testing.', array['regular_rehearsal', 'contest'], 'Chapter quartet experience', 'Tuesday evenings or Saturday mornings', 65, 'mi', true, true, 'US', 'United States', 'Colorado', 'Denver', '80202-DEMO', 'Denver, CO area', 'postal_code', 39.739200, -104.990300),
  ('72000000-1000-4000-8000-000000000003', '72000000-0000-4000-8000-000000000003', 'QMF Demo Casey Baritone', 'QMF_PROD_DEMO_20260501: Visible baritone in Chicago for no-result and regional search scenarios.', array['pickup', 'learning'], 'Returning singer', 'Monthly weekends', 40, 'mi', true, true, 'US', 'United States', 'Illinois', 'Chicago', '60601-DEMO', 'Chicago, IL area', 'postal_code', 41.878100, -87.629800),
  ('72000000-1000-4000-8000-000000000004', '72000000-0000-4000-8000-000000000004', 'QMF Demo Riley Bass', 'QMF_PROD_DEMO_20260501: Visible bass in Boston for distance and contact relay testing.', array['paid_gigs', 'contest'], 'Experienced quartet singer', 'Flexible with advance notice', 120, 'mi', true, true, 'US', 'United States', 'Massachusetts', 'Boston', '02108-DEMO', 'Boston, MA area', 'postal_code', 42.360100, -71.058900),
  ('72000000-1000-4000-8000-000000000005', '72000000-0000-4000-8000-000000000005', 'QMF Demo Morgan Lead', 'QMF_PROD_DEMO_20260501: Visible lead in Toronto using kilometers.', array['regular_rehearsal', 'learning'], 'Chapter singer', 'Sunday afternoons', 75, 'km', true, true, 'CA', 'Canada', 'Ontario', 'Toronto', 'M5V-DEMO', 'Toronto, Ontario area', 'postal_code', 43.653200, -79.383200),
  ('72000000-1000-4000-8000-000000000006', '72000000-0000-4000-8000-000000000006', 'QMF Demo Harper Tenor', 'QMF_PROD_DEMO_20260501: Visible tenor in Vancouver for Canadian west coast results.', array['casual', 'pickup'], 'Longtime chorus singer', 'Weekends', 90, 'km', true, true, 'CA', 'Canada', 'British Columbia', 'Vancouver', 'V6B-DEMO', 'Vancouver, BC area', 'postal_code', 49.282700, -123.120700),
  ('72000000-1000-4000-8000-000000000007', '72000000-0000-4000-8000-000000000007', 'QMF Demo Ellis Bass', 'QMF_PROD_DEMO_20260501: Visible bass in Manchester for UK search testing.', array['contest', 'regular_rehearsal'], 'Experienced chorus singer', 'Thursday evenings', 100, 'km', true, true, 'GB', 'United Kingdom', 'England', 'Manchester', 'M1 DEMO', 'Manchester, UK area', 'postal_code', 53.480800, -2.242600),
  ('72000000-1000-4000-8000-000000000008', '72000000-0000-4000-8000-000000000008', 'QMF Demo Rowan Baritone', 'QMF_PROD_DEMO_20260501: Visible baritone in Dublin for Ireland/global behavior.', array['pickup', 'casual'], 'Returning singer', 'Occasional weekends', 50, 'km', true, true, 'IE', 'Ireland', 'Leinster', 'Dublin', 'D02-DEMO', 'Dublin, Ireland area', 'postal_code', 53.349800, -6.260300),
  ('72000000-1000-4000-8000-000000000009', '72000000-0000-4000-8000-000000000009', 'QMF Demo Taylor Soprano', 'QMF_PROD_DEMO_20260501: Visible SATB soprano in Melbourne.', array['learning', 'regular_rehearsal'], 'New quartet singer', 'Monday evenings', 60, 'km', true, true, 'AU', 'Australia', 'Victoria', 'Melbourne', '3000-DEMO', 'Melbourne, VIC area', 'postal_code', -37.813600, 144.963100),
  ('72000000-1000-4000-8000-000000000010', '72000000-0000-4000-8000-000000000010', 'QMF Demo Quinn Alto', 'QMF_PROD_DEMO_20260501: Visible SSAA alto in Auckland.', array['casual', 'learning'], 'Community singer', 'Alternating Saturdays', 45, 'km', true, true, 'NZ', 'New Zealand', 'Auckland', 'Auckland', '1010-DEMO', 'Auckland, New Zealand area', 'postal_code', -36.850900, 174.764500),
  ('72000000-1000-4000-8000-000000000011', '72000000-0000-4000-8000-000000000011', 'QMF Demo Alex Alto', 'QMF_PROD_DEMO_20260501: Visible SATB alto in Berlin for continental Europe search testing.', array['pickup', 'contest'], 'Experienced ensemble singer', 'Weeknights', 70, 'km', true, true, 'DE', 'Germany', 'Berlin', 'Berlin', '10115-DEMO', 'Berlin, Germany area', 'postal_code', 52.520000, 13.405000),
  ('72000000-1000-4000-8000-000000000012', '72000000-0000-4000-8000-000000000012', 'QMF Demo Hidden Singer', 'QMF_PROD_DEMO_20260501: Hidden singer that should not appear in public discovery.', array['pickup'], 'Hidden demo profile', 'Hidden from search', 30, 'km', false, true, 'SE', 'Sweden', 'Stockholm County', 'Stockholm', '111 DEMO', 'Stockholm, Sweden area', 'postal_code', 59.329300, 18.068600);

insert into public.singer_profile_parts (singer_profile_id, voicing, part)
values
  ('72000000-1000-4000-8000-000000000001', 'TTBB', 'Tenor'),
  ('72000000-1000-4000-8000-000000000002', 'TTBB', 'Lead'),
  ('72000000-1000-4000-8000-000000000003', 'TTBB', 'Baritone'),
  ('72000000-1000-4000-8000-000000000004', 'TTBB', 'Bass'),
  ('72000000-1000-4000-8000-000000000005', 'TTBB', 'Lead'),
  ('72000000-1000-4000-8000-000000000006', 'TTBB', 'Tenor'),
  ('72000000-1000-4000-8000-000000000007', 'TTBB', 'Bass'),
  ('72000000-1000-4000-8000-000000000008', 'TTBB', 'Baritone'),
  ('72000000-1000-4000-8000-000000000009', 'SATB', 'Soprano'),
  ('72000000-1000-4000-8000-000000000010', 'SSAA', 'Alto 1'),
  ('72000000-1000-4000-8000-000000000011', 'SATB', 'Alto'),
  ('72000000-1000-4000-8000-000000000012', 'TTBB', 'Lead');

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
  location_precision,
  latitude_private,
  longitude_private
)
values
  ('72000000-2000-4000-8000-000000000013', '72000000-0000-4000-8000-000000000013', 'QMF Demo Front Range Pickup Quartet', 'QMF_PROD_DEMO_20260501: Visible Colorado TTBB listing seeking baritone and bass for map and contact testing.', array['pickup', 'casual'], 'Mixed chorus and quartet experience', 'Monthly Saturdays', 95, 'mi', true, true, 'US', 'United States', 'Colorado', 'Fort Collins', '80525-DEMO', 'Fort Collins, CO area', 'postal_code', 40.585300, -105.084400),
  ('72000000-2000-4000-8000-000000000014', '72000000-0000-4000-8000-000000000014', 'QMF Demo Great Lakes Contest Quartet', 'QMF_PROD_DEMO_20260501: Visible Midwest TTBB listing seeking tenor.', array['contest', 'regular_rehearsal'], 'Contest-oriented', 'Weekly Wednesdays', 160, 'mi', true, true, 'US', 'United States', 'Illinois', 'Chicago', '60611-DEMO', 'Chicago, IL area', 'postal_code', 41.878100, -87.629800),
  ('72000000-2000-4000-8000-000000000015', '72000000-0000-4000-8000-000000000015', 'QMF Demo Manchester Social Quartet', 'QMF_PROD_DEMO_20260501: Visible UK quartet seeking lead and baritone.', array['casual', 'learning'], 'Developing quartet', 'Thursday evenings', 80, 'km', true, true, 'GB', 'United Kingdom', 'England', 'Manchester', 'M2 DEMO', 'Manchester, UK area', 'postal_code', 53.480800, -2.242600),
  ('72000000-2000-4000-8000-000000000016', '72000000-0000-4000-8000-000000000016', 'QMF Demo Melbourne Learning Quartet', 'QMF_PROD_DEMO_20260501: Visible SSAA/SATB-adjacent test listing in Australia.', array['learning', 'regular_rehearsal'], 'New quartet', 'Every other Sunday', 70, 'km', true, true, 'AU', 'Australia', 'Victoria', 'Melbourne', '3004-DEMO', 'Melbourne, VIC area', 'postal_code', -37.813600, 144.963100),
  ('72000000-2000-4000-8000-000000000017', '72000000-0000-4000-8000-000000000017', 'QMF Demo Berlin SATB Quartet', 'QMF_PROD_DEMO_20260501: Visible SATB listing seeking bass.', array['pickup', 'contest'], 'Experienced mixed ensemble', 'Weeknights', 75, 'km', true, true, 'DE', 'Germany', 'Berlin', 'Berlin', '10117-DEMO', 'Berlin, Germany area', 'postal_code', 52.520000, 13.405000),
  ('72000000-2000-4000-8000-000000000018', '72000000-0000-4000-8000-000000000018', 'QMF Demo Hidden Quartet Listing', 'QMF_PROD_DEMO_20260501: Hidden listing that should not appear in public discovery.', array['pickup'], 'Hidden demo listing', 'Hidden from search', 40, 'km', false, true, 'NZ', 'New Zealand', 'Auckland', 'Auckland', '1011-DEMO', 'Auckland, New Zealand area', 'postal_code', -36.850900, 174.764500);

insert into public.quartet_listing_parts (quartet_listing_id, voicing, part, status)
values
  ('72000000-2000-4000-8000-000000000013', 'TTBB', 'Tenor', 'covered'),
  ('72000000-2000-4000-8000-000000000013', 'TTBB', 'Lead', 'covered'),
  ('72000000-2000-4000-8000-000000000013', 'TTBB', 'Baritone', 'needed'),
  ('72000000-2000-4000-8000-000000000013', 'TTBB', 'Bass', 'needed'),
  ('72000000-2000-4000-8000-000000000014', 'TTBB', 'Tenor', 'needed'),
  ('72000000-2000-4000-8000-000000000014', 'TTBB', 'Lead', 'covered'),
  ('72000000-2000-4000-8000-000000000014', 'TTBB', 'Baritone', 'covered'),
  ('72000000-2000-4000-8000-000000000014', 'TTBB', 'Bass', 'covered'),
  ('72000000-2000-4000-8000-000000000015', 'TTBB', 'Tenor', 'covered'),
  ('72000000-2000-4000-8000-000000000015', 'TTBB', 'Lead', 'needed'),
  ('72000000-2000-4000-8000-000000000015', 'TTBB', 'Baritone', 'needed'),
  ('72000000-2000-4000-8000-000000000015', 'TTBB', 'Bass', 'covered'),
  ('72000000-2000-4000-8000-000000000016', 'SSAA', 'Soprano 1', 'covered'),
  ('72000000-2000-4000-8000-000000000016', 'SSAA', 'Soprano 2', 'needed'),
  ('72000000-2000-4000-8000-000000000016', 'SSAA', 'Alto 1', 'covered'),
  ('72000000-2000-4000-8000-000000000016', 'SSAA', 'Alto 2', 'needed'),
  ('72000000-2000-4000-8000-000000000017', 'SATB', 'Soprano', 'covered'),
  ('72000000-2000-4000-8000-000000000017', 'SATB', 'Alto', 'covered'),
  ('72000000-2000-4000-8000-000000000017', 'SATB', 'Tenor', 'covered'),
  ('72000000-2000-4000-8000-000000000017', 'SATB', 'Bass', 'needed'),
  ('72000000-2000-4000-8000-000000000018', 'TTBB', 'Tenor', 'covered'),
  ('72000000-2000-4000-8000-000000000018', 'TTBB', 'Lead', 'needed');

insert into public.contact_requests (
  sender_user_id,
  singer_profile_id,
  message_body,
  status
)
values
  (
    '72000000-0000-4000-8000-000000000013',
    '72000000-1000-4000-8000-000000000001',
    'QMF_PROD_DEMO_20260501: Demo contact request for a visible singer target.',
    'pending'
  ),
  (
    '72000000-0000-4000-8000-000000000002',
    '72000000-1000-4000-8000-000000000007',
    'QMF_PROD_DEMO_20260501: Demo contact request for a non-US visible singer target.',
    'pending'
  );

insert into public.contact_requests (
  sender_user_id,
  quartet_listing_id,
  message_body,
  status
)
values
  (
    '72000000-0000-4000-8000-000000000004',
    '72000000-2000-4000-8000-000000000013',
    'QMF_PROD_DEMO_20260501: Demo contact request for a visible quartet target.',
    'pending'
  ),
  (
    '72000000-0000-4000-8000-000000000011',
    '72000000-2000-4000-8000-000000000017',
    'QMF_PROD_DEMO_20260501: Demo contact request for a SATB quartet target.',
    'pending'
  );

commit;
