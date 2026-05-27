-- ============================================================
--  Result Separator — Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS result_separator
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE result_separator;

-- ─────────────────────────────────────────────────────────────
--  LOOKUP / MASTER TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS school_standards (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  key_name   VARCHAR(50)  NOT NULL UNIQUE,
  value      VARCHAR(100) NOT NULL,
  category   ENUM('pre_school','primary','middle','secondary','higher_secondary') NOT NULL,
  sort_order SMALLINT     NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS school_boards (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  key_name   VARCHAR(50)  NOT NULL UNIQUE,
  value      VARCHAR(200) NOT NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS college_degrees (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  key_name   VARCHAR(100) NOT NULL UNIQUE,
  value      VARCHAR(250) NOT NULL,
  sort_order SMALLINT     NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
--  MAIN TABLE — Student Submissions
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS student_submissions (
  id          INT AUTO_INCREMENT PRIMARY KEY,

  -- Personal
  first_name  VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name   VARCHAR(100) NOT NULL,
  mother_name VARCHAR(100) NOT NULL,

  -- Contact
  parents_phone       VARCHAR(15)  NOT NULL,
  whatsapp_number     VARCHAR(15)  NOT NULL,
  email               VARCHAR(150),
  student_phone       VARCHAR(15),

  -- Address
  residential_address TEXT NOT NULL,

  -- Education type
  student_type ENUM('school','college') NOT NULL,

  -- School-specific (NULL when college)
  school_standard_id INT,
  school_board_id    INT,

  -- College-specific (NULL when school)
  college_degree_id INT,
  semester          TINYINT UNSIGNED,
  university_name   VARCHAR(250),

  -- Result
  result_year             YEAR         NOT NULL,
  percentage              DECIMAL(5,2) NOT NULL,
  result_image_url        VARCHAR(500),
  result_image_public_id  VARCHAR(200),

  -- Admin
  submission_status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  rejection_reason  TEXT,
  rank_position     INT UNSIGNED,
  prize_amount      DECIMAL(10,2),

  -- Timestamps
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_school_standard FOREIGN KEY (school_standard_id) REFERENCES school_standards(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_school_board    FOREIGN KEY (school_board_id)    REFERENCES school_boards(id)    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_college_degree  FOREIGN KEY (college_degree_id)  REFERENCES college_degrees(id)  ON DELETE SET NULL ON UPDATE CASCADE,

  -- Indexes
  INDEX idx_student_type      (student_type),
  INDEX idx_result_year       (result_year),
  INDEX idx_submission_status (submission_status),
  INDEX idx_percentage        (percentage DESC),
  INDEX idx_submitted_at      (submitted_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
