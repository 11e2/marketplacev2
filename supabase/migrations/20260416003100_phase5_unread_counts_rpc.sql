-- Replace unbounded messages fetch for unread counts with a DB-side aggregate.
create or replace function public.conversation_unread_counts(
  p_user_id uuid,
  p_conv_ids uuid[]
) returns table (conversation_id uuid, unread_count int)
language sql
security definer
stable
set search_path = public
as $$
  select m.conversation_id, count(*)::int as unread_count
  from public.messages m
  where m.conversation_id = any(p_conv_ids)
    and m.sender_id <> p_user_id
    and m.read_at is null
  group by m.conversation_id;
$$;

revoke all on function public.conversation_unread_counts(uuid, uuid[]) from public, anon;
grant execute on function public.conversation_unread_counts(uuid, uuid[]) to authenticated;
