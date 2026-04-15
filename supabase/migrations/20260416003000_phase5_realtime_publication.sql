-- Enroll messages + conversations in realtime publication so frontend subscriptions receive events.
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

-- Prevent race condition: duplicate conversations on concurrent first-GET.
alter table public.conversations
  add constraint conversations_deal_id_key unique (deal_id);

-- Tighten insert policies from public to authenticated role.
drop policy if exists conversations_insert_participants on public.conversations;
create policy conversations_insert_participants on public.conversations
  for insert to authenticated
  with check (brand_user_id = auth.uid() or creator_user_id = auth.uid());

drop policy if exists messages_insert_sender on public.messages;
create policy messages_insert_sender on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid());
