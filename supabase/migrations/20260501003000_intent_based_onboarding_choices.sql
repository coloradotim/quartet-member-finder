alter table public.account_profiles
drop constraint if exists account_profiles_onboarding_last_choice_check;

alter table public.account_profiles
add constraint account_profiles_onboarding_last_choice_check
check (
  onboarding_last_choice is null
  or onboarding_last_choice in (
    'singer-profile-first',
    'quartet-profile-first',
    'get-oriented',
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
