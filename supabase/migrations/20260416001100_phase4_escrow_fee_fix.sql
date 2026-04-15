-- Fix escrow_release: creator receives amount minus BOTH fees (4% brand + 4% creator).
-- v_net was incorrectly set to amount - creator_fee only; corrected to amount - brand_fee - creator_fee.
-- Ledger remains zero-sum: brand pending decreases by full escrow; platform earns brand_fee + creator_fee (8% total).
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

  v_brand_fee   := round(v_amount * 0.04, 2);
  v_creator_fee := round(v_amount * 0.04, 2);
  v_net         := v_amount - v_brand_fee - v_creator_fee;

  -- brand: release full escrow from pending
  perform public.adjust_balance(v_brand, 0, -v_amount);
  -- creator: credit net (amount minus both fees)
  perform public.adjust_balance(v_creator, v_net, 0);

  insert into public.transactions (user_id, type, amount, status, description, related_deal_id) values
    (v_brand,   'ESCROW_RELEASE', v_amount,       'COMPLETED', 'Escrow released to creator',    p_deal_id),
    (v_brand,   'FEE',            v_brand_fee,    'COMPLETED', 'Platform fee (brand side 4%)',   p_deal_id),
    (v_creator, 'EARNING',        v_net,          'COMPLETED', 'Deal payout',                    p_deal_id),
    (v_creator, 'FEE',            v_creator_fee,  'COMPLETED', 'Platform fee (creator side 4%)', p_deal_id);

  update public.deals
  set escrow_amount = 0,
      escrow_status = 'RELEASED',
      status = 'COMPLETED',
      completed_at = now()
  where id = p_deal_id;
end;
$$;

revoke all on function public.escrow_release(uuid) from public, anon, authenticated;
