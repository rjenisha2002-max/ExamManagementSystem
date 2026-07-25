using ExamManagementAPI.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ExamManagementAPI.Repositories
{
    // ADO.NET repository for StudentMst
    public class StudentRepository : IStudentRepository
    {
        private readonly string _connectionString;

        public StudentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        public async Task<List<Student>> GetAllStudentsAsync()
        {
            var students = new List<Student>();

            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand("USP_GetAllStudents", connection);
            command.CommandType = CommandType.StoredProcedure;

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                students.Add(new Student
                {
                    StudentId = reader.GetInt32(reader.GetOrdinal("StudentID")),
                    StudentName = reader.GetString(reader.GetOrdinal("StudentName")),
                    Mail = reader.GetString(reader.GetOrdinal("Mail"))
                });
            }

            return students;
        }

        // Used to enforce the unique email rule before insert/update
        public async Task<int> GetEmailCountAsync(string mail, int? studentId)
        {
            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand("USP_CheckStudentEmailExists", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add(new SqlParameter("@Mail", SqlDbType.NVarChar, 150) { Value = mail });
            command.Parameters.Add(new SqlParameter("@StudentID", SqlDbType.Int) { Value = (object?)studentId ?? DBNull.Value });

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt32(result);
        }
    }
}
