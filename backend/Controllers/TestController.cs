using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class TestController : Controller
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Hello, World!" });
        }
    }
}
