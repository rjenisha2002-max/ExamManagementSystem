using ExamManagementAPI.Models;
using ExamManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExamManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;

        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        // POST api/Exam/Save
        [HttpPost("Save")]
        public async Task<IActionResult> SaveExam([FromBody] SaveExamRequest request)
        {
            var result = await _examService.SaveExamAsync(request);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<ExamMaster>.Fail(result.Message));
            }

            return Ok(ApiResponse<ExamMaster>.Ok(result.Data!, result.Message));
        }

        // GET api/Exam/{masterId}
        [HttpGet("{masterId:int}")]
        public async Task<IActionResult> GetExamByMasterId(int masterId)
        {
            var exam = await _examService.GetExamByMasterIdAsync(masterId);

            if (exam == null)
            {
                return NotFound(ApiResponse<ExamMaster>.Fail("Exam record not found."));
            }

            return Ok(ApiResponse<ExamMaster>.Ok(exam));
        }

        // GET api/Exam/All
        [HttpGet("All")]
        public async Task<IActionResult> GetAllExamResults()
        {
            var results = await _examService.GetAllExamResultsAsync();
            return Ok(ApiResponse<List<ExamMaster>>.Ok(results));
        }
    }
}
