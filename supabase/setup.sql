-- Supabase initial schema for Apex Auto Sales & Repair
-- Run this in Supabase SQL Editor for project dlisbapmpxcaittniqmm

-- Enable required extension (for gen_random_uuid)
create extension if not exists pgcrypto;

-- Profiles table
create table if not exists profiles (
	id uuid references auth.users(id) primary key,
	email text unique not null,
	full_name text,
	phone text,
	role text check (role in ('customer','admin','staff')) default 'customer',
	avatar_url text,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- Vehicles table
create table if not exists vehicles (
	id uuid default gen_random_uuid() primary key,
	make text not null,
	model text not null,
	year integer not null,
	price numeric(10,2) not null,
	mileage integer,
	vin text unique,
	status text check (status in ('available','sold','reserved','maintenance')) default 'available',
	images text[],
	specs jsonb,
	features text[],
	tags text[],
	description text,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- Bookings table
create table if not exists bookings (
	id uuid default gen_random_uuid() primary key,
	customer_name text not null,
	customer_phone text,
	customer_email text,
	service text not null,
	vehicle_info text,
	booking_date date not null,
	booking_time time not null,
	status text check (status in ('pending','confirmed','in-progress','completed','cancelled')) default 'pending',
	notes text,
	estimated_cost numeric(10,2),
	actual_cost numeric(10,2),
	assigned_staff text,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- Content sections table
create table if not exists content_sections (
	id uuid default gen_random_uuid() primary key,
	section_type text not null,
	title text not null,
	visible boolean default true,
	sort_order integer default 0,
	content jsonb,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- Simple todos table for connectivity tests
create table if not exists todos (
	id uuid default gen_random_uuid() primary key,
	title text not null,
	completed boolean default false,
	created_at timestamptz default now()
);

-- Seed sample todos
insert into todos (title, completed) values
	('Test Supabase connection', false),
	('Set up database tables', false),
	('Configure authentication', false)
	on conflict do nothing;

-- Enable RLS
alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table bookings enable row level security;
alter table content_sections enable row level security;
alter table todos enable row level security;

-- profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- vehicles
DROP POLICY IF EXISTS "Vehicles are viewable by everyone" ON vehicles;
CREATE POLICY "Vehicles are viewable by everyone" ON vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify vehicles" ON vehicles;
CREATE POLICY "Only admins can modify vehicles" ON vehicles FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- bookings
DROP POLICY IF EXISTS "Bookings are viewable by everyone" ON bookings;
CREATE POLICY "Bookings are viewable by everyone" ON bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify bookings" ON bookings;
CREATE POLICY "Only admins can modify bookings" ON bookings FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- content_sections
DROP POLICY IF EXISTS "Content sections are viewable by everyone" ON content_sections;
CREATE POLICY "Content sections are viewable by everyone" ON content_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify content" ON content_sections;
CREATE POLICY "Only admins can modify content" ON content_sections FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- todos
DROP POLICY IF EXISTS "Todos are viewable by everyone" ON todos;
CREATE POLICY "Todos are viewable by everyone" ON todos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify todos" ON todos;
CREATE POLICY "Only admins can modify todos" ON todos FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);