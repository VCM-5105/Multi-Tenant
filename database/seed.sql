

USE appzex_db;


INSERT INTO agencies (id, name, slug, plan, status, primary_email, phone)
VALUES (
    'agency-001-apex',
    'Apex Digital Studio',
    'apex-digital',
    'enterprise',
    'active',
    'contact@apexdigital.com',
    '+1-555-0100'
);

-- Agency 2: Suspended agency (CRITICAL for testing 403 suspension lockout)
INSERT INTO agencies (id, name, slug, plan, status, primary_email, phone)
VALUES (
    'agency-002-orbit',
    'Orbit Marketing Inc',
    'orbit-marketing',
    'pro',
    'suspended',
    'billing@orbitmarketing.com',
    '+1-555-0199'
);

-- -------------------------------------------------------------
-- 2. SEED USERS (Global Platform Identity)
-- -------------------------------------------------------------
-- User 1: Super Admin (Platform Owner)
INSERT INTO users (id, name, email, password_hash, global_role, is_active)
VALUES (
    'usr-super-001',
    'Alexander Vance (Super Admin)',
    'superadmin@appzex.com',
    '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xTw3.551E5.U.P0d.rO',
    'super_admin',
    TRUE
);

-- User 2: Agency Admin for Apex Digital
INSERT INTO users (id, name, email, password_hash, global_role, is_active)
VALUES (
    'usr-agency-admin-001',
    'Sarah Connor (Apex Admin)',
    'admin@apexdigital.com',
    '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xTw3.551E5.U.P0d.rO',
    'user',
    TRUE
);

-- User 3: Agency Team Member for Apex Digital
INSERT INTO users (id, name, email, password_hash, global_role, is_active)
VALUES (
    'usr-agency-team-001',
    'Marcus Wright (Apex Developer)',
    'dev@apexdigital.com',
    '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xTw3.551E5.U.P0d.rO',
    'user',
    TRUE
);

-- User 4: Admin for Suspended Agency (Orbit)
INSERT INTO users (id, name, email, password_hash, global_role, is_active)
VALUES (
    'usr-suspended-admin-001',
    'David Miller (Orbit Suspended Admin)',
    'admin@orbitmarketing.com',
    '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xTw3.551E5.U.P0d.rO',
    'user',
    TRUE
);

-- User 5: Client User (Customer of Apex Digital)
INSERT INTO users (id, name, email, password_hash, global_role, is_active)
VALUES (
    'usr-client-001',
    'Elena Rostova (Globex Client Lead)',
    'client@globexcorp.com',
    '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xTw3.551E5.U.P0d.rO',
    'user',
    TRUE
);


-- Sarah is Agency Admin at Apex
INSERT INTO agency_members (id, agency_id, user_id, role, job_title)
VALUES (
    'mem-001',
    'agency-001-apex',
    'usr-agency-admin-001',
    'agency_admin',
    'Founder & Managing Director'
);

-- Marcus is Agency Team at Apex
INSERT INTO agency_members (id, agency_id, user_id, role, job_title)
VALUES (
    'mem-002',
    'agency-001-apex',
    'usr-agency-team-001',
    'agency_team',
    'Senior Full-Stack Engineer'
);

-- David is Admin at Orbit (Suspended)
INSERT INTO agency_members (id, agency_id, user_id, role, job_title)
VALUES (
    'mem-003',
    'agency-002-orbit',
    'usr-suspended-admin-001',
    'agency_admin',
    'Agency Owner'
);


INSERT INTO clients (id, agency_id, company_name, primary_contact_person, email, phone, notes)
VALUES (
    'cli-001-globex',
    'agency-001-apex',
    'Globex Corporation',
    'Elena Rostova',
    'contact@globexcorp.com',
    '+1-555-0820',
    'VIP Enterprise Client - E-Commerce Migration Project'
);

INSERT INTO client_members (id, agency_id, client_id, user_id, designation)
VALUES (
    'climem-001',
    'agency-001-apex',
    'cli-001-globex',
    'usr-client-001',
    'VP of Digital Product'
);

-- -------------------------------------------------------------
-- 6. SEED PROJECT
-- -------------------------------------------------------------
INSERT INTO projects (
    id, agency_id, client_id, project_manager_id, name, description, 
    status, priority, start_date, expected_completion_date
)
VALUES (
    'proj-001',
    'agency-001-apex',
    'cli-001-globex',
    'usr-agency-admin-001',
    'Globex Modern Headless E-Commerce',
    'Re-architecting customer portal and storefront into Next.js & Node.js microservices',
    'active',
    'high',
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 60 DAY)
);

-- -------------------------------------------------------------
-- 7. SEED MILESTONES
-- -------------------------------------------------------------
INSERT INTO milestones (id, agency_id, project_id, title, description, order_index, status, due_date)
VALUES 
(
    'ms-001',
    'agency-001-apex',
    'proj-001',
    'Phase 1: Architecture & Data Modeling',
    'Database schema design, multi-tenant isolation verification, and API blueprints',
    1,
    'completed',
    DATE_ADD(CURDATE(), INTERVAL 7 DAY)
),
(
    'ms-002',
    'agency-001-apex',
    'proj-001',
    'Phase 2: Storefront & Client Portal',
    'Client portal integration, tasks view, change requests and feedback loop',
    2,
    'in_progress',
    DATE_ADD(CURDATE(), INTERVAL 30 DAY)
);

-- -------------------------------------------------------------
-- 8. SEED TASKS (2 Completed, 2 In Progress -> Exactly 50% Derived Progress!)
-- -------------------------------------------------------------
INSERT INTO tasks (
    id, agency_id, project_id, milestone_id, assignee_id, 
    title, description, status, priority, due_date
)
VALUES 
(
    'task-001',
    'agency-001-apex',
    'proj-001',
    'ms-001',
    'usr-agency-team-001',
    'Define MySQL Relational DDL & Foreign Keys',
    'Implement all 12 tables with strict agency_id scoping',
    'completed',
    'urgent',
    CURDATE()
),
(
    'task-002',
    'agency-001-apex',
    'proj-001',
    'ms-001',
    'usr-agency-team-001',
    'Implement Tenant Scoping Middleware',
    'Block suspended agencies with HTTP 403 and scope queries',
    'completed',
    'high',
    DATE_ADD(CURDATE(), INTERVAL 2 DAY)
),
(
    'task-003',
    'agency-001-apex',
    'proj-001',
    'ms-002',
    'usr-agency-team-001',
    'Build Client Feedback & Change Request API',
    'State machine: open -> in_review -> in_progress -> resolved',
    'in_progress',
    'medium',
    DATE_ADD(CURDATE(), INTERVAL 14 DAY)
),
(
    'task-004',
    'agency-001-apex',
    'proj-001',
    'ms-002',
    'usr-agency-admin-001',
    'Setup Secure File Download Streaming Service',
    'Permission checks on is_shared_with_client flag',
    'todo',
    'medium',
    DATE_ADD(CURDATE(), INTERVAL 20 DAY)
);

-- -------------------------------------------------------------
-- 9. SEED MEETINGS & NOTES (1 Shared with Client, 1 Internal Only)
-- -------------------------------------------------------------
INSERT INTO meetings (
    id, agency_id, project_id, created_by, title, 
    meeting_date, notes, is_shared_with_client
)
VALUES 
(
    'meet-001',
    'agency-001-apex',
    'proj-001',
    'usr-agency-admin-001',
    'Kickoff & Scope Alignment with Globex',
    NOW(),
    'Discussed key milestones, team assignments, and client portal expectations. Client approved scope.',
    TRUE
),
(
    'meet-002',
    'agency-001-apex',
    'proj-001',
    'usr-agency-admin-001',
    'Internal Architecture Sync',
    NOW(),
    'Internal team note: Need to ensure JWT expiration and rate limiting on client portal auth.',
    FALSE
);

-- -------------------------------------------------------------
-- 10. SEED CLIENT FEEDBACK / CHANGE REQUEST
-- -------------------------------------------------------------
INSERT INTO feedback_requests (
    id, agency_id, project_id, submitted_by, title, 
    description, status, agency_response
)
VALUES (
    'fb-001',
    'agency-001-apex',
    'proj-001',
    'usr-client-001',
    'Add dark mode preview toggle in portal header',
    'Please allow our team to preview the storefront mockups with dark mode enabled.',
    'open',
    NULL
);

-- -------------------------------------------------------------
-- 11. SEED ACTIVITY LOG
-- -------------------------------------------------------------
INSERT INTO activity_logs (
    id, agency_id, actor_id, actor_type, event_type, 
    related_entity_type, related_entity_id, visibility, metadata
)
VALUES (
    'act-001',
    'agency-001-apex',
    'usr-client-001',
    'client_user',
    'feedback.submitted',
    'feedback',
    'fb-001',
    'client',
    '{"title": "Add dark mode preview toggle in portal header"}'
);
