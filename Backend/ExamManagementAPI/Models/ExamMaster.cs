namespace ExamManagementAPI.Models
{
    // Maps to ExamMaster table, joined with student info + subject details
    public class ExamMaster
    {
        public int MasterId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Mail { get; set; } = string.Empty;
        public int ExamYear { get; set; }
        public int TotalMark { get; set; }
        public string PassOrFail { get; set; } = string.Empty;
        public DateTime CreateTime { get; set; }

        public List<ExamDtlsItem> ExamDtls { get; set; } = new();
    }
}
