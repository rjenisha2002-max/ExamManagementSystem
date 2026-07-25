-- =====================================================================
-- Exam Management System - Database Schema Script
-- =====================================================================

CREATE DATABASE ExamManagementDB;                                             -- Creates the exam management database
GO

USE ExamManagementDB;                                                         -- Switches execution context to the new database
GO

-- ---------------------------------------------------------------------
-- Table: SubjectMst  (Master list of subjects)
-- ---------------------------------------------------------------------
CREATE TABLE SubjectMst
(
    SubjectID     INT IDENTITY(1,1) NOT NULL,                                 -- Auto generated primary key for subject
    SubjectName   NVARCHAR(100)     NOT NULL,                                 -- Name of the subject
    CONSTRAINT PK_SubjectMst PRIMARY KEY CLUSTERED (SubjectID)                -- Primary key constraint on SubjectID
);
GO

-- ---------------------------------------------------------------------
-- Table: StudentMst  (Master list of students)
-- ---------------------------------------------------------------------
CREATE TABLE StudentMst
(
    StudentID     INT IDENTITY(1,1)  NOT NULL,                                -- Auto generated primary key for student
    StudentName   NVARCHAR(250)      NOT NULL,                                -- Full name of the student, length 5-250
    Mail          NVARCHAR(150)      NOT NULL,                                -- Unique email address of the student
    CONSTRAINT PK_StudentMst PRIMARY KEY CLUSTERED (StudentID),               -- Primary key constraint on StudentID
    CONSTRAINT UQ_StudentMst_Mail UNIQUE (Mail),                              -- Unique constraint enforcing unique email
    CONSTRAINT CK_StudentMst_NameLength CHECK (LEN(StudentName) BETWEEN 5 AND 250) -- Check constraint for name length
);
GO

-- ---------------------------------------------------------------------
-- Table: ExamMaster  (Header record per student per exam year)
-- ---------------------------------------------------------------------
CREATE TABLE ExamMaster
(
    MasterID      INT IDENTITY(1,1) NOT NULL,                                 -- Auto generated primary key for exam master
    StudentID     INT               NOT NULL,                                 -- Foreign key reference to StudentMst
    ExamYear      INT               NOT NULL,                                 -- Year in which the exam was conducted
    TotalMark     INT               NOT NULL DEFAULT (0),                     -- Calculated sum of all subject marks
    PassOrFail    NVARCHAR(10)      NOT NULL,                                 -- Derived overall result, PASS or FAIL
    CreateTime    DATETIME          NOT NULL DEFAULT (GETDATE()),             -- Timestamp when the record was created
    CONSTRAINT PK_ExamMaster PRIMARY KEY CLUSTERED (MasterID),                -- Primary key constraint on MasterID
    CONSTRAINT FK_ExamMaster_StudentMst FOREIGN KEY (StudentID)               -- Foreign key constraint definition start
        REFERENCES StudentMst (StudentID),                                    -- Links ExamMaster to StudentMst table
    CONSTRAINT UQ_ExamMaster_Student_Year UNIQUE (StudentID, ExamYear)        -- Ensures one exam record per student per year
);
GO

-- ---------------------------------------------------------------------
-- Table: ExamDtls  (Subject wise mark details for an exam master row)
-- ---------------------------------------------------------------------
CREATE TABLE ExamDtls
(
    DtlsID        INT IDENTITY(1,1) NOT NULL,                                 -- Auto generated primary key for exam detail
    MasterID      INT               NOT NULL,                                 -- Foreign key reference to ExamMaster
    SubjectID     INT               NOT NULL,                                 -- Foreign key reference to SubjectMst
    Marks         INT               NOT NULL,                                 -- Marks scored in the subject, 0 to 100
    CONSTRAINT PK_ExamDtls PRIMARY KEY CLUSTERED (DtlsID),                    -- Primary key constraint on DtlsID
    CONSTRAINT FK_ExamDtls_ExamMaster FOREIGN KEY (MasterID)                  -- Foreign key constraint definition start
        REFERENCES ExamMaster (MasterID),                                     -- Links ExamDtls to ExamMaster table
    CONSTRAINT FK_ExamDtls_SubjectMst FOREIGN KEY (SubjectID)                 -- Foreign key constraint definition start
        REFERENCES SubjectMst (SubjectID),                                    -- Links ExamDtls to SubjectMst table
    CONSTRAINT CK_ExamDtls_MarksRange CHECK (Marks BETWEEN 0 AND 100)         -- Check constraint enforcing marks range
);
GO

-- ---------------------------------------------------------------------
-- Table Type: Used as a Table Valued Parameter to pass subject marks
-- ---------------------------------------------------------------------
CREATE TYPE ExamDtlsTableType AS TABLE
(
    SubjectID     INT NOT NULL,                                               -- Subject identifier column for the TVP
    Marks         INT NOT NULL                                                -- Marks scored column for the TVP
);
GO
