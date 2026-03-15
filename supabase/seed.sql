
--
-- PostgreSQL database dump
--


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
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change,
                        email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
                        email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES ('00000000-0000-0000-0000-000000000000',
                                                                                                                                                                                                '78026fdb-6a86-41d9-82ca-14eb5409a493', 'authenticated', 'authenticated', 'test@siam.edu', '$2a$10$zkc/rPvjjvrMdyE30U/59.PoECQbh2.6ogTUn2iwjTEU.7C7gSFnO', '2026-03-14 05:06:09.635587+00', NULL, '', NULL, '', NULL, '', '',
                                                                                                                                                                                                NULL, '2026-03-14 08:25:44.901713+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-14 05:06:09.629559+00', '2026-03-14 08:25:44.904764+00', NULL, NULL, '', '', NULL, '', 0, NULL,
                                                                                                                                                                                                '', NULL, false, NULL, false);
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change,
                        email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
                        email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES ('00000000-0000-0000-0000-000000000000',
                                                                                                                                                                                                'fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'authenticated', 'authenticated', 'teststudent@siam.edu', '$2a$10$35tJ80nNZ1H0.cxJh9uksOWiOOoovXE8DGvq3wAK9diPpVeXZtzMO', '2026-03-14 07:03:17.246264+00', NULL, '', NULL, '', NULL, '',
                                                                                                                                                                                                '', NULL, '2026-03-14 08:26:08.415892+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-14 07:03:17.238631+00', '2026-03-14 09:30:36.725615+00', NULL, NULL, '', '', NULL, '', 0,
                                                                                                                                                                                                NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('78026fdb-6a86-41d9-82ca-14eb5409a493', '78026fdb-6a86-41d9-82ca-14eb5409a493', '{"sub":
"78026fdb-6a86-41d9-82ca-14eb5409a493", "email": "test@siam.edu", "email_verified": false, "phone_verified": false}', 'email', '2026-03-14 05:06:09.632445+00', '2026-03-14 05:06:09.632482+00', '2026-03-14 05:06:09.632482+00',
                                                                                                                                 'f8616c4c-2ddc-4ef3-b02c-f9953797d1b6');
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) VALUES ('fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'fb91ee2c-848e-42e1-bba1-3094bb367cf6', '{"sub":
"fb91ee2c-848e-42e1-bba1-3094bb367cf6", "email": "teststudent@siam.edu", "email_verified": false, "phone_verified": false}', 'email', '2026-03-14 07:03:17.242442+00', '2026-03-14 07:03:17.242497+00', '2026-03-14
07:03:17.242497+00', 'ebf2f47b-9c3a-455d-a8a4-38d05f1f2f85');


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.faculties (id, name, created_at) VALUES (1, 'วิทยาศาสตร์', '2026-03-14 03:08:29.695641+00');


--
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.majors (id, name, faculty_id, created_at) VALUES (1, 'วิทยาการคอมพิวเตอร์', 1, '2026-03-14 07:22:40.542695+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.profiles (id, role, created_at, full_name) VALUES ('fb91ee2c-848e-42e1-bba1-3094bb367cf6', 'student', '2026-03-14 07:04:23.250843+00', 'นาย แข็งแกร่ง ดั่งหินผา');
INSERT INTO public.profiles (id, role, created_at, full_name) VALUES ('78026fdb-6a86-41d9-82ca-14eb5409a493', 'teacher', '2026-03-14 06:01:35.094689+00', 'ดร.สมชาย ใจดี');


--
-- Data for Name: teacher_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.teacher_details (id, created_at, major_id) VALUES ('78026fdb-6a86-41d9-82ca-14eb5409a493', '2026-03-14 07:22:59.045805+00', 1);


--
-- Data for Name: student_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.student_details (id, student_code, year_level, created_at, advisor_id, major_id) VALUES ('fb91ee2c-848e-42e1-bba1-3094bb367cf6', '6504800001', 1, '2026-03-14 07:23:25.536778+00',
                                                                                                            '78026fdb-6a86-41d9-82ca-14eb5409a493', 1);


--
-- Data for Name: students_test; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.students_test (id, name, nickname, major, created_at) VALUES (1231, 'Iron Man', 'Tony Stark', 'SSSSS', '2026-03-13 21:36:08.20894+00');
INSERT INTO public.students_test (id, name, nickname, major, created_at) VALUES (1232, 'Captain America', 'Steve Rogers ', 'AAAA', '2026-03-13 21:36:30.797246+00');
INSERT INTO public.students_test (id, name, nickname, major, created_at) VALUES (1, 'Spider-Man', 'Peter Parker', 'ssssss', '2026-03-13 21:36:53.457316+00');


--
-- Name: faculties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculties_id_seq', 1, true);


--
-- Name: majors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.majors_id_seq', 1, true);


--
-- Name: students_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_test_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--
