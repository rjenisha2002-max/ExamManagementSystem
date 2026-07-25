using ExamManagementAPI.Models;
using ExamManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExamManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentsController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        // GET api/Students
        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _studentService.GetAllStudentsAsync();
            return Ok(ApiResponse<List<Student>>.Ok(students));
        }
    }
}
