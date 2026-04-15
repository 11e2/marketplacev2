-- Phase 4: atomic balance movements + transaction ledger.
-- All balance math lives in SECURITY DEFINER functions so app code can never
-- produce a partial mutation. Callers must use the service role.

create or replace function public.adjust_balance(
  p_user_id uuid,
  p_delta_available numeric,
  p_delta_pending numeric default 0
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.balances (user_id, available, pending)
  values (p_user_id, 0, 0)
  on conflict (user_id) do nothing;

  update public.balances
  set available = available + p_delta_available,
      pending = pending + p_delta_pending,
      updated_at = now()
  where user_id = p_user_id;

  if exists (select 1 from public.balances where user_id = p_user_id and available < 0) then
    raise exception 'insufficient_balance' using errcode = 'P0001';
  end if;
end;
$$;

-- Escrow hold: move funds from brand available to pending.
create or replace function public.escrow_hold(
  p_brand_user_id uuid,
  p_deal_id uuid,
  p_amount numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;

  perform public.adjust_balance(p_brand_user_id, -p_amount, p_amount);

  insert into public.transactions (user_id, type, amount, status, description, related_deal_id)
  values (p_brand_user_id, 'ESCROW_HOLD', p_amount, 'COMPLETED', 'Escrow hold for deal', p_deal_id);

  update public.deals
  set escrow_amount = coalesce(escrow_amount, 0) + p_amount,
      escrow_status = 'HELD'
  where id = p_deal_id;
end;
$$;

-- Escrow release: brand pending -> creator available, minus 4% + 4% platform fee.
create or replace function public.escrow_release(
  p_deal_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_brand uuid;
  v_creator uuid;
  v_amount numeric;
  v_brand_fee numeric;
  v_creator_fee numeric;
  v_net numeric;
begin
  select brand_user_id, creator_user_id, escrow_amount
  into v_brand, v_creator, v_amount
  from public.deals where id = p_deal_id for update;

  if v_amount is null or v_amount <= 0 then
    raise exception 'no_escrow' using errcode = 'P0001';
  end if;

  v_brand_fee := round(v_amount * 0.04, 2);
  v_creator_fee := round(v_amount * 0.04, 2);
  v_net := v_amount - v_creator_fee;

  -- brand: drop pending by full escrow
  perform public.adjust_balance(v_brand, 0, -v_amount);
  -- creator: credit net
  perform public.adjust_balance(v_creator, v_net, 0);

  insert into public.transactions (user_id, type, amount, status, description, related_deal_id) values
    (v_brand, 'ESCROW_RELEASE', v_amount, 'COMPLETED', 'Escrow released to creator', p_deal_id),
    (v_brand, 'FEE', v_brand_fee, 'COMPLETED', 'Platform fee (brand side 4%)', p_deal_id),
    (v_creator, 'EARNING', v_net, 'COMPLETED', 'Deal payout', p_deal_id),
    (v_creator, 'FEE', v_creator_fee, 'COMPLETED', 'Platform fee (creator side 4%)', p_deal_id);

  update public.deals
  set escrow_amount = 0,
      escrow_status = 'RELEASED',
      status = 'COMPLETED',
      completed_at = now()
  where id = p_deal_id;
end;
$$;

-- Escrow refund: return held funds to the brand.
create or replace function public.escrow_refund(
  p_deal_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_brand uuid;
  v_amount numeric;
begin
  select brand_user_id, escrow_amount
  into v_brand, v_amount
  from public.deals where id = p_deal_id for update;

  if v_amount is null or v_amount <= 0 then
    return;
  end if;

  perform public.adjust_balance(v_brand, v_amount, -v_amount);

  insert into public.transactions (user_id, type, amount, status, description, related_deal_id)
  values (v_brand, 'REFUND', v_amount, 'COMPLETED', 'Escrow refund', p_deal_id);

  update public.deals
  set escrow_amount = 0,
      escrow_status = 'REFUNDED',
      status = 'CANCELLED'
  where id = p_deal_id;
end;
$$;

-- Deposit: credit brand available balance (dev/test flows; real money via Stripe webhook).
create or replace function public.ledger_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_reference text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;

  perform public.adjust_balance(p_user_id, p_amount, 0);

  insert into public.transactions (user_id, type, amount, status, description, reference)
  values (p_user_id, 'DEPOSIT', p_amount, 'COMPLETED', 'Deposit', p_reference);
end;
$$;

-- Withdraw: debit creator available balance (dev/test flows; real money via Stripe Connect).
create or replace function public.ledger_withdraw(
  p_user_id uuid,
  p_amount numeric,
  p_reference text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;

  perform public.adjust_balance(p_user_id, -p_amount, 0);

  insert into public.transactions (user_id, type, amount, status, description, reference)
  values (p_user_id, 'PAYOUT', p_amount, 'COMPLETED', 'Payout', p_reference);
end;
$$;

revoke all on function public.adjust_balance(uuid, numeric, numeric) from public, anon, authenticated;
revoke all on function public.escrow_hold(uuid, uuid, numeric) from public, anon, authenticated;
revoke all on function public.escrow_release(uuid) from public, anon, authenticated;
revoke all on function public.escrow_refund(uuid) from public, anon, authenticated;
revoke all on function public.ledger_deposit(uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.ledger_withdraw(uuid, numeric, text) from public, anon, authenticated;
