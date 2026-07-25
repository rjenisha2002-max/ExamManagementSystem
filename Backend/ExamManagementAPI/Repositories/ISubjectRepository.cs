using ExamManagementAPI.Models;

namespace ExamManagementAPI.Repositories
{
    public interface ISubjectRepository
    {
        Task<List<Subject>> GetAllSubjectsAsync();
    }
}
