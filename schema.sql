-- Database Schema PinjamIn (Solo Area Only)

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Profiles Table (Syncs with auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role text check (role in ('Customer', 'Owner', 'Admin')) not null default 'Customer',
  avatar_url text,
  phone text,
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- 3. Create Stores Table (Multi-toko per owner)
create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  category text not null,
  city text not null default 'Solo',
  is_active boolean not null default true,
  logo_url text,
  created_at timestamptz not null default now()
);

-- Enable RLS on Stores
alter table public.stores enable row level security;

create policy "Stores are viewable by everyone" 
  on public.stores for select using (is_active = true);

create policy "Owners can manage their own stores" 
  on public.stores for all using (auth.uid() = owner_id);

-- 4. Create Items Table (Physical rental goods)
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  description text,
  specs text,
  price_per_day numeric not null,
  stock integer not null default 1,
  photos text[] not null default '{}',
  category text not null,
  status text check (status in ('Tersedia', 'Disewa', 'Nonaktif')) not null default 'Tersedia',
  rating numeric not null default 5.0,
  review_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS on Items
alter table public.items enable row level security;

create policy "Items are viewable by everyone" 
  on public.items for select using (status = 'Tersedia');

create policy "Owners can manage items of their stores" 
  on public.items for all using (
    exists (
      select 1 from public.stores 
      where stores.id = items.store_id and stores.owner_id = auth.uid()
    )
  );

-- 5. Create Chats Table
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.items(id) on delete cascade not null,
  last_message text,
  updated_at timestamptz not null default now()
);

-- Enable RLS on Chats
alter table public.chats enable row level security;

create policy "Users can view chats they are involved in" 
  on public.chats for select using (auth.uid() = customer_id or auth.uid() = owner_id);

create policy "Users can create chats" 
  on public.chats for insert with check (auth.uid() = customer_id);

create policy "Users can update chats" 
  on public.chats for update using (auth.uid() = customer_id or auth.uid() = owner_id);

-- 6. Create Messages Table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  type text check (type in ('text', 'negotiation', 'order_link')) not null default 'text',
  negotiated_price numeric,
  order_id uuid,
  created_at timestamptz not null default now()
);

-- Enable RLS on Messages
alter table public.messages enable row level security;

create policy "Users can view messages in their chats" 
  on public.messages for select using (
    exists (
      select 1 from public.chats 
      where chats.id = messages.chat_id and (chats.customer_id = auth.uid() or chats.owner_id = auth.uid())
    )
  );

create policy "Users can send messages to their chats" 
  on public.messages for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.chats 
      where chats.id = messages.chat_id and (chats.customer_id = auth.uid() or chats.owner_id = auth.uid())
    )
  );

-- 7. Create Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  item_id uuid references public.items(id) on delete cascade not null,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  duration_days integer not null,
  price_per_day numeric not null,
  total_price numeric not null,
  commission numeric not null,
  owner_earnings numeric not null,
  status text check (status in ('Menunggu Pembayaran', 'Pembayaran Dikirim', 'Dikonfirmasi', 'Aktif', 'Selesai')) not null default 'Menunggu Pembayaran',
  payment_proof_url text,
  payment_confirmed_at timestamptz,
  identity_proof_url text,
  created_at timestamptz not null default now()
);

-- Enable RLS on Orders
alter table public.orders enable row level security;

create policy "Users can view their own orders" 
  on public.orders for select using (auth.uid() = customer_id or auth.uid() = owner_id or exists (
    select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'Admin'
  ));

create policy "Owners can create order links from chats" 
  on public.orders for insert with check (auth.uid() = owner_id);

create policy "Users can update orders involved" 
  on public.orders for update using (auth.uid() = customer_id or auth.uid() = owner_id or exists (
    select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'Admin'
  ));

-- ========================================================
-- Trigger: Auto Sync Profile when a user signs up on Supabase
-- ========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, avatar_url, phone, balance)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'Customer'),
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    coalesce(new.raw_user_meta_data->>'phone', ''),
    0
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
