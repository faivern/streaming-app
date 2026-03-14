using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Filters
{
    public class GlobalExceptionFilter : IExceptionFilter
    {
        private readonly ILogger<GlobalExceptionFilter> _logger;

        public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
        {
            _logger = logger;
        }

        public void OnException(ExceptionContext context)
        {
            switch (context.Exception)
            {
                case HttpRequestException httpEx:
                    _logger.LogError(httpEx, "External API request failed");
                    context.Result = new ObjectResult("An external service request failed. Please try again later.")
                    {
                        StatusCode = StatusCodes.Status502BadGateway
                    };
                    break;

                default:
                    _logger.LogError(context.Exception, "Unhandled exception in {Action}",
                        context.ActionDescriptor.DisplayName);
                    context.Result = new ObjectResult("An unexpected error occurred.")
                    {
                        StatusCode = StatusCodes.Status500InternalServerError
                    };
                    break;
            }

            context.ExceptionHandled = true;
        }
    }
}
