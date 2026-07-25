using ExamManagementAPI.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ExamManagementAPI.Repositories
{
    // ADO.NET repository for ExamMaster / ExamDtls
    public class ExamRepository : IExamRepository
    {
        private readonly string _connectionString;

        public ExamRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        // Used to enforce the StudentID + ExamYear uniqueness rule
        public async Task<int> GetExamCountForYearAsync(int studentId, int examYear)
        {
            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand("USP_CheckExamExistsForYear", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add(new SqlParameter("@StudentID", SqlDbType.Int) { Value = studentId });
            command.Parameters.Add(new SqlParameter("@ExamYear", SqlDbType.Int) { Value = examYear });

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt32(result);
        }

        // Saves ExamMaster + ExamDtls in one call using a table-valued parameter.
        // TotalMark and PassOrFail are calculated inside USP_SaveExamDetails.
        public async Task<(int MasterId, int TotalMark, string PassOrFail)> SaveExamAsync(
            int studentId, int examYear, List<ExamDtlsItem> examDtls)
        {
            var examDtlsTable = new DataTable();
            examDtlsTable.Columns.Add("SubjectID", typeof(int));
            examDtlsTable.Columns.Add("Marks", typeof(int));

            foreach (var item in examDtls)
            {
                examDtlsTable.Rows.Add(item.SubjectId, item.Marks);
            }

            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand("USP_SaveExamDetails", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add(new SqlParameter("@StudentID", SqlDbType.Int) { Value = studentId });
            command.Parameters.Add(new SqlParameter("@ExamYear", SqlDbType.Int) { Value = examYear });

            command.Parameters.Add(new SqlParameter("@ExamDtls", SqlDbType.Structured)
            {
                TypeName = "ExamDtlsTableType",
                Value = examDtlsTable
            });

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                var masterId = reader.GetInt32(reader.GetOrdinal("MasterID"));
                var totalMark = reader.GetInt32(reader.GetOrdinal("TotalMark"));
                var passOrFail = reader.GetString(reader.GetOrdinal("PassOrFail"));

                return (masterId, totalMark, passOrFail);
            }

            throw new InvalidOperationException("Failed to save exam details.");
        }

        public async Task<ExamMaster?> GetExamByMasterIdAsync(int masterId)
        {
            ExamMaster? examMaster = null;

            using var connection = new SqlConnection(_connectionString);

            using (var command = new SqlCommand("USP_GetExamMasterById", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add(new SqlParameter("@MasterID", SqlDbType.Int) { Value = masterId });

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    examMaster = new ExamMaster
                    {
                        MasterId = reader.GetInt32(reader.GetOrdinal("MasterID")),
                        StudentId = reader.GetInt32(reader.GetOrdinal("StudentID")),
                        StudentName = reader.GetString(reader.GetOrdinal("StudentName")),
                        Mail = reader.GetString(reader.GetOrdinal("Mail")),
                        ExamYear = reader.GetInt32(reader.GetOrdinal("ExamYear")),
                        TotalMark = reader.GetInt32(reader.GetOrdinal("TotalMark")),
                        PassOrFail = reader.GetString(reader.GetOrdinal("PassOrFail")),
                        CreateTime = reader.GetDateTime(reader.GetOrdinal("CreateTime"))
                    };
                }
            }

            if (examMaster == null)
            {
                return null;
            }

            using (var command = new SqlCommand("USP_GetExamDtlsByMasterId", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add(new SqlParameter("@MasterID", SqlDbType.Int) { Value = masterId });

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    examMaster.ExamDtls.Add(new ExamDtlsItem
                    {
                        DtlsId = reader.GetInt32(reader.GetOrdinal("DtlsID")),
                        SubjectId = reader.GetInt32(reader.GetOrdinal("SubjectID")),
                        SubjectName = reader.GetString(reader.GetOrdinal("SubjectName")),
                        Marks = reader.GetInt32(reader.GetOrdinal("Marks"))
                    });
                }
            }

            return examMaster;
        }

        public async Task<List<ExamMaster>> GetAllExamResultsAsync()
        {
            var results = new List<ExamMaster>();

            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand("USP_GetAllExamResults", connection);
            command.CommandType = CommandType.StoredProcedure;

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                results.Add(new ExamMaster
                {
                    MasterId = reader.GetInt32(reader.GetOrdinal("MasterID")),
                    StudentId = reader.GetInt32(reader.GetOrdinal("StudentID")),
                    StudentName = reader.GetString(reader.GetOrdinal("StudentName")),
                    Mail = reader.GetString(reader.GetOrdinal("Mail")),
                    ExamYear = reader.GetInt32(reader.GetOrdinal("ExamYear")),
                    TotalMark = reader.GetInt32(reader.GetOrdinal("TotalMark")),
                    PassOrFail = reader.GetString(reader.GetOrdinal("PassOrFail")),
                    CreateTime = reader.GetDateTime(reader.GetOrdinal("CreateTime"))
                });
            }

            return results;
        }
    }
}
