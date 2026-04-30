-- 1. เพิ่มคอลัมน์ email ใน profiles (ถ้ายังไม่มี) เพื่อแก้ Error ใน Angular
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
END $$;

-- 2. สร้าง Enum Type สำหรับบทบาทผู้ใช้งาน (ถ้ายังไม่มี)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        create type app_role as enum ('admin', 'teacher', 'student');
    END IF;
END $$;

-- 3. สร้างตาราง user_roles (ลบของเก่าแล้วสร้างใหม่เพื่อให้ Schema อัปเดต)
drop table if exists user_roles;

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  role app_role not null,
  created_at timestamptz default now()
);

-- 4. เปิดใช้งาน RLS (Row Level Security) เพื่อความปลอดภัย
alter table user_roles enable row level security;

-- 5. สร้าง Policy ให้ทุกคนอ่านบทบาทได้ แต่อะลูมินั่ม (Admin) เท่านั้นที่แก้ไขได้
create policy "Allow public read access" on user_roles for select using (true);
create policy "Allow admin to manage roles" on user_roles for all using (
  exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  )
);