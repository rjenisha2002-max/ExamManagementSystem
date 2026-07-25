using ExamManagementAPI.Models;

namespace ExamManagementAPI.DataValidations
{
    // Business rules that go beyond simple attribute validation
    public static class ExamBusinessValidator
    {
        public static List<string> ValidateDuplicateSubjects(SaveExamRequest request)
        {
            var errors = new List<string>();

            var hasDuplicates = request.ExamDtls
                .GroupBy(x => x.SubjectId)
                .Any(g => g.Count() > 1);

            if (hasDuplicates)
            {
                errors.Add("Duplicate subjects are not allowed in the same exam.");
            }

            return errors;
        }
    }
}
