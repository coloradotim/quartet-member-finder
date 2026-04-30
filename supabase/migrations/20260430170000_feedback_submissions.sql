create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_user_id uuid not null references auth.users (id) on delete cascade,
  submitter_email_private text check (
    submitter_email_private is null
    or char_length(submitter_email_private) <= 320
  ),
  feedback_type text not null check (
    feedback_type in ('feedback', 'bug', 'suggestion')
  ),
  message_body text not null check (char_length(message_body) between 1 and 3000),
  context_path text check (
    context_path is null
    or char_length(context_path) <= 500
  ),
  user_agent text check (
    user_agent is null
    or char_length(user_agent) <= 500
  ),
  status text not null default 'new' check (
    status in ('new', 'reviewed', 'closed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feedback_submissions_submitter_idx
  on public.feedback_submissions (submitter_user_id, created_at desc);

create index feedback_submissions_status_idx
  on public.feedback_submissions (status, created_at desc);

create trigger feedback_submissions_set_updated_at
before update on public.feedback_submissions
for each row execute function public.set_updated_at();

alter table public.feedback_submissions enable row level security;

create policy "Authenticated users can create their own feedback"
on public.feedback_submissions
for insert
with check (auth.uid() = submitter_user_id);

create policy "Authenticated users can rate limit their own feedback"
on public.feedback_submissions
for select
using (auth.uid() = submitter_user_id);

revoke all on table public.feedback_submissions from anon, authenticated;
grant select, insert on table public.feedback_submissions to authenticated;
