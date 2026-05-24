-- ============================================================
-- Racesin Market — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Profiles (extends auth.users) ───────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  name        text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- ── Listings ─────────────────────────────────────────────────
create table public.listings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  title         text not null,
  description   text,
  category      text not null,
  brand         text,
  seller_name   text,   -- custom display name for admin-created listings
  price         numeric(10,2) not null,
  original_price numeric(10,2),
  condition     text not null check (condition in ('new','like-new','good','fair')),
  location      text,
  phone         text,
  email         text,
  status        text not null default 'pending_payment'
                  check (status in ('pending_payment','active','expired','sold')),
  views         integer not null default 0,
  expires_at    timestamptz,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- Migration (run in Supabase SQL editor if table already exists):
-- alter table public.listings add column if not exists brand text;
-- alter table public.listings add column if not exists seller_name text;
-- alter table public.listings add column if not exists original_price numeric(10,2);

-- ── Listing images ───────────────────────────────────────────
create table public.listing_images (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references public.listings on delete cascade not null,
  url         text not null,
  position    integer not null default 0,
  created_at  timestamptz default now() not null
);

-- ── Conversations ────────────────────────────────────────────
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid references public.listings on delete set null,
  listing_title   text,
  seller_id       uuid references auth.users on delete cascade not null,
  buyer_id        uuid references auth.users on delete cascade not null,
  last_message_at timestamptz default now() not null,
  created_at      timestamptz default now() not null,
  unique (listing_id, buyer_id)
);

-- ── Messages ─────────────────────────────────────────────────
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations on delete cascade not null,
  sender_id       uuid references auth.users on delete cascade not null,
  content         text not null,
  read            boolean not null default false,
  created_at      timestamptz default now() not null
);

-- ── Row-Level Security ───────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.listings       enable row level security;
alter table public.listing_images enable row level security;
alter table public.conversations  enable row level security;
alter table public.messages       enable row level security;

-- profiles
create policy "profiles_select_all"   on public.profiles for select using (true);
create policy "profiles_insert_own"   on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);

-- listings
create policy "listings_select_active"  on public.listings for select
  using (status = 'active' or auth.uid() = user_id);
create policy "listings_insert_auth"    on public.listings for insert
  with check (auth.uid() = user_id);
create policy "listings_update_own"     on public.listings for update
  using (auth.uid() = user_id);
create policy "listings_delete_own"     on public.listings for delete
  using (auth.uid() = user_id);

-- listing_images
create policy "images_select_all"  on public.listing_images for select using (true);
create policy "images_manage_own"  on public.listing_images for all
  using (auth.uid() = (select user_id from public.listings where id = listing_id));

-- conversations
create policy "conv_select_own"   on public.conversations for select
  using (auth.uid() = seller_id or auth.uid() = buyer_id);
create policy "conv_insert_buyer" on public.conversations for insert
  with check (auth.uid() = buyer_id);
create policy "conv_update_own"   on public.conversations for update
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

-- messages
create policy "msg_select_participants" on public.messages for select
  using (auth.uid() in (
    select seller_id from public.conversations where id = conversation_id
    union
    select buyer_id  from public.conversations where id = conversation_id
  ));
create policy "msg_insert_participants" on public.messages for insert
  with check (
    auth.uid() = sender_id and
    auth.uid() in (
      select seller_id from public.conversations where id = conversation_id
      union
      select buyer_id  from public.conversations where id = conversation_id
    )
  );

-- ── Triggers & helpers ───────────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Increment listing views (called from API)
create or replace function public.increment_listing_views(p_listing_id uuid)
returns void language sql security definer as $$
  update public.listings set views = views + 1 where id = p_listing_id;
$$;

-- Update conversation last_message_at on new message
create or replace function public.update_conversation_timestamp()
returns trigger language plpgsql as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_new_message
  after insert on public.messages
  for each row execute procedure public.update_conversation_timestamp();

-- ── Storage bucket ───────────────────────────────────────────
-- Create this bucket manually in Supabase Dashboard > Storage:
--   Name: listing-images
--   Public: true
--
-- Then add these storage policies:
--   INSERT: authenticated users (bucket listing-images)
--   SELECT: public (bucket listing-images)
--   DELETE: owner only
