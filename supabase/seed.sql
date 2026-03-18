SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict qRjJaUdwJo0d6ugGryFQYMQmEBxvOWo22xKGcFUHL7D8RBODOgoBevSWHXZ5geg

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
	('00000000-0000-0000-0000-000000000000', '90f7f147-5dc2-4ca0-83d1-4a5894fccea7', '{"action":"token_revoked","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"token"}', '2026-03-14 09:30:36.717774+00', ''),
	('00000000-0000-0000-0000-000000000000', '85326fd9-9b68-42cd-98a9-adb569710fb1', '{"action":"token_refreshed","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"token"}', '2026-03-17 00:59:52.327313+00', ''),
	('00000000-0000-0000-0000-000000000000', '0afedf32-881f-4569-9517-ce912e157e95', '{"action":"token_revoked","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"token"}', '2026-03-17 00:59:52.3404+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ed7b658-9a07-43a8-ba2a-647045ce54a6', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 01:37:16.946071+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd7a91edd-83ed-4f94-b259-369a4ad9506b', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 01:37:32.375306+00', ''),
	('00000000-0000-0000-0000-000000000000', '67072548-c988-4192-a735-39e162b05f46', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 01:37:40.212631+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9b61ced-9cbd-4b0b-be16-db10dd529cc4', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin1@siam.edu","user_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","user_phone":""}}', '2026-03-17 01:48:37.548688+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ee50e8f-41cc-4516-be02-598db46a78bf', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 01:53:19.545243+00', ''),
	('00000000-0000-0000-0000-000000000000', '10fb9081-fdea-4f79-b469-4094c8562252', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:02:35.575868+00', ''),
	('00000000-0000-0000-0000-000000000000', '8e558ba1-1db8-4679-a9b1-325798691c59', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:02:39.178529+00', ''),
	('00000000-0000-0000-0000-000000000000', '052f9649-e396-40a6-b3bc-05b2ac9fbb7b', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:02:59.019603+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b72a1ae-18ad-4474-b7bb-d40a4b151ee4', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:02:59.359095+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aaf9ec0c-7f10-45b3-8d30-87a34b999a29', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:09:44.318826+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e92d317a-628e-4aca-aed4-ae8d44422837', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:09:51.821195+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bf1c0bca-b973-4551-9c5d-aed4e5aaf273', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:10:09.295971+00', ''),
	('00000000-0000-0000-0000-000000000000', '7431c530-1061-4936-99b0-42ac4de1a6b4', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:10:23.300933+00', ''),
	('00000000-0000-0000-0000-000000000000', '75812b6f-8a43-467f-aa84-6b4ddfd1aada', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:10:35.377957+00', ''),
	('00000000-0000-0000-0000-000000000000', '70e70666-f1e2-49ed-ab3e-7c8f4a825324', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:10:35.629439+00', ''),
	('00000000-0000-0000-0000-000000000000', '3dc9fb7d-9711-455d-90be-4adffd42bc28', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:11:55.931481+00', ''),
	('00000000-0000-0000-0000-000000000000', '33902962-c1f7-4572-97b0-fba27a357922', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:12:00.443091+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ae339da5-dd5c-4dde-97ae-aad7d8c6042b', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:15:56.073213+00', ''),
	('00000000-0000-0000-0000-000000000000', '0530b340-9014-4964-8bc3-66b0aa0135c3', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:16:30.259588+00', ''),
	('00000000-0000-0000-0000-000000000000', '74447768-bb97-4505-9ce7-ab79f0ac41d6', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:21:32.735145+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e665bc31-ec99-4b53-912a-37ff70e430da', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:21:33.005568+00', ''),
	('00000000-0000-0000-0000-000000000000', '30a7da14-9d10-4851-aae1-1a980dbd736b', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:21:38.637796+00', ''),
	('00000000-0000-0000-0000-000000000000', '54fc1944-9541-4d54-8a25-d7f6375d8e27', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:21:38.927352+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd7c8138d-f93c-4e63-a0e8-18b1aa2e41df', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:26:00.591326+00', ''),
	('00000000-0000-0000-0000-000000000000', '112b71ca-959d-40e8-a417-07bfe335c768', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:26:00.83647+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7121442-6262-4626-9b97-52819b4d664d', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:26:15.730363+00', ''),
	('00000000-0000-0000-0000-000000000000', '92fcbc55-4796-4846-ab03-ccdc4ef94e11', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:26:24.820425+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c4dfaf06-cc08-410f-91a6-c710fa5a1990', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:26:37.369507+00', ''),
	('00000000-0000-0000-0000-000000000000', '87639ce2-b50c-4d91-8189-0a70e1519f2f', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:26:42.873133+00', ''),
	('00000000-0000-0000-0000-000000000000', '42c0e041-086c-46c4-a62b-d2485cf8e4ce', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:27:28.66448+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a2b9b6d-0e4f-4450-a231-34fe4868c085', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:28:40.899563+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b5da2288-6d1b-4f49-82d7-e7e52a1b4dc4', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:28:50.506219+00', ''),
	('00000000-0000-0000-0000-000000000000', '051caa60-ce91-453c-834f-341159144f3c', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:28:52.943643+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ae81d17f-0da2-4508-a8db-b376848237cb', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:29:07.285238+00', ''),
	('00000000-0000-0000-0000-000000000000', '9d91bdc0-d988-4d43-83b2-cd5ea62c149a', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:29:07.558342+00', ''),
	('00000000-0000-0000-0000-000000000000', '72d2bfee-b736-4115-8ff8-a1d709a821bf', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:35:23.638459+00', ''),
	('00000000-0000-0000-0000-000000000000', '3177b859-b090-4de9-990f-724ea739dcf8', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:35:26.048945+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b63b1a53-a478-4e46-9a0f-a60a75ecd4ff', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 02:36:42.188965+00', ''),
	('00000000-0000-0000-0000-000000000000', '642c010d-4518-42e4-8fcd-5cda0af5f5b0', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 02:37:09.469695+00', ''),
	('00000000-0000-0000-0000-000000000000', '5025b4a2-099b-4914-bfa3-6736c0a81a53', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 03:48:37.478898+00', ''),
	('00000000-0000-0000-0000-000000000000', '2ee70c83-709e-4e0f-ac71-5a7016ccffbb', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 03:48:40.170156+00', ''),
	('00000000-0000-0000-0000-000000000000', '9141be4d-a540-40fe-a2a0-578867687a22', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 04:26:36.401099+00', ''),
	('00000000-0000-0000-0000-000000000000', '79f4ec6a-d570-414c-8bdb-87d51acdc535', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 04:26:38.815273+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd8c96622-96c2-4492-a3c6-db4619273761', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-17 04:47:05.735343+00', ''),
	('00000000-0000-0000-0000-000000000000', '2edaa5c2-dab9-4850-876f-667d8ee86dc9', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-17 04:47:09.104545+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f3fe1f0-3585-4bbb-92ec-9041618deb34', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:10:18.152467+00', ''),
	('00000000-0000-0000-0000-000000000000', '0a2d4a9a-19cc-49b8-9e9c-f6edaefecb0e', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:10:24.641242+00', ''),
	('00000000-0000-0000-0000-000000000000', '7498c71a-ea57-4885-9f55-eb56aae51004', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:10:31.121343+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2ffe777-004c-4a97-9f27-4dacfef092af', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:10:47.455636+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd9c34646-ac38-4393-b517-0411020563ed', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:10:51.563803+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc1ae307-6ec5-42a4-861e-34b4a2445196', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:10:58.680322+00', ''),
	('00000000-0000-0000-0000-000000000000', '0c8df0b2-ad0f-4f7b-9237-3a4341522a8c', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:11:07.761423+00', ''),
	('00000000-0000-0000-0000-000000000000', '55b89850-8683-4b87-9d4f-a6a57a0daa32', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:11:08.912554+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e96464e8-d209-4122-adf0-c06ea6f1633d', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:11:18.345727+00', ''),
	('00000000-0000-0000-0000-000000000000', '45d1313f-6ce6-48e9-82cc-643b3539b32e', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:14:09.198797+00', ''),
	('00000000-0000-0000-0000-000000000000', '3ea11f71-4c73-4233-aef4-a3cb38819310', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:20:29.110988+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ac87a6f-7d67-4a5e-843f-8a1874427b8f', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:20:47.942946+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7b13106-8b28-4e4a-82af-f734413e799a', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:20:51.842586+00', ''),
	('00000000-0000-0000-0000-000000000000', '0a8a58b8-7c2b-477f-9c57-1eac2c7e8ecd', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:20:54.292513+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e6bee4d9-c65e-4b8a-9a6a-f7cff327ad40', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:30:03.104023+00', ''),
	('00000000-0000-0000-0000-000000000000', '50b99fbc-168e-4341-ada5-a07061f1b748', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:30:05.653433+00', ''),
	('00000000-0000-0000-0000-000000000000', '3aba64ac-e47c-4d78-b723-c9df8b8f92b3', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:30:22.796521+00', ''),
	('00000000-0000-0000-0000-000000000000', '84d37b99-7c3b-4849-b7ce-28a78c58f9b2', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:30:25.766882+00', ''),
	('00000000-0000-0000-0000-000000000000', '17638ca9-0a07-40bd-86ce-facc7564f897', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:46:19.315384+00', ''),
	('00000000-0000-0000-0000-000000000000', '75ce74f8-ff2d-4dc0-81f7-629708eef9fd', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:53:07.380714+00', ''),
	('00000000-0000-0000-0000-000000000000', '60a07bf6-f510-4a9e-a207-a706f4153301', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:54:39.434175+00', ''),
	('00000000-0000-0000-0000-000000000000', '1c6b5409-3cec-42bc-9c23-e43343b3734e', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:54:41.249805+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd136efd-4aff-419d-a093-da841a8dc348', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:54:48.113315+00', ''),
	('00000000-0000-0000-0000-000000000000', '5e9da6b3-7bf7-4905-95fc-4a87a9f8ba6f', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:54:56.203673+00', ''),
	('00000000-0000-0000-0000-000000000000', '6213381d-4ad4-4674-9db3-febfcaadb551', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:55:11.862723+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec18e29e-5ce5-4e73-b44d-754ae25c1b74', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:55:13.301108+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db819e52-654f-41de-bbd8-fd0ff347a0dd', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:55:35.785989+00', ''),
	('00000000-0000-0000-0000-000000000000', '5c722118-c6c3-4651-8942-8ffbfe7ccac7', '{"action":"login","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:58:20.847211+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd466dc15-c551-47fb-a758-c5ff2bbed52a', '{"action":"logout","actor_id":"fb91ee2c-848e-42e1-bba1-3094bb367cf6","actor_username":"teststudent@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:58:23.916566+00', ''),
	('00000000-0000-0000-0000-000000000000', '271065b0-553e-4c4a-81b1-bf82fcab26f2', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:58:34.775601+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e630b2c1-e56e-4c64-872e-e348c9ef0c3a', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:58:37.457367+00', ''),
	('00000000-0000-0000-0000-000000000000', '6726eea2-042a-45dd-bc56-3782be8eb42d', '{"action":"login","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 07:58:55.437749+00', ''),
	('00000000-0000-0000-0000-000000000000', '2bf8969f-8f58-49e2-914f-7ddb1140182d', '{"action":"logout","actor_id":"9704c589-af76-469c-b51c-fe0ae7f6548d","actor_username":"admin1@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 07:58:59.218866+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b6984b87-1f7b-47d5-b51b-2017bbc59dd1', '{"action":"login","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-03-18 08:00:13.644341+00', ''),
	('00000000-0000-0000-0000-000000000000', '45d75897-8ae8-428a-b583-a162a0dac0a8', '{"action":"logout","actor_id":"78026fdb-6a86-41d9-82ca-14eb5409a493","actor_username":"test@siam.edu","actor_via_sso":false,"log_type":"account"}', '2026-03-18 08:00:22.658609+00', '');


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
	('00000000-0000-0000-0000-000000000000', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'authenticated', 'authenticated', 'teststudent@siam.edu', '$2a$10$35tJ80nNZ1H0.cxJh9uksOWiOOoovXE8DGvq3wAK9diPpVeXZtzMO', '2026-03-14 07:03:17.246264+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-18 07:58:20.848739+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-14 07:03:17.238631+00', '2026-03-18 07:58:20.851633+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9704c589-af76-469c-b51c-fe0ae7f6548d', 'authenticated', 'authenticated', 'admin1@siam.edu', '$2a$10$WM4zjgAaIoxC7eLKIDoI9Or9uVm2tdaRe/sNAqweKZHjDgRSHWRPu', '2026-03-17 01:48:37.554461+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-18 07:58:55.439258+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-17 01:48:37.536084+00', '2026-03-18 07:58:55.442409+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '78026fdb-6a86-41d9-82ca-14eb5409a493', 'authenticated', 'authenticated', 'test@siam.edu', '$2a$10$zkc/rPvjjvrMdyE30U/59.PoECQbh2.6ogTUn2iwjTEU.7C7gSFnO', '2026-03-14 05:06:09.635587+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-18 08:00:13.645614+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-14 05:06:09.629559+00', '2026-03-18 08:00:13.6492+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('78026fdb-6a86-41d9-82ca-14eb5409a493', '78026fdb-6a86-41d9-82ca-14eb5409a493', '{"sub": "78026fdb-6a86-41d9-82ca-14eb5409a493", "email": "test@siam.edu", "email_verified": false, "phone_verified": false}', 'email', '2026-03-14 05:06:09.632445+00', '2026-03-14 05:06:09.632482+00', '2026-03-14 05:06:09.632482+00', 'f8616c4c-2ddc-4ef3-b02c-f9953797d1b6'),
	('fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', '{"sub": "fb91ee2c-848e-42e1-bba1-3094bb367cf6", "email": "teststudent@siam.edu", "email_verified": false, "phone_verified": false}', 'email', '2026-03-14 07:03:17.242442+00', '2026-03-14 07:03:17.242497+00', '2026-03-14 07:03:17.242497+00', 'ebf2f47b-9c3a-455d-a8a4-38d05f1f2f85'),
	('9704c589-af76-469c-b51c-fe0ae7f6548d', '9704c589-af76-469c-b51c-fe0ae7f6548d', '{"sub": "9704c589-af76-469c-b51c-fe0ae7f6548d", "email": "admin1@siam.edu", "email_verified": false, "phone_verified": false}', 'email', '2026-03-17 01:48:37.546371+00', '2026-03-17 01:48:37.546451+00', '2026-03-17 01:48:37.546451+00', 'deee26ba-2d41-472e-a49d-d3831e3b9d81');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



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
	(1, 'วิทยาศาสตร์', '2026-03-14 03:08:29.695641+00');


--
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."majors" ("id", "name", "faculty_id", "created_at") VALUES
	(1, 'วิทยาการคอมพิวเตอร์', 1, '2026-03-14 07:22:40.542695+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "role", "created_at", "full_name") VALUES
	('fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'student', '2026-03-14 07:04:23.250843+00', 'นาย แข็งแกร่ง ดั่งหินผา'),
	('78026fdb-6a86-41d9-82ca-14eb5409a493', 'teacher', '2026-03-14 06:01:35.094689+00', 'ดร.สมชาย ใจดี'),
	('9704c589-af76-469c-b51c-fe0ae7f6548d', 'admin', '2026-03-17 01:49:10.187107+00', 'admin01');


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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 58, true);


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

-- \unrestrict qRjJaUdwJo0d6ugGryFQYMQmEBxvOWo22xKGcFUHL7D8RBODOgoBevSWHXZ5geg

RESET ALL;
