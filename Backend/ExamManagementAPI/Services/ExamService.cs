using ExamManagementAPI.DataValidations;
using ExamManagementAPI.Models;
using ExamManagementAPI.Repositories;

namespace ExamManagementAPI.Services
{
    // Validates and orchestrates exam saving
    public class ExamService : IExamService
    {
        private readonly IExamRepository _examRepository;

        public ExamService(IExamRepository examRepository)
        {
            _examRepository = examRepository;
        }

        public async Task<(bool Success, string Message, ExamMaster? Data)> SaveExamAsync(SaveExamRequest request)
        {
            // Attribute based checks (required fields, marks range, etc.)
            var attributeErrors = ModelValidator.Validate(request);
            if (attributeErrors.Count > 0)
            {
                return (false, string.Join(" ", attributeErrors), null);
            }

            foreach (var subject in request.ExamDtls)
            {
                var subjectErrors = ModelValidator.Validate(subject);
                if (subjectErrors.Count > 0)
                {
                    return (false, string.Join(" ", subjectErrors), null);
                }
            }

            // Business rule: no duplicate subjects in the same exam
            var duplicateErrors = ExamBusinessValidator.ValidateDuplicateSubjects(request);
            if (duplicateErrors.Count > 0)
            {
                return (false, string.Join(" ", duplicateErrors), null);
            }

            // Business rule: one exam per student per year
            var existingCount = await _examRepository.GetExamCountForYearAsync(request.StudentId, request.ExamYear);
            if (existingCount > 0)
            {
                return (false, "An exam record already exists for this student and year.", null);
            }

            try
            {
                var saveResult = await _examRepository.SaveExamAsync(request.StudentId, request.ExamYear, request.ExamDtls);
                var savedExam = await _examRepository.GetExamByMasterIdAsync(saveResult.MasterId);

                return (true, "Exam details saved successfully.", savedExam);
            }
            catch (Exception ex)
            {
                return (false, $"Failed to save exam details. {ex.Message}", null);
            }
        }

        public async Task<ExamMaster?> GetExamByMasterIdAsync(int masterId)
        {
            return await _examRepository.GetExamByMasterIdAsync(masterId);
        }

        public async Task<List<ExamMaster>> GetAllExamResultsAsync()
        {
            return await _examRepository.GetAllExamResultsAsync();
        }
    }
}
