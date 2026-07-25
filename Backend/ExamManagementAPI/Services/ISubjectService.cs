using ExamManagementAPI.Models;

namespace ExamManagementAPI.Services
{
    public interface ISubjectService
    {
        Task<List<Subject>> GetAllSubjectsAsync();
    }
}
