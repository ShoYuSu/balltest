-- รันชุดนี้ทีเดียวจบ
BEGIN;

-------------------------------------------------------------------
-- 1. สร้าง User ในระบบ Auth (เพื่อให้ Login ได้และไม่ติด Key)
-------------------------------------------------------------------
INSERT INTO "auth"."users" 
  ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "raw_app_meta_data", "raw_user_meta_data", "created_at", "updated_at", "is_sso_user", "is_anonymous") 
VALUES
  -- อาจารย์
  ('00000000-0000-0000-0000-000000000000', '78026fdb-6a86-41d9-82ca-14eb5409a493', 'authenticated', 'authenticated', 'test@siam.edu', '$2a$10$zkc/rPvjjvrMdyE30U/59.PoECQbh2.6ogTUn2iwjTEU.7C7gSFnO', NOW(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NOW(), NOW(), false, false),
  -- นักศึกษา
  ('00000000-0000-0000-0000-000000000000', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'authenticated', 'authenticated', 'teststudent@siam.edu', '$2a$10$35tJ80nNZ1H0.cxJh9uksOWiOOoovXE8DGvq3wAK9diPpVeXZtzMO', NOW(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NOW(), NOW(), false, false)
ON CONFLICT (id) DO NOTHING;

-- สร้าง Identity (จำเป็นเพื่อให้ระบบ Supabase มองเห็น User)
INSERT INTO "auth"."identities" ("id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "provider_id")
VALUES
  (gen_random_uuid(), '78026fdb-6a86-41d9-82ca-14eb5409a493', '{"sub": "78026fdb-6a86-41d9-82ca-14eb5409a493", "email": "test@siam.edu"}', 'email', NOW(), NOW(), NOW(), '78026fdb-6a86-41d9-82ca-14eb5409a493'),
  (gen_random_uuid(), 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', '{"sub": "fb91ee2c-848e-42e1-bba1-3094bb367cf6", "email": "teststudent@siam.edu"}', 'email', NOW(), NOW(), NOW(), 'fb91ee2c-848e-42e1-bba1-3094bb367cf6')
ON CONFLICT DO NOTHING;


-------------------------------------------------------------------
-- 2. ข้อมูลคณะและสาขา
-------------------------------------------------------------------
INSERT INTO "public"."faculties" ("id", "name") VALUES (1, 'วิทยาศาสตร์') ON CONFLICT (id) DO NOTHING;
INSERT INTO "public"."majors" ("id", "name", "faculty_id") VALUES (1, 'วิทยาการคอมพิวเตอร์', 1) ON CONFLICT (id) DO NOTHING;


-------------------------------------------------------------------
-- 3. ข้อมูลโปรไฟล์ (Profile)
-------------------------------------------------------------------
INSERT INTO "public"."profiles" ("id", "role", "full_name") VALUES
('78026fdb-6a86-41d9-82ca-14eb5409a493', 'teacher', 'ดร.สมชาย ใจดี'),
('fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'student', 'นาย แข็งแกร่ง ดั่งหินผา')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;


-------------------------------------------------------------------
-- 4. รายละเอียดอาจารย์และนักศึกษา
-------------------------------------------------------------------
-- ใส่อาจารย์ก่อน
INSERT INTO "public"."teacher_details" ("id", "major_id") VALUES
('78026fdb-6a86-41d9-82ca-14eb5409a493', 1)
ON CONFLICT (id) DO NOTHING;

-- ใสนักศึกษา (เชื่อมที่ปรึกษาคือ ดร.สมชาย)
INSERT INTO "public"."student_details" ("id", "student_code", "year_level", "advisor_id", "major_id") VALUES
('fb91ee2c-848e-42e1-bba1-3094bb367cf6', '6504800001', 1, '78026fdb-6a86-41d9-82ca-14eb5409a493', 1)
ON CONFLICT (id) DO NOTHING;


-------------------------------------------------------------------
-- 5. ข้อมูลตารางทดสอบ
-------------------------------------------------------------------
INSERT INTO "public"."students_test" ("id", "name", "nickname", "major") VALUES
(1231, 'Iron Man', 'Tony Stark', 'Engineering'),
(1232, 'Captain America', 'Steve Rogers', 'Soldier'),
(1, 'Spider-Man', 'Peter Parker', 'Science')
ON CONFLICT (id) DO NOTHING;

-- อัปเดต Sequence ให้รันต่อได้
SELECT setval(pg_get_serial_sequence('"public"."faculties"', 'id'), coalesce(max(id), 1)) FROM "public"."faculties";
SELECT setval(pg_get_serial_sequence('"public"."majors"', 'id'), coalesce(max(id), 1)) FROM "public"."majors";
SELECT setval(pg_get_serial_sequence('"public"."students_test"', 'id'), coalesce(max(id), 1)) FROM "public"."students_test";

COMMIT;