-- =====================================================================
-- Exam Management System - Stored Procedures Script
-- =====================================================================
USE ExamManagementDB;                                                         -- Ensures procedures are created in correct database
GO

-- ---------------------------------------------------------------------
-- Procedure: USP_GetAllStudents
-- Purpose  : Returns all students for the student autofill control
-- ---------------------------------------------------------------------
CREATE PROCEDURE USP_GetAllStudents
AS
BEGIN
    SET NOCOUNT ON;                                                          -- Suppresses row count messages
    SELECT StudentID, StudentName, Mail                                      -- Selects columns needed by the UI
    FROM StudentMst                                                          -- Reads from the student master table
    ORDER BY StudentName ASC;                                                -- Orders alphabetically for autofill
END
GO

-- ---------------------------------------------------------------------
-- Procedure: USP_GetAllSubjects
-- Purpose  : Returns all subjects for the subject autofill control
-- ---------------------------------------------------------------------
CREATE PROCEDURE USP_GetAllSubjects
AS
BEGIN
    SET NOCOUNT ON;                                                          -- Suppresses row count messages
    SELECT SubjectID, SubjectName                                            -- Selects columns needed by the UI
    FROM SubjectMst                                                          -- Reads from the subject master table
    ORDER BY SubjectName ASC;                                                -- Orders alphabetically for autofill
END
GO

-- ---------------------------------------------------------------------
-- Procedure: USP_CheckStudentEmailExists
-- Purpose  : Validates whether an email already exists (uniqueness rule)
-- ---------------------------------------------------------------------
CREATE PROCEDURE USP_CheckStudentEmailExists
    @Mail       NVARCHAR(150),                                                -- Email address to validate
    @StudentID  INT = NULL                                                    -- Optional id to exclude, used on update
AS
BEGIN
    SET NOCOUNT ON;                                                          -- Suppresses row count messages
    SELECT COUNT(1) AS EmailCount                                            -- Returns count of matching emails
    FROM StudentMst                                                          -- Reads from the student master table
    WHERE Mail = @Mail                                                       -- Filters by supplied email
      AND (@StudentID IS NULL OR StudentID <> @StudentID);                   -- Excludes current student when updating
END
GO

-- ---------------------------------------------------------------------
-- Procedure: USP_CheckExamExistsForYear
-- Purpose  : Validates the StudentID + ExamYear uniqueness rule
-- ---------------------------------------------------------------------
CREATE PROCEDURE USP_CheckExamExistsForYear
    @StudentID  INT,                                                          -- Student identifier to check
    @ExamYear   INT                                                           -- Exam year to check
AS
BEGIN
    SET NOCOUNT ON;                                                          -- Suppresses row count messages
    SELECT COUNT(1) AS ExamCount                                             -- Returns count of matching exam records
    FROM ExamMaster                                                          -- Reads from the exam master table
    WHERE StudentID = @StudentID                                            -- Filters by supplied student id
      AND ExamYear = @ExamYear;                                             -- Filters by supplied exam year
END
GO

-- ---------------------------------------------------------------------
-- Procedure: USP_SaveExamDetails
-- Purpose  : Saves ExamMaster + ExamDtls in a single transaction,
--            auto calculating TotalMark and PassOrFail
-- ---------------------------------------------------------------------
CREATE PROCEDURE USP_SaveExamDetails
    @StudentID  INT,                                                          -- Student identifier for the exam
    @ExamYear   INT,                                                          -- Year of the exam
    @ExamDtls   ExamDtlsTableType READONLY                                    -- Table valued parameter of subject marks
AS
BEGIN
    SET NOCOUNT ON;                                                          -- Suppresses row count messages
    SET XACT_ABORT ON;                                                       -- Rolls back automatically on error

    BEGIN TRY                                                                -- Starts try block for safe transaction
        IF EXISTS (SELECT 1 FROM ExamMaster                                  -- Re-validates uniqueness inside procedure
                    WHERE StudentID = @StudentID AND ExamYear = @ExamYear)
        BEGIN
            RAISERROR('Exam record already exists for this student and year.', 16, 1); -- Raises duplicate error
            RETURN;                                                          -- Stops execution on validation failure
        END

        IF NOT EXISTS (SELECT 1 FROM @ExamDtls)                              -- Validates at least one subject supplied
        BEGIN
            RAISERROR('At least one subject with marks is required.', 16, 1); -- Raises missing subject error
            RETURN;                                                          -- Stops execution on validation failure
        END

        BEGIN TRANSACTION;                                                   -- Begins explicit transaction

        DECLARE @TotalMark  INT;                                             -- Holds the calculated total mark
        DECLARE @PassOrFail NVARCHAR(10);                                    -- Holds the derived pass or fail status
        DECLARE @MasterID   INT;                                             -- Holds the newly generated master id

        SELECT @TotalMark = SUM(Marks) FROM @ExamDtls;                       -- Sums marks from the table valued parameter

        IF EXISTS (SELECT 1 FROM @ExamDtls WHERE Marks < 25)                 -- Checks if any subject is below pass mark
            SET @PassOrFail = 'FAIL';                                        -- Sets overall result to FAIL
        ELSE
            SET @PassOrFail = 'PASS';                                        -- Sets overall result to PASS

        INSERT INTO ExamMaster (StudentID, ExamYear, TotalMark, PassOrFail, CreateTime) -- Inserts exam master header row
        VALUES (@StudentID, @ExamYear, @TotalMark, @PassOrFail, GETDATE());  -- Supplies values for the new row

        SET @MasterID = SCOPE_IDENTITY();                                    -- Captures the generated MasterID

        INSERT INTO ExamDtls (MasterID, SubjectID, Marks)                    -- Inserts one row per subject detail
        SELECT @MasterID, SubjectID, Marks FROM @ExamDtls;                   -- Maps TVP rows into ExamDtls table

        COMMIT TRANSACTION;                                                  -- Commits the transaction on success

        SELECT @MasterID AS MasterID, @TotalMark AS TotalMark, @PassOrFail AS PassOrFail; -- Returns result to caller
    END TRY
    BEGIN CATCH                                                              -- Handles any runtime error
        IF XACT_STATE() <> 0                                                 -- Checks if a transaction is still open
            ROLLBACK TRANSACTION;                                            -- Rolls back the open transaction
        THROW;                                                               -- Re-throws the original error to caller
    END CATCH
END
GO

-- ---------------------------------------------------------------------
-- Procedure: USP_GetExamMasterById
-- Purpose  : Returns exam master + student info for a saved MasterID
-- ---------------------------------------------------------------------
CREATE PROCEDURE USP_GetExamMasterById
    @MasterID INT                                                            -- Exam master identifier to fetch
AS
BEGIN
    SET NOCOUNT ON;                                                          -- Suppresses row count messages
    SELECT
        EM.MasterID,                                                         -- Exam master identifier
        EM.StudentID,                                                        -- Student identifier
        SM.StudentName,                                                      -- Student name from student master
        SM.Mail,                                                             -- Student email from student master
        EM.ExamYear,                                                         -- Year of the exam
        EM.TotalMark,                                                        -- Calculated total mark
        EM.PassOrFail,                                                       -- Derived pass or fail status
        EM.CreateTime                                                        -- Record creation timestamp
    FROM ExamMaster EM                                                       -- Base exam master table
    INNER JOIN StudentMst SM ON SM.StudentID = EM.StudentID                  -- Joins to fetch student details
    WHERE EM.MasterID = @MasterID;                                          -- Filters by requested master id
END
GO

-- ---------------------------------------------------------------------
-- Procedure: USP_GetExamDtlsByMasterId
-- Purpose  : Returns subject wise mark rows for a saved MasterID
-- ---------------------------------------------------------------------
CREATE PROCEDURE USP_GetExamDtlsByMasterId
    @MasterID INT                                                            -- Exam master identifier to fetch details for
AS
BEGIN
    SET NOCOUNT ON;                                                          -- Suppresses row count messages
    SELECT
        ED.DtlsID,                                                           -- Exam detail identifier
        ED.SubjectID,                                                        -- Subject identifier
        SB.SubjectName,                                                      -- Subject name from subject master
        ED.Marks                                                             -- Marks scored in the subject
    FROM ExamDtls ED                                                         -- Base exam details table
    INNER JOIN SubjectMst SB ON SB.SubjectID = ED.SubjectID                  -- Joins to fetch subject name
    WHERE ED.MasterID = @MasterID;                                          -- Filters by requested master id
END
GO

-- ---------------------------------------------------------------------
-- Procedure: USP_GetAllExamResults
-- Purpose  : Returns all saved exam header records for the results grid
-- ---------------------------------------------------------------------
CREATE PROCEDURE USP_GetAllExamResults
AS
BEGIN
    SET NOCOUNT ON;                                                          -- Suppresses row count messages
    SELECT
        EM.MasterID,                                                         -- Exam master identifier
        EM.StudentID,                                                        -- Student identifier
        SM.StudentName,                                                      -- Student name from student master
        SM.Mail,                                                             -- Student email from student master
        EM.ExamYear,                                                         -- Year of the exam
        EM.TotalMark,                                                        -- Calculated total mark
        EM.PassOrFail,                                                       -- Derived pass or fail status
        EM.CreateTime                                                        -- Record creation timestamp
    FROM ExamMaster EM                                                       -- Base exam master table
    INNER JOIN StudentMst SM ON SM.StudentID = EM.StudentID                  -- Joins to fetch student details
    ORDER BY EM.CreateTime DESC;                                             -- Orders newest records first
END
GO
