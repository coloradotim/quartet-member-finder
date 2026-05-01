alter table public.contact_requests
add column recipient_read_at timestamptz,
add column sender_read_at timestamptz;

create table public.contact_request_replies (
  id uuid primary key default gen_random_uuid(),
  contact_request_id uuid not null references public.contact_requests (id) on delete cascade,
  sender_user_id uuid not null references auth.users (id) on delete cascade,
  message_body text not null check (char_length(message_body) between 1 and 2000),
  notification_status public.contact_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  check (sender_user_id is not null)
);

create index contact_request_replies_request_idx
  on public.contact_request_replies (contact_request_id, created_at);

create index contact_request_replies_sender_idx
  on public.contact_request_replies (sender_user_id, created_at desc);

create function public.mark_contact_request_responded()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.contact_requests
  set
    status = 'responded',
    updated_at = now()
  where id = new.contact_request_id
    and status <> 'closed';

  return new;
end;
$$;

create trigger contact_request_replies_mark_responded
after insert on public.contact_request_replies
for each row execute function public.mark_contact_request_responded();

alter table public.contact_request_replies enable row level security;

create policy "Contact participants can read replies"
on public.contact_request_replies
for select
using (
  exists (
    select 1
    from public.contact_requests
    where contact_requests.id = contact_request_replies.contact_request_id
      and (
        contact_requests.sender_user_id = auth.uid()
        or contact_requests.recipient_user_id = auth.uid()
      )
  )
);

create policy "Contact participants can create replies"
on public.contact_request_replies
for insert
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.contact_requests
    where contact_requests.id = contact_request_replies.contact_request_id
      and (
        contact_requests.sender_user_id = auth.uid()
        or contact_requests.recipient_user_id = auth.uid()
      )
  )
);

revoke all on table public.contact_request_replies from anon, authenticated;
grant select, insert on table public.contact_request_replies to authenticated;

grant update (recipient_read_at, sender_read_at) on table public.contact_requests to authenticated;

revoke all on function public.mark_contact_request_responded() from public;
