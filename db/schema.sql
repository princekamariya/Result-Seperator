-- PostgreSQL schema for result_separator

-- ENUM types
CREATE TYPE student_type_enum         AS ENUM ('school', 'college');
CREATE TYPE submission_status_enum    AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE standard_category_enum   AS ENUM ('pre_school', 'primary', 'middle', 'secondary', 'higher_secondary');

-- Function that sets updated_at to current time before any UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- MASTER TABLES

CREATE TABLE IF NOT EXISTS school_standards (
  id         SERIAL                 PRIMARY KEY,
  key_name   VARCHAR(50)            NOT NULL UNIQUE,
  value      VARCHAR(100)           NOT NULL,
  category   standard_category_enum NOT NULL,
  sort_order SMALLINT               NOT NULL DEFAULT 0,
  is_active  BOOLEAN                NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP              DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP              DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_school_standards_updated_at
  BEFORE UPDATE ON school_standards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS school_boards (
  id         SERIAL       PRIMARY KEY,
  key_name   VARCHAR(50)  NOT NULL UNIQUE,
  value      VARCHAR(200) NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_school_boards_updated_at
  BEFORE UPDATE ON school_boards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS college_degrees (
  id         SERIAL        PRIMARY KEY,
  key_name   VARCHAR(100)  NOT NULL UNIQUE,
  value      VARCHAR(250)  NOT NULL,
  sort_order SMALLINT      NOT NULL DEFAULT 0,
  is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_college_degrees_updated_at
  BEFORE UPDATE ON college_degrees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- MAIN TABLE for Student Submissions

CREATE TABLE IF NOT EXISTS student_submissions (
  id          SERIAL PRIMARY KEY,

  first_name  VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name   VARCHAR(100) NOT NULL,
  mother_name VARCHAR(100) NOT NULL,

  parents_phone       VARCHAR(15) NOT NULL,
  whatsapp_number     VARCHAR(15) NOT NULL,
  email               VARCHAR(150),
  student_phone       VARCHAR(15),

  residential_address TEXT NOT NULL,

  student_type student_type_enum NOT NULL,

  school_standard_id VARCHAR(50),
  school_board_id    VARCHAR(50),

  college_degree_id VARCHAR(100),
  semester          SMALLINT,
  university_name   VARCHAR(250),

  result_year            SMALLINT     NOT NULL,
  percentage             NUMERIC(5,2) NOT NULL,
  result_image_url       VARCHAR(500),
  result_image_public_id VARCHAR(200),

  submission_status submission_status_enum NOT NULL DEFAULT 'pending',
  rejection_reason  TEXT,
  rank_position     INTEGER,
  prize_amount      NUMERIC(10,2),

  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_school_standard FOREIGN KEY (school_standard_id) REFERENCES school_standards(key_name) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_school_board    FOREIGN KEY (school_board_id)    REFERENCES school_boards(key_name)    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_college_degree  FOREIGN KEY (college_degree_id)  REFERENCES college_degrees(key_name)  ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_student_type      ON student_submissions (student_type);
CREATE INDEX idx_result_year       ON student_submissions (result_year);
CREATE INDEX idx_submission_status ON student_submissions (submission_status);
CREATE INDEX idx_percentage        ON student_submissions (percentage DESC);
CREATE INDEX idx_submitted_at      ON student_submissions (submitted_at);

CREATE TRIGGER trg_student_submissions_updated_at
  BEFORE UPDATE ON student_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ADMIN USERS

CREATE TABLE IF NOT EXISTS admin_users (
  id         SERIAL       PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
