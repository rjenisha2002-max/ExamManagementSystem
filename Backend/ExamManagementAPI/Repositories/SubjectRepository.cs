using ExamManagementAPI.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ExamManagementAPI.Repositories
{
    // ADO.NET repository for SubjectMst
    public class SubjectRepository : ISubjectRepository
    {
        private readonly string _connectionString;

        public SubjectRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        public async Task<List<Subject>> GetAllSubjectsAsync()
        {
            var subjects = new List<Subject>();

            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand("USP_GetAllSubjects", connection);
            command.CommandType = CommandType.StoredProcedure;

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                subjects.Add(new Subject
                {
                    SubjectId = reader.GetInt32(reader.GetOrdinal("SubjectID")),
                    SubjectName = reader.GetString(reader.GetOrdinal("SubjectName"))
                });
            }

            return subjects;
        }
    }
}
