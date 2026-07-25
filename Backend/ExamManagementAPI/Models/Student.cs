using System.ComponentModel.DataAnnotations;

namespace ExamManagementAPI.Models
{
    // Maps to StudentMst table
    public class Student
    {
        public int StudentId { get; set; }

        [Required(ErrorMessage = "Student name is required.")]
        [StringLength(250, MinimumLength = 5, ErrorMessage = "Student name must be between 5 and 250 characters.")]
        public string StudentName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email format is invalid.")]
        public string Mail { get; set; } = string.Empty;
    }
}
