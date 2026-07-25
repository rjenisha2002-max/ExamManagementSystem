using ExamManagementAPI.Models;

namespace ExamManagementAPI.Repositories
{
    public interface IExamRepository
    {
        Task<int> GetExamCountForYearAsync(int studentId, int examYear);

        Task<(int MasterId, int TotalMark, string PassOrFail)> SaveExamAsync(
            int studentId, int examYear, List<ExamDtlsItem> examDtls);

        Task<ExamMaster?> GetExamByMasterIdAsync(int masterId);

        Task<List<ExamMaster>> GetAllExamResultsAsync();
    }
}
