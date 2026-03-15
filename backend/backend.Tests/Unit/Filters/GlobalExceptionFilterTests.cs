using backend.Filters;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend.Tests.Unit.Filters;

public class GlobalExceptionFilterTests
{
    private readonly GlobalExceptionFilter _filter;

    public GlobalExceptionFilterTests()
    {
        _filter = new GlobalExceptionFilter(NullLogger<GlobalExceptionFilter>.Instance);
    }

    private static ExceptionContext CreateContext(Exception exception)
    {
        var actionContext = new ActionContext(
            new DefaultHttpContext(),
            new RouteData(),
            new ActionDescriptor { DisplayName = "TestAction" });

        return new ExceptionContext(actionContext, new List<IFilterMetadata>())
        {
            Exception = exception
        };
    }

    [Fact]
    public void HttpRequestException_Returns502()
    {
        var context = CreateContext(new HttpRequestException("TMDB is down"));

        _filter.OnException(context);

        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status502BadGateway);
        ((string)result.Value!).Should().Contain("external service");
    }

    [Fact]
    public void GenericException_Returns500()
    {
        var context = CreateContext(new InvalidOperationException("Something broke"));

        _filter.OnException(context);

        var result = context.Result.Should().BeOfType<ObjectResult>().Subject;
        result.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
        ((string)result.Value!).Should().Contain("unexpected error");
    }

    [Fact]
    public void HttpRequestException_DoesNotLeakExceptionMessage()
    {
        var context = CreateContext(new HttpRequestException("secret API key invalid"));

        _filter.OnException(context);

        var result = (ObjectResult)context.Result!;
        ((string)result.Value!).Should().NotContain("secret");
        ((string)result.Value!).Should().NotContain("API key");
    }

    [Fact]
    public void GenericException_DoesNotLeakExceptionMessage()
    {
        var context = CreateContext(new Exception("NullReferenceException at UserService.cs:42"));

        _filter.OnException(context);

        var result = (ObjectResult)context.Result!;
        ((string)result.Value!).Should().NotContain("NullReference");
        ((string)result.Value!).Should().NotContain("UserService");
    }

    [Fact]
    public void OnException_MarksExceptionAsHandled()
    {
        var context = CreateContext(new Exception("boom"));

        _filter.OnException(context);

        context.ExceptionHandled.Should().BeTrue();
    }
}
