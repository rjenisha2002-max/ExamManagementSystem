-- =====================================================================
-- Exam Management System - Sample Seed Data Script
-- =====================================================================
USE ExamManagementDB;                                                         -- Ensures data is seeded into the correct database
GO

-- ---------------------------------------------------------------------
-- Sample data for SubjectMst
-- ---------------------------------------------------------------------
INSERT INTO SubjectMst (SubjectName) VALUES ('Mathematics');                  -- Inserts sample subject Mathematics
INSERT INTO SubjectMst (SubjectName) VALUES ('Science');                      -- Inserts sample subject Science
INSERT INTO SubjectMst (SubjectName) VALUES ('English');                      -- Inserts sample subject English
INSERT INTO SubjectMst (SubjectName) VALUES ('Social Studies');               -- Inserts sample subject Social Studies
INSERT INTO SubjectMst (SubjectName) VALUES ('Computer Science');             -- Inserts sample subject Computer Science
GO

-- ---------------------------------------------------------------------
-- Sample data for StudentMst
-- ---------------------------------------------------------------------
INSERT INTO StudentMst (StudentName, Mail) VALUES ('Lekshmi C', 'lekshmi.c@example.com');       -- Inserts sample student Lekshmi C
INSERT INTO StudentMst (StudentName, Mail) VALUES ('Kavitha Menon', 'kavitha.menon@example.com'); -- Inserts sample student Kavitha
INSERT INTO StudentMst (StudentName, Mail) VALUES ('Arundhathy MU', 'arundhathy.mu@example.com'); -- Inserts sample student Arundhathy
INSERT INTO StudentMst (StudentName, Mail) VALUES ('Rahul Kumar', 'rahul.kumar@example.com');     -- Inserts sample student Rahul
INSERT INTO StudentMst (StudentName, Mail) VALUES ('Priya Sharma', 'priya.sharma@example.com');   -- Inserts sample student Priya
GO
