SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict GsR35P6R1pEinWH1A8ZTk6uPfnC2ACitEpVOuzvNvsMoBb0pt4vDsAYGfyb0h5u

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'f1ca0938-e6ec-458e-8f5b-225d52ee9276', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"ok@gmail.com","user_id":"424cec48-7e1c-4d94-88bf-0f8c10ae95a0","user_phone":""}}', '2026-03-13 23:16:27.805031+00', ''),
	('00000000-0000-0000-0000-000000000000', '98bac052-5931-4f63-9a9c-3689f5a25d27', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@siam.edu","user_id":"25b65ab3-7bba-415f-a1f0-050f96121acd","user_phone":""}}', '2026-03-14 05:05:13.809052+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ca828e5f-85bc-411f-bfa3-a0f8e29d0ca7', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test@siam.edu","user_id":"25b65ab3-7bba-415f-a1f0-050f96121acd","user_phone":""}}', '2026-03-14 05:06:00.72797+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c02bb6d-acb4-4820-82f6-6558995ffe72', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@siam.edu","user_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","user_phone":""}}', '2026-03-14 05:06:09.634012+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d7b1352-919d-4470-9391-c0378b232bf7', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 05:06:19.162481+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fcc61b2b-a538-4f6f-9c1e-baf1343b2563', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 05:10:58.021183+00', ''),
	('00000000-0000-0000-0000-000000000000', '872ac0b0-4695-4b59-8173-c26609bc1808', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 05:20:39.395972+00', ''),
	('00000000-0000-0000-0000-000000000000', '5145a32a-1a41-4ff3-b9f4-4042114e2ba0', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 05:50:52.734013+00', ''),
	('00000000-0000-0000-0000-000000000000', '085980df-258a-456a-83b5-3739dc461b87', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 05:59:14.190138+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d4145fa-7417-4ad4-8b24-9b88001c6cd4', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 06:02:40.717399+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dd1d6bee-2432-40ad-be74-f16b7653f324', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 06:03:15.849169+00', ''),
	('00000000-0000-0000-0000-000000000000', '64113f23-7fab-4e62-99c7-2ecc08bf5a66', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 06:03:24.601335+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dd30f00f-8c89-4d98-a4e2-6d3eaa973022', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ok@gmail.com","user_id":"424cec48-7e1c-4d94-88bf-0f8c10ae95a0","user_phone":""}}', '2026-03-14 06:22:24.220515+00', ''),
	('00000000-0000-0000-0000-000000000000', '622e2d10-9862-45ad-9007-820a13843536', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 06:25:25.709912+00', ''),
	('00000000-0000-0000-0000-000000000000', '7d32c444-c05a-4788-8258-c863304b2d6d', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 06:25:37.626473+00', ''),
	('00000000-0000-0000-0000-000000000000', '1da3f449-555d-45b9-b9fe-e6600f2d2e01', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 06:25:44.839501+00', ''),
	('00000000-0000-0000-0000-000000000000', '50671f94-d6e2-44f0-9b02-11a6e4f01d73', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 06:26:10.713892+00', ''),
	('00000000-0000-0000-0000-000000000000', '2eb5531f-14f3-4f00-810f-90714ace93fe', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teststudent@siam.edu","user_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","user_phone":""}}', '2026-03-14 07:03:17.244372+00', ''),
	('00000000-0000-0000-0000-000000000000', '5bbe7660-789b-4bf6-a929-d5b813f4b989', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 07:16:59.916476+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1ef5ca3-d03e-4f85-a5de-70f86b3d452a', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 07:17:24.01536+00', ''),
	('00000000-0000-0000-0000-000000000000', '912c5d84-188b-49e6-9439-19c7cfad0481', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 07:34:50.197784+00', ''),
	('00000000-0000-0000-0000-000000000000', '332da9c7-f977-4206-88da-d8f918ab974f', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 07:35:19.86325+00', ''),
	('00000000-0000-0000-0000-000000000000', '9852e751-c668-44d1-a058-87a7adc9777e', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 08:01:06.102817+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb80f14d-faa4-4d7e-89f8-7a992fff17c7', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 08:01:23.486633+00', ''),
	('00000000-0000-0000-0000-000000000000', '44bafa2f-4dcd-423f-9ef5-e2b0f7c969cb', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 08:25:34.48791+00', ''),
	('00000000-0000-0000-0000-000000000000', '1b80ed30-5280-476d-ac1f-edeeb5c4188f', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 08:25:44.90069+00', ''),
	('00000000-0000-0000-0000-000000000000', '8f90f228-c40e-4246-894f-4f9fba052396', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-14 08:25:53.897983+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bc685641-ce64-4a8e-93e8-facbce1c46ec', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-14 08:26:08.414586+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fae11475-b375-42da-9e1c-c44a8064b416', '{"action":"token_refreshed","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"token"}', '2026-03-14 09:30:36.714501+00', ''),
	('00000000-0000-0000-0000-000000000000', '90f7f147-5dc2-4ca0-83d1-4a5894fccea7', '{"action":"token_revoked","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"token"}', '2026-03-14 09:30:36.717774+00', '');


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '78026fdb-6a86-41d9-82ca-14eb5409a493', 'authenticated', 'authenticated', 'test@siam.edu', '$2a$10$zkc/rPvjjvrMdyE30U/59.PoECQbh2.6ogTUn2iwjTEU.7C7gSFnO', '2026-03-14 05:06:09.635587+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-14 08:25:44.901713+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-14 05:06:09.629559+00', '2026-03-14 08:25:44.904764+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'authenticated', 'authenticated', 'teststudent@siam.edu', '$2a$10$35tJ80nNZ1H0.cxJh9uksOWiOOoovXE8DGvq3wAK9diPpVeXZtzMO', '2026-03-14 07:03:17.246264+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-14 08:26:08.415892+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-14 07:03:17.238631+00', '2026-03-14 09:30:36.725615+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('78026fdb-6a86-41d9-82ca-14eb5409a493', '78026fdb-6a86-41d9-82ca-14eb5409a493', '{"sub": "78026fdb-6a86-41d9-82ca-14eb5409a493", "email": "test@siam.edu", "email_verified": false, "phone_verified": false}', 'email', '2026-03-14 05:06:09.632445+00', '2026-03-14 05:06:09.632482+00', '2026-03-14 05:06:09.632482+00', 'f8616c4c-2ddc-4ef3-b02c-f9953797d1b6'),
	('fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', '{"sub": "fb91ee2c-848e-42e1-bba1-3094bb367cf6", "email": "teststudent@siam.edu", "email_verified": false, "phone_verified": false}', 'email', '2026-03-14 07:03:17.242442+00', '2026-03-14 07:03:17.242497+00', '2026-03-14 07:03:17.242497+00', 'ebf2f47b-9c3a-455d-a8a4-38d05f1f2f85');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('d1fa5a93-ac75-49a5-9742-5dbab0f9f5b6', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', '2026-03-14 08:26:08.415957+00', '2026-03-14 09:30:36.728693+00', NULL, 'aal1', NULL, '2026-03-14 09:30:36.728632', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('d1fa5a93-ac75-49a5-9742-5dbab0f9f5b6', '2026-03-14 08:26:08.419358+00', '2026-03-14 08:26:08.419358+00', 'password', '34db3111-77ac-4ee3-9cfb-6607c5605016');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 13, 'bv4tooytbjqi', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', true, '2026-03-14 08:26:08.417721+00', '2026-03-14 09:30:36.718645+00', NULL, 'd1fa5a93-ac75-49a5-9742-5dbab0f9f5b6'),
	('00000000-0000-0000-0000-000000000000', 14, '6ss325b2vogm', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', false, '2026-03-14 09:30:36.72323+00', '2026-03-14 09:30:36.72323+00', 'bv4tooytbjqi', 'd1fa5a93-ac75-49a5-9742-5dbab0f9f5b6');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."faculties" ("id", "name", "created_at") VALUES
	(1, 'เธงเธดเธ—เธขเธฒเธจเธฒเธชเธ•เธฃเน', '2026-03-14 03:08:29.695641+00');


--
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."majors" ("id", "name", "faculty_id", "created_at") VALUES
	(1, 'เธงเธดเธ—เธขเธฒเธเธฒเธฃเธเธญเธกเธเธดเธงเน€เธ•เธญเธฃเน', 1, '2026-03-14 07:22:40.542695+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "role", "created_at", "full_name") VALUES
	('fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'student', '2026-03-14 07:04:23.250843+00', 'เธเธฒเธข เนเธเนเธเนเธเธฃเนเธ เธ”เธฑเนเธเธซเธดเธเธเธฒ'),
	('78026fdb-6a86-41d9-82ca-14eb5409a493', 'teacher', '2026-03-14 06:01:35.094689+00', 'เธ”เธฃ.เธชเธกเธเธฒเธข เนเธเธ”เธต');


--
-- Data for Name: teacher_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."teacher_details" ("id", "created_at", "major_id") VALUES
	('78026fdb-6a86-41d9-82ca-14eb5409a493', '2026-03-14 07:22:59.045805+00', 1);


--
-- Data for Name: student_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."student_details" ("id", "student_code", "year_level", "created_at", "advisor_id", "major_id") VALUES
	('fb91ee2c-848e-42e1-bba1-3094bb367cf6', '6504800001', 1, '2026-03-14 07:23:25.536778+00', '78026fdb-6a86-41d9-82ca-14eb5409a493', 1);


--
-- Data for Name: students_test; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."students_test" ("id", "name", "nickname", "major", "created_at") VALUES
	(1231, 'Iron Man', 'Tony Stark', 'SSSSS', '2026-03-13 21:36:08.20894+00'),
	(1232, 'Captain America', 'Steve Rogers ', 'AAAA', '2026-03-13 21:36:30.797246+00'),
	(1, 'Spider-Man', 'Peter Parker', 'ssssss', '2026-03-13 21:36:53.457316+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 14, true);


--
-- Name: faculties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."faculties_id_seq"', 1, true);


--
-- Name: majors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."majors_id_seq"', 1, true);


--
-- Name: students_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."students_test_id_seq"', 1, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict GsR35P6R1pEinWH1A8ZTk6uPfnC2ACitEpVOuzvNvsMoBb0pt4vDsAYGfyb0h5u

RESET ALL;
