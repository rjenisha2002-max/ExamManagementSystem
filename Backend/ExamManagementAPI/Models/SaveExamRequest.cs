using System.ComponentModel.DataAnnotations;

namespace ExamManagementAPI.Models
{
    // Payload sent from Angular when saving an exam
    public class SaveExamRequest
    {
        [Required(ErrorMessage = "Student is required.")]
        public int StudentId { get; set; }

        [Required(ErrorMessage = "Exam year is required.")]
        [Range(2000, 2100, ErrorMessage = "Exam year is invalid.")]
        public int ExamYear { get; set; }

        [Required(ErrorMessage = "At least one subject is required.")]
        [MinLength(1, ErrorMessage = "At least one subject is required.")]
        public List<ExamDtlsItem> ExamDtls { get; set; } = new();
    }
}
