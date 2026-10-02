
CREATE DATABASE IF NOT EXISTS appzex_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE appzex_db;

-- 1. Tenants (Agencies)
CREATE TABLE IF NOT EXISTS agencies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan ENUM('starter', 'pro', 'enterprise') DEFAULT 'pro',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    primary_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_agencies_status (status)
) ;

-- 2. Global Users (AppZex platform users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    global_role ENUM('super_admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 3. Clients (Customer companies belonging to an Agency)
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    primary_contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    INDEX idx_clients_agency (agency_id)
) ENGINE=InnoDB;

-- 4. Agency Members (Links user -> agency with administrative/team role)
CREATE TABLE IF NOT EXISTS agency_members (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('agency_admin', 'agency_team') NOT NULL,
    job_title VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_agency_user (agency_id, user_id),
    INDEX idx_agency_members_user (user_id)
) ENGINE=InnoDB;

-- 5. Client Members (Links user -> client company for portal access)
CREATE TABLE IF NOT EXISTS client_members (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    designation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_client_user (client_id, user_id),
    INDEX idx_client_members_lookup (agency_id, client_id)
) ENGINE=InnoDB;

-- 6. Projects (Scoped to agency and client)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    project_manager_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    start_date DATE,
    expected_completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_projects_agency_client (agency_id, client_id),
    INDEX idx_projects_status (status)
) ENGINE=InnoDB;

-- 7. Milestones (Stages within a project)
CREATE TABLE IF NOT EXISTS milestones (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_milestones_project (project_id)
) ENGINE=InnoDB;

-- 8. Tasks (Work items within a project / milestone)
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    milestone_id VARCHAR(36) NULL,
    assignee_id VARCHAR(36) NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'in_review', 'completed') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tasks_agency_project (agency_id, project_id),
    INDEX idx_tasks_due_status (due_date, status)
) ENGINE=InnoDB;

-- 9. Meetings & Internal/Shared Notes
CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    meeting_date DATETIME NOT NULL,
    notes TEXT NOT NULL,
    is_shared_with_client BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_meetings_lookup (project_id, is_shared_with_client)
) ENGINE=InnoDB;

-- 10. Client Feedback & Change Requests
CREATE TABLE IF NOT EXISTS feedback_requests (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    submitted_by VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_review', 'in_progress', 'resolved', 'declined') DEFAULT 'open',
    agency_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    INDEX idx_feedback_agency_project (agency_id, project_id, status)
) ENGINE=InnoDB;

-- 11. Secure Files & Documents
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NULL,
    feedback_id VARCHAR(36) NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    is_shared_with_client BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (feedback_id) REFERENCES feedback_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_files_lookup (project_id, is_shared_with_client)
) ENGINE=InnoDB;

-- 12. Activity & Audit Logs (Platform & Agency Timelines)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NULL,
    actor_id VARCHAR(36) NOT NULL,
    actor_type ENUM('super_admin', 'agency_user', 'client_user', 'system') NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    related_entity_type VARCHAR(50) NOT NULL,
    related_entity_id VARCHAR(36) NOT NULL,
    visibility ENUM('internal', 'client') DEFAULT 'internal',
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity_agency_visibility (agency_id, visibility, created_at)
) ENGINE=InnoDB;
