using ExamManagementAPI.Models;
using ExamManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExamManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _subjectService;

        public SubjectsController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        // GET api/Subjects
        [HttpGet]
        public async Task<IActionResult> GetAllSubjects()
        {
            var subjects = await _subjectService.GetAllSubjectsAsync();
            return Ok(ApiResponse<List<Subject>>.Ok(subjects));
        }
    }
}
