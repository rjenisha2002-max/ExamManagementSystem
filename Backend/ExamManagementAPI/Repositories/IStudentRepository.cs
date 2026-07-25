using ExamManagementAPI.Models;

namespace ExamManagementAPI.Repositories
{
    public interface IStudentRepository
    {
        Task<List<Student>> GetAllStudentsAsync();
        Task<int> GetEmailCountAsync(string mail, int? studentId);
    }
}
