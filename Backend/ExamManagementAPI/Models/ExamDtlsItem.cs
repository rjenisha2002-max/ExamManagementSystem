using System.ComponentModel.DataAnnotations;

namespace ExamManagementAPI.Models
{
    // One subject + marks row inside an exam
    public class ExamDtlsItem
    {
        public int DtlsId { get; set; }

        [Required(ErrorMessage = "Subject is required.")]
        public int SubjectId { get; set; }

        public string SubjectName { get; set; } = string.Empty;

        [Range(0, 100, ErrorMessage = "Marks must be between 0 and 100.")]
        public int Marks { get; set; }
    }
}
