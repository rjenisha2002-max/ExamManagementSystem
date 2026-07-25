using ExamManagementAPI.Models;

namespace ExamManagementAPI.Services
{
    public interface IExamService
    {
        Task<(bool Success, string Message, ExamMaster? Data)> SaveExamAsync(SaveExamRequest request);
        Task<ExamMaster?> GetExamByMasterIdAsync(int masterId);
        Task<List<ExamMaster>> GetAllExamResultsAsync();
    }
}
