create table public.user_moderation_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  account_status text not null default 'active' check (
    account_status in (
      'active',
      'message_blocked',
      'suspended',
      'permanently_blocked',
      'deletion_requested'
    )
  ),
  messaging_blocked_at timestamptz,
  messaging_block_reason text check (
    messaging_block_reason is null
    or char_length(messaging_block_reason) <= 500
  ),
  admin_notes text check (
    admin_notes is null
    or char_length(admin_notes) <= 2000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.message_reports (
  id uuid primary key default gen_random_uuid(),
  contact_request_id uuid not null references public.contact_requests (id) on delete cascade,
  reporter_user_id uuid not null references auth.users (id) on delete cascade,
  reported_user_id uuid references auth.users (id) on delete set null,
  category text not null check (
    category in (
      'spam',
      'harassment',
      'unsafe_request',
      'other'
    )
  ),
  note text check (
    note is null
    or char_length(note) <= 2000
  ),
  status text not null default 'new' check (
    status in (
      'new',
      'reviewed',
      'action_taken',
      'dismissed'
    )
  ),
  admin_notes text check (
    admin_notes is null
    or char_length(admin_notes) <= 2000
  ),
  action_taken_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index message_reports_request_idx
  on public.message_reports (contact_request_id, created_at desc);

create index message_reports_reported_user_idx
  on public.message_reports (reported_user_id, created_at desc);

create index message_reports_status_idx
  on public.message_reports (status, created_at desc);

create trigger user_moderation_status_set_updated_at
before update on public.user_moderation_status
for each row execute function public.set_updated_at();

create trigger message_reports_set_updated_at
before update on public.message_reports
for each row execute function public.set_updated_at();

create function public.set_message_report_reported_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  request_sender uuid;
  request_recipient uuid;
begin
  select sender_user_id, recipient_user_id
  into request_sender, request_recipient
  from public.contact_requests
  where id = new.contact_request_id;

  if request_sender is null or request_recipient is null then
    raise exception 'message report target is not available';
  end if;

  if new.reporter_user_id = request_sender then
    new.reported_user_id = request_recipient;
  elsif new.reporter_user_id = request_recipient then
    new.reported_user_id = request_sender;
  else
    raise exception 'reporter cannot report unrelated messages';
  end if;

  return new;
end;
$$;

create trigger message_reports_set_reported_user
before insert on public.message_reports
for each row execute function public.set_message_report_reported_user();

alter table public.user_moderation_status enable row level security;
alter table public.message_reports enable row level security;

create policy "Users can read their own moderation status"
on public.user_moderation_status
for select
using (auth.uid() = user_id);

create policy "Message participants can create private reports"
on public.message_reports
for insert
with check (
  reporter_user_id = auth.uid()
  and exists (
    select 1
    from public.contact_requests
    where contact_requests.id = message_reports.contact_request_id
      and (
        contact_requests.sender_user_id = auth.uid()
        or contact_requests.recipient_user_id = auth.uid()
      )
  )
);

revoke all on table public.user_moderation_status from anon, authenticated;
revoke all on table public.message_reports from anon, authenticated;

grant select on table public.user_moderation_status to authenticated;
grant insert on table public.message_reports to authenticated;

revoke all on function public.set_message_report_reported_user() from public;
