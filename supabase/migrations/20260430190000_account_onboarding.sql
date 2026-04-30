alter table public.account_profiles
add column onboarding_completed_at timestamptz,
add column onboarding_skipped_at timestamptz,
add column onboarding_last_choice text check (
  onboarding_last_choice is null
  or onboarding_last_choice in (
    'my-singer-profile',
    'find-quartet-openings',
    'find-singers-as-singer',
    'quartet-mode-listing',
    'quartet-mode-find-singers',
    'browse-for-now',
    'read-help-privacy',
    'skipped'
  )
);
