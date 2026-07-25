using ExamManagementAPI.Models;

namespace ExamManagementAPI.Services
{
    public interface IStudentService
    {
        Task<List<Student>> GetAllStudentsAsync();
    }
}
